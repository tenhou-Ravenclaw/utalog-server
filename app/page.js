'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './style/HomePage.module.css'; // CSS Moduleをインポート

export default function HomePage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  // ... (useEffectやソート関数は変更なし) ...
  useEffect(() => {
    fetch('/api/songs')
      .then(res => res.json())
      .then(data => {
        setHistory(data.map(item => ({...item, date: new Date(item.date)})));
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  const sortedHistory = [...history].sort((a, b) => {
    const key = sortConfig.key;
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    let aValue = a[key]; let bValue = b[key];
    if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase(); bValue = bValue.toLowerCase();
    }
    if (aValue < bValue) return -1 * direction;
    if (aValue > bValue) return 1 * direction;
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') direction = 'asc';
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'desc' ? '▼' : '▲';
  };

  // スコアの色分けロジック
  const getScoreClassName = (score) => {
    let classNames = [styles.score]; // 基本クラス
    if (score >= 95) classNames.push(styles.rainbow);
    else if (score >= 90) classNames.push(styles.high);
    else if (score >= 85) classNames.push(styles.veryHigh);
    return classNames.join(' '); // "score rainbow" のような文字列を返す
  };


  if (loading) return <div className="text-center text-lg animate-pulse">データを読み込み中...</div>;
  if (error) return <div className="text-center text-lg text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>UtaLog Dashboard</h1>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.th} onClick={() => requestSort('title')}>曲名 {getSortIndicator('title')}</th>
              <th className={styles.th} onClick={() => requestSort('artist')}>アーティスト名 {getSortIndicator('artist')}</th>
              <th className={styles.th} onClick={() => requestSort('score')}>スコア {getSortIndicator('score')}</th>
              <th className={styles.th} onClick={() => requestSort('date')}>歌唱日時 {getSortIndicator('date')}</th>
            </tr>
          </thead>
          <tbody className={styles.tableBody}>
            {sortedHistory.map(item => (
              <tr key={item.id} className={styles.tr}>
                <td className={`${styles.td} ${styles.songTitle}`}>
                  <Link href={`/song/${encodeURIComponent(item.title)}`}>
                    <div>{item.title}</div>
                  </Link>
                </td>
                <td className={`${styles.td} ${styles.artistName}`}>{item.artist}</td>
                <td className={styles.td}>
                  <span className={getScoreClassName(item.score)}>{item.score.toFixed(3)}</span>
                </td>
                <td className={`${styles.td} ${styles.date}`}>
                  {item.date.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <a href="/api/export" className={styles.exportButton} download title="全データをCSVでエクスポート">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </a>
    </div>
  );
}