import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  serverExternalPackages: ['mongoose', 'bcryptjs', 'jsonwebtoken'],
};

export default nextConfig;
