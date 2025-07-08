'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './HomePage.module.css';
import Sidebar from '@/components/Sidebar';

export default function DXGPage() {
    const [songs, setSongs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSongs = async () => {
            try {
                const response = await fetch('/api/songs/dxg');
                if (!response.ok) {
                    throw new Error('データの取得に失敗しました');
                }
                const data = await response.json();
                setSongs(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSongs();
    }, []);

    const formatScore = (score) => {
        return (score || 0).toFixed(3);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className={styles.container}>
                <Sidebar />
                <main className={styles.main}>
                    <div className={styles.loading}>読み込み中...</div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <Sidebar />
                <main className={styles.main}>
                    <div className={styles.error}>エラー: {error}</div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.title}>
                        精密採点DX-G 歌唱履歴
                        <span className={styles.scoringBadge}>DX-G</span>
                    </h1>
                    <div className={styles.stats}>
                        <div className={styles.statItem}>
                            <span className={styles.statLabel}>総歌唱数</span>
                            <span className={styles.statValue}>{songs.length}</span>
                        </div>
                        {songs.length > 0 && (
                            <>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>最高得点</span>
                                    <span className={styles.statValue}>
                                        {formatScore(Math.max(...songs.map(s => s.score)))}
                                    </span>
                                </div>
                                <div className={styles.statItem}>
                                    <span className={styles.statLabel}>平均得点</span>
                                    <span className={styles.statValue}>
                                        {formatScore(songs.reduce((sum, s) => sum + (s.score || 0), 0) / songs.length)}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {songs.length === 0 ? (
                    <div className={styles.noData}>
                        <p>まだ歌唱データがありません。</p>
                        <p>スクレイピングを実行してデータを取得してください。</p>
                    </div>
                ) : (
                    <div className={styles.songList}>
                        {songs.map((song, index) => (
                            <div key={`${song.id}-${index}`} className={styles.songCard}>
                                <div className={styles.songInfo}>
                                    <h3 className={styles.songTitle}>
                                        <Link href={`/song/${encodeURIComponent(song.title)}`}>
                                            {song.title}
                                        </Link>
                                    </h3>
                                    <p className={styles.songArtist}>{song.artist}</p>
                                </div>
                                <div className={styles.scoreInfo}>
                                    <div className={styles.scoreValue}>
                                        {formatScore(song.score)}
                                    </div>
                                    <div className={styles.scoreDate}>
                                        {formatDate(song.date)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
