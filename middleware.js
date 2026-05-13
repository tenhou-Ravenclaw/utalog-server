import _withAuth from 'next-auth/middleware';

// next-auth は CJS モジュールのため ESM インポート時に二重ラップされる
const withAuth = _withAuth?.default ?? _withAuth;

export default withAuth;

export const config = {
  matcher: ['/', '/ai', '/ai-heart', '/song/:path*'],
};
