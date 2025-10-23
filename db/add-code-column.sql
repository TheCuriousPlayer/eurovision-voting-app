-- Add `code` INT column to competitions and populate values for 2020 entries
-- Adjust for public schema; run in Supabase SQL editor

ALTER TABLE public.competitions ADD COLUMN IF NOT EXISTS code integer;

-- Set codes for existing rows (main -> 202000, semi-final-a -> 202001, semi-final-b -> 202002)
UPDATE public.competitions
SET code = CASE
  WHEN year = 2020 AND (stage = 'main' OR stage IS NULL) THEN 202000
  WHEN year = 2020 AND stage = 'semi-final-a' THEN 202001
  WHEN year = 2020 AND stage = 'semi-final-b' THEN 202002
  ELSE code
END
WHERE year = 2020;

-- Create unique index on code if desired
CREATE UNIQUE INDEX IF NOT EXISTS competitions_code_idx ON public.competitions (code);

-- Repeat for quoted schema if it exists
DO $$
BEGIN
  IF EXISTS(SELECT 1 FROM information_schema.schemata WHERE schema_name = 'Eurovision Voting System Schema') THEN
    EXECUTE 'ALTER TABLE "Eurovision Voting System Schema".competitions ADD COLUMN IF NOT EXISTS code integer';
    EXECUTE '
      UPDATE "Eurovision Voting System Schema".competitions
      SET code = CASE
        WHEN year = 2020 AND (stage = ''main'' OR stage IS NULL) THEN 202000
        WHEN year = 2020 AND stage = ''semi-final-a'' THEN 202001
        WHEN year = 2020 AND stage = ''semi-final-b'' THEN 202002
        ELSE code
      END
      WHERE year = 2020
    ';
    EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS competitions_code_idx_quoted ON "Eurovision Voting System Schema".competitions (code)';
  END IF;
END
$$ LANGUAGE plpgsql;
