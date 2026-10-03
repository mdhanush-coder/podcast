# Design — deepsoch podcast

Source of truth for the UI. Mockups: **[Podcast Reframe UI](https://claude.ai/artifact/P6guudhHvetDayBwQ1J8v5)** (private, so share it from the page before sending the link). The board has four screens: Landing, Studio, Result, and Result states. Reference for structure: Notus NextJS (Creative Tim).

Direction: calm, minimal, quiet. Cool slate neutrals, white cards, soft shadows, plenty of whitespace, a single accent. Motion appears in only two places: the hero and progress.

## Tokens

Set these as the shadcn theme variables in `app/globals.css`. They replace the `taupe` base color.

| Token | Value | Use |
|---|---|---|
| `--background` | `#F5F6F8` | page ground |
| `--card` | `#FFFFFF` | cards, header |
| `--foreground` | `#0E1726` | headings, primary text, dark band |
| `--text-body` | `#3D4757` | body copy |
| `--muted-foreground` | `#5A6475` | helper text, meta (≥4.5:1 on white and ground) |
| `--border` | `#E3E6EB` | card borders, dividers (`#EEF0F3` inside cards) |
| `--input` | `#D5DAE1` | inputs, ghost buttons |
| `--muted` | `#F1F3F6` | segmented-control track, chips, file icons |
| `--primary` | `#2F55D4` | accent: primary buttons, focus, selected shape, progress |
| `--primary-soft` | `rgba(47,85,212,0.10)` | icon badges, selected shape fill |
| `--success` | `#1F7A4D` on `#E7F4EC` | "Ready", uploaded |
| `--destructive` | `#A8281C` on `#FDECEA` / `#FDF6F5` | failed state |

Alternative accents explored: teal `#2E7D6B`, clay `#B5502F`, ink `#0E1726`.

Shot-kind colors (they differ in lightness, not hue alone): Wide `#C9D1DC`, Single = accent, Reaction `#8FA7EE`, Split `#0E1726`.

- **Type:** Geist for UI text, Geist Mono for labels, file types and times (both already loaded by `app/layout.tsx`).
  - H1: hero `clamp(40px, 5vw, 64px)`, app pages 32–34px.
  - H2: `clamp(30px, 3.4vw, 44px)`.
  - Letter-spacing: `-0.03em` on headings.
  - Body: 16–19px with line-height 1.6.
  - Weights: 600 for headings, 500 for buttons.
- **Radius:**
  - Cards: 18–22px.
  - Inputs and segmented tracks: 10–12px.
  - Buttons and pills: full (999px).
- **Shadow:** cards usually take only a border. Hero and feature cards add `0 24px 48px -24px rgba(14,23,38,.18)`.
- **Layout:** `max-width: 1200px` and `24px` side padding. Sections use `96px` vertical padding. Columns are flex-wrap rows, so they stack at phone width.
- **Motion:** use Motion (motion.dev) for the hero reframe loop, the indeterminate progress bar and the pulsing status dot. Everything else stays still. Respect `prefers-reduced-motion`.
- **Accessibility:**
  - Touch targets ≥ 44px.
  - Use real `<button>`, `<a>` and `<label>` elements.
  - Segmented controls are `role="radiogroup"`/`radio`, and the sync toggle is `role="switch"`.
  - Icon-only buttons get `aria-label`.

## Components

Built on shadcn/ui (Base UI) and Lucide icons. Skiper's free components go where they add something; `skiper40` is installed.

| Component | Build from | Notes |
|---|---|---|
| Header | markup | logo mark (dark square with a 9:16 outline), wordmark `deepsoch`, `podcast` pill; sticky + blurred on landing |
| Button | shadcn `Button` | variants: primary (accent pill), ghost (white + `--input` border), on-dark (white) |
| Segmented control | shadcn `ToggleGroup` | grey track, selected item = white chip + hairline shadow |
| Shape picker | `ToggleGroup` | 4 tiles drawing the aspect ratio outline; selected = accent border + soft fill |
| Dropzone | `<label>` + hidden `<input type=file>` | dashed `#C9D1DC`, icon badge, "MP4 or MOV · up to 5 GB per file" |
| File row | markup + shadcn `Progress` | states: uploading (bar + %), uploaded (green check + size), waiting; remove button |
| Switch | shadcn `Switch` | accent when on |
| Collapsible | shadcn `Collapsible` | "Advanced" section |
| Slider | shadcn `Slider` | quality 10–40 with the value in mono |
| Status pill | `Badge` | Ready (green), Editing (accent + pulse), Didn't finish (red) |
| Download row | markup | mono type tag (`MP4`, `XML`, …), name, file + format, Download button |
| Shot strip | markup | one flex segment per shot, `flex-grow` = duration, hover title = kind + times |

## Pages

### `/`: Landing

1. **Header:** links to How it works, Controls and Exports; **Start editing** button goes to `/studio`.
2. **Hero:**
   - Pill: "Smart podcast editing".
   - H1: "Your conversation, re-cut for every screen."
   - Body: "Upload the episode — one video or every camera. The edit follows whoever is talking, cuts to reactions, and leans in as a point builds. You get a vertical cut and the timeline to keep refining it."
   - Buttons: **Start editing** and **See how it works**.
   - Exports line: "Exports to Premiere Pro · Final Cut Pro · DaVinci Resolve · EDL".
   - Visual: a 16:9 frame with two speakers and a 9:16 crop window gliding to whoever talks (9 s loop), plus a phone preview crossfading in sync. Under it, the shot strip "The first 77 seconds of a real edit".
3. **How it works:**
   - Heading: "From raw footage to a finished cut".
   - Cards: **Upload**, **Set the feel**, **Download** (numbered 01–03 with icon badges).
4. **Controls:**
   - Heading: "You set the feel. It does the cutting."
   - Shape tiles: 9:16, 1:1, 4:5, 16:9.
   - A card listing Layout, Reactions, Motion, Framing and Pace with option chips; defaults shown dark.
5. **Multi-camera:**
   - Heading: "Bring every angle".
   - Visual: waveform rows for clean audio and cameras 1–3, each sitting where its sound matches.
   - Bullets: up to 99 clips in any order; sync off when every camera started together; clean audio becomes the soundtrack.
6. **Exports:**
   - Heading: "Finish it in your editor".
   - Cards: Edited video (MP4), Premiere Pro (XML), Final Cut Pro · Resolve (FCPXML), Any editor (EDL), Shot list (JSON).
7. **Call-to-action band:** dark, "Start with your next episode." with a white **Start editing** button.
8. **Footer:** wordmark, links, © 2026 Deepsoch.

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

## UI → pipeline (`podcast_edit`, `tpl_Zb8c6gf4LP3O`)

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
