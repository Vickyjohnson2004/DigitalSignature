import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDb } from '@/lib/server/db';
import { DocumentModel } from '@/lib/server/models/Document';
import { Signature } from '@/lib/server/models/Signature';
import { ProcessingJob } from '@/lib/server/models/ProcessingJob';
import { sign, algorithms, Algorithm } from '@/lib/server/crypto';
import { requireAuth, getClientIp } from '@/lib/server/auth';
import { audit } from '@/lib/server/audit';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  let job: any = null;

  try {
    await connectDb();
    const { documentId, algorithm } = (await request.json()) as {
      documentId: string;
      algorithm: Algorithm;
    };

    if (!Types.ObjectId.isValid(documentId) || !algorithms[algorithm]) {
      return NextResponse.json(
        { message: 'Valid documentId and supported algorithm are required' },
        { status: 400 }
      );
    }

    const docQuery = auth.user.role === 'admin'
      ? { _id: documentId }
      : { _id: documentId, userId: auth.user.id };
    const doc = await DocumentModel.findOne(docQuery);
    if (!doc) return NextResponse.json({ message: 'Document not found' }, { status: 404 });

    job = await ProcessingJob.create({
      userId: auth.user.id,
      documentId,
      algorithm,
      jobStatus: 'Processing',
      startTime: new Date(),
    });

    const result = sign(doc.data, algorithm);

    const sig = await Signature.create({
      userId: auth.user.id,
      documentId,
      algorithm,
      signatureValue: result.signature.toString('base64'),
      publicKey: result.publicKey,
      signatureSize: result.signature.length,
      keySize: result.keySize,
    });

    job.jobStatus = 'Completed';
    job.completionTime = new Date();
    await job.save();

    await audit(auth.user.id, 'SIGN_DOCUMENT', 'Signature', sig.id, getClientIp(request), {
      algorithm,
    });

    return NextResponse.json(
      {
        signature: {
          id: sig.id,
          algorithm,
          signedAt: sig.generatedAt,
          signatureSize: sig.signatureSize,
          keySize: sig.keySize,
          publicKey: sig.publicKey,
          signatureValue: sig.signatureValue,
        },
        metrics: { signingTimeMs: result.signingTime },
      },
      { status: 201 }
    );
  } catch (e) {
    if (job) {
      job.jobStatus = 'Failed';
      job.errorMessage = 'Processing failed';
      await job.save().catch(() => {});
    }
    console.error('[sign]', e);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
