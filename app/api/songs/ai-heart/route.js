import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// AI Heart採点の履歴を取得するAPI
export async function GET() {
    try {
        const aiHeartHistory = await prisma.aIHeartSongHistory.findMany({
            orderBy: {
                date: 'desc',
            },
        });
        return NextResponse.json(aiHeartHistory);
    } catch (error) {
        console.error('AI Heart採点データの取得エラー:', error);
        return NextResponse.json({ error: 'Failed to fetch AI Heart scoring data' }, { status: 500 });
    }
}
