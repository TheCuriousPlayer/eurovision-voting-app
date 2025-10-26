# Security Improvements - Eurovision 2020 Reveal System

## Date: October 26, 2025

## Summary
Implemented server-side GM authentication for all public API endpoints (2020-2026) to prevent unauthorized access to voting results.

## Changes Made

### 1. API Endpoints - Added GM Authentication to All Years

**Eurovision 2020 Endpoints:**
#### `/api/votes/2020/semi-final-a/public/route.ts`
- ✅ Added GM authentication (year code: `202001`)

#### `/api/votes/2020/semi-final-b/public/route.ts`
- ✅ Created new public endpoint with GM authentication (year code: `202002`)

#### `/api/votes/2020/public/route.ts`
- ✅ Added GM authentication (year code: `202000`)

**Eurovision 2022-2026 Endpoints:**
#### `/api/votes/2022/public/route.ts`
- ✅ Added GM authentication (year code: `2022`)

#### `/api/votes/2023/public/route.ts`
- ✅ Added GM authentication (year code: `2023`)

#### `/api/votes/2024/public/route.ts`
- ✅ Added GM authentication (year code: `2024`)

#### `/api/votes/2025/public/route.ts`
- ✅ Added GM authentication (year code: `2025`)

#### `/api/votes/2026/public/route.ts`
- ✅ Added GM authentication (year code: `2026`)

**All endpoints now include:**
- `getServerSession` import from `next-auth/next`
- `authOptions` import from `@/lib/auth`
- `VOTE_CONFIG` import for GM list
- Authentication check (401 if not logged in)
- GM authorization check (403 if not a GM)

### 2. Middleware - Simplified Approach

#### `src/middleware.ts`
- ✅ Removed Edge Runtime incompatible code (`getServerSession`)
- ✅ Kept existing header-based protection for `/public` and `/simple` API endpoints
- ℹ️ **Note:** Reveal pages protected by client-side checks + API authentication (no server-side page redirect)

**Why this approach?**
- Next.js middleware runs in Edge Runtime which doesn't support `getServerSession`
- The API endpoints are the actual data source - protecting them is more important
- Client-side protection in reveal pages + secure API = effective security
- Without a valid GM session, API returns 401/403, so reveal page gets no data

## Security Before vs After

### BEFORE (Vulnerable)
```
Public API: /api/votes/2020/semi-final-a/public
Protection: Header-based (referer/origin) - EASILY SPOOFED
Attack: curl with fake headers could access results

Reveal Page: /eurovision2020/semi-final-a-reveal
Protection: Client-side only (React check)
Attack: Disable JavaScript or modify client code
```

### AFTER (Secure)
```
Public API: /api/votes/2020/semi-final-a/public
Protection: Server-side session + GM list verification
Attack: Impossible without valid GM account

Reveal Page: /eurovision2020/semi-final-a-reveal
Protection: Client-side GM check + API requires GM auth
Attack: Page loads but API returns 401/403 without GM session
        (no data exposed, page shows error)
```

## Attack Scenarios Prevented

### ❌ Scenario 1: Spoofed Headers (FIXED)
```bash
# Before: This would work
curl "https://site.com/api/votes/2020/semi-final-a/public" \
  -H "Referer: https://site.com/"

# After: Returns 401 Unauthorized
```

### ❌ Scenario 2: Direct API Access (FIXED)
```javascript
// Before: Fetch from browser console would work
fetch('/api/votes/2020/semi-final-a/public')
  .then(r => r.json())
  .then(console.log) // Would show results!

// After: Returns 401 Unauthorized (no session)
```

### ❌ Scenario 3: Reveal Page Without Auth (FIXED)
```
Before: Access /eurovision2020/semi-final-a-reveal
  → Page loads
  → React checks auth
  → User can inspect network tab for API calls

After: Access /eurovision2020/semi-final-a-reveal
  → Page loads (client-side check)
  → API call requires authentication
  → API returns 401 Unauthorized
  → No data exposed
```

### ❌ Scenario 4: Valid User, Not GM (FIXED)
```
Before: Regular logged-in user
  → Client-side: "Access denied"
  → Network tab: Can still call API endpoints

After: Regular logged-in user
  → Server returns 403 Forbidden
  → No data exposed
```

## Testing Checklist

- [ ] Test as unauthenticated user → Should redirect to sign-in
- [ ] Test as authenticated non-GM user → Should redirect with error
- [ ] Test as authenticated GM user → Should work normally
- [ ] Test API endpoint directly without session → Should return 401
- [ ] Test API endpoint with non-GM session → Should return 403
- [ ] Test API endpoint with GM session → Should return results
- [ ] Verify reveal page loads for GMs
- [ ] Verify videos play correctly for GMs

## GM Configuration

GM lists are managed in `/src/config/eurovisionvariables.ts`:

```typescript
VOTE_CONFIG = {
  '202000': { // Final
    GMs: 'gm1@example.com, gm2@example.com'
  },
  '202001': { // Semi-Final A
    GMs: 'gm1@example.com, gm2@example.com'
  },
  '202002': { // Semi-Final B
    GMs: 'gm1@example.com, gm2@example.com'
  }
}
```

## Notes

- The `/simple` endpoints were NOT modified as they are designed for regular users to see results
- **API-level protection is the primary security layer** - without GM session, no data is returned
- Client-side checks remain for better UX (instant feedback)
- All GM email checks are case-insensitive
- Edge Runtime limitation: Cannot use `getServerSession` in middleware
- This approach focuses on protecting the data source (APIs) rather than page access

## Deployment

After these changes:
1. Build the application: `npm run build`
2. Test in development: `npm run dev`
3. Deploy to production
4. Verify GM access works
5. Verify non-GMs cannot access

## Rollback Plan

If issues occur, revert these commits:
1. Middleware changes in `src/middleware.ts`
2. API route changes in `src/app/api/votes/2020/*/public/route.ts`

The system will fall back to header-based protection (less secure but functional).
