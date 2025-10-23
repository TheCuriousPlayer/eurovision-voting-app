DB helper scripts

This folder contains SQL helper scripts for seeding and copying Eurovision 2020 semi-final data.

- seed-semi-finals-2020.sql — creates stage column (if missing), inserts semi-final-a and semi-final-b competitions under the schema named "Eurovision Voting System Schema", inserts one test vote per semi-final, and upserts cumulative_results.
- copy-quoted-to-public-2020.sql — copies the seeded rows from "Eurovision Voting System Schema" into public so Prisma (which uses public by default) can query them.

How to run (Supabase SQL editor - recommended):
1. Open your Supabase project and go to SQL Editor.
2. Open db/seed-semi-finals-2020.sql and run it. It will create the stage column and seed the quoted schema.
3. Open db/copy-quoted-to-public-2020.sql and run it. This will copy the rows into public.
4. In your project run: cd C:\EurovisionHost\eurovisionturkiye and then run: npx prisma generate
5. Restart your Next dev server and call the simple endpoints to verify. You can use PowerShell's Invoke-RestMethod to test the endpoints.

If anything fails, copy the exact Supabase error or the terminal output here and I'll take the next step.
