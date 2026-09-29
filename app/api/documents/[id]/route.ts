import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/server/db';
import { DocumentModel } from '@/lib/server/models/Document';
import { Signature } from '@/lib/server/models/Signature';
import { requireAuth, getClientIp } from '@/lib/server/auth';
import { audit } from '@/lib/server/audit';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    await connectDb();
    const { id } = await params;

    const doc = await DocumentModel.findOne({ _id: id, userId: auth.user.id });
    if (!doc) {
      return NextResponse.json({ message: 'Document not found' }, { status: 404 });
    }

    await DocumentModel.deleteOne({ _id: id });
    await Signature.deleteMany({ documentId: id });

    await audit(auth.user.id, 'DELETE_DOCUMENT', 'Document', id, getClientIp(request), {
      fileName: doc.fileName,
    });

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (e) {
    console.error('[document DELETE]', e);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
