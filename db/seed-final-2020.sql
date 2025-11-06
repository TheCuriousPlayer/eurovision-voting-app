-- Seed file: Final for Eurovision 2020
-- Targets schema: "Eurovision Voting System Schema" (quoted because of spaces)
-- Steps: 1) ensure `stage` column exists
--        2) create final competition if missing
--        3) upsert cumulative_results

-- Ensure pgcrypto (for gen_random_uuid) and the target schema exist
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS "Eurovision Voting System Schema";

-- Switch to the target schema
SET search_path TO "Eurovision Voting System Schema";

-- 1) Add `stage` column if missing (default 'main')
ALTER TABLE "Eurovision Voting System Schema".competitions
  ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'main';

-- 2) Create unique index on (year, stage) if not exists
CREATE UNIQUE INDEX IF NOT EXISTS competitions_year_stage_idx
  ON "Eurovision Voting System Schema".competitions (year, stage);

-- 3) Insert Final competition row if missing
INSERT INTO "Eurovision Voting System Schema".competitions
  (id, year, name, stage, countries, "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  2020,
  'Eurovision 2020Final',
  'final',
  ARRAY[
    'Albania','Armenia','Azerbaijan','Belgium','Bulgaria',
    'Denmark','Georgia','Germany','Greece','Iceland',
    'Italy','Lithuania','Malta','Norway','Romania',
    'Russia','Serbia','Sweden','Switzerland','Ukraine'
  ]::text[],
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Eurovision Voting System Schema".competitions c
  WHERE c.year = 2020 AND c.stage = 'final'
);

-- 4) Upsert cumulative_results for Final (initialize with empty results)
INSERT INTO "Eurovision Voting System Schema".cumulative_results
  (id, "competitionId", results, "totalVotes", "lastUpdated")
SELECT
  gen_random_uuid(),
  c.id,
  '{}'::jsonb,
  0,
  NOW()
FROM "Eurovision Voting System Schema".competitions c
WHERE c.year = 2020 AND c.stage = 'final'
ON CONFLICT ("competitionId") DO UPDATE SET
  results = EXCLUDED.results,
  "totalVotes" = EXCLUDED."totalVotes",
  "lastUpdated" = EXCLUDED."lastUpdated";

-- 5) Quick sanity check output
SELECT id, year, name, stage, countries 
FROM "Eurovision Voting System Schema".competitions 
WHERE year = 2020 AND stage = 'final';

SELECT competitionId, results, "totalVotes" 
FROM "Eurovision Voting System Schema".cumulative_results 
WHERE competitionId IN (
  SELECT id FROM "Eurovision Voting System Schema".competitions 
  WHERE year = 2020 AND stage = 'final'
);
