-- Create table for "Next Year" survey responses (PostgreSQL/Supabase)
CREATE TABLE IF NOT EXISTS survey_next_year (
  id SERIAL PRIMARY KEY,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  selected_year VARCHAR(4) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on selected_year for better query performance
CREATE INDEX IF NOT EXISTS idx_selected_year ON survey_next_year(selected_year);

-- Optional: Create a view to see survey results
CREATE OR REPLACE VIEW survey_next_year_results AS
SELECT 
  selected_year,
  COUNT(*) as vote_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM survey_next_year), 2) as percentage
FROM survey_next_year
GROUP BY selected_year
ORDER BY vote_count DESC;
