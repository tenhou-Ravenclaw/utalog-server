import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '../../../../lib/prisma.js';
import { scrapeScoring } from '../../../../lib/scraper.js';
import { registerLimiter, getIp } from '../../../../lib/ratelimit.js';

export async function POST(request) {
  try {
    const { success } = await registerLimiter.limit(getIp(request));
    if (!success) {
      return NextResponse.json(
        { error: 'しばらく時間をおいてから再試行してください' },
        { status: 429 },
      );
    }

    const { email, password, cdmCardNo } = await request.json();

    if (!email || !password || !cdmCardNo) {
      return NextResponse.json({ error: '全ての項目を入力してください' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'パスワードは8文字以上にしてください' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, cdmCardNo },
    });

    // 登録後にバックグラウンドでスクレイプ開始（await しない）
    Promise.allSettled([
      scrapeScoring({ userId: user.id, cdmCardNo, scoringType: 'ai' }),
      scrapeScoring({ userId: user.id, cdmCardNo, scoringType: 'ai-heart' }),
    ]).catch(err => console.error('初回スクレイプエラー:', err));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('登録エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
