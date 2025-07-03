import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

/**
 * データベースから取得したデータをCSV形式の文字列に変換します。
 * @param {Array<Object>} data - SongHistoryのオブジェクトの配列
 * @returns {string} CSV形式の文字列
 */
function convertToCSV(data) {
  if (!data || data.length === 0) {
    return 'id,title,artist,score,date\n'; // データがない場合はヘッダーのみ返す
  }

  const headers = ['ID', '曲名', 'アーティスト名', 'スコア', '歌唱日時'];
  
  const rows = data.map(item => {
    // データをCSVの各セルに対応させる
    const escapedTitle = `"${String(item.title).replace(/"/g, '""')}"`;
    const escapedArtist = `"${String(item.artist).replace(/"/g, '""')}"`;
    const date = new Date(item.date).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    
    return [item.id, escapedTitle, escapedArtist, item.score, date].join(',');
  });

  // ヘッダー行とデータ行を結合
  const csvContent = [headers.join(','), ...rows].join('\n');

  // Excelでの文字化けを防ぐためのBOMを先頭に追加
  return '\uFEFF' + csvContent;
}

export async function GET() {
  try {
    // データベースから全履歴を日付の新しい順に取得
    const allHistory = await prisma.songHistory.findMany({
      orderBy: {
        date: 'desc',
      },
    });

    const csvData = convertToCSV(allHistory);

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