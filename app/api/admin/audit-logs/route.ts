import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/server/db';
import { AuditLog } from '@/lib/server/models/AuditLog';
import { requireAdmin } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    await connectDb();
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(500);

    return NextResponse.json({ logs });
  } catch (e) {
    console.error('[admin audit-logs GET]', e);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
