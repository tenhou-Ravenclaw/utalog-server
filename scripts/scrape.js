import 'dotenv/config'

import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import xml2js from 'xml2js';

const prisma = new PrismaClient();

// --- 設定 ---
const CDM_CARD_NO = process.env.DAM_CDM_CARD_NO;
const API_URL = 'https://www.clubdam.com/app/damtomo/scoring/GetScoringAiListXML.do';
const MAX_ITEMS = 200;

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
  // ... (main関数前半のデータ取得ロジックは変更なし) ...
  if (!CDM_CARD_NO || CDM_CARD_NO === '0000000000') {
    console.error('エラー: .env ファイルに DAM_CDM_CARD_NO を設定してください。');
    return;
  }

  console.log('--- utalog データ更新開始 (最新5件比較・最適化版) ---');

  const latestDbRecords = await prisma.aISongHistory.findMany({
    take: 5,
    orderBy: { date: 'desc' },
    select: { id: true, score: true },
  });
  const dbRecordMap = new Map(latestDbRecords.map(r => [r.id, r.score]));

  let firstPageResults = [];
  try {
    const response = await axios.get(API_URL, { params: { cdmCardNo: CDM_CARD_NO, pageNo: 1 } });
    const parser = new xml2js.Parser();
    const resultJson = await parser.parseStringPromise(response.data);
    firstPageResults = convertDamData(resultJson);
  } catch (error) {
    console.error('APIからの初回データ取得に失敗しました。', error.message);
    return;
  }

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

  let allNewData = [];
  let currentPage = 1;
  let hasNext = true;
  let shouldStop = false;

  while (allNewData.length < MAX_ITEMS && hasNext && !shouldStop) {
    const pageResults = (currentPage === 1) ? firstPageResults : await (async () => {
      try {
        const response = await axios.get(API_URL, { params: { cdmCardNo: CDM_CARD_NO, pageNo: currentPage } });
        const parser = new xml2js.Parser();
        const resultJson = await parser.parseStringPromise(response.data);
        return convertDamData(resultJson);
      } catch (e) { return []; }
    })();

    if (pageResults.length === 0) break;

    for (const item of pageResults) {
      const existingRecord = await prisma.aISongHistory.findUnique({ where: { id: item.id } });
      if (existingRecord) {
        shouldStop = true;
        break;
      } else {
        allNewData.push(item);
      }
    }

    if (!shouldStop) {
      const metaResponse = await axios.get(API_URL, { params: { cdmCardNo: CDM_CARD_NO, pageNo: currentPage } });
      const parser = new xml2js.Parser();
      const metaJson = await parser.parseStringPromise(metaResponse.data);
      hasNext = getMeta(metaJson).hasNext;
      currentPage++;
    }
  }

  if (allNewData.length === 0) {
    console.log('（詳細チェックの結果）新しいデータはありませんでした。');
    return;
  }

  const finalData = allNewData.slice(0, MAX_ITEMS);
  console.log(`APIから新たに${finalData.length}件のデータを取得しました。データベースに書き込みます...`);

  // ★★★ ここからが修正箇所 ★★★
  let processedCount = 0;
  // createManyの代わりに、1件ずつupsertを実行するループ処理に変更
  for (const item of finalData) {
    // 不正なデータはスキップ
    if (!item.id || !item.date || isNaN(item.score)) continue;

    await prisma.aISongHistory.upsert({
      where: { id: item.id },
      // 既存のレコードが見つかった場合の更新内容
      update: {
        score: item.score,
        date: item.date, // 日時も更新される可能性があるため
      },
      // 新規レコードの場合の作成内容
      create: {
        id: item.id,
        title: item.title,
        artist: item.artist,
        score: item.score,
        date: item.date,
      },
    });
    processedCount++;
  }

  console.log(`データベースの更新が完了しました。（${processedCount}件処理）`);
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