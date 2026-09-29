import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/server/db';
import { DocumentModel } from '@/lib/server/models/Document';
import { requireAuth } from '@/lib/server/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    await connectDb();
    const { id } = await params;
    const docQuery = auth.user.role === 'admin'
      ? { _id: id }
      : { _id: id, userId: auth.user.id };
    const doc = await DocumentModel.findOne(docQuery);
    if (!doc) return NextResponse.json({ message: 'Document not found' }, { status: 404 });

    return new NextResponse(doc.data, {
      headers: {
        'Content-Type': doc.fileType,
        'Content-Disposition': `attachment; filename="${doc.fileName.replace(/"/g, '')}"`,
      },
    });
  } catch (e) {
    console.error('[document download]', e);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
