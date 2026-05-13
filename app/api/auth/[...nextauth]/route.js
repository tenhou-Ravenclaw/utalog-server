import _NextAuth from 'next-auth';
import { authOptions } from '../../../../lib/auth.js';

export const dynamic = 'force-dynamic';

// next-auth は CJS モジュールのため ESM インポート時に二重ラップされる
const NextAuth = _NextAuth?.default ?? _NextAuth;

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
