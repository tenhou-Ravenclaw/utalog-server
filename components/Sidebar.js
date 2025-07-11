'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

// メニューの項目
const menuItems = [
  { href: '/ai-heart', label: '精密採点Ai Heart' }, // 新しい項目
  { href: '/ai', label: '精密採点Ai' },
];

// propsとして isOpen と closeSidebar を受け取る
export default function Sidebar({ isOpen, closeSidebar }) {
  const pathname = usePathname();

  // メニュー項目をクリックしたときの処理
  const handleLinkClick = () => {
    // サイドバーを閉じる（スマホ表示などで便利）
    closeSidebar();
  };

  return (
    // isOpen の状態に応じてスタイルを動的に変更
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
      <nav>
        <h2 className={styles.menuTitle}>採点方式</h2>
        <ul>
          {menuItems.map(item => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.menuLink} ${pathname === item.href ? styles.active : ''}`}
                onClick={handleLinkClick}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}