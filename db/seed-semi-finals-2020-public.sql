-- Seed (public schema): Semi-Final A and B for Eurovision 2020
-- This script writes directly into the public schema so Prisma (default) can see the rows.

-- 1) Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Ensure `stage` column exists on public.competitions
ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'main';

-- 3) Unique index on (year, stage)
CREATE UNIQUE INDEX IF NOT EXISTS competitions_year_stage_idx_public
  ON public.competitions (year, stage);

-- 4) Insert Semi-Final A competition row if missing
INSERT INTO public.competitions
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
  SELECT 1 FROM public.competitions c
  WHERE c.year = 2020 AND c.stage = 'semi-final-a'
);

-- 5) Insert Semi-Final B competition row if missing
INSERT INTO public.competitions
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
  SELECT 1 FROM public.competitions c
  WHERE c.year = 2020 AND c.stage = 'semi-final-b'
);

-- 6) Insert one test vote for Semi-Final A (idempotent)
INSERT INTO public.votes
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
FROM public.competitions c
WHERE c.year = 2020 AND c.stage = 'semi-final-a'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 7) Upsert cumulative_results for Semi-Final A
INSERT INTO public.cumulative_results
  (id, "competitionId", results, "totalVotes", "lastUpdated")
SELECT
  gen_random_uuid(),
  c.id,
  '{"Albania":12,"Armenia":10,"Australia":8,"Austria":7,"Azerbaijan":6,"Belarus":5,"Belgium":4,"Bulgaria":3,"Croatia":2,"Czechia":1}'::jsonb,
  1,
  NOW()
FROM public.competitions c
WHERE c.year = 2020 AND c.stage = 'semi-final-a'
ON CONFLICT ("competitionId") DO UPDATE SET
  results = EXCLUDED.results,
  "totalVotes" = EXCLUDED."totalVotes",
  "lastUpdated" = EXCLUDED."lastUpdated";

-- 8) Insert one test vote for Semi-Final B
INSERT INTO public.votes
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
FROM public.competitions c
WHERE c.year = 2020 AND c.stage = 'semi-final-b'
LIMIT 1
ON CONFLICT DO NOTHING;

-- 9) Upsert cumulative_results for Semi-Final B
INSERT INTO public.cumulative_results
  (id, "competitionId", results, "totalVotes", "lastUpdated")
SELECT
  gen_random_uuid(),
  c.id,
  '{"Albania":12,"Armenia":10,"Austria":8,"Bulgaria":7,"Czechia":6,"Denmark":5,"Estonia":4,"Finland":3,"Georgia":2,"Greece":1}'::jsonb,
  1,
  NOW()
FROM public.competitions c
WHERE c.year = 2020 AND c.stage = 'semi-final-b'
ON CONFLICT ("competitionId") DO UPDATE SET
  results = EXCLUDED.results,
  "totalVotes" = EXCLUDED."totalVotes",
  "lastUpdated" = EXCLUDED."lastUpdated";

-- 10) Quick sanity check
SELECT id, year, name, stage FROM public.competitions WHERE year = 2020 ORDER BY stage, name;
SELECT competitionId, results, "totalVotes" FROM public.cumulative_results WHERE competitionId IN (SELECT id FROM public.competitions WHERE year = 2020);
