import { NextRequest, NextResponse } from 'next/server';
import { connectDb } from '@/lib/server/db';
import { User } from '@/lib/server/models/User';
import { AuditLog } from '@/lib/server/models/AuditLog';
import { Benchmark } from '@/lib/server/models/Benchmark';
import { DocumentModel } from '@/lib/server/models/Document';
import { Signature } from '@/lib/server/models/Signature';
import { requireAdmin } from '@/lib/server/auth';

export async function GET(request: NextRequest) {
  const auth = requireAdmin(request);
  if ('error' in auth) return auth.error;

  try {
    await connectDb();
    const [users, audits, benchmarks, documents, signatures] = await Promise.all([
      User.countDocuments(),
      AuditLog.countDocuments(),
      Benchmark.countDocuments(),
      DocumentModel.countDocuments(),
      Signature.countDocuments(),
    ]);

    return NextResponse.json({
      users,
      audits,
      benchmarks,
      documents,
      signatures,
    });
  } catch (e) {
    console.error('[admin overview GET]', e);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
