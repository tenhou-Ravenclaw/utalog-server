'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ScoreChart from '../../../components/ScoreChart';
import styles from '../../style/SongDetailPage.module.css';
import { normalizeSongTitle } from '../../../lib/songUtils';

export default function SongDetailPage() {
  const params = useParams();
  const router = useRouter();
  const title = params ? decodeURIComponent(params.title) : '';
  const [songData, setSongData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ... (useEffectは変更なし) ...
  useEffect(() => {
    if (!title) return;

    const normalizedTitle = normalizeSongTitle(title);

    fetch('/api/songs')
      .then(res => { if (!res.ok) throw new Error('データ取得に失敗しました。'); return res.json(); })
      .then(allData => {
        const filteredData = allData
          .filter(item => normalizeSongTitle(item.title) === normalizedTitle)
          .map(item => ({
            ...item,
            date: new Date(item.date),
            // 採点方法がない場合はレガシーデータとして扱う
            scoringMethod: item.scoringMethod || 'レガシー'
          }))
          .sort((a, b) => a.date - b.date);

        setSongData(filteredData);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [title]);


  const artist = songData.length > 0 ? songData[0].artist : '';

  // 採点方法の色を取得する関数
  const getScoringMethodColor = (method) => {
    switch (method) {
      case 'AI採点':
        return '#0ea5e9'; // 青系
      case 'AI Heart採点':
        return '#e91e63'; // ピンク系
      case '精密採点DX-G':
        return '#10b981'; // 緑系
      default:
        return '#64748b'; // グレー系
    }
  };

  // ★★★ 1. スコアの色分け関数をここにも追加 ★★★
  const getScoreClassName = (score) => {
    let classNames = [styles.score]; // 基本クラス
    if (score >= 95) classNames.push(styles.rainbow); // HomePage.module.css のクラスを参照
    else if (score >= 90) classNames.push(styles.high);
    else if (score >= 85) classNames.push(styles.veryHigh);
    return classNames.join(' ');
  };

  if (loading) return <div style={{ textAlign: 'center', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}>読み込み中...</div>;
  if (error) return <div style={{ textAlign: 'center', color: 'red' }}>{error}</div>;

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backButton}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        <span>ダッシュボードに戻る</span>
      </button>

      <h1 className={styles.title}>{title}</h1>
      <h2 className={styles.artist}>{artist}</h2>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>スコア推移グラフ</h3>
        <ScoreChart data={songData} />
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>歌唱履歴</h3>
        <table className={styles.table}>
          <thead className={styles.tableHead}>
            <tr>
              <th className={styles.th}>歌唱日時</th>
              <th className={styles.th}>採点方法</th>
              <th className={styles.th}>スコア</th>
            </tr>
          </thead>
          <tbody>
            {songData.slice().reverse().map(item => (
              <tr key={item.id} className={styles.tr}>
                <td className={styles.td}>
                  <div className={styles.date}>
                    {item.date.toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                </td>
                <td className={styles.td}>
                  <span
                    className={styles.scoringMethod}
                    style={{ color: getScoringMethodColor(item.scoringMethod) }}
                  >
                    {item.scoringMethod}
                  </span>
                </td>
                <td className={styles.td}>
                  {/* ★★★ 2. 動的なクラス名を適用 ★★★ */}
                  <span className={getScoreClassName(item.score)}>
                    {item.score.toFixed(3)}
                  </span>
                  <span className={styles.scoreUnit}> 点</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}