-- Insert Eurovision 2024 Competition if it doesn't exist

INSERT INTO public.competitions (id, year, name, isActive, countries, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(), 
  2024, 
  'Eurovision Song Contest 2024', 
  true,
  '[
    "Albania", "Armenia", "Australia", "Austria", "Azerbaijan", "Belgium", "Croatia", "Cyprus", 
    "Czechia", "Denmark", "Estonia", "Finland", "France", "Georgia", "Germany", "Greece", 
    "Iceland", "Ireland", "Israel", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", 
    "Moldova", "Netherlands", "Norway", "Poland", "Portugal", "San Marino", "Serbia", 
    "Slovenia", "Spain", "Sweden", "Switzerland", "Ukraine", "United Kingdom"
  ]'::jsonb,
  NOW(), 
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM public.competitions WHERE year = 2024);

-- Set up initial empty cumulative results
INSERT INTO public.cumulative_results (id, "competitionId", results, "totalVotes", "lastUpdated")
SELECT 
  gen_random_uuid(),
  c.id,
  '{}'::jsonb,
  0,
  NOW()
FROM public.competitions c
WHERE c.year = 2024
  AND NOT EXISTS (
    SELECT 1 
    FROM public.cumulative_results cr 
    WHERE cr."competitionId" = c.id
  );

-- Note: After creating the database entries, you may want to add some test data
-- To add test votes, use something like:
--
-- INSERT INTO public.votes (id, "userId", "userName", "userEmail", "competitionId", votes, points, "createdAt", "updatedAt")
-- VALUES (
--   gen_random_uuid(),
--   'admin@example.com',
--   'Admin User',
--   'admin@example.com',
--   (SELECT id FROM public.competitions WHERE year = 2024),
--   '["Sweden", "Italy", "Finland", "France", "Spain", "Ukraine", "Netherlands", "Cyprus", "Norway", "Germany"]'::jsonb,
--   '{"Sweden": 12, "Italy": 10, "Finland": 8, "France": 7, "Spain": 6, "Ukraine": 5, "Netherlands": 4, "Cyprus": 3, "Norway": 2, "Germany": 1}'::jsonb,
--   NOW(),
--   NOW()
-- );
