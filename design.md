# Design — deepsoch podcast

Source of truth for the UI. Structure and typography are modelled on an editorial studio style (reference: mattis.framer.website). **The palette is our own and must never match that reference**, which is black/white with an orange-red accent. Ours is forest ink on warm bone with a lime highlight.

Direction: editorial, flat, confident. Very large tight headlines, small uppercase mono labels with `(01)`-style numbering, square corners, hairline rules instead of shadows. Motion appears in only two places: the hero and progress.

## Tokens

Set as the theme variables in `app/globals.css`.

| Token | Value | Use |
|---|---|---|
| `--background` | `#EFEBE3` | page ground (warm bone) |
| `--card` | `#F7F4EE` | cards, alternate section bands |
| `--foreground` / `--primary` | `#10231C` | ink: headings, primary buttons, selected states, dark bands, progress |
| `--text-body` | `#2F3F38` | body copy |
| `--muted-foreground` | `#5C675F` | labels, helper text, meta |
| `--highlight` | `#C6F432` | lime: headline highlights, accents on ink, CTA button on dark, crop window |
| `--muted` / `--hairline` | `#E3DDD1` | chips, dividers inside cards |
| `--border` | `#D6CFC1` | card borders, rules |
| `--input` | `#BFB7A7` | inputs, dropzone dash |
| `--success` | `#2E6B3F` on `#DCEBD9` | "Ready", uploaded |
| `--destructive` | `#9E2A2B` on `#F3DCD8` | failed state |

Lime is only placed on ink, or as a fill under ink text. It's never used for text or thin lines on bone, where its contrast is too low.

On ink bands: headings `#EFEBE3`, body `#C9D3CC`, labels `#9FB8A6`, rules `#2B4238`.

Shot-kind colors (they differ in lightness, not hue alone): Wide `#CFC8BA`, Single `#10231C`, Reaction `#9FB8A6`, Split `#4F7A62`.

- **Type:** Geist for UI text, Geist Mono for labels, file types and times.
  - Display: `clamp(44px, 7.2vw, 92px)` (hero, closing CTA).
  - H2: `clamp(36px, 5.2vw, 68px)`, often split across two lines with the second line muted.
  - App page H1: `clamp(40px, 5.6vw, 72px)`.
  - Headings: weight 500, letter-spacing `-0.05em`, line-height 0.95.
  - Labels (`.label`): Geist Mono 12px, uppercase, `0.02em`, muted. Section labels carry an index: `(01) How it works`.
  - Body: 16–18px, line-height 1.6. Statement paragraphs `clamp(22px, 2.4vw, 32px)`, tracking `-0.03em`.
- **Radius:** 0 everywhere, except pills (buttons, chips, status) and the switch, which are fully round.
- **Depth:** none. Cards are `--card` with a `--border` hairline. Lists use a 1px ink rule on top and hairlines between rows.
- **Layout:** `max-width: 1280px`, `24px` side padding, `96px` section padding. Each section opens with a big heading left and its numbered label right. Columns are flex-wrap rows that stack at phone width.
- **Motion:** Lenis smooth scrolling site-wide (`components/smooth-scroll.tsx`; anchors glide too). CSS for the hero crop-window loop, progress bars, the pulsing status dot, the render-preview scan line, and `.reveal` sections that rise in on scroll (`animation-timeline: view()`). Result stats count up. All of it is off under `prefers-reduced-motion`.
- **Accessibility:**
  - Touch targets ≥ 44px.
  - Use real `<button>`, `<a>`, `<label>` and `<details>` elements.
  - Segmented controls and shape tiles are native radio groups, and the sync toggle is `role="switch"`.
  - Icon-only buttons get `aria-label`.

## Components

All in `components/kit.tsx`, built from native elements and Lucide icons.

| Component | Notes |
|---|---|
| Header | logo mark (ink square with a lime 9:16 outline), wordmark `deepsoch®`, mono `PODCAST` label; lowercase nav links; sticky + blurred on landing |
| Button | mono uppercase pills: primary (ink), ghost (ink outline, fills on hover), on-dark (lime) |
| Label | mono uppercase meta text with optional `(01)` index |
| Segmented control | hairline-bordered row of cells; selected cell = ink fill, bone text |
| Shape picker | 4 square tiles drawing the aspect outline; selected = ink border + faint ink fill |
| Dropzone | `<label>` + hidden `<input type=file>`, dashed `--input`, "MP4 or MOV · up to 5 GB per file" |
| File row | uploading (bar + %), uploaded (green check + size), error; remove button |
| Switch | ink outline track; on = ink track with lime knob |
| Advanced | native `<details>` |
| Slider | native range, ink accent, value in mono |
| Status pill | Ready (green), Editing (ink + lime text, pulsing dot), Didn't finish (red) |
| Numbered row | `(01)` label, large title, description, optional mono tag on the right |
| FAQ | `<details>` rows under an ink rule, `+` rotates to `×` |
| Shot strip | flex segment per shot, `flex-grow` = duration, hover title = kind + times |
| Timeline (result) | scrubbable shot strip synced to the video: lime playhead, hover tooltip (kind, times, people), click to seek, arrow keys ±5 s, dims shots outside the active filter |
| Footer | ink band on every page: tagline + lime CTA, link columns, giant `deepsoch®` wordmark, © line |

## Pages

### `/`: Landing

1. **Header:** links to how it works, controls, exports and faq; **Start editing** button goes to `/studio`.
2. **Hero:**
   - Meta row of labels above a rule: "(Smart podcast editing — v1.0)", "Renders on: GPU", "Exports: 5 formats".
   - Display H1: "Your conversation, re-cut for every screen." with "every screen." on a lime fill.
   - Body: "Upload the episode — one video or every camera. The edit follows whoever is talking, cuts to reactions, and leans in as a point builds. You get a vertical cut and the timeline to keep refining it."
   - Buttons: **Start editing ↗** and **↓ See how it works**.
   - Visual: a 16:9 ink frame with two speakers and a lime 9:16 crop window gliding to whoever talks (9 s loop), plus a phone preview. Under it, the shot strip labelled "The first 77 seconds of a real edit" and "0:00 — 1:17".
3. **(01) Why it works:** card band, H2 "Follow / the voice." and a large statement paragraph with "whoever is talking" highlighted.
4. **(02) How it works:** H2 "From raw footage / to a finished cut"; numbered rows **Upload**, **Set the feel**, **Download**.
5. **(03) Controls:** H2 "You set the feel. / It does the cutting." (second line muted); one card with the four shape outlines and a table of Layout, Reactions, Motion, Framing and Pace chips, defaults in ink.
6. **(04) Multi-camera:** ink band, H2 "Bring every / angle."; waveform rows (clean audio in lime) and three big lime figures: 99 clips, Sync, 1 clean audio track.
7. **(05) Exports:** H2 "Finish it in / your editor."; numbered rows: Edited video (MP4), Premiere Pro (XML), Final Cut Pro · Resolve (FCPXML), Any editor (EDL), Shot list (JSON).
8. **(06) FAQ:** card band, H2 "Before you / upload."; five questions on files, sync, render time, editing afterwards, and failed edits.
9. **Call-to-action band:** ink, display "Start with your next episode." ("next episode." in lime) with the lime **Start editing ↗** button.
10. **Footer:** logo and links above a rule; "© 2026 Deepsoch" and "Made for podcasts" labels.

### `/studio`: New edit

Two cards that stack at narrow widths.

- **Footage** (wide card):
  - Switch: One video / Multiple cameras (`footage` = `edited` / `angles`).
  - Helper text for each mode.
  - Dropzone and file list. The first file is tagged **Main camera** and becomes `input`; the rest become `cameras`.
  - **Clean audio · optional** goes to `audio`.
  - Multi-camera only: **Line up cameras by sound** switch, which sets `sync`.
- **Edit settings** (narrow card):
  - Shape tiles set `aspect`.
  - Segmented controls set Layout, Reactions, Motion, Framing and Pace.
  - **Advanced** (collapsed) holds:
    - Timeline name → `title`
    - Height (px), placeholder "Auto" → `height`
    - Codec H.264/HEVC → `codec`
    - Quality slider → `quality`
  - Live summary line ("9:16 · Auto layout · Normal reactions · Normal pace").
  - **Create edit** button, with the note "Renders on a GPU. You can leave — the result page link keeps your edit."

### `/runs/[id]`: Result

- **Header:**
  - Run title and status pill.
  - Meta line: duration · shape · render time (from `runMs`).
  - **Download video** button.
- **Preview card:** a 9:16 player.
- **Downloads:** Edited video, Premiere Pro, Final Cut Pro · DaVinci Resolve, Any editor (EDL), Timeline, Edit data.
- **Speakers:** a bar per person who talked (`people[].talkingSec`). People on camera who didn't talk are collapsed into one line.
- **Settings used:** chips. "Edit again with new settings" links back to `/studio` with the same values.
- **Shots:** a full-width strip from `shots[]` with a legend and counts, and a time axis.
- **States:**
  - Rendering:
    - indeterminate bar and pulsing "Editing" pill
    - stages: Uploaded → Picked up by a GPU worker → Editing and rendering → Ready to download
    - elapsed timer
    - "You can close this tab. This page's link brings you back to the result."
  - Failed:
    - a plain-language headline and explanation
    - the fix as a button, e.g. **Try again with sync off** or **Add clean audio**
    - the raw EngineX error under Details

## UI → pipeline (`podcast_edit`, id in `EDITOR_TEMPLATE_ID`)

| Field | Control | Values | Default |
|---|---|---|---|
| `input` | first uploaded file | object key | required |
| `cameras` | remaining files (multi-camera) | array of keys | omit if none |
| `audio` | Clean audio | object key | omit if none |
| `footage` | footage switch | `edited` · `angles` (`auto` if unset) | `auto` |
| `aspect` | Shape | `9:16` · `1:1` · `4:5` · `16:9` | `9:16` |
| `height` | Advanced | 64–4096 | omit (auto) |
| `layout` | Layout | `auto` · `single` · `split` · `wide` | `auto` |
| `reactions` | Reactions | `off` · `few` · `normal` · `many` | `normal` |
| `motion` | Motion | `off` · `subtle` · `expressive` | `subtle` |
| `framing` | Framing | `tight` · `medium` · `loose` | `medium` |
| `pace` | Pace | `calm` · `normal` · `lively` | `normal` |
| `sync` | sync switch | boolean | `true` |
| `title` | Timeline name | 1–200 chars | omit |
| `codec` | Codec | `h264` · `hevc` | `h264` |
| `quality` | Quality | 10–40 | `19` |

Never send `null` or `0` for an unset field; leave it out. The server validates every enum and range before calling EngineX.

Outputs: `video`, `premiere`, `fcpxml`, `edl`, `timeline` and `edit` are object keys, which the server signs through `POST /v1/outputs/sign`. `shots` and `people` come back inline as JSON.
