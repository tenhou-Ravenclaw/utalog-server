import 'dotenv/config'

import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import xml2js from 'xml2js';

const prisma = new PrismaClient();

// --- 設定 ---
const CDM_CARD_NO = process.env.DAM_CDM_CARD_NO;
const API_URL = 'https://www.clubdam.com/app/damtomo/scoring/GetScoringAiListXML.do';
const MAX_ITEMS = 50;

// ... (parseDamDateTime, convertDamData, getMeta は変更なし) ...
function parseDamDateTime(dateTimeStr) {
  if (!dateTimeStr || dateTimeStr.length < 14) return null;
  const year = parseInt(dateTimeStr.substring(0, 4), 10);
  const month = parseInt(dateTimeStr.substring(4, 6), 10) - 1;
  const day = parseInt(dateTimeStr.substring(6, 8), 10);
  const hour = parseInt(dateTimeStr.substring(8, 10), 10);
  const minute = parseInt(dateTimeStr.substring(10, 12), 10);
  const second = parseInt(dateTimeStr.substring(12, 14), 10);
  return new Date(year, month, day, hour, minute, second);
}

function convertDamData(xmlData) {
  if (!xmlData.document.list || !xmlData.document.list[0].data) return [];
  const items = Array.isArray(xmlData.document.list[0].data) 
    ? xmlData.document.list[0].data 
    : [xmlData.document.list[0].data];
  return items.map(d => {
    const attributes = d.scoring[0].$;
    const scoreValue = d.scoring[0]._;
    const normalizedScore = parseFloat(scoreValue) / 1000;
    return {
      id: attributes.scoringAiId,
      title: attributes.contentsName,
      artist: attributes.artistName,
      score: isNaN(normalizedScore) ? 0 : normalizedScore,
      date: parseDamDateTime(attributes.scoringDateTime),
    };
  });
}

function getMeta(xmlData) {
  const page = xmlData.document.data[0].page[0];
  return { hasNext: page.$.hasNext === '1' };
}


async function main() {
  if (!CDM_CARD_NO || CDM_CARD_NO === '0000000000') {
    console.error('エラー: .env ファイルに DAM_CDM_CARD_NO を設定してください。');
    return;
  }
  
  console.log('--- utalog データ更新開始 (最新5件比較・最適化版) ---');

  // ★★★ 1. DBから最新5件のIDとスコアを取得 ★★★
  const latestDbRecords = await prisma.songHistory.findMany({
    take: 5, // 取得件数を5件に修正
    orderBy: { date: 'desc' },
    select: { id: true, score: true },
  });
  const dbRecordMap = new Map(latestDbRecords.map(r => [r.id, r.score]));

  // 2. APIから最初のページ（最新5件）を取得
  let firstPageResults = [];
  try {
    const response = await axios.get(API_URL, { params: { cdmCardNo: CDM_CARD_NO, pageNo: 1 }});
    const parser = new xml2js.Parser();
    const resultJson = await parser.parseStringPromise(response.data);
    firstPageResults = convertDamData(resultJson);
  } catch (error) {
    console.error('APIからの初回データ取得に失敗しました。', error.message);
    return;
  }
  
  // 3. APIの最新5件が、DBの最新5件に全て含まれているかチェック
  // (DBの件数が5件未満の場合も考慮)
  const isUpToDate = firstPageResults.length > 0 && 
                     latestDbRecords.length >= firstPageResults.length &&
                     firstPageResults.every(apiRecord => 
                        dbRecordMap.has(apiRecord.id) && dbRecordMap.get(apiRecord.id) === apiRecord.score
                     );
  
  if (isUpToDate) {
    console.log('データベースは最新の状態です。更新は不要です。');
    return;
  }
  console.log('新しい歌唱履歴、または更新を検知しました。詳細なデータ取得を開始します...');

  // --- 更新が必要な場合のみ、以下の詳細な取得処理を実行 ---
  let allNewData = [];
  let currentPage = 1;
  let hasNext = true;
  let shouldStop = false;

  while (allNewData.length < MAX_ITEMS && hasNext && !shouldStop) {
    const pageResults = (currentPage === 1) ? firstPageResults : await (async () => {
      console.log(`[${currentPage}ページ目] のデータをAPIから取得中...`);
      try {
        const response = await axios.get(API_URL, { params: { cdmCardNo: CDM_CARD_NO, pageNo: currentPage }});
        const parser = new xml2js.Parser();
        const resultJson = await parser.parseStringPromise(response.data);
        return convertDamData(resultJson);
      } catch (e) { return []; }
    })();

    if (pageResults.length === 0) break;

    for (const item of pageResults) {
      // findUniqueの代わりにfindFirstを使うことで、scoreの比較もロジックに含められる
      const existingRecord = await prisma.songHistory.findFirst({ 
        where: { 
          id: item.id,
          score: item.score // スコアも一致するか確認
        } 
      });

      if (existingRecord) {
        shouldStop = true;
        break;
      } else {
        allNewData.push(item);
      }
    }
    
    if (!shouldStop) {
      // hasNextの判定も初回のAPIレスポンスを再利用できる
      if(currentPage === 1) {
          const metaResponse = await axios.get(API_URL, { params: { cdmCardNo: CDM_CARD_NO, pageNo: currentPage }});
          const parser = new xml2js.Parser();
          const metaJson = await parser.parseStringPromise(metaResponse.data);
          hasNext = getMeta(metaJson).hasNext;
      } else {
          hasNext = pageResults.length > 0; // 簡略化
      }
      currentPage++;
    }
  }

  if (allNewData.length === 0) {
    console.log('（詳細チェックの結果）新しいデータはありませんでした。');
    return;
  }
  
  const finalData = allNewData.slice(0, MAX_ITEMS);
  console.log(`APIから新たに${finalData.length}件のデータを取得しました。データベースに書き込みます...`);
  
  const { count } = await prisma.songHistory.createMany({
    data: finalData,
    skipDuplicates: true,
  });
  
  console.log(`データベースに${count}件の新しいレコードを追加しました。`);
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });