import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// 精密採点DX-Gの履歴を取得するAPI
export async function GET() {
    try {
        const dxgHistory = await prisma.dXGSongHistory.findMany({
            orderBy: {
                date: 'desc',
            },
        });
        return NextResponse.json(dxgHistory);
    } catch (error) {
        console.error('DX-G採点データの取得エラー:', error);
        return NextResponse.json({ error: 'Failed to fetch DX-G scoring data' }, { status: 500 });
    }
}
