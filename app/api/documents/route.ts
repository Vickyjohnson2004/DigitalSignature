import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/server/db';
import { DocumentModel } from '@/lib/server/models/Document';
import { hashDocument } from '@/lib/server/crypto';
import { requireAuth, getClientIp } from '@/lib/server/auth';
import { audit } from '@/lib/server/audit';
import { env } from '@/lib/server/env';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    await connectDb();
    const docs = await DocumentModel.find({ userId: auth.user.id })
      .select('-data')
      .sort({ createdAt: -1 })
      .limit(100);
    return NextResponse.json({ documents: docs });
  } catch (e) {
    console.error('[documents GET]', e);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    await connectDb();
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'Document is required' }, { status: 400 });
    }

    const maxBytes = env.MAX_FILE_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      return NextResponse.json(
        { message: `File exceeds the ${env.MAX_FILE_SIZE_MB} MB limit` },
        { status: 413 }
      );
    }

    const allowed =
      /pdf|text|csv|json|xml|markdown|msword|officedocument|plain|octet-stream/.test(file.type) ||
      /\.(pdf|txt|doc|docx|csv|json|xml|md|rtf|log)$/i.test(file.name);
    if (!allowed) {
      return NextResponse.json(
        { message: 'Unsupported document type. Supported: PDF, TXT, CSV, DOCX, JSON, XML, MD' },
        { status: 415 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const hash = hashDocument(buffer);

    const doc = await DocumentModel.create({
      userId: auth.user.id,
      fileName: file.name,
      fileType: file.type || 'application/octet-stream',
      fileSize: file.size,
      fileHash: hash,
      data: buffer,
    });

    await audit(auth.user.id, 'UPLOAD_DOCUMENT', 'Document', doc.id, getClientIp(request), { hash });

    return NextResponse.json(
      {
        document: {
          id: doc.id,
          fileName: doc.fileName,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
          fileHash: doc.fileHash,
          createdAt: doc.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (e) {
    console.error('[documents POST]', e);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
