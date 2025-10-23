-- Copy seeded Eurovision 2020 rows from the quoted schema
-- into the public schema so Prisma (which uses public by default)
-- can see them. Run this in Supabase SQL editor (recommended) or via psql.

-- 0) Safety: make sure public has the stage column and unique index
ALTER TABLE public.competitions
  ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT 'main';

CREATE UNIQUE INDEX IF NOT EXISTS competitions_year_stage_idx
  ON public.competitions (year, stage);

-- 1) Copy competitions (2020) from quoted schema into public
INSERT INTO public.competitions (id, year, name, stage, countries, "isActive", "createdAt", "updatedAt")
SELECT id, year, name, stage, countries, "isActive", "createdAt", "updatedAt"
FROM "Eurovision Voting System Schema".competitions c
WHERE c.year = 2020
ON CONFLICT (id) DO NOTHING;

-- 2) Copy votes (for 2020 competitions)
INSERT INTO public.votes (id, "userId", "userName", "userEmail", "competitionId", votes, points, "createdAt", "updatedAt")
SELECT v.id, v."userId", v."userName", v."userEmail", v."competitionId", v.votes, v.points, v."createdAt", v."updatedAt"
FROM "Eurovision Voting System Schema".votes v
JOIN "Eurovision Voting System Schema".competitions c ON v."competitionId" = c.id
WHERE c.year = 2020
ON CONFLICT (id) DO NOTHING;

-- 3) Copy cumulative_results (for 2020 competitions)
INSERT INTO public.cumulative_results (id, "competitionId", results, "totalVotes", "lastUpdated")
SELECT cr.id, cr."competitionId", cr.results, cr."totalVotes", cr."lastUpdated"
FROM "Eurovision Voting System Schema".cumulative_results cr
JOIN "Eurovision Voting System Schema".competitions c ON cr."competitionId" = c.id
WHERE c.year = 2020
ON CONFLICT ("competitionId") DO UPDATE
  SET results = EXCLUDED.results,
      "totalVotes" = EXCLUDED."totalVotes",
      "lastUpdated" = EXCLUDED."lastUpdated";

-- 4) Quick verification queries (you can run these after the script)
-- SELECT id, year, name, stage FROM public.competitions WHERE year = 2020 ORDER BY stage, name;
-- SELECT competitionId, results, "totalVotes" FROM public.cumulative_results WHERE competitionId IN (SELECT id FROM public.competitions WHERE year = 2020);
