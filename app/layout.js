import "./globals.css";
import Sidebar from '../components/Sidebar'; // Sidebarコンポーネントをインポート

export const metadata = {
  title: "utalog - カラオケ採点分析",
  description: "DAMの採点結果を分析・可視化するアプリ",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <body style={{ position: 'relative', minHeight: '100vh' }}>
        
        {/* === 低レイヤー：背景アイコン（変更なし） === */}
        <div 
          style={{
            position: 'fixed',
            inset: '0px',
            zIndex: -1,
            backgroundImage: `url('/icon.png')`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center center',
            backgroundSize: 'contain',
            opacity: 0.03, // 背景なので少し薄く戻す
            pointerEvents: 'none',
          }}
        ></div>

        {/* === 高レイヤー：レイアウト全体 === */}
        <div style={{ display: 'flex' }}>
          
          {/* --- 左カラム：サイドバー --- */}
          <Sidebar />

          {/* --- 右カラム：メインコンテンツ --- */}
          {/* サイドバーの幅だけ左にマージンを取り、コンテンツが被らないようにする */}
          <main style={{ 
            flex: 1, 
            marginLeft: '250px', // サイドバーの幅と同じ値
            padding: '1.5rem' 
          }}>
            {children}
          </main>

        </div>
        
      </body>
    </html>
  );
}