# POTTS_10K — Project Guide for Claude Code

Immersive, blue/techy gaming site for the streamer **Potts_10K** (TikTok
[@potts_10k](https://www.tiktok.com/@potts_10k), Twitch potts_10k).
Stack: **Astro (static) + Decap CMS + Netlify**. Domain: **potts10k.com**.

---

## ⚠️ Repo isolation (read first)

This folder lives inside a parent git repo (the user's home dir) whose remote is
**Slaydbyjade**, and there is also an **AdLogic** repo nearby. **Never** commit
this project's files into either of those.

This project has its **own** `.git` here in `KPotts/` with remote
`https://github.com/unit6854/Potts10k.git` on branch `main`. Before any git
write, run `git rev-parse --show-toplevel` and confirm it ends in `KPotts`.
If it does not, **STOP** and tell the user — do not `git add`.

Do not touch the AdLogic or Slaydbyjade repos/folders.

---

## The "deploy" command

When the user types **deploy** (just that word), do all of the following.
Do not ask for confirmation unless a step is genuinely blocked.

1. **Safety check:** `git rev-parse --show-toplevel` must end in `KPotts`. If not, STOP.
2. **Clean build:** run `npm run build`. If it fails, STOP and report the error.
3. `git add -A`
4. `git commit -m "<concise message describing what changed>"`
   End every commit message with:
   `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`
5. **Remote:** ensure `origin` = `https://github.com/unit6854/Potts10k.git`.
6. **Push:**
   - If the GitHub repo does not exist yet, create + push:
     `gh repo create unit6854/Potts10k --public --source=. --remote=origin --push`
   - Otherwise: `git push -u origin main`
7. Report success. After the first Netlify import, report the live URL.

Rules: branch is `main`; never `--no-verify`; never force-push.

---

## How the site works

- **All content is in one file:** [`src/data/homepage.json`](src/data/homepage.json).
  Components never hardcode text or images — they read from this JSON. Decap edits
  this same file (see `public/admin/config.yml`), so the CMS fields must always stay
  in sync with the JSON keys. Run `node scripts/verify-cms.mjs` after changing either.
- **Editable vs fixed:** every image is editable in Decap **except** the hero
  composite and the logo (intentionally fixed). The hero is `Logo.png` rendered with
  `mix-blend-mode: screen` over a WebGL energy field.
- **Visuals:** `src/components/HeroBackground.astro` is a raw-WebGL fragment shader
  (blue fbm energy + pixel-trickle). It is FPS-capped (32), renders at 0.6× internal
  resolution, pauses off-screen, and falls back to a CSS gradient for
  `prefers-reduced-motion`. Keep the CPU/GPU budget low–medium: prefer GPU/shader
  work over JS animation; do not add heavy per-frame JS.
- **TikTok shorts:** no reliable free auto-feed exists. Each clip = poster + optional
  uploaded preview clip (plays muted on hover) + TikTok link. If no thumbnail is
  uploaded, `ShortsTikTok.astro` fetches one from TikTok oEmbed at build time.
- **Fonts:** Chakra Petch (display), Barlow (body), Orbitron (numbers), self-hosted
  via `@fontsource`.

## Structure

```
src/
  data/homepage.json        ← single source of truth (edited via Decap)
  layouts/BaseLayout.astro  ← <head>, fonts, Netlify Identity widget
  components/               ← Hero, NavBar, FeaturedVideos, ShortsTikTok, …
  pages/index.astro         ← composes the homepage
public/
  images/                   ← media (Decap target) + processed hero/logo/avatar
  admin/                    ← Decap CMS (index.html + config.yml)
scripts/
  process-assets.mjs        ← regenerate hero/logo/avatar + placeholder tiles
  verify-cms.mjs            ← assert config.yml matches homepage.json
  shot.mjs                  ← headless screenshot (system Edge) for visual checks
```

## Common commands

- `npm run dev` — local dev server (http://localhost:4321)
- `npm run build` — static build to `dist/` (what Netlify runs)
- `node scripts/verify-cms.mjs` — check CMS/JSON field parity
- `node scripts/process-assets.mjs` — rebuild images from source art
