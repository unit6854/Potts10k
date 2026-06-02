// Reads the build-time TikTok cache (written by scripts/fetch-tiktok.mjs).
// Safe if the file is missing → returns null so the UI falls back to a placeholder.
import { readFileSync, existsSync } from 'node:fs';

const cacheUrl = new URL('../data/tiktok-cache.json', import.meta.url);
let cache = {};
try {
  if (existsSync(cacheUrl)) cache = JSON.parse(readFileSync(cacheUrl, 'utf8'));
} catch {}

/** Cached { thumb, title, author } for a TikTok URL, or null. */
export function tiktokInfo(url) {
  return (url && cache[url]) || null;
}

const PLACEHOLDER = '/images/short-1.webp';

/** Resolve the best thumbnail for an item: explicit upload → cache → placeholder. */
export function resolveThumb(explicit, url) {
  if (explicit) return explicit;
  const info = tiktokInfo(url);
  return info?.thumb || PLACEHOLDER;
}

/** Resolve the best title: explicit → cache → fallback. */
export function resolveTitle(explicit, url, fallback = '') {
  if (explicit) return explicit;
  const info = tiktokInfo(url);
  return info?.title || fallback;
}
