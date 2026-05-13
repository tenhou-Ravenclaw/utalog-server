import _CredentialsProvider from 'next-auth/providers/credentials';
import prisma from './prisma.js';
import { fetchDamCardNo } from './damAuth.js';
import { loginLimiter } from './ratelimit.js';

// next-auth は CJS モジュールのため ESM インポート時に二重ラップされる
const CredentialsProvider = _CredentialsProvider?.default ?? _CredentialsProvider;

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'dam',
      credentials: {
        loginId: { label: 'DAM★とも ID', type: 'text' },
        password: { label: 'パスワード', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.loginId || !credentials?.password) return null;

        // レートリミット
        const ip =
          req?.headers?.['x-forwarded-for']?.split(',')[0].trim() ??
          req?.headers?.['x-real-ip'] ??
          '127.0.0.1';
        const { success } = await loginLimiter.limit(ip);
        if (!success) throw new Error('しばらく時間をおいてから再試行してください');

        // DAM★とも 認証
        const { cdmCardNo } = await fetchDamCardNo({
          loginId: credentials.loginId,
          password: credentials.password,
        });

        // ユーザーを検索、なければ新規作成
        let user = await prisma.user.findUnique({ where: { cdmCardNo } });
        const isNewUser = !user;

        if (isNewUser) {
          user = await prisma.user.create({
            data: { cdmCardNo, damLoginId: credentials.loginId },
          });
          // 初回スクレイプは /loading ページ経由で /api/scrape が担う
        } else {
          // damLoginId が変わっていれば更新
          if (user.damLoginId !== credentials.loginId) {
            await prisma.user.update({
              where: { id: user.id },
              data: { damLoginId: credentials.loginId },
            });
          }
        }

        return { id: user.id, damLoginId: credentials.loginId, cdmCardNo };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.damLoginId = user.damLoginId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.damLoginId = token.damLoginId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
};
