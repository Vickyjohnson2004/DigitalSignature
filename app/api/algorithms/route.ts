import { NextResponse } from 'next/server';
import { algorithms } from '@/lib/server/crypto';

export async function GET() {
  return NextResponse.json({ algorithms: Object.values(algorithms) });
}
