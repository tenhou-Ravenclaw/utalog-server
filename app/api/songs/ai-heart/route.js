import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth.js';
import prisma from '../../../../lib/prisma.js';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  try {
    const history = await prisma.songHistory.findMany({
      where: { userId: session.user.id, scoringType: 'ai-heart' },
      orderBy: { date: 'desc' },
    });
    return NextResponse.json(history);
  } catch (error) {
    console.error('AI Heart採点データの取得エラー:', error);
    return NextResponse.json({ error: 'データ取得に失敗しました' }, { status: 500 });
  }
}
