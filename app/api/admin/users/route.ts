import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/server/db';
import { User } from '@/lib/server/models/User';
import { requireAdmin } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    await connectDb();
    const users = await User.find()
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .limit(500);

    return NextResponse.json({ users });
  } catch (e) {
    console.error('[admin users GET]', e);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
