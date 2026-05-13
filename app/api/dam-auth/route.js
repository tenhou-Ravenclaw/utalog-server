import { NextResponse } from 'next/server';
import { fetchDamCardNo } from '../../../lib/damAuth.js';
import { damAuthLimiter, getIp } from '../../../lib/ratelimit.js';

/**
 * DAM★とも ID + パスワードで認証して cdmCardNo を返す
 * POST body: { loginId: string, password: string }
 */
export async function POST(request) {
  try {
    const { success } = await damAuthLimiter.limit(getIp(request));
    if (!success) {
      return NextResponse.json(
        { error: 'しばらく時間をおいてから再試行してください' },
        { status: 429 },
      );
    }

    const { loginId, password } = await request.json();

    if (!loginId || !password) {
      return NextResponse.json(
        { error: 'DAM★とも ID とパスワードを入力してください' },
        { status: 400 },
      );
    }

    const { cdmCardNo } = await fetchDamCardNo({ loginId, password });

    return NextResponse.json({ cdmCardNo });
  } catch (error) {
    console.error('DAM認証エラー:', error.message);
    return NextResponse.json(
      { error: error.message || 'DAM★とも認証に失敗しました' },
      { status: 400 },
    );
  }
}
