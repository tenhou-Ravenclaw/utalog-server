import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

// Prismaクライアントのシングルトンインスタンスを作成
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * データベースから取得したデータをCSV形式の文字列に変換します。
 * @param {Array<Object>} data - 統合された採点履歴のオブジェクトの配列
 * @returns {string} CSV形式の文字列
 */
function convertToCSV(data) {
  if (!data || data.length === 0) {
    return 'id,title,artist,score,date,scoringMethod\n'; // データがない場合はヘッダーのみ返す
  }

  const headers = ['ID', '曲名', 'アーティスト名', 'スコア', '歌唱日時', '採点方法'];

  const rows = data.map(item => {
    // データをCSVの各セルに対応させる
    const escapedTitle = `"${String(item.title).replace(/"/g, '""')}"`;
    const escapedArtist = `"${String(item.artist).replace(/"/g, '""')}"`;
    const date = new Date(item.date).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });

    return [item.id, escapedTitle, escapedArtist, item.score, date, item.scoringMethod].join(',');
  });

  // ヘッダー行とデータ行を結合
  const csvContent = [headers.join(','), ...rows].join('\n');

  // Excelでの文字化けを防ぐためのBOMを先頭に追加
  return '\uFEFF' + csvContent;
}

export async function GET() {
  try {
    // 両方の採点方法のデータを並行して取得
    const [aiHistory, aiHeartHistory] = await Promise.all([
      prisma.aISongHistory.findMany({
        orderBy: { date: 'desc' },
        select: {
          id: true,
          title: true,
          artist: true,
          score: true,
          date: true,
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

    const csvData = convertToCSV(sortedHistory);

    // ファイル名を生成 (例: utalog_export_2023-10-27.csv)
    const filename = `utalog_export_${new Date().toISOString().split('T')[0]}.csv`;

    // CSVデータをレスポンスとして返す
    return new Response(csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('CSVエクスポートエラー:', error);
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}