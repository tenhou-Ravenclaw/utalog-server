import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth.js';
import prisma from '../../../lib/prisma.js';
import { scrapeScoring } from '../../../lib/scraper.js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SCRAPE_INTERVAL_MS = 5 * 60 * 1000; // 5分

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { cdmCardNo: true, lastScrapedAt: true },
  });

  if (!user?.cdmCardNo) {
    return NextResponse.json({ error: '会員番号が設定されていません' }, { status: 400 });
  }

  // 前回スクレイプから5分以内なら拒否
  if (user.lastScrapedAt) {
    const elapsed = Date.now() - new Date(user.lastScrapedAt).getTime();
    if (elapsed < SCRAPE_INTERVAL_MS) {
      const waitSec = Math.ceil((SCRAPE_INTERVAL_MS - elapsed) / 1000);
      return NextResponse.json(
        { error: `あと${waitSec}秒後に更新できます` },
        { status: 429 },
      );
    }
  }

  // lastScrapedAt を先に更新（二重実行防止）
  await prisma.user.update({
    where: { id: session.user.id },
    data: { lastScrapedAt: new Date() },
  });

  const [aiResult, aiHeartResult] = await Promise.allSettled([
    scrapeScoring({ userId: session.user.id, cdmCardNo: user.cdmCardNo, scoringType: 'ai' }),
    scrapeScoring({ userId: session.user.id, cdmCardNo: user.cdmCardNo, scoringType: 'ai-heart' }),
  ]);

  return NextResponse.json({
    ai: aiResult.status === 'fulfilled'
      ? aiResult.value
      : { error: aiResult.reason?.message },
    aiHeart: aiHeartResult.status === 'fulfilled'
      ? aiHeartResult.value
      : { error: aiHeartResult.reason?.message },
  });
}
