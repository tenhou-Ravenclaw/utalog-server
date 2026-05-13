'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function LoadingPage() {
  const router = useRouter();
  const pollRef = useRef(null);
  const pollCount = useRef(0);
  const MAX_POLL = 40; // 最大40回 × 3秒 = 120秒

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/songs/ai');
        if (!res.ok) { router.push('/ai'); return; }
        const { history, scraped } = await res.json();
        // データが1件でも入っていれば遷移（全件揃うのを待たない）
        if (history.length > 0 || scraped) {
          clearInterval(pollRef.current);
          router.push('/ai');
        }
      } catch {
        clearInterval(pollRef.current);
        router.push('/ai');
      }
    };

    // 即時チェック
    check();

    pollRef.current = setInterval(() => {
      pollCount.current += 1;
      if (pollCount.current >= MAX_POLL) {
        clearInterval(pollRef.current);
        router.push('/ai');
        return;
      }
      check();
    }, 3000);

    return () => clearInterval(pollRef.current);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '1rem',
      color: '#64748b',
      fontFamily: 'sans-serif',
    }}>
      <p style={{ fontSize: '1rem' }}>初回データを取得中です。しばらくお待ちください...</p>
      <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>完了後に自動で画面が切り替わります</p>
    </div>
  );
}
