import postgres from "postgres";

const SCHEMA = `
  create table if not exists runs (
    id text primary key,
    user_email text not null,
    title text,
    settings jsonb not null default '{}',
    created_at timestamptz not null default now()
  );
  alter table runs add column if not exists storage_prefix text;
  create index if not exists runs_user_created on runs (user_email, created_at desc);
`;

export type RunRow = { id: string; title: string | null; settings: Record<string, unknown>; created_at: Date; storage_prefix: string | null };

// Off until DATABASE_URL is set: runs still work, but there is no history, daily cap or ownership check.
export const dbOn = !!process.env.DATABASE_URL;

// One client per process; globalThis keeps dev hot reloads from opening a new pool each time.
const g = globalThis as unknown as { sql?: postgres.Sql; ready?: Promise<unknown> };

export async function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  // prepare: false so it works behind Supabase/Neon poolers (pgbouncer transaction mode).
  g.sql ??= postgres(url, { prepare: false });
  g.ready ??= g.sql.unsafe(SCHEMA);
  await g.ready;
  return g.sql;
}

