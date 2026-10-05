// Public facts about the site, used by metadata, legal pages and contact. Fill in before launch.
export const SITE = {
  name: "deepsoch podcast",
  url: process.env.SITE_URL ?? "http://localhost:3000",
  supportEmail: process.env.SUPPORT_EMAIL ?? "support@deepsoch.ai",
  legalName: "[Deepsoch legal entity name]",
  address: "[Registered address]",
  jurisdiction: "[Governing-law jurisdiction]",
  // How long EngineX keeps raw uploads; finished edits live in Supabase until deleted.
  retentionDays: 30,
  legalUpdated: "October 5, 2026",
};

export const RUNS_PER_DAY = Number(process.env.RUNS_PER_DAY ?? 10);
