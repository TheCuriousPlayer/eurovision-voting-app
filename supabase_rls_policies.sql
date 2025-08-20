-- Enable Row Level Security on all tables
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cumulative_results ENABLE ROW LEVEL SECURITY;

-- Competitions table policies
-- Allow everyone to read competitions (public data)
CREATE POLICY "competitions_select_policy" ON public.competitions
    FOR SELECT USING (true);

-- Allow only authenticated users to insert/update competitions (admin only)
-- You might want to restrict this further to specific admin users
CREATE POLICY "competitions_insert_policy" ON public.competitions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "competitions_update_policy" ON public.competitions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Votes table policies
-- Users can only see their own votes
CREATE POLICY "votes_select_policy" ON public.votes
    FOR SELECT USING (auth.jwt() ->> 'email' = "userEmail");

-- Users can only insert their own votes
CREATE POLICY "votes_insert_policy" ON public.votes
    FOR INSERT WITH CHECK (auth.jwt() ->> 'email' = "userEmail");

-- Users can only update their own votes
CREATE POLICY "votes_update_policy" ON public.votes
    FOR UPDATE USING (auth.jwt() ->> 'email' = "userEmail")
    WITH CHECK (auth.jwt() ->> 'email' = "userEmail");

-- Users can only delete their own votes
CREATE POLICY "votes_delete_policy" ON public.votes
    FOR DELETE USING (auth.jwt() ->> 'email' = "userEmail");

-- Cumulative results table policies
-- Allow everyone to read cumulative results (public leaderboard data)
CREATE POLICY "cumulative_results_select_policy" ON public.cumulative_results
    FOR SELECT USING (true);

-- Only allow system/admin to insert/update cumulative results
-- This should typically be done by your application, not direct user access
CREATE POLICY "cumulative_results_insert_policy" ON public.cumulative_results
    FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "cumulative_results_update_policy" ON public.cumulative_results
    FOR UPDATE USING (auth.role() = 'service_role');

-- Optional: If you want to allow authenticated users to trigger recalculation
-- CREATE POLICY "cumulative_results_update_auth_policy" ON public.cumulative_results
--     FOR UPDATE USING (auth.role() = 'authenticated');
