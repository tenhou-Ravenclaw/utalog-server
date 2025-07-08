import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// 採点方法別の履歴を取得するAPI
export async function GET(request, { params }) {
    try {
        const { scoringType } = params;

        let history = [];

        switch (scoringType) {
            case 'ai':
                history = await prisma.aISongHistory.findMany({
                    orderBy: { date: 'desc' },
                });
                break;
            case 'ai-heart':
                history = await prisma.aIHeartSongHistory.findMany({
                    orderBy: { date: 'desc' },
                });
                break;
            case 'dxg':
                history = await prisma.dXGSongHistory.findMany({
                    orderBy: { date: 'desc' },
                });
                break;
            default:
                return NextResponse.json({ error: 'Invalid scoring type' }, { status: 400 });
        }

        return NextResponse.json(history);
    } catch (error) {
        console.error(`${params.scoringType}採点データの取得エラー:`, error);
        return NextResponse.json({ error: 'Failed to fetch scoring data' }, { status: 500 });
    }
}
