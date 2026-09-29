import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/server/db';
import { User } from '@/lib/server/models/User';
import { requireAuth } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    await connectDb();
    const user = await User.findById(auth.user.id).select('-passwordHash');
    if (!user) return NextResponse.json({ message: 'User not found' }, { status: 404 });
    return NextResponse.json({ user });
  } catch (e) {
    console.error('[me]', e);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
