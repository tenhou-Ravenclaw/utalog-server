import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth.js';
import prisma from '../../../lib/prisma.js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

function convertToCSV(data) {
  const headers = ['曲名', 'アーティスト名', 'スコア', '採点方法', '歌唱日時'];

  if (!data || data.length === 0) {
    return '\uFEFF' + headers.join(',') + '\n';
  }

  const rows = data.map(item => {
    const escapedTitle = `"${String(item.title).replace(/"/g, '""')}"`;
    const escapedArtist = `"${String(item.artist).replace(/"/g, '""')}"`;
    const scoringMethodLabel = item.scoringType === 'ai' ? 'AI採点' : 'AI Heart採点';
    const date = new Date(item.date).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    return [escapedTitle, escapedArtist, item.score, scoringMethodLabel, date].join(',');
  });

  return '\uFEFF' + [headers.join(','), ...rows].join('\n');
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  try {
    const allHistory = await prisma.songHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
    });

    const csvData = convertToCSV(allHistory);
    const filename = `utalog_export_${new Date().toISOString().split('T')[0]}.csv`;

    return new Response(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('CSVエクスポートエラー:', error);
    return NextResponse.json({ error: 'エクスポートに失敗しました' }, { status: 500 });
  }
}
