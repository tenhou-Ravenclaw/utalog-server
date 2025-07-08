'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        // ページがマウントされたらすぐにAIページにリダイレクト
        router.push('/ai');
    }, [router]);

    // リダイレクト中の表示（一瞬だけ表示される）
    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>リダイレクト中...</h1>
            <p>しばらくお待ちください。</p>
        </div>
    );
}
