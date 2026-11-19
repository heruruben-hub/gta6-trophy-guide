# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/heruruben-hub/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/heruruben-hub/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Legend** — an offline guide and tracker for all 55 Grand Theft Auto VI PlayStation 5 trophies. Every trophy carries its official name, description and grade, a guide in our own words, and the sources that guide is built from, named beside it. A six-stage roadmap walks the run to the platinum in the order the official descriptions dictate — story chapters, character strands, then the 100% checklist — and flags the one missable trophy (Positive Mental Attitude: a meditation spot that exists only in Chapter 1) plus four save-watch story beats. The tracker saves progress in localStorage, filters by kind (story, missable, collectibles, activities, online) and grade, searches, hides story trophies behind a spoiler shield until they are earned, and exports/imports progress as a JSON file. No network, no build step, no Rockstar artwork — the look is its own.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. (To hand the guide in instead: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.)

## What's inside

- `app/` — the guide itself: plain static files, no build step. `index.html` plus ES modules (`app.js` boots and wires the views, `tracker.js` renders the checklist and the per-trophy guide panel, `roadmap.js` holds the six-stage roadmap and the golden rules, `storage.js` keeps progress in localStorage and handles export/import) and one stylesheet.
- `app/data/trophies.json` — the official 55 trophies (names, descriptions and grades exactly as PlayStation publishes them), each enriched with its kind, its roadmap stage, its tracked count where PlayStation tracks one, a missable or save-watch flag where the descriptions support one, an original guide, and its sources.
- `screenshots/` — four real renders of the running app: the checklist with the missable trophy's guide open, the roadmap, the spoiler shield at work, and the Collectibles filter with a gold trophy's guide.
- `main.ts` — hands the guide in: copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the kit's vendored library (`vendor/makefun-frontend.ts`, unchanged).

## Sources

Guides are written for this entry and cite, per trophy: the official PlayStation trophy list as published via [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and PSNProfiles; [Keen Gamer's platinum roadmap](https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/); [Output Lag's trophy list](https://outputlag.com/guides/gta-6-trophy-list/); [GTABase's trophy guide](https://www.gtabase.com/articles/gta-6/gta-6-achievements-trophies-list-ps5-xbox-series); and [GTA Vibes' trophy list](https://www.gtavibes.com/guides/gta-6-trophy-list-achievements). Facts are cited, never copied; the only verbatim text is the official trophy names and descriptions themselves.

---

Entered on [make.fun](https://make.fun/?ref=kh6903y0&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards
