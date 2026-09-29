import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDb } from '@/lib/server/db';
import { DocumentModel } from '@/lib/server/models/Document';
import { Signature } from '@/lib/server/models/Signature';
import { VerificationLog } from '@/lib/server/models/VerificationLog';
import { verify, Algorithm } from '@/lib/server/crypto';
import { requireAuth, getClientIp } from '@/lib/server/auth';
import { audit } from '@/lib/server/audit';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    await connectDb();
    const { signatureId, documentId } = (await request.json()) as {
      signatureId: string;
      documentId: string;
    };

    if (!Types.ObjectId.isValid(signatureId) || !Types.ObjectId.isValid(documentId)) {
      return NextResponse.json(
        { message: 'Valid signatureId and documentId are required' },
        { status: 400 }
      );
    }

    const isAdmin = auth.user.role === 'admin';
    const [sig, doc] = await Promise.all([
      Signature.findOne(isAdmin ? { _id: signatureId } : { _id: signatureId, userId: auth.user.id }),
      DocumentModel.findOne(isAdmin ? { _id: documentId } : { _id: documentId, userId: auth.user.id }),
    ]);

    if (!sig || !doc) {
      return NextResponse.json({ message: 'Signature or document not found' }, { status: 404 });
    }

    const originalDoc = await DocumentModel.findById(sig.documentId);
    const integrity = doc.fileHash === originalDoc?.fileHash;

    const result = verify(
      doc.data,
      sig.algorithm as Algorithm,
      Buffer.from(sig.signatureValue, 'base64'),
      sig.publicKey
    );

    const status: string = !integrity ? 'Tampered' : result.valid ? 'Valid' : 'Invalid';

    const remarks =
      status === 'Valid'
        ? 'Signature and document verified successfully'
        : status === 'Tampered'
        ? 'Document content differs from the signed document'
        : 'Signature does not match the supplied document';

    const log = await VerificationLog.create({
      userId: auth.user.id,
      signatureId: sig.id,
      verificationStatus: status,
      verificationTime: result.verificationTime,
      remarks,
    });

    await audit(auth.user.id, 'VERIFY_SIGNATURE', 'VerificationLog', log.id, getClientIp(request), {
      status,
    });

    return NextResponse.json({
      status,
      algorithm: sig.algorithm,
      verificationTimeMs: result.verificationTime,
      documentHash: doc.fileHash,
      remarks,
    });
  } catch (e) {
    console.error('[verify]', e);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    await connectDb();
    const query = auth.user.role === 'admin' ? {} : { userId: auth.user.id };
    const logs = await VerificationLog.find(query)
      .sort({ verifiedAt: -1 })
      .limit(50);
    return NextResponse.json({ verificationLogs: logs });
  } catch (e) {
    console.error('[verify GET logs]', e);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}

