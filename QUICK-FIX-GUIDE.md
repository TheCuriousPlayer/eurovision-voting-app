# Quick Fix Guide - Eurovision 2026 Preview Voting

## The Issue
The Eurovision 2026 Preview page cannot save votes because the competition (year code `202600`) doesn't exist in your Supabase database.

## Quick Fix (Choose One Method)

### Method 1: API Endpoint (Fastest) ⚡
```bash
# Just visit this URL in your browser or run:
curl -X POST https://your-domain.com/api/add-2026-preview
```

✅ Done! The competition is created.

### Method 2: SQL Script (Direct to Database) 📊
1. Open Supabase → SQL Editor
2. Run the script from: `db/add-2026-preview-competition.sql`
3. ✅ Done!

### Method 3: Management UI 🖱️
1. Go to: `https://your-domain.com/init-db`
2. Click: **"Setup Fresh Database"**
3. ⚠️ WARNING: Deletes all existing data!

## Verify It Works

1. Visit: `/eurovision2026Preview`
2. Sign in with Google
3. Select 10 countries and drag them to voting slots
4. Check browser console for: `"Votes saved successfully"`
5. Refresh page - votes should persist ✅

## What Was Fixed

✅ Created competition record (year: 202600)  
✅ Initialized empty cumulative results  
✅ Updated debug API to include 2026 Preview stats  
✅ Updated setup-fresh API to include 2026 Preview  

## Files Changed

- ✅ `src/app/api/add-2026-preview/route.ts` (NEW)
- ✅ `src/app/api/debug/route.ts` (Updated)
- ✅ `src/app/api/setup-fresh/route.ts` (Updated)
- ✅ `db/add-2026-preview-competition.sql` (NEW)

## Need More Details?

See: `FIX-2026-PREVIEW-VOTING.md` for comprehensive documentation.

---
**Pro Tip**: After deploying, run Method 1 once to initialize the competition in production.
