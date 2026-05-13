'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import styles from './Sidebar.module.css';

const menuItems = [
  { href: '/ai-heart', label: '精密採点Ai Heart' },
  { href: '/ai', label: '精密採点Ai' },
];

export default function Sidebar({ isOpen, closeSidebar }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [scraping, setScraping] = useState(false);
  const [scrapeResult, setScrapeResult] = useState(null);

  const handleScrape = async () => {
    setScraping(true);
    setScrapeResult(null);
    try {
      const res = await fetch('/api/scrape', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        const aiCount = data.ai?.processed ?? 0;
        const aiHeartCount = data.aiHeart?.processed ?? 0;
        const total = aiCount + aiHeartCount;
        setScrapeResult({
          success: true,
          message: total > 0 ? `${total}件を取得しました` : '最新の状態です',
        });
      } else {
        setScrapeResult({ success: false, message: data.error || '更新に失敗しました' });
      }
    } catch {
      setScrapeResult({ success: false, message: 'エラーが発生しました' });
    } finally {
      setScraping(false);
    }
  };

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <nav className={styles.nav}>
        <h2 className={styles.menuTitle}>採点方式</h2>
        <ul>
          {menuItems.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.menuLink} ${pathname === item.href ? styles.active : ''}`}
                onClick={closeSidebar}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.footer}>
        <button
          onClick={handleScrape}
          disabled={scraping}
          className={styles.scrapeButton}
        >
          {scraping ? '取得中...' : 'データ更新'}
        </button>

        {scrapeResult && (
          <p className={scrapeResult.success ? styles.scrapeSuccess : styles.scrapeError}>
            {scrapeResult.message}
          </p>
        )}

        {session?.user && (
          <div className={styles.userInfo}>
            <p className={styles.userEmail}>{session.user.damLoginId}</p>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className={styles.logoutButton}
            >
              ログアウト
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
