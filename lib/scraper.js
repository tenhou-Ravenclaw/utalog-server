import axios from 'axios';
import xml2js from 'xml2js';
import prisma from './prisma.js';

const MAX_ITEMS = 200;
const PARALLEL_PAGES = 5; // 同時に取得するページ数

function parseDamDateTime(dateTimeStr) {
  if (!dateTimeStr || dateTimeStr.length < 14) return null;
  const year   = parseInt(dateTimeStr.substring(0, 4), 10);
  const month  = parseInt(dateTimeStr.substring(4, 6), 10) - 1;
  const day    = parseInt(dateTimeStr.substring(6, 8), 10);
  const hour   = parseInt(dateTimeStr.substring(8, 10), 10);
  const minute = parseInt(dateTimeStr.substring(10, 12), 10);
  const second = parseInt(dateTimeStr.substring(12, 14), 10);
  return new Date(year, month, day, hour, minute, second);
}

function getPageCount(xmlData) {
  try {
    const page = xmlData.document.data[0].page[0];
    return {
      hasNext: page.$.hasNext === '1',
      pageCount: parseInt(page.$.pageCount, 10) || 1,
    };
  } catch {
    return { hasNext: false, pageCount: 1 };
  }
}

const SCORING_CONFIGS = {
  ai: {
    apiUrl: 'https://www.clubdam.com/app/damtomo/scoring/GetScoringAiListXML.do',
    convertData(xmlData) {
      if (!xmlData.document.list?.[0]?.data) return [];
      const items = Array.isArray(xmlData.document.list[0].data)
        ? xmlData.document.list[0].data
        : [xmlData.document.list[0].data];
      return items.map(d => {
        const attr = d.scoring[0].$;
        const normalized = parseFloat(d.scoring[0]._) / 1000;
        return {
          externalId: attr.scoringAiId,
          title: attr.contentsName,
          artist: attr.artistName,
          score: isNaN(normalized) ? 0 : normalized,
          date: parseDamDateTime(attr.scoringDateTime),
        };
      });
    },
  },
  'ai-heart': {
    apiUrl: 'https://www.clubdam.com/app/damtomo/scoring/GetScoringHeartsListXML.do',
    convertData(xmlData) {
      if (!xmlData.document.list?.[0]?.data) return [];
      const items = Array.isArray(xmlData.document.list[0].data)
        ? xmlData.document.list[0].data
        : [xmlData.document.list[0].data];
      return items.map(d => {
        const attr = d.scoringHearts[0].$;
        const normalized = parseFloat(d.scoringHearts[0]._) / 1000;
        return {
          externalId: attr.scoringHeartsHistoryId,
          title: attr.songName,
          artist: attr.artistName,
          score: isNaN(normalized) ? 0 : normalized,
          date: parseDamDateTime(attr.scoringDateTime),
        };
      });
    },
  },
};

async function fetchPage(apiUrl, cdmCardNo, pageNo, convertData) {
  const parser = new xml2js.Parser();
  const response = await axios.get(apiUrl, { params: { cdmCardNo, pageNo } });
  const resultJson = await parser.parseStringPromise(response.data);
  return {
    items: convertData(resultJson),
    meta: getPageCount(resultJson),
  };
}

/**
 * 指定ユーザーの採点データをDAM APIから取得してDBに保存する
 * @param {{ userId: string, cdmCardNo: string, scoringType: 'ai' | 'ai-heart' }} options
 * @returns {{ processed: number, message: string }}
 */
export async function scrapeScoring({ userId, cdmCardNo, scoringType }) {
  const config = SCORING_CONFIGS[scoringType];
  if (!config) throw new Error(`Unknown scoring type: ${scoringType}`);

  const { apiUrl, convertData } = config;

  // DBに存在する externalId を一括取得
  const existingRecords = await prisma.songHistory.findMany({
    where: { userId, scoringType },
    select: { externalId: true },
  });
  const existingIds = new Set(existingRecords.map(r => r.externalId));

  // 1ページ目を取得してページ総数を確認
  let firstPage;
  try {
    firstPage = await fetchPage(apiUrl, cdmCardNo, 1, convertData);
  } catch (error) {
    throw new Error(`APIからの初回データ取得に失敗しました: ${error.message}`);
  }

  // 1ページ目が全て既存データなら更新不要
  if (firstPage.items.length > 0 && firstPage.items.every(r => existingIds.has(r.externalId))) {
    return { processed: 0, message: 'データベースは最新の状態です' };
  }

  // 全ページを並列取得（PARALLEL_PAGES件ずつバッチ処理）
  const totalPages = Math.min(firstPage.meta.pageCount, Math.ceil(MAX_ITEMS / 5));
  const allItems = [...firstPage.items];

  for (let batchStart = 2; batchStart <= totalPages; batchStart += PARALLEL_PAGES) {
    const batchEnd = Math.min(batchStart + PARALLEL_PAGES - 1, totalPages);
    const pageNos = Array.from({ length: batchEnd - batchStart + 1 }, (_, i) => batchStart + i);

    const results = await Promise.allSettled(
      pageNos.map(pageNo => fetchPage(apiUrl, cdmCardNo, pageNo, convertData)),
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        allItems.push(...result.value.items);
      }
    }
  }

  // 新規データのみ抽出
  const newItems = allItems.filter(item => !existingIds.has(item.externalId));
  const finalData = newItems.slice(0, MAX_ITEMS);

  // DB に一括 upsert
  let processed = 0;
  for (const item of finalData) {
    if (!item.externalId || !item.date || isNaN(item.score)) continue;

    await prisma.songHistory.upsert({
      where: {
        userId_externalId_scoringType: { userId, externalId: item.externalId, scoringType },
      },
      update: { score: item.score, date: item.date },
      create: {
        userId,
        externalId: item.externalId,
        title: item.title,
        artist: item.artist,
        score: item.score,
        date: item.date,
        scoringType,
      },
    });
    processed++;
  }

  return { processed, message: `${processed}件のデータを更新しました` };
}
