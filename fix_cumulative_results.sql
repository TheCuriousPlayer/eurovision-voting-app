-- SQL to create cumulative_results for Eurovision 2020 Semi-Finals
-- Using the actual competition IDs from the database

-- For Semi-Final A (202001)
INSERT INTO "public"."cumulative_results" 
("id", "competitionId", "results", "totalVotes", "lastUpdated") 
VALUES 
('cumulative_202001_semifinal_a', 'cmgo1fww10000w18og9midyz401', '{}', 0, NOW());

-- For Semi-Final B (202002)  
INSERT INTO "public"."cumulative_results" 
("id", "competitionId", "results", "totalVotes", "lastUpdated") 
VALUES 
('cumulative_202002_semifinal_b', 'cmgo1fww10000w18og9midyz402', '{}', 0, NOW());