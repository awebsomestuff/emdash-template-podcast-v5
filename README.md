# Signal & Noise — EmDash Podcast Template

A bold, audio-first podcast template for [EmDash CMS](https://emdashcms.com) built on Astro 6 + Cloudflare (D1 + R2). Designed for professional shows with episodes, hosts, guests, seasons, transcripts, show notes, and a valid Apple Podcasts RSS feed.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/your-org/emdash-template-podcast)

## Features

- **Dark-mode first** — bold editorial aesthetic with Bricolage Grotesque + Inter, electric lime accent
- **Episode pages** — large cover art, native audio player, show notes with timestamped chapters, collapsable transcripts, guest credits
- **Hosts & guests** — dedicated bio pages with photos, socials, and appearance history
- **Seasons & topics** — filterable episode archive by season and topic
- **Platform links** — Spotify, Apple Podcasts, YouTube, RSS buttons baked into the UI
- **Valid podcast RSS** — `/rss.xml` with `itunes:` namespace, `<enclosure>`, duration, episode/season numbers — ready to submit to directories
- **Fully server-rendered** — no static paths, edits appear instantly
- **Visual editing ready** — inline edit attributes, search, menus, widgets, SEO

## Quick start

```bash
npm install

# Create D1 database and paste its id into wrangler.jsonc
wrangler d1 create emdash-template-podcast

# Create R2 bucket
wrangler r2 bucket create emdash-template-podcast-media

# Seed demo content
npx emdash seed seed/seed.json

# Dev
npm run dev
```

Admin: `http://localhost:4321/_emdash/admin`

## Structure

```
src/
  layouts/Base.astro        — Shared HTML shell, menu, theme toggle, search
  components/               — Episode, Host, Audio, Waveform, PlatformLinks, ShowNotes
  pages/
    index.astro             — Homepage (hero + featured episode + grid + hosts)
    episodes/               — Listing + detail
    hosts/[slug].astro      — Host bio + episodes
    season/[slug].astro     — Season archive
    rss.xml.ts              — Podcast RSS (itunes namespace)
  styles/theme.css          — Design tokens
seed/seed.json              — Demo content
```

## Deployment

```bash
npm run build
npm run deploy
```

## License

MIT
