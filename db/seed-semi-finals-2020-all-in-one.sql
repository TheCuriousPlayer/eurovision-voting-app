-- All-in-one seed for Eurovision 2020 semi-finals
-- Safe/idempotent: checks for schema/table existence before attempting changes
-- Paste and run this single file in Supabase SQL editor

-- Ensure pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Ensure quoted schema exists (no-op if already present)
CREATE SCHEMA IF NOT EXISTS "Eurovision Voting System Schema";

-- Helper: semi-final A data


DO $$
BEGIN
  -- Seed into quoted schema if tables exist
  IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'Eurovision Voting System Schema' AND table_name = 'competitions') THEN
    -- Add stage column if missing
    EXECUTE 'ALTER TABLE "Eurovision Voting System Schema".competitions ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT ''main''';

    -- Create unique index
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS competitions_year_stage_idx_quoted ON "Eurovision Voting System Schema".competitions (year, stage)';

    -- Insert Semi-Final A if missing
    EXECUTE $exec$
      INSERT INTO "Eurovision Voting System Schema".competitions
        (id, year, name, stage, countries, "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), 2020, 'Eurovision 2020 Semi-Final A', 'semi-final-a', ARRAY['Albania','Armenia','Australia','Austria','Azerbaijan','Belarus','Belgium','Bulgaria','Croatia','Czechia','Denmark','Estonia','Finland','Georgia','Greece','Ireland','Israel','Lithuania','North Macedonia','Norway','Romania','Russia','Slovenia','Sweden','Ukraine']::text[], true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM "Eurovision Voting System Schema".competitions c WHERE c.year = 2020 AND c.stage = 'semi-final-a');
    $exec$;

    -- Insert Semi-Final B if missing
    EXECUTE $exec$
      INSERT INTO "Eurovision Voting System Schema".competitions
        (id, year, name, stage, countries, "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), 2020, 'Eurovision 2020 Semi-Final B', 'semi-final-b', ARRAY['Albania','Armenia','Austria','Bulgaria','Czechia','Denmark','Estonia','Finland','Georgia','Greece','Iceland','Italy','Latvia','Moldova','Poland','Portugal','San Marino','Serbia','Switzerland','United Kingdom']::text[], true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM "Eurovision Voting System Schema".competitions c WHERE c.year = 2020 AND c.stage = 'semi-final-b');
    $exec$;

    -- Insert one test vote A (idempotent)
    EXECUTE $exec$
      INSERT INTO "Eurovision Voting System Schema".votes (id, "userId", "userName", "userEmail", "competitionId", votes, points, "createdAt", "updatedAt")
      SELECT gen_random_uuid(), 'test-user-2020-a', 'Test User Semi-Final A', 'test-a@example.com', c.id,
        '["Albania","Armenia","Australia","Austria","Azerbaijan","Belarus","Belgium","Bulgaria","Croatia","Czechia"]'::jsonb,
        '{"Albania":12,"Armenia":10,"Australia":8,"Austria":7,"Azerbaijan":6,"Belarus":5,"Belgium":4,"Bulgaria":3,"Croatia":2,"Czechia":1}'::jsonb,
        NOW(), NOW()
      FROM "Eurovision Voting System Schema".competitions c
      WHERE c.year = 2020 AND c.stage = 'semi-final-a'
      LIMIT 1
      ON CONFLICT DO NOTHING;
    $exec$;

    -- Upsert cumulative_results A
    EXECUTE $exec$
      INSERT INTO "Eurovision Voting System Schema".cumulative_results (id, "competitionId", results, "totalVotes", "lastUpdated")
      SELECT gen_random_uuid(), c.id, '{"Albania":12,"Armenia":10,"Australia":8,"Austria":7,"Azerbaijan":6,"Belarus":5,"Belgium":4,"Bulgaria":3,"Croatia":2,"Czechia":1}'::jsonb, 1, NOW()
      FROM "Eurovision Voting System Schema".competitions c
      WHERE c.year = 2020 AND c.stage = 'semi-final-a'
      ON CONFLICT ("competitionId") DO UPDATE SET results = EXCLUDED.results, "totalVotes" = EXCLUDED."totalVotes", "lastUpdated" = EXCLUDED."lastUpdated";
    $exec$;

    -- Insert one test vote B (idempotent)
    EXECUTE $exec$
      INSERT INTO "Eurovision Voting System Schema".votes (id, "userId", "userName", "userEmail", "competitionId", votes, points, "createdAt", "updatedAt")
      SELECT gen_random_uuid(), 'test-user-2020-b', 'Test User Semi-Final B', 'test-b@example.com', c.id,
        '["Albania","Armenia","Austria","Bulgaria","Czechia","Denmark","Estonia","Finland","Georgia","Greece"]'::jsonb,
        '{"Albania":12,"Armenia":10,"Austria":8,"Bulgaria":7,"Czechia":6,"Denmark":5,"Estonia":4,"Finland":3,"Georgia":2,"Greece":1}'::jsonb,
        NOW(), NOW()
      FROM "Eurovision Voting System Schema".competitions c
      WHERE c.year = 2020 AND c.stage = 'semi-final-b'
      LIMIT 1
      ON CONFLICT DO NOTHING;
    $exec$;

    -- Upsert cumulative_results B
    EXECUTE $exec$
      INSERT INTO "Eurovision Voting System Schema".cumulative_results (id, "competitionId", results, "totalVotes", "lastUpdated")
      SELECT gen_random_uuid(), c.id, '{"Albania":12,"Armenia":10,"Austria":8,"Bulgaria":7,"Czechia":6,"Denmark":5,"Estonia":4,"Finland":3,"Georgia":2,"Greece":1}'::jsonb, 1, NOW()
      FROM "Eurovision Voting System Schema".competitions c
      WHERE c.year = 2020 AND c.stage = 'semi-final-b'
      ON CONFLICT ("competitionId") DO UPDATE SET results = EXCLUDED.results, "totalVotes" = EXCLUDED."totalVotes", "lastUpdated" = EXCLUDED."lastUpdated";
    $exec$;
  END IF;
END
$$ LANGUAGE plpgsql;

-- Now do the same for public schema (most likely where your app tables live)
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'competitions') THEN
    -- Add stage column if missing
    EXECUTE 'ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS stage text NOT NULL DEFAULT ''main''';

    -- Create unique index
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS competitions_year_stage_idx_public ON public.competitions (year, stage)';

    -- Insert Semi-Final A if missing
    EXECUTE $exec$
      INSERT INTO public.competitions (id, year, name, stage, countries, "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), 2020, 'Eurovision 2020 Semi-Final A', 'semi-final-a', ARRAY['Albania','Armenia','Australia','Austria','Azerbaijan','Belarus','Belgium','Bulgaria','Croatia','Czechia','Denmark','Estonia','Finland','Georgia','Greece','Ireland','Israel','Lithuania','North Macedonia','Norway','Romania','Russia','Slovenia','Sweden','Ukraine']::text[], true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM public.competitions c WHERE c.year = 2020 AND c.stage = 'semi-final-a');
    $exec$;

    -- Insert Semi-Final B if missing
    EXECUTE $exec$
      INSERT INTO public.competitions (id, year, name, stage, countries, "isActive", "createdAt", "updatedAt")
      SELECT gen_random_uuid(), 2020, 'Eurovision 2020 Semi-Final B', 'semi-final-b', ARRAY['Albania','Armenia','Austria','Bulgaria','Czechia','Denmark','Estonia','Finland','Georgia','Greece','Iceland','Italy','Latvia','Moldova','Poland','Portugal','San Marino','Serbia','Switzerland','United Kingdom']::text[], true, NOW(), NOW()
      WHERE NOT EXISTS (SELECT 1 FROM public.competitions c WHERE c.year = 2020 AND c.stage = 'semi-final-b');
    $exec$;

    -- Insert one test vote A (idempotent)
    EXECUTE $exec$
      INSERT INTO public.votes (id, "userId", "userName", "userEmail", "competitionId", votes, points, "createdAt", "updatedAt")
      SELECT gen_random_uuid(), 'test-user-2020-a', 'Test User Semi-Final A', 'test-a@example.com', c.id,
        '["Albania","Armenia","Australia","Austria","Azerbaijan","Belarus","Belgium","Bulgaria","Croatia","Czechia"]'::jsonb,
        '{"Albania":12,"Armenia":10,"Australia":8,"Austria":7,"Azerbaijan":6,"Belarus":5,"Belgium":4,"Bulgaria":3,"Croatia":2,"Czechia":1}'::jsonb,
        NOW(), NOW()
      FROM public.competitions c
      WHERE c.year = 2020 AND c.stage = 'semi-final-a'
      LIMIT 1
      ON CONFLICT DO NOTHING;
    $exec$;

    -- Upsert cumulative_results A
    EXECUTE $exec$
      INSERT INTO public.cumulative_results (id, "competitionId", results, "totalVotes", "lastUpdated")
      SELECT gen_random_uuid(), c.id, '{"Albania":12,"Armenia":10,"Australia":8,"Austria":7,"Azerbaijan":6,"Belarus":5,"Belgium":4,"Bulgaria":3,"Croatia":2,"Czechia":1}'::jsonb, 1, NOW()
      FROM public.competitions c
      WHERE c.year = 2020 AND c.stage = 'semi-final-a'
      ON CONFLICT ("competitionId") DO UPDATE SET results = EXCLUDED.results, "totalVotes" = EXCLUDED."totalVotes", "lastUpdated" = EXCLUDED."lastUpdated";
    $exec$;

    -- Insert one test vote B (idempotent)
    EXECUTE $exec$
      INSERT INTO public.votes (id, "userId", "userName", "userEmail", "competitionId", votes, points, "createdAt", "updatedAt")
      SELECT gen_random_uuid(), 'test-user-2020-b', 'Test User Semi-Final B', 'test-b@example.com', c.id,
        '["Albania","Armenia","Austria","Bulgaria","Czechia","Denmark","Estonia","Finland","Georgia","Greece"]'::jsonb,
        '{"Albania":12,"Armenia":10,"Austria":8,"Bulgaria":7,"Czechia":6,"Denmark":5,"Estonia":4,"Finland":3,"Georgia":2,"Greece":1}'::jsonb,
        NOW(), NOW()
      FROM public.competitions c
      WHERE c.year = 2020 AND c.stage = 'semi-final-b'
      LIMIT 1
      ON CONFLICT DO NOTHING;
    $exec$;

    -- Upsert cumulative_results B
    EXECUTE $exec$
      INSERT INTO public.cumulative_results (id, "competitionId", results, "totalVotes", "lastUpdated")
      SELECT gen_random_uuid(), c.id, '{"Albania":12,"Armenia":10,"Austria":8,"Bulgaria":7,"Czechia":6,"Denmark":5,"Estonia":4,"Finland":3,"Georgia":2,"Greece":1}'::jsonb, 1, NOW()
      FROM public.competitions c
      WHERE c.year = 2020 AND c.stage = 'semi-final-b'
      ON CONFLICT ("competitionId") DO UPDATE SET results = EXCLUDED.results, "totalVotes" = EXCLUDED."totalVotes", "lastUpdated" = EXCLUDED."lastUpdated";
    $exec$;
  END IF;
END
$$ LANGUAGE plpgsql;

-- Final sanity selects (will return nothing if tables don't exist)
SELECT id, year, name, stage FROM public.competitions WHERE year = 2020 ORDER BY stage, name;
SELECT competitionId, results, "totalVotes" FROM public.cumulative_results WHERE competitionId IN (SELECT id FROM public.competitions WHERE year = 2020);
