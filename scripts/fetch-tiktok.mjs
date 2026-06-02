// Prebuild step. Reads every TikTok URL referenced in homepage.json (shorts +
// any featured items with platform "tiktok"), pulls the official poster + title
// via TikTok oEmbed, downloads the thumbnail locally to public/images/tiktok/,
// and writes a cache map to src/data/tiktok-cache.json that the components read.
//
// Resilient by design: on any failure it keeps the previously cached entry /
// downloaded file, so a TikTok hiccup at deploy time never blanks the section.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const r = (p) => new URL(p, ROOT);

const home = JSON.parse(readFileSync(r('src/data/homepage.json'), 'utf8'));
mkdirSync(r('public/images/tiktok/'), { recursive: true });

const cachePath = r('src/data/tiktok-cache.json');
let cache = {};
if (existsSync(cachePath)) {
  try { cache = JSON.parse(readFileSync(cachePath, 'utf8')); } catch {}
}

// collect urls
const urls = new Set();
for (const it of home.shorts?.items ?? []) if (it.tiktokUrl) urls.add(it.tiktokUrl);
for (const it of home.featured?.items ?? []) if (it.platform === 'tiktok' && it.url) urls.add(it.url);

const idOf = (u) => (u.match(/video\/(\d+)/) || [])[1] || Buffer.from(u).toString('hex').slice(0, 12);
const cleanTitle = (t) =>
  (t || '')
    .split(/#|\n/)[0]
    .replace(/[\u{1F000}-\u{1FAFF}☀-➿←-⇿⬀-⯿]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

let ok = 0, kept = 0, failed = 0;
for (const url of urls) {
  const id = idOf(url);
  const localPath = `/images/tiktok/${id}.jpg`;
  const fileUrl = r(`public/images/tiktok/${id}.jpg`);
  try {
    const res = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (!res.ok) throw new Error(`oembed ${res.status}`);
    const j = await res.json();
    if (!j.thumbnail_url) throw new Error('no thumbnail_url');
    const img = await fetch(j.thumbnail_url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!img.ok) throw new Error(`thumb ${img.status}`);
    writeFileSync(fileUrl, Buffer.from(await img.arrayBuffer()));
    cache[url] = {
      thumb: localPath,
      title: cleanTitle(j.title) || cache[url]?.title || '',
      author: j.author_name || cache[url]?.author || '',
    };
    ok++;
  } catch (e) {
    // keep an existing good entry; otherwise leave a blank so the UI uses a placeholder
    if (cache[url]?.thumb && existsSync(r(`public${cache[url].thumb}`))) {
      kept++;
    } else {
      cache[url] = cache[url] || { thumb: '', title: '', author: '' };
      failed++;
      console.warn(`  · ${id}: ${e.message} (placeholder)`);
    }
  }
}

writeFileSync(cachePath, JSON.stringify(cache, null, 2));
console.log(`tiktok: ${ok} fetched, ${kept} kept from cache, ${failed} placeholder · ${urls.size} total`);
