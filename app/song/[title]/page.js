'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ScoreChart from '../../../components/ScoreChart';

export default function SongDetailPage() {
  const params = useParams();
  const router = useRouter();
  const title = params ? decodeURIComponent(params.title) : '';
  const [songData, setSongData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const artist = songData.length > 0 ? songData[0].artist : '';

  useEffect(() => {
    if (!title) return;
    fetch('/api/songs')
      .then(res => { if (!res.ok) throw new Error('データファイルが見つかりません。'); return res.json(); })
      .then(allData => {
        const filteredData = allData
          .filter(item => item.title === title)
          .map(item => ({...item, date: new Date(item.date)}))
          .sort((a, b) => a.date - b.date);

        const finalData = filteredData.map(item => ({
            ...item,
            date: item.date.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\//g, '/'),
        }));

        if (finalData.length === 0) throw new Error('該当する曲のデータが見つかりませんでした。');
        setSongData(finalData);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [title]);

  // --- ここから下が欠けていた部分 ---
  
  if (loading) return <div className="text-center animate-pulse">読み込み中...</div>;
  if (error) return <div className="text-center text-red-400 p-4 bg-red-900/50 rounded-lg">{error}</div>;

  return (
    <div>
      <button onClick={() => router.back()} className="mb-6 text-sm text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        <span>ダッシュボードに戻る</span>
      </button>

      <h1 className="text-4xl font-bold text-slate-100">{title}</h1>
      <h2 className="text-xl text-slate-400 mb-8">{artist}</h2>

      <div className="mb-8 p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg">
        <h3 className="text-xl font-semibold mb-4 text-sky-300">スコア推移グラフ</h3>
        <ScoreChart data={songData} />
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4 text-sky-300">歌唱履歴</h3>
        <div className="space-y-4">
          {songData.slice().reverse().map(item => (
            <div key={item.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-4 rounded-lg flex items-center gap-4 shadow-md transition-all hover:border-sky-500/50 hover:shadow-sky-500/10">
              <div className="flex-grow">
                <p className="text-2xl font-mono font-bold text-yellow-400">{item.score.toFixed(3)} <span className="text-sm font-sans text-slate-400">点</span></p>
                <p className="text-sm text-slate-400">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}