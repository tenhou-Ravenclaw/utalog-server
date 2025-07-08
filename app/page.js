'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
    const router = useRouter();

    useEffect(() => {
        // ページが読み込まれたらすぐにAIページにリダイレクト
        router.replace('/ai');
    }, [router]);

    // リダイレクト中の表示
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontSize: '1.2rem'
        }}>
            AIページにリダイレクト中...
        </div>
    );
}
