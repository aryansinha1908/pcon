# PCON Website

The frontend for the Programming Club of NIT Jamshedpur, built with Next.js App Router and TypeScript.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project structure

```text
app/          App Router page, root layout, and global styles
components/   Shared site header, footer, and brand elements
lib/          Homepage content and navigation data
public/       Static assets, including the PCON mark
```

The homepage is frontend-only. Contact links currently use email and can be connected to club channels or backend services later.

## Roadmap data

The `/roadmaps` page (`app/roadmaps/page.tsx`) reads all roadmap content through `getPathway()` in `lib/roadmaps.ts`. The types in that file are the data contract:

- `Pathway` holds the shared `foundation` track (problem solving through HackerRank 5★), the independent `branches` (CP, Web, ML, DevOps) and the `principles` shown in the hero.
- `Roadmap` is one track: title, tint, ordered `steps`, plus optional `locked`, `exploreNext`, `furtherReading`, `channels` and `tips`.
- `RoadmapStep` has a stable `id`, a title, optional `stage`, `optional` and `milestone` flags, and its `resources` (`playlist`, `video`, `practice` or `website` links, with an optional `note` such as "Sessions 1–7").

Content lives in `lib/roadmaps.ts` until the admin panel ships. To switch over, make `getPathway()` fetch from the admin panel's API and return the same shape. Keep step `id`s stable: juniors' progress is saved in their browser (`localStorage` key `pcon:roadmap-progress:v1`) against those ids.
