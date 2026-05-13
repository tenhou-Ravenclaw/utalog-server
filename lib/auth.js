import _CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './prisma.js';
import { loginLimiter } from './ratelimit.js';

// next-auth は CJS モジュールのため ESM インポート時に二重ラップされる
const CredentialsProvider = _CredentialsProvider?.default ?? _CredentialsProvider;

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'メールアドレス', type: 'email' },
        password: { label: 'パスワード', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null;

        const ip =
          req?.headers?.['x-forwarded-for']?.split(',')[0].trim() ??
          req?.headers?.['x-real-ip'] ??
          '127.0.0.1';
        const { success } = await loginLimiter.limit(ip);
        if (!success) throw new Error('しばらく時間をおいてから再試行してください');

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return { id: user.id, email: user.email };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token) session.user.id = token.id;
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
