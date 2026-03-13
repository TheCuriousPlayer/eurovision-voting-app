# Fix for Eurovision 2026 Preview Voting Issue

## Problem
The Eurovision 2026 Preview page (`/eurovision2026Preview`) was unable to save votes because the required competition record (year code `202600`) was missing from the Supabase database.

## Root Cause
The voting system requires a `Competition` record in the database for each Eurovision year/edition. The 2026 Preview page uses year code `202600`, but this competition was never created in the database.

## Solution Options

You have three ways to fix this issue:

### Option 1: Using the API Endpoint (Recommended - Easiest)

1. Navigate to: `/api/add-2026-preview` in your browser or use curl:
   ```bash
   curl -X POST https://your-domain.com/api/add-2026-preview
   ```

2. This will:
   - Create the Eurovision 2026 Preview competition (year: 202600)
   - Initialize empty cumulative results
   - NOT delete any existing data

3. To verify it was created, visit:
   ```
   https://your-domain.com/api/add-2026-preview
   ```
   (GET request to check if competition exists)

### Option 2: Using SQL Script in Supabase

1. Go to your Supabase project
2. Navigate to: SQL Editor
3. Copy and paste the contents of: `db/add-2026-preview-competition.sql`
4. Run the script

The script will:
- Check if the competition already exists
- Create it if missing (with all participating countries)
- Initialize empty cumulative results
- Show a success message

### Option 3: Using the Database Management Page

1. Navigate to: `/init-db` on your website
2. Click: "Setup Fresh Database" button
   
   ⚠️ **WARNING**: This will delete ALL existing votes and competitions and reset the database!
   Only use this if you're okay with losing all data.

## Verification

After applying any of the fixes above, verify the competition was created:

1. Go to Supabase Dashboard → Table Editor
2. Open the `competitions` table
3. Look for a record with `year = 202600`
4. It should show:
   - name: "Eurovision 2026 Preview"
   - isActive: true
   - countries: Array of 35 countries

## Testing the Fix

1. Navigate to: `/eurovision2026Preview`
2. Sign in with Google
3. Select 10 countries
4. Check browser console - should see:
   ```
   Votes saved successfully
   ```
5. Refresh the page - your votes should be preserved

## Countries in 2026 Preview

The competition includes these 35 countries:
- Albania, Armenia, Australia, Austria, Azerbaijan
- Belgium, Bulgaria, Croatia, Czechia, Denmark
- Estonia, Finland, France, Georgia, Germany
- Greece, Israel, Italy, Latvia, Lithuania
- Luxembourg, Malta, Moldova, Montenegro, Norway
- Poland, Portugal, Romania, San Marino, Serbia
- Southern Cyprus, Sweden, Switzerland, Ukraine, United Kingdom

## Technical Details

### Database Schema
```
Competition {
  id: string (cuid)
  year: 202600
  name: "Eurovision 2026 Preview"
  isActive: true
  countries: string[]
}

CumulativeResult {
  id: string (cuid)
  competitionId: string (references Competition)
  results: {} (empty initially)
  voteCounts: {} (empty initially)
  totalVotes: 0
}
```

### API Endpoints
- **POST** `/api/votes/202600` - Submit votes
- **GET** `/api/votes/202600` - Get results (authenticated)
- **GET** `/api/votes/202600/simple` - Get results (public)
- **POST** `/api/add-2026-preview` - Create competition (one-time setup)
- **GET** `/api/add-2026-preview` - Check if competition exists

## Troubleshooting

### Issue: "Competition not found" error
- Solution: Run one of the fix options above

### Issue: Votes not saving
- Check: Is user signed in with Google?
- Check: Browser console for errors
- Check: Network tab shows successful POST to `/api/votes/202600`

### Issue: "202600 competition not found in database"
- This confirms the competition is missing
- Apply one of the fix options above

### Issue: After fix, still getting errors
- Try: Hard refresh the page (Ctrl+Shift+R / Cmd+Shift+R)
- Try: Clear browser cache
- Check: Database to verify competition record exists

## Prevention

To prevent this issue in the future when adding new Eurovision years:

1. Always create the competition record in the database
2. Use the provided API endpoint or SQL script
3. Update the year code in eurovisionvariables.ts
4. Test the voting flow before going live

## Files Modified/Created

- ✅ `db/add-2026-preview-competition.sql` - SQL script to add competition
- ✅ `src/app/api/add-2026-preview/route.ts` - API endpoint to add competition
- ✅ `src/app/api/setup-fresh/route.ts` - Updated to include 2026 Preview
- ✅ `FIX-2026-PREVIEW-VOTING.md` - This documentation

## Need Help?

If you continue to experience issues after applying these fixes:

1. Check the browser console for specific error messages
2. Check Supabase logs for database errors
3. Verify your DATABASE_URL environment variable is correct
4. Ensure Prisma client is up to date: `npx prisma generate`
