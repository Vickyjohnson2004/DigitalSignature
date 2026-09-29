import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { connectDb } from '@/lib/server/db';
import { User } from '@/lib/server/models/User';
import { env } from '@/lib/server/env';
import { audit } from '@/lib/server/audit';
import { getClientIp } from '@/lib/server/auth';

const schema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export async function POST(request: NextRequest) {
  try {
    await connectDb();
    const body = schema.parse(await request.json());

    if (await User.exists({ email: body.email.toLowerCase() })) {
      return NextResponse.json({ message: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await User.create({
      fullName: body.fullName,
      email: body.email.toLowerCase(),
      passwordHash,
    });

    const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn: '8h',
    });

    await audit(user.id, 'REGISTER', 'User', user.id, getClientIp(request));

    return NextResponse.json(
      { token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } },
      { status: 201 }
    );
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ message: e.errors[0]?.message ?? 'Invalid input' }, { status: 400 });
    }
    console.error('[register]', e);
    const msg = e?.message?.includes('MONGODB_URI')
      ? 'Database configuration error: MONGODB_URI is missing in Vercel environment variables.'
      : (e?.message || 'An unexpected error occurred');
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
