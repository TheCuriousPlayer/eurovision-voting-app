-- Alternative RLS policies that work better with Prisma/API access
-- These are more permissive for API access while still providing security

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "competitions_select_policy" ON public.competitions;
DROP POLICY IF EXISTS "competitions_insert_policy" ON public.competitions;
DROP POLICY IF EXISTS "competitions_update_policy" ON public.competitions;
DROP POLICY IF EXISTS "votes_select_policy" ON public.votes;
DROP POLICY IF EXISTS "votes_insert_policy" ON public.votes;
DROP POLICY IF EXISTS "votes_update_policy" ON public.votes;
DROP POLICY IF EXISTS "votes_delete_policy" ON public.votes;
DROP POLICY IF EXISTS "cumulative_results_select_policy" ON public.cumulative_results;
DROP POLICY IF EXISTS "cumulative_results_insert_policy" ON public.cumulative_results;
DROP POLICY IF EXISTS "cumulative_results_update_policy" ON public.cumulative_results;

-- Enable Row Level Security
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cumulative_results ENABLE ROW LEVEL SECURITY;

-- Competitions: Allow read access to everyone, write access to service role
CREATE POLICY "competitions_read" ON public.competitions
    FOR SELECT USING (true);

CREATE POLICY "competitions_write" ON public.competitions
    FOR ALL USING (auth.role() = 'service_role');

-- Votes: More permissive for API access while maintaining some security
CREATE POLICY "votes_read" ON public.votes
    FOR SELECT USING (true);

CREATE POLICY "votes_write" ON public.votes
    FOR ALL USING (auth.role() = 'service_role');

-- Cumulative results: Public read, service role write
CREATE POLICY "cumulative_results_read" ON public.cumulative_results
    FOR SELECT USING (true);

CREATE POLICY "cumulative_results_write" ON public.cumulative_results
    FOR ALL USING (auth.role() = 'service_role');
