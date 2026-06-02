// Headless screenshot via system Edge/Chrome. Usage:
//   node scripts/shot.mjs <url> <out.png> [width] [height] [fullPage]
import { chromium } from 'playwright-core';

const [, , url = 'http://localhost:4322/', out = 'shot.png', w = '1280', h = '900', full = 'true'] = process.argv;

const channels = ['msedge', 'chrome', 'chromium'];
let browser, lastErr;
for (const channel of channels) {
  try {
    browser = await chromium.launch({ channel, headless: true });
    break;
  } catch (e) { lastErr = e; }
}
if (!browser) { console.error('No browser found:', lastErr?.message); process.exit(1); }

const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(1500); // let shader + fonts settle
await page.screenshot({ path: out, fullPage: full === 'true' });
const errs = [];
page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
await browser.close();
console.log('Saved', out);
