'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import Image from 'next/image';

const menuItems = [
  { href: '/', label: '精密採点Ai' },
  // { href: '/dx-g', label: '精密採点DX-G' },
  // { href: '/dx', label: '精密採点DX' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      {/* サイドバー上部にロゴとタイトルを配置 */}
      <div className={styles.sidebarHeader}>
        <Image src="/icon.png" alt="utalog icon" width={40} height={40} />
        <span className={styles.sidebarTitle}>Uta-Log</span>
      </div>

      <nav>
        <h2 className={styles.menuTitle}>採点方式</h2>
        <ul>
          {menuItems.map(item => (
            <li key={item.href}>
              <Link 
                href={item.href} 
                className={`${styles.menuLink} ${pathname === item.href ? styles.active : ''}`}
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