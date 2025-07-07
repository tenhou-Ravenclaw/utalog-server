/** @type {import('next').NextConfig} */
const nextConfig = {
  // ★★★ リダイレクト設定を追加 ★★★
  async redirects() {
    return [
      {
        source: '/',
        destination: '/ai',
        permanent: true,
      },
    ]
  },
};

module.exports = nextConfig;