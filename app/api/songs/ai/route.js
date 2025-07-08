import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// AI採点の履歴を取得するAPI
export async function GET() {
    try {
        const aiHistory = await prisma.aISongHistory.findMany({
            orderBy: {
                date: 'desc',
            },
        });
        return NextResponse.json(aiHistory);
    } catch (error) {
        console.error('AI採点データの取得エラー:', error);
        return NextResponse.json({ error: 'Failed to fetch AI scoring data' }, { status: 500 });
    }
}
