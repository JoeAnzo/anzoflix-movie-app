# Hyperframes Composition Brief: AnzoFlix

## Objective
Create a 20-second, polished app-store-style brag video for AnzoFlix, an Expo movie and TV discovery app.

## Output
- Composition directory: `brag-output-2026-10-22-102419/composition/`
- Rendered video: `brag-output-2026-10-22-102419/brag.mp4`
- Format: landscape — 1280x720
- Duration: 20 seconds

## Source Material
- Project root: `/home/joel/Desktop/App Development/anzoflix-movie-app`
- Primary files read: `app.json`, `src/app/(tabs)/home.tsx`, `src/app/(tabs)/details/[id].tsx`, `src/app/watch/[id].tsx`, `src/app/components/CardSection.tsx`, `src/app/components/CardDisplay.tsx`, `src/app/components/Logo.tsx`, and `src/app/(tabs)/_layout.tsx`
- Product name: AnzoFlix
- Tagline / strongest claim: no authored marketing tagline; use the product-specific line “Find your next watch.”
- Key UI or visual moment to recreate: dark movie home feed with “Now Playing,” “Trending,” and “Upcoming,” leading into the detail actions “Save,” “Add to Watchlist,” and “Watch”
- Copy that must appear verbatim:
  - `AnzoFlix`
  - `Now Playing`
  - `Trending`
  - `Upcoming`
  - `Save`
  - `Add to Watchlist`
  - `Watch`
  - `Checking authorized playback sources…`

## Creative Direction
- Tone preset: app-store
- Creative direction: a quiet, premium movie-night premiere
- Interpretation: clean feature-forward scenes, restrained motion, readable holds, and app-specific copy.
- Angle: Treat discovery as a small cinema premiere. Lead with the project's supplied red-curtain image, then show the real app flow from browsing to title actions to the playback screen.
- Hook: a red-curtain reveal with “Find your next watch.”
- Outro / punchline: “Browse. Save. Watch.”
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign
  - Real film posters, footage, names, metadata, credentials, or claims about playback/catalog availability

## Visual Identity
- Background: `#141414`
- Text: `#FFFFFF`, secondary `#A1A1AA`
- Accent: `#E50914`
- Display font: bold system sans-serif; the app declares no custom font
- Body font: system sans-serif; the app declares no custom font
- Visual references from the project: `assets/images/cinemaHall.jpg`, the red AnzoFlix wordmark, black feed, red bottom-tab bar

## Storyboard
Use `brag-plan.md` as the creative contract.

Scene summary:
1. Curtain call — 4s — red-curtain hook and AnzoFlix wordmark.
2. Browse — 5.5s — actual home-feed section labels and original abstract poster stand-ins.
3. Save the pick — 5s — fictional title detail with real Save / Add to Watchlist / Watch actions.
4. Open the watch screen — 5.5s — actual loading copy, then “Browse. Save. Watch.” end card.

## Audio
- Audio role: warm, upbeat bed with sparse, professional accents
- Audio arc: gentle music entrance, soft UI accents during browsing and selection, then a calm fade under the end card.
- Music: `happy-beats-business-moves-vol-1-by-ende-dot-app.mp3`
- Music treatment: fade in at the start and fade out over the final 1.5 seconds; no voice track.
- Music cue guidance: bundled preset at `/home/joel/.agents/skills/brag/assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.md`; 17.02s is an optional strong cue for the end card; readability and story take priority.
- Audio-reactive treatment: subtle only; any response should affect existing background glow, never text scale or contrast.
- Audio-coupled moments:
  - Browse-card reveal — one soft card-slide accent.
  - Watchlist tap — one low-risk click.
  - End card — optional reveal near 17.02s.
- SFX selection guidance: low-risk interface or soft-impact sounds only; keep accents sparse and matched to visible motion.
- SFX analysis guidance: read `/home/joel/.agents/skills/brag/assets/sfx/sfx-analysis.md`; prefer low-risk options for polished moments.
- Exact SFX choice: `assets/sfx/casino/card-slide-1.ogg` at the browse reveal and `assets/sfx/interface/click_003.ogg` at the watchlist tap.
- Audio files: copy chosen music and SFX into `composition/assets/`.

## Hyperframes Instructions
Use native Hyperframes conventions. Keep the composition local and render it with the locally available CLI; do not publish or use cloud rendering.

Requirements:
- Show actual product copy and UI labels from the source app.
- Keep the recreated screen honest: “Afterglow” and its abstract artwork are fictional visual stand-ins; do not imply real catalog or playback availability.
- Keep every text element readable and the duration within 15–25 seconds.
- Include the planned music and minimal motion-matched SFX.
- Run `hyperframes check` before rendering.
