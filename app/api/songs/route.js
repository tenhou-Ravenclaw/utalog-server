import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// 利用可能な採点方法の一覧
const AVAILABLE_SCORING_METHODS = ['AI採点', 'AI Heart採点'];

// 全ての採点方法の履歴を統合して取得するAPI
export async function GET() {
  try {
    // 各採点方法のデータを並行して取得
    const [aiHistory, aiHeartHistory] = await Promise.all([
      prisma.aISongHistory.findMany({
        orderBy: { date: 'desc' },
        select: {
          id: true,
          title: true,
          artist: true,
          score: true,
          date: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.aIHeartSongHistory.findMany({
        orderBy: { date: 'desc' },
        select: {
          id: true,
          title: true,
          artist: true,
          score: true,
          date: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    // 各データに採点方法を示すタグを追加
    const taggedHistory = [
      ...aiHistory.map(item => ({ ...item, scoringMethod: 'AI採点' })),
      ...aiHeartHistory.map(item => ({ ...item, scoringMethod: 'AI Heart採点' })),
    ];

    // 日付でソート
    const sortedHistory = taggedHistory.sort((a, b) => new Date(b.date) - new Date(a.date));

    return NextResponse.json(sortedHistory);
  } catch (error) {
    console.error('統合採点データの取得エラー:', error);
    return NextResponse.json({
      error: 'Failed to fetch data',
      message: 'データベースからの統合データ取得に失敗しました',
      availableScoringMethods: AVAILABLE_SCORING_METHODS
    }, { status: 500 });
  }
}