import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { env } from './env';

export interface AuthUser {
  id: string;
  role: string;
}

export function getClientIp(request: NextRequest): string | undefined {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || undefined;
}

export function getAuthUser(request: NextRequest): AuthUser | null {
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '').trim();
  if (!token) {
    try {
      const url = new URL(request.url);
      token = url.searchParams.get('token')?.trim();
    } catch {
      // ignore
    }
  }
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string; role: string };
    return { id: decoded.id, role: decoded.role };
  } catch {
    return null;
  }
}

export function requireAuth(
  request: NextRequest
): { user: AuthUser } | { error: NextResponse } {
  const user = getAuthUser(request);
  if (!user) {
    return {
      error: NextResponse.json({ message: 'Authentication required' }, { status: 401 }),
    };
  }
  return { user };
}

export function requireAdmin(
  request: NextRequest
): { user: AuthUser } | { error: NextResponse } {
  const result = requireAuth(request);
  if ('error' in result) return result;
  if (result.user.role !== 'admin') {
    return {
      error: NextResponse.json({ message: 'Administrator access required' }, { status: 403 }),
    };
  }
  return result;
}
