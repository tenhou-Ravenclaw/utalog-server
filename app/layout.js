import "./globals.css";
import { Inter } from "next/font/google"; // Googleフォントの読み込みを追加

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "utalog - カラオケ採点分析",
  description: "DAMの採点結果を分析・可視化するアプリ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      {/* <body>タグにフォント設定を適用 */}
      <body className={inter.className}>
        <header className="bg-slate-800 shadow-md">
          <nav className="container mx-auto px-6 py-4">
            <a href="/" className="text-2xl font-bold text-white hover:text-blue-400 transition-colors">
              🎤 utalog
            </a>
          </nav>
        </header>
        <main className="container mx-auto p-6">
          {children}
        </main>
      </body>
    </html>
  );
}