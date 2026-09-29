import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/server/db';
import { Benchmark } from '@/lib/server/models/Benchmark';
import { requireAuth } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    await connectDb();
    const query = auth.user.role === 'admin' ? {} : { userId: auth.user.id };
    const rows = await Benchmark.find(query)
      .sort({ benchmarkDate: -1 })
      .limit(200);
    return NextResponse.json({ benchmarks: rows });
  } catch (e) {
    console.error('[benchmarks GET]', e);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
