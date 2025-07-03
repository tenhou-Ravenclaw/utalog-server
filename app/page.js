'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'latestDate', direction: 'desc' });

  useEffect(() => {
    fetch('/api/songs')
      .then(res => {
        if (!res.ok) throw new Error('データベースからのデータ取得に失敗しました。');
        return res.json();
      })
      .then(data => {
        const historyWithDateObjects = data.map(item => ({
          ...item,
          date: new Date(item.date),
        }));
        
        const songMap = new Map();
        historyWithDateObjects.forEach(item => {
          if (!songMap.has(item.title)) {
            songMap.set(item.title, {
              id: item.id,
              title: item.title,
              artist: item.artist,
              highestScore: 0,
              latestDate: new Date('1970-01-01'),
              count: 0, // ★★★ 歌唱回数用のプロパティを初期化 ★★★
            });
          }
          const existing = songMap.get(item.title);
          
          existing.count++; // ★★★ カウントをインクリメント ★★★

          if (item.score > existing.highestScore) {
            existing.highestScore = item.score;
          }
          if (item.date > existing.latestDate) {
            existing.latestDate = item.date;
          }
        });

        const finalSongs = Array.from(songMap.values()).map(song => ({
            ...song,
            latestDate: song.latestDate.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\//g, '/'),
        }));

        setSongs(finalSongs);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);
  
  const sortedSongs = [...songs].sort((a, b) => {
    const key = sortConfig.key;
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    const aValue = a[key]; const bValue = b[key];
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
          <thead className="bg-slate-900/70">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('title')}>
                曲名 {getSortIndicator('title')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('artist')}>
                アーティスト名 {getSortIndicator('artist')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('highestScore')}>
                最高点 {getSortIndicator('highestScore')}
              </th>
              {/* ★★★ 歌唱回数のヘッダーを追加 ★★★ */}
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('count')}>
                歌唱回数 {getSortIndicator('count')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer" onClick={() => requestSort('latestDate')}>
                最終歌唱日 {getSortIndicator('latestDate')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {sortedSongs.map(song => (
              <tr key={song.id} className="hover:bg-sky-900/20 transition-colors duration-200">
                <td className="px-6 py-4 whitespace-nowrap">
                  <Link href={`/song/${encodeURIComponent(song.title)}`} className="group">
                    <div className="text-base font-medium text-slate-100 group-hover:text-sky-400 transition-colors">{song.title}</div>
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                  {song.artist}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-xl font-mono font-bold ${getScoreColor(song.highestScore)}`}>{song.highestScore.toFixed(3)}</span>
                </td>
                {/* ★★★ 歌唱回数のセルを追加 ★★★ */}
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-300">
                  {song.count} 回
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{song.latestDate}</td>
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