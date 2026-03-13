# Deployment Checklist - Eurovision 2026 Preview Fix

## Pre-Deployment

- [ ] Review all code changes
- [ ] Verify no TypeScript/ESLint errors: `npm run lint`
- [ ] Test locally if possible
- [ ] Backup current Supabase database (optional but recommended)

## Code Deployment

### Option 1: Git Push (if using Vercel/Netlify auto-deploy)
```bash
git add .
git commit -m "Fix: Add Eurovision 2026 Preview competition (year 202600)

- Add API endpoint to create 2026 Preview competition
- Add SQL script for manual database setup
- Update debug API to include 2026 Preview stats
- Update setup-fresh API to include all competitions
- Add comprehensive documentation"

git push origin main
```

### Option 2: Manual Deploy
```bash
# For Vercel
vercel --prod

# For Netlify
netlify deploy --prod

# For Railway/Render
# Follow your platform's deployment process
```

## Database Initialization (REQUIRED)

**After code is deployed, you MUST initialize the competition in the database.**

Choose ONE method:

### Method 1: API Endpoint (Fastest ⚡)
```bash
# Replace with your actual domain
curl -X POST https://eurotr.vercel.app/api/add-2026-preview

# Expected response:
# {
#   "success": true,
#   "message": "Eurovision 2026 Preview competition created successfully",
#   "competition": {...},
#   "cumulativeResult": {...}
# }
```

### Method 2: Supabase SQL Editor
1. Open Supabase Dashboard
2. Go to: SQL Editor
3. Create new query
4. Paste contents from: `db/add-2026-preview-competition.sql`
5. Run query
6. Look for: "Successfully created Eurovision 2026 Preview competition"

### Method 3: Management UI (⚠️ Destructive)
```
⚠️ WARNING: This deletes ALL existing data!
Only use if you're setting up a fresh database.

1. Visit: https://your-domain.com/init-db
2. Click: "Setup Fresh Database"
3. Wait for success message
```

## Verification Steps

### 1. Check Competition Exists
```bash
curl https://your-domain.com/api/add-2026-preview

# Expected response:
# {
#   "exists": true,
#   "competition": {
#     "year": 202600,
#     "name": "Eurovision 2026 Preview",
#     ...
#   }
# }
```

### 2. Check Debug Endpoint
```bash
curl https://your-domain.com/api/debug

# Look for in response:
# {
#   "focus2026Preview": {
#     "competitionExists": true,
#     "cachedExists": true,
#     "votesCount": 0
#   }
# }
```

### 3. Check Supabase Tables

**In Supabase Dashboard → Table Editor:**

**competitions table:**
- [ ] Has record with `year = 202600`
- [ ] name = "Eurovision 2026 Preview"
- [ ] isActive = true
- [ ] countries array has 35 countries

**cumulative_results table:**
- [ ] Has record with competitionId matching above
- [ ] results = {} (empty object)
- [ ] totalVotes = 0

### 4. Test Voting Flow

1. **Open page:**
   - [ ] Visit: `https://your-domain.com/eurovision2026Preview`
   - [ ] Page loads without errors

2. **Sign in:**
   - [ ] Click "Sign in with Google"
   - [ ] Successfully authenticate
   - [ ] Page shows user name/email

3. **Vote:**
   - [ ] Select 10 countries by dragging to voting slots
   - [ ] All 10 slots filled
   - [ ] Points displayed correctly (12, 10, 8, 7, 6, 5, 4, 3, 2, 1)

4. **Save verification:**
   - [ ] Open browser DevTools → Console
   - [ ] Look for: "Votes saved successfully"
   - [ ] No error messages about "202600 competition not found"

5. **Persistence test:**
   - [ ] Refresh the page (F5)
   - [ ] All 10 votes still in their positions
   - [ ] No votes lost

6. **Results test (if enabled):**
   - [ ] Toggle "Show Results" button
   - [ ] Results display correctly
   - [ ] Your vote is included in totals

### 5. Browser Console Check

**Should NOT see these errors:**
- ❌ "Competition for year code 202600 not found"
- ❌ "202600 competition not found in database"
- ❌ "Failed to save votes to server"

**Should see these messages:**
- ✅ "Votes saved successfully"
- ✅ "User votes loaded into selectedCountries"
- ✅ "Results state set with totalVotes"

### 6. Network Tab Check

**In DevTools → Network tab:**

**POST /api/votes/202600:**
- [ ] Status: 200 OK
- [ ] Response: `{"success": true}`

**GET /api/votes/202600/simple:**
- [ ] Status: 200 OK
- [ ] Response includes: `totalVotes`, `countryPoints`, `userVote`

## Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor for 202600-related errors in logs
- [ ] Check vote count increases: `/api/debug`
- [ ] Verify cumulative results update correctly
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices

### Week 1
- [ ] Monitor total votes growing
- [ ] Verify no user complaints about losing votes
- [ ] Check database performance (query speeds)
- [ ] Ensure auto-refresh works (results update every 60s)

## Rollback Procedure (If Needed)

If critical issues occur:

### 1. Code Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback deployment in Vercel/Netlify UI
```

### 2. Database Cleanup (Optional)
```sql
-- Only if you want to remove the competition
-- This will delete all votes for 2026 Preview!

DELETE FROM cumulative_results 
WHERE "competitionId" IN (
  SELECT id FROM competitions WHERE year = 202600
);

DELETE FROM votes 
WHERE "competitionId" IN (
  SELECT id FROM competitions WHERE year = 202600
);

DELETE FROM competitions WHERE year = 202600;
```

## Success Criteria

✅ **Deployment is successful when:**
- Code deployed without build errors
- Competition record exists in database (year: 202600)
- Cumulative results record created and linked
- Users can successfully vote on /eurovision2026Preview
- Votes persist across page refreshes
- No console errors about missing competition
- Debug endpoint shows competition exists
- Multiple users can vote without conflicts

## Documents to Keep

After successful deployment:
- ✅ This checklist (for future reference)
- ✅ `SUMMARY-2026-PREVIEW-FIX.md` (overview)
- ✅ `FIX-2026-PREVIEW-VOTING.md` (detailed guide)
- ✅ `QUICK-FIX-GUIDE.md` (quick reference)
- ✅ SQL script: `db/add-2026-preview-competition.sql`

## Notes

- This fix is **additive only** - it doesn't modify existing data
- Safe to deploy during live voting (won't affect other years)
- Can be run multiple times safely (won't duplicate records)
- No breaking changes to existing functionality

## Support Contacts

If issues arise during deployment:
1. Check documentation files in the project root
2. Review Supabase logs for database errors
3. Check Vercel/Netlify deployment logs
4. Run `/api/debug` for diagnostic information

---

**Deployment Date:** _____________

**Deployed By:** _____________

**Verification Complete:** [ ] Yes [ ] No

**Notes:**
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________
