// Build-time TikTok cache (written by scripts/fetch-tiktok.mjs, refreshed by the
// `prebuild` step). Imported statically so Vite/Astro bundles it reliably.
import cache from '../data/tiktok-cache.json';

/** Cached { thumb, title, author } for a TikTok URL, or null. */
export function tiktokInfo(url) {
  return (url && cache[url]) || null;
}

const PLACEHOLDER = '/images/short-1.webp';

/** Resolve the best thumbnail: explicit upload → cache → placeholder. */
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
