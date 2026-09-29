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
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    await connectDb();
    const body = schema.parse(await request.json());

    const user = await User.findOne({ email: body.email.toLowerCase() });
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      return NextResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, {
      expiresIn: '8h',
    });

    await audit(user.id, 'LOGIN', 'User', user.id, getClientIp(request));

    return NextResponse.json({
      token,
      user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role },
    });
  } catch (e: any) {
    if (e?.name === 'ZodError') {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }
    console.error('[login]', e);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
