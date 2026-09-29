import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/server/db';
import { Signature } from '@/lib/server/models/Signature';
import { requireAuth } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    await connectDb();
    const signatures = await Signature.find({ userId: auth.user.id })
      .select('-__v')
      .sort({ generatedAt: -1 })
      .limit(100);
    return NextResponse.json({ signatures });
  } catch (e) {
    console.error('[signatures GET]', e);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
