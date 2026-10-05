# deepsoch podcast

Upload a podcast episode, get a vertical cut that follows the speaker plus timelines for Premiere, Final Cut, Resolve and any EDL editor. Editing runs on GPU through the EngineX `podcast_edit` template.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env.local` and fill it in:
   - **EngineX**: `EDITOR_API_KEY`, `EDITOR_TEMPLATE_ID`
   - **Auth**: `AUTH_SECRET` (`npx auth secret`), and a Google OAuth client with redirect URI `<SITE_URL>/api/auth/callback/google`
   - **Database**: `DATABASE_URL` for Postgres (Neon or Supabase). The `runs` table is created automatically.
3. `npm run dev` and open http://localhost:3000

## Pages

| Route | What it is | Sign-in |
|---|---|---|
| `/` | Landing page | — |
| `/pricing`, `/contact`, `/privacy`, `/terms` | Public info | — |
| `/login` | Google sign-in | — |
| `/studio` | Upload footage and choose settings | required |
| `/runs/[id]` | Progress and result of one edit (owner only) | required |
| `/edits` | All your edits | required |
| `/account` | Usage, sign out, delete edit history | required |

`proxy.ts` sends signed-out visitors to `/login`. The API routes check the session themselves, and `/api/podcast` enforces `RUNS_PER_DAY`.

## Before launch

- Fill in the placeholders in `lib/site.ts` (legal entity, address, jurisdiction) and set `retentionDays` to match the storage retention you actually have.
- Set real prices in `app/pricing/page.tsx`.
- Have the privacy policy and terms reviewed.

## Tests

`node --experimental-strip-types lib/podcast-run.test.ts`
