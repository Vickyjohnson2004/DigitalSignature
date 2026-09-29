import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/server/db';
import { DocumentModel } from '@/lib/server/models/Document';
import { Signature } from '@/lib/server/models/Signature';
import { Benchmark } from '@/lib/server/models/Benchmark';
import { VerificationLog } from '@/lib/server/models/VerificationLog';
import { requireAuth } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    await connectDb();
    const uid = auth.user.id;

    const [documents, signatures, benchmarks, verifications, valid] = await Promise.all([
      DocumentModel.countDocuments({ userId: uid }),
      Signature.countDocuments({ userId: uid }),
      Benchmark.countDocuments({ userId: uid }),
      VerificationLog.countDocuments({ userId: uid }),
      VerificationLog.countDocuments({ userId: uid, verificationStatus: 'Valid' }),
    ]);

    const recent = await Benchmark.find({ userId: uid })
      .sort({ benchmarkDate: -1 })
      .limit(20);

    return NextResponse.json({
      stats: {
        documents,
        signatures,
        benchmarks,
        verifications,
        validVerifications: valid,
      },
      recentBenchmarks: recent,
    });
  } catch (e) {
    console.error('[dashboard GET]', e);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
