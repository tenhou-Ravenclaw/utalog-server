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
            alignItems: 'center',
            minHeight: '100vh',
            color: 'black',
            fontSize: '1.5rem'
        }}>
            AIページにリダイレクト中...
        </div>
    );
}
