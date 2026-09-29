import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectDb } from '@/lib/server/db';
import { DocumentModel } from '@/lib/server/models/Document';
import { Benchmark } from '@/lib/server/models/Benchmark';
import { sign, verify, algorithms, Algorithm } from '@/lib/server/crypto';
import { requireAuth, getClientIp } from '@/lib/server/auth';
import { audit } from '@/lib/server/audit';

export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if ('error' in auth) return auth.error;

  try {
    await connectDb();
    const { documentId, algorithm, runs = 100 } = (await request.json()) as {
      documentId: string;
      algorithm: Algorithm;
      runs?: number;
    };

    if (!Types.ObjectId.isValid(documentId) || !algorithms[algorithm]) {
      return NextResponse.json(
        { message: 'Valid documentId and algorithm are required' },
        { status: 400 }
      );
    }

    const count = Math.min(Math.max(Number(runs) || 100, 1), 500);

    const docQuery = auth.user.role === 'admin'
      ? { _id: documentId }
      : { _id: documentId, userId: auth.user.id };
    const doc = await DocumentModel.findOne(docQuery);
    if (!doc) return NextResponse.json({ message: 'Document not found' }, { status: 404 });

    const memoryStart = process.memoryUsage().heapUsed;
    let signing = 0, verification = 0, size = 0, keySize = 0;

    for (let i = 0; i < count; i++) {
      const s = sign(doc.data, algorithm);
      signing += s.signingTime;
      verification += verify(doc.data, algorithm, s.signature, s.publicKey).verificationTime;
      size += s.signature.length;
      keySize += s.keySize;
    }

    const result = await Benchmark.create({
      userId: auth.user.id,
      documentId,
      algorithm,
      runs: count,
      signingTime: signing / count,
      verificationTime: verification / count,
      signatureSize: size / count,
      keySize: keySize / count,
      memoryUsage: (process.memoryUsage().heapUsed - memoryStart) / 1024,
    });

    await audit(auth.user.id, 'RUN_BENCHMARK', 'Benchmark', result.id, getClientIp(request), {
      algorithm,
      runs: count,
    });

    return NextResponse.json({ benchmark: result }, { status: 201 });
  } catch (e) {
    console.error('[benchmark run]', e);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
