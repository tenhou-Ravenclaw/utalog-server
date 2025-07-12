import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// 許可されている採点方法の一覧
const ALLOWED_SCORING_TYPES = ['ai', 'ai-heart'];

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
            default:
                return NextResponse.json({
                    error: 'Invalid scoring type',
                    message: `許可されていない採点方法です。利用可能な採点方法: ${ALLOWED_SCORING_TYPES.join(', ')}`,
                    allowedScoringTypes: ALLOWED_SCORING_TYPES
                }, { status: 400 });
        }

        return NextResponse.json(history);
    } catch (error) {
        console.error(`${params.scoringType}採点データの取得エラー:`, error);
        return NextResponse.json({
            error: 'Failed to fetch scoring data',
            message: 'データベースからのデータ取得に失敗しました',
            allowedScoringTypes: ALLOWED_SCORING_TYPES
        }, { status: 500 });
    }
}
