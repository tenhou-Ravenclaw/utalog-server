/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', 'next-auth', '@prisma/client'],
  },
};

module.exports = nextConfig;
