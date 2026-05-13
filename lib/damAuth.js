import axios from 'axios';
import xml2js from 'xml2js';

const BASE_URL = 'https://www.clubdam.com';

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ja-JP,ja;q=0.9',
};

/** レスポンスヘッダーから Cookie を Map に変換 */
function parseCookies(setCookieHeaders) {
  const cookies = {};
  for (const header of setCookieHeaders) {
    const [kv] = header.split(';');
    const eqIdx = kv.indexOf('=');
    if (eqIdx > 0) {
      const key = kv.substring(0, eqIdx).trim();
      const val = kv.substring(eqIdx + 1).trim();
      cookies[key] = val;
    }
  }
  return cookies;
}

function formatCookies(cookies) {
  return Object.entries(cookies)
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');
}

/**
 * base64 デコードして数字のみで構成されているか検証する
 */
function isValidCdmCardNo(value) {
  try {
    const decoded = Buffer.from(value, 'base64').toString('utf-8');
    return /^\d{10,20}$/.test(decoded);
  } catch {
    return false;
  }
}

/**
 * HTML ページから cdmCardNo を抽出する
 * cdmCardNo は数字列を base64 エンコードした値
 */
function extractCdmCardNo(html) {
  const match = html.match(/cdmCardNo=([A-Za-z0-9+/=]{16,})/);
  if (match && isValidCdmCardNo(match[1])) return match[1];
  return null;
}

/**
 * DAM★とも ID + パスワードでログインし cdmCardNo を返す
 * @param {{ loginId: string, password: string }} credentials
 * @returns {{ cdmCardNo: string }}
 */
export async function fetchDamCardNo({ loginId, password }) {
  // 1. ログインページを GET して JSESSIONID を取得
  // maxRedirects: 0 でリダイレクトループを防ぐ（JSESSIONID は 302 レスポンスで返ってくる）
  const initResp = await axios.get(
    `${BASE_URL}/app/damtomo/auth/member/Login.do`,
    {
      headers: DEFAULT_HEADERS,
      maxRedirects: 0,
      validateStatus: s => s < 400 || s === 302,
    },
  );
  const cookies = parseCookies(initResp.headers['set-cookie'] || []);

  // 2. ログイン API に POST
  const loginResp = await axios.post(
    `${BASE_URL}/app/damtomo/auth/LoginXML.do`,
    new URLSearchParams({ procKbn: '1', loginId, password, enc: 'sjis' }).toString(),
    {
      headers: {
        ...DEFAULT_HEADERS,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': formatCookies(cookies),
        'Referer': `${BASE_URL}/app/damtomo/auth/member/Login.do`,
        'Origin': BASE_URL,
      },
    },
  );

  // ログイン後の Cookie を追加
  const loginCookies = parseCookies(loginResp.headers['set-cookie'] || []);
  const sessionCookies = { ...cookies, ...loginCookies };

  // 3. ログインレスポンスの XML を解析してステータス確認
  const parser = new xml2js.Parser();
  const loginXml = await parser.parseStringPromise(loginResp.data);

  const statusCode =
    loginXml?.document?.statusCode?.[0] ??
    loginXml?.document?.data?.[0]?.statusCode?.[0];

  if (statusCode === '1001') throw new Error('IDまたはパスワードが正しくありません');
  if (statusCode === '1000') throw new Error('パラメータが不正です');
  if (statusCode && statusCode !== '0000' && !statusCode.startsWith('000')) {
    throw new Error(`ログインに失敗しました (${statusCode})`);
  }

  // 4. マイページから cdmCardNo を取得
  const myPageResp = await axios.get(
    `${BASE_URL}/app/damtomo/MyPage.do`,
    {
      headers: {
        ...DEFAULT_HEADERS,
        'Cookie': formatCookies(sessionCookies),
        'Referer': `${BASE_URL}/app/damtomo/MyPage.do`,
      },
    },
  );

  const cdmCardNo = extractCdmCardNo(myPageResp.data);
  if (!cdmCardNo) {
    throw new Error(
      'CDM会員番号を取得できませんでした。DAM★ともアカウントにCDMカードが紐付けられているか確認してください。',
    );
  }

  return { cdmCardNo };
}
