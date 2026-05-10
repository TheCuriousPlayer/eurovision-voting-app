-- Add Eurovision 2026 competition (year: 2026)
-- This script creates the competition record and initial cumulative results

DO $$
DECLARE
    competition_exists BOOLEAN;
    comp_id TEXT;
BEGIN
    SELECT EXISTS(SELECT 1 FROM competitions WHERE year = 2026) INTO competition_exists;
    IF NOT competition_exists THEN
        INSERT INTO competitions (id, year, name, "isActive", countries, "createdAt", "updatedAt")
        VALUES (
            gen_random_uuid()::text,
            2026,
            'Eurovision 2026',
            true,
            ARRAY[
                'Albania', 'Armenia', 'Australia', 'Austria', 'Azerbaijan',
                'Belgium', 'Bulgaria', 'Croatia', 'Czechia', 'Denmark',
                'Estonia', 'Finland', 'France', 'Georgia', 'Germany',
                'Greece', 'Israel', 'Italy', 'Latvia', 'Lithuania',
                'Luxembourg', 'Malta', 'Moldova', 'Montenegro', 'Norway',
                'Poland', 'Portugal', 'Romania', 'San Marino', 'Serbia',
                'Southern Cyprus', 'Sweden', 'Switzerland', 'Ukraine', 'United Kingdom'
            ]::text[],
            NOW(),
            NOW()
        )
        RETURNING id INTO comp_id;

        -- Create initial cumulative results record (empty state)
        INSERT INTO cumulative_results (id, "competitionId", results, "voteCounts", "totalVotes", "lastUpdated")
        VALUES (
            gen_random_uuid()::text,
            comp_id,
            '{}'::jsonb,
            '{}'::jsonb,
            0,
            NOW()
        );

        RAISE NOTICE 'Successfully created Eurovision 2026 competition (year: 2026)';
    ELSE
        RAISE NOTICE 'Eurovision 2026 competition already exists';
    END IF;
END $$;
