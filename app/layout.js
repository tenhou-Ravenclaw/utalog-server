import "./globals.css";
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: "utalog - カラオケ採点分析",
  description: "DAMの採点結果を分析・可視化するアプリ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body style={{ position: 'relative', minHeight: '100vh' }}>
        
        {/* === 低レイヤー：背景アイコン === */}
        <div 
          style={{
            // --- 配置 ---
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1, // コンテンツの背後に配置

            // --- 背景画像の設定 ---
            backgroundImage: `url('/icon.png')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            backgroundSize: 'contain', // 画像がはみ出ないように調整

            // --- 見た目の調整 ---
            opacity: 0.15, // 透明度を3%に設定 (お好みで調整)
            pointerEvents: 'none', // マウス操作を無効化
          }}
        ></div>

        {/* === 高レイヤー：コンテンツ本体 === */}
        <div style={{ position: 'relative' }}>
          <header style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.8)', // 半透明の白
            backdropFilter: 'blur(8px)', // すりガラス効果
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', 
          }}>
            <nav style={{ 
              maxWidth: '1280px', 
              margin: 'auto', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between'
            }}>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
                <Image
                  src="/icon.png"
                  alt="utalog icon"
                  width={100}
                  height={100}
                  priority
                />
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' }}>
                  Uta-Log
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