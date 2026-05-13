import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth.js';
import prisma from '../../../../lib/prisma.js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED_SCORING_TYPES = ['ai', 'ai-heart'];

export async function GET(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const { scoringType } = params;

  if (!ALLOWED_SCORING_TYPES.includes(scoringType)) {
    return NextResponse.json(
      { error: `無効な採点タイプです。利用可能: ${ALLOWED_SCORING_TYPES.join(', ')}` },
      { status: 400 },
    );
  }

  try {
    const history = await prisma.songHistory.findMany({
      where: { userId: session.user.id, scoringType },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(history);
  } catch (error) {
    console.error(`${scoringType}採点データの取得エラー:`, error);
    return NextResponse.json({ error: 'データ取得に失敗しました' }, { status: 500 });
  }
}
