import 'dotenv/config'
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

console.log('=== 全採点方法のデータ更新を開始 ===');

async function runScrapeScript(scriptPath, name) {
  console.log(`\n--- ${name}のデータ更新を開始 ---`);
  try {
    const { stdout, stderr } = await execAsync(`node ${scriptPath}`);
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.error(`${name}警告:`, stderr);
    }
    console.log(`--- ${name}のデータ更新完了 ---`);
  } catch (error) {
    console.error(`${name}のデータ更新でエラーが発生しました:`, error.message);
    // エラーが発生しても他のスクリプトは実行を続ける
  }
}

async function main() {
  const scripts = [
    { path: 'scripts/ai/scrape.js', name: 'AI採点' },
    // 将来の拡張用：他の採点方法のスクリプトをここに追加
    { path: 'scripts/dx-g/scrape.js', name: '精密採点DX-G' },
    { path: 'scripts/ai-heart/scrape.js', name: 'AI Heart採点' },
  ];

  for (const script of scripts) {
    await runScrapeScript(script.path, script.name);
  }

  console.log('\n=== 全採点方法のデータ更新完了 ===');
}

main().catch(console.error);