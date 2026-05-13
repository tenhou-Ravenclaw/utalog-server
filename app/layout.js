'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import "./globals.css";
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from '../components/Sidebar';
import styles from './Layout.module.css';

const AUTH_PATHS = ['/login', '/loading'];

export default function RootLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);

  return (
    <html lang="ja">
      <head>
        <title>utalog - カラオケ採点分析</title>
        <meta name="description" content="DAMの採点結果を分析・可視化するアプリ" />
        <link rel="icon" href="/icon.png" type="image/png" />
      </head>
      <body className={styles.body}>
        <SessionProvider>
          {isAuthPage ? (
            children
          ) : (
            <>
              <div className={styles.backgroundIcon}></div>

              <header className={styles.header}>
                <nav className={styles.nav}>
                  <div className={styles.navLeft}>
                    <button
                      onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                      className={styles.hamburgerButton}
                      title="メニューを開閉"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                      </svg>
                    </button>

                    <Link href="/" className={`${styles.logoLink} ${isSidebarOpen ? styles.shifted : ''}`}>
                      <Image src="/icon.png" alt="utalog icon" width={40} height={40} priority />
                      <span className={styles.logoTitle}>Uta-Log</span>
                    </Link>
                  </div>

                  <div></div>
                </nav>
              </header>

              <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setIsSidebarOpen(false)} />

              <main
                className={styles.mainContent}
                style={{ paddingLeft: isSidebarOpen ? '266px' : '1.5rem' }}
              >
                {children}
              </main>
            </>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}
