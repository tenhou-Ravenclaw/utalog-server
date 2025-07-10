/**
 * 楽曲名を正規化する関数
 * 全角半角統一、生音表記統一、空白正規化を行う
 */
export const normalizeSongTitle = (title) => {
    if (!title) return '';

    return title
        // 1. 全角英数字を半角に
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
        // 2. 全角記号を半角に
        .replace(/[（）]/g, (s) => s === '（' ? '(' : ')')
        .replace(/[｛｝]/g, (s) => s === '｛' ? '{' : '}')
        .replace(/[［］]/g, (s) => s === '［' ? '[' : ']')
        .replace(/[！？]/g, (s) => s === '！' ? '!' : '?')
        .replace(/[：；]/g, (s) => s === '：' ? ':' : ';')
        .replace(/[，．]/g, (s) => s === '，' ? ',' : '.')
        // 3. 生音表記の統一（すべて最後に(生音)形式に統一）
        .replace(/\[(生音|生音版|生演奏|オリジナル|original)\]/gi, '')  // [生音]系を削除
        .replace(/（(生音|生音版|生演奏|オリジナル|original)）/gi, '')   // （生音）系を削除
        .replace(/\((生音|生音版|生演奏|オリジナル|original)\)/gi, '')    // (生音)系を削除
        .replace(/～(生音|生音版|生演奏|オリジナル|original)～/gi, '')      // ～生音～系を削除
        .replace(/-(生音|生音版|生演奏|オリジナル|original)-/gi, '')       // -生音-系を削除
        // 4. 空白の正規化
        .replace(/\s+/g, ' ')
        .trim()
        // 5. 削除した生音表記があった場合は最後に(生音)を追加
        + (/(生音|生音版|生演奏|オリジナル|original)/i.test(title) ? '(生音)' : '');
};

/**
 * 楽曲名から正規化されたURLセーフな文字列を生成
 */
export const generateSongUrl = (title) => {
    const normalized = normalizeSongTitle(title);
    return encodeURIComponent(normalized);
};

/**
 * 楽曲リストから重複を除去（正規化された楽曲名で判定）
 */
export const removeDuplicateSongs = (songs) => {
    const seen = new Set();
    return songs.filter(song => {
        const normalized = normalizeSongTitle(song.title);
        if (seen.has(normalized)) {
            return false;
        }
        seen.add(normalized);
        return true;
    });
};
