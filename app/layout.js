import "./globals.css"; // globals.css をインポート
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: "utalog - カラオケ採点分析",
  description: "DAMの採点結果を分析・可視化するアプリ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      {/* ★★★ bodyタグに直接スタイルを指定 ★★★ */}
      <body 
        style={{
          position: 'relative', // 子要素のfixedの基準
          minHeight: '100vh',
        }}
      >
        {/* === 低レイヤー：背景アイコン === */}
        {/* ここにCSSだけで背景を指定する */}
        <div 
          style={{
            position: 'fixed',
            inset: '0px',
            zIndex: -1, // ★★★ コンテンツの後ろに配置するため-1にする ★★★
            backgroundImage: `url('/icon.png')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            backgroundSize: 'contain',
            opacity: 0.05, // 5%
            pointerEvents: 'none',
          }}
        ></div>

        {/* === 高レイヤー：コンテンツ本体 (z-indexは不要) === */}
        <div>
          <header style={{ backgroundColor: 'rgba(30, 41, 59, 0.8)', backdropFilter: 'blur(4px)', position: 'sticky', top: '0' }}>
            <nav style={{ maxWidth: '1280px', margin: 'auto', padding: '1rem 1.5rem' }}>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem' }}>
                <Image
                  src="/icon.png"
                  alt="utalog icon"
                  width={48}
                  height={48}
                  priority
                />
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'white' }}>
                  utalog
                </span>
              </Link>
            </nav>
          </header>
          <main style={{ maxWidth: '1280px', margin: 'auto', padding: '1.5rem' }}>
            {children}
          </main>
        </div>
        
      </body>
    </html>
  );
}