-- Seed file: semi-final A and B for Eurovision 2020
-- Targets schema: "Eurovision Voting System Schema" (quoted because of spaces)
-- Steps: 1) add `stage` column if missing
--        2) create semi-final competitions if missing
--        3) insert one test vote per semi-final and upsert cumulative_results

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

-- 3) Insert Semi-Final A competition row if missing
INSERT INTO "Eurovision Voting System Schema".competitions
  (id, year, name, stage, countries, "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  2020,
  'Eurovision 2020 Semi-Final A',
  'semi-final-a',
  ARRAY[
    'Albania','Armenia','Australia','Austria','Azerbaijan',
    'Belarus','Belgium','Bulgaria','Croatia','Czechia',
    'Denmark','Estonia','Finland','Georgia','Greece',
    'Ireland','Israel','Lithuania','North Macedonia','Norway',
    'Romania','Russia','Slovenia','Sweden','Ukraine'
  ]::text[],
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Eurovision Voting System Schema".competitions c
  WHERE c.year = 2020 AND c.stage = 'semi-final-a'
);

-- 4) Insert Semi-Final B competition row if missing
INSERT INTO "Eurovision Voting System Schema".competitions
  (id, year, name, stage, countries, "isActive", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  2020,
  'Eurovision 2020 Semi-Final B',
  'semi-final-b',
  ARRAY[
    'Albania','Armenia','Austria','Bulgaria','Czechia',
    'Denmark','Estonia','Finland','Georgia','Greece',
    'Iceland','Italy','Latvia','Moldova','Poland',
    'Portugal','San Marino','Serbia','Switzerland','United Kingdom'
  ]::text[],
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM "Eurovision Voting System Schema".competitions c
  WHERE c.year = 2020 AND c.stage = 'semi-final-b'
);

-- 5) Insert one test vote for Semi-Final A
INSERT INTO "Eurovision Voting System Schema".votes
  (id, "userId", "userName", "userEmail", "competitionId", votes, points, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  'test-user-2020-a',
  'Test User Semi-Final A',
  'test-a@example.com',
  c.id,
  '["Albania","Armenia","Australia","Austria","Azerbaijan","Belarus","Belgium","Bulgaria","Croatia","Czechia"]'::jsonb,
  '{"Albania":12,"Armenia":10,"Australia":8,"Austria":7,"Azerbaijan":6,"Belarus":5,"Belgium":4,"Bulgaria":3,"Croatia":2,"Czechia":1}'::jsonb,
  NOW(),
  NOW()
FROM "Eurovision Voting System Schema".competitions c
WHERE c.year = 2020 AND c.stage = 'semi-final-a'
LIMIT 1
ON CONFLICT DO NOTHING; -- avoid duplicate test votes

-- 6) Upsert cumulative_results for Semi-Final A
INSERT INTO "Eurovision Voting System Schema".cumulative_results
  (id, "competitionId", results, "totalVotes", "lastUpdated")
SELECT
  gen_random_uuid(),
  c.id,
  '{"Albania":12,"Armenia":10,"Australia":8,"Austria":7,"Azerbaijan":6,"Belarus":5,"Belgium":4,"Bulgaria":3,"Croatia":2,"Czechia":1}'::jsonb,
  1,
  NOW()
FROM "Eurovision Voting System Schema".competitions c
WHERE c.year = 2020 AND c.stage = 'semi-final-a'
ON CONFLICT ("competitionId") DO UPDATE SET
  results = EXCLUDED.results,
  "totalVotes" = EXCLUDED."totalVotes",
  "lastUpdated" = EXCLUDED."lastUpdated";

-- 7) Insert one test vote for Semi-Final B
INSERT INTO "Eurovision Voting System Schema".votes
  (id, "userId", "userName", "userEmail", "competitionId", votes, points, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  'test-user-2020-b',
  'Test User Semi-Final B',
  'test-b@example.com',
  c.id,
  '["Albania","Armenia","Austria","Bulgaria","Czechia","Denmark","Estonia","Finland","Georgia","Greece"]'::jsonb,
  '{"Albania":12,"Armenia":10,"Austria":8,"Bulgaria":7,"Czechia":6,"Denmark":5,"Estonia":4,"Finland":3,"Georgia":2,"Greece":1}'::jsonb,
  NOW(),
  NOW()
FROM "Eurovision Voting System Schema".competitions c
WHERE c.year = 2020 AND c.stage = 'semi-final-b'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 8) Upsert cumulative_results for Semi-Final B
INSERT INTO "Eurovision Voting System Schema".cumulative_results
  (id, "competitionId", results, "totalVotes", "lastUpdated")
SELECT
  gen_random_uuid(),
  c.id,
  '{"Albania":12,"Armenia":10,"Austria":8,"Bulgaria":7,"Czechia":6,"Denmark":5,"Estonia":4,"Finland":3,"Georgia":2,"Greece":1}'::jsonb,
  1,
  NOW()
FROM "Eurovision Voting System Schema".competitions c
WHERE c.year = 2020 AND c.stage = 'semi-final-b'
ON CONFLICT ("competitionId") DO UPDATE SET
  results = EXCLUDED.results,
  "totalVotes" = EXCLUDED."totalVotes",
  "lastUpdated" = EXCLUDED."lastUpdated";

-- 9) Quick sanity check output
SELECT id, year, name, stage FROM "Eurovision Voting System Schema".competitions WHERE year = 2020 ORDER BY stage, name;
SELECT competitionId, results, "totalVotes" FROM "Eurovision Voting System Schema".cumulative_results WHERE competitionId IN (
  SELECT id FROM "Eurovision Voting System Schema".competitions WHERE year = 2020
);
