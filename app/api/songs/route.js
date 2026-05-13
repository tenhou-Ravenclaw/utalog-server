import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth.js';
import prisma from '../../../lib/prisma.js';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  try {
    const history = await prisma.songHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      select: { id: true, title: true, artist: true, score: true, date: true, scoringType: true },
    });

    const tagged = history.map(item => ({
      ...item,
      scoringMethod: item.scoringType === 'ai' ? 'AI採点' : 'AI Heart採点',
    }));

    return NextResponse.json(tagged);
  } catch (error) {
    console.error('統合採点データの取得エラー:', error);
    return NextResponse.json({ error: 'データ取得に失敗しました' }, { status: 500 });
  }
}
