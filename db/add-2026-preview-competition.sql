-- Add Eurovision 2026 Preview competition (year code: 202600)
-- This script creates the competition record needed for the 2026Preview voting page

-- Check if competition already exists
DO $$
DECLARE
    competition_exists BOOLEAN;
    comp_id TEXT;
BEGIN
    -- Check if competition with year 202600 exists
    SELECT EXISTS(SELECT 1 FROM competitions WHERE year = 202600) INTO competition_exists;
    
    IF NOT competition_exists THEN
        -- Insert the competition record
        INSERT INTO competitions (id, year, name, "isActive", countries, "createdAt", "updatedAt")
        VALUES (
            gen_random_uuid()::text,
            202600,
            'Eurovision 2026 Preview',
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
            '{}'::jsonb,  -- Empty results initially
            '{}'::jsonb,  -- Empty vote counts initially
            0,            -- No votes yet
            NOW()
        );
        
        RAISE NOTICE 'Successfully created Eurovision 2026 Preview competition (year: 202600)';
    ELSE
        RAISE NOTICE 'Eurovision 2026 Preview competition already exists';
    END IF;
END $$;
