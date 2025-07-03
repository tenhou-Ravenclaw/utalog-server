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
      <body 
        className="relative min-h-screen bg-slate-900" 
        style={{
          '--bg-icon-url': `url('/icon.png')` // 背景画像のパスも /icon.png に統一
        }}
      >
        <div 
          className="absolute inset-0 z-0 bg-no-repeat bg-center bg-contain opacity-5 pointer-events-none"
          style={{ backgroundImage: 'var(--bg-icon-url)' }}
        ></div>

        <div className="relative z-10">
          <header className="bg-slate-800/80 backdrop-blur-sm shadow-md sticky top-0">
            <nav className="container mx-auto px-6 py-4">
              
              {/* ★★★ ここからが修正箇所 ★★★ */}
              <Link href="/" className="inline-flex items-center gap-4 group">
                <Image
                  src="/icon.png" // ご指定のパスに変更
                  alt="utalog icon" // altテキストを分かりやすく変更
                  width={48}
                  height={48}
                  priority
                  className="group-hover:scale-110 transition-transform duration-200" // ホバーエフェクトを追加
                />
              </Link>
              {/* ★★★ ここまで ★★★ */}
              
            </nav>
          </header>
          <main className="container mx-auto p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}