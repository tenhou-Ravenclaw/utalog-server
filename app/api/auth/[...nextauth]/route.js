import _NextAuth from 'next-auth';
import { authOptions } from '../../../../lib/auth.js';

// next-auth は CJS モジュールのため ESM インポート時に二重ラップされる
const NextAuth = _NextAuth?.default ?? _NextAuth;

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
