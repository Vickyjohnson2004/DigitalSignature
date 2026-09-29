import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/server/db';
import { Benchmark } from '@/lib/server/models/Benchmark';
import { requireAuth } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    await connectDb();
    const rows = await Benchmark.find({ userId: auth.user.id }).sort({ benchmarkDate: -1 });

    const header =
      'algorithm,runs,signingTimeMs,verificationTimeMs,signatureSizeBytes,keySizeBytes,memoryUsageKb,benchmarkDate\n';
    const csv =
      header +
      rows
        .map((x) =>
          [
            x.algorithm,
            x.runs,
            x.signingTime,
            x.verificationTime,
            x.signatureSize,
            x.keySize,
            x.memoryUsage ?? '',
            x.benchmarkDate.toISOString(),
          ].join(',')
        )
        .join('\n');

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="benchmarks.csv"',
      },
    });
  } catch (e) {
    console.error('[benchmark export.csv]', e);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
