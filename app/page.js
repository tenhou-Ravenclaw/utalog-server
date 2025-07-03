'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  // stateの名前を 'songs' から 'history' に変更して分かりやすく
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 初期ソートキーを 'date' (日付) に
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

  useEffect(() => {
    fetch('/api/songs')
      .then(res => {
        if (!res.ok) throw new Error('データベースからのデータ取得に失敗しました。');
        return res.json();
      })
      .then(data => {
        // ★★★ 曲ごとの集計ロジックを完全に削除 ★★★
        // APIから取得したデータをそのままstateにセットする
        const formattedHistory = data.map(item => ({
          ...item,
          // ソートや表示のためにDateオブジェクトに変換
          date: new Date(item.date),
        }));
        setHistory(formattedHistory);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);
  
  // ソートロジック
  const sortedHistory = [...history].sort((a, b) => {
    const key = sortConfig.key;
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    
    let aValue = a[key];
    let bValue = b[key];

    // 文字列の場合は小文字にして比較（大文字小文字を区別しない）
    if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) return -1 * direction;
    if (aValue > bValue) return 1 * direction;
    return 0;
  });

  const requestSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'desc' ? '▼' : '▲';
  };

  const getScoreColor = (score) => {
    if (score >= 95) return 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 font-bold';
    if (score >= 90) return 'text-yellow-400';
    if (score >= 85) return 'text-sky-400';
    return 'text-slate-300';
  };

  if (loading) return <div className="text-center text-lg animate-pulse">データを読み込み中...</div>;
  if (error) return <div className="text-center text-lg text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</div>;

  return (
    <div className="pb-24">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-blue-500">
          UtaLog Dashboard
        </h1>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm shadow-2xl rounded-xl overflow-hidden border border-slate-700">
        <table className="min-w-full">
          {/* ★★★ テーブルヘッダーを「一採点一表示」用に変更 ★★★ */}
          <thead className="bg-slate-900/70">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('title')}>
                曲名 {getSortIndicator('title')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('artist')}>
                アーティスト名 {getSortIndicator('artist')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('score')}>
                スコア {getSortIndicator('score')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('date')}>
                歌唱日時 {getSortIndicator('date')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {/* ★★★ 個別の履歴を1行ずつ表示 ★★★ */}
            {sortedHistory.map(item => (
              <tr key={item.id} className="hover:bg-sky-900/20 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  {/* 詳細ページへのリンクは保持 */}
                  <Link href={`/song/${encodeURIComponent(item.title)}`} className="group">
                    <div className="text-base font-medium text-slate-100 group-hover:text-sky-400 transition-colors">{item.title}</div>
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                  {item.artist}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-xl font-mono font-bold ${getScoreColor(item.score)}`}>{item.score.toFixed(3)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                  {/* toLocaleStringで日付を読みやすい形式に変換 */}
                  {item.date.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <a 
        href="/api/export" 
        className="fixed bottom-8 right-8 z-50 bg-emerald-600 hover:bg-emerald-700 text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
        download
        title="全データをCSVでエクスポート"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      </a>
    </div>
  );
}