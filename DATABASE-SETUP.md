# Database Setup Guide

## Option 1: Railway (Recommended - Free PostgreSQL)

1. **Go to**: https://railway.app
2. **Sign up** with GitHub
3. **Click**: "New Project" → "Provision PostgreSQL"
4. **Copy** the PostgreSQL connection string
5. **Add to Vercel** Environment Variables:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

## Option 2: Supabase (Alternative - Free PostgreSQL)

1. **Go to**: https://supabase.com
2. **Sign up** with GitHub
3. **Create new project**
4. **Go to**: Settings → Database
5. **Copy** connection string
6. **Add to Vercel** Environment Variables

## Environment Variables for Vercel:

```
DATABASE_URL=your_postgresql_connection_string_here
GOOGLE_ID=87219256128-7k4p98c0pdp07lg8b3ds0b90u16nbokh.apps.googleusercontent.com
GOOGLE_SECRET=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
NEXTAUTH_SECRET=2b80d6ad2c49db241a51260e30b2e3fd160b9983ea8ec125bb300c5e83bdd7df
NEXTAUTH_URL=https://eurotr.vercel.app
```

## Local Development:

For local development, add to `.env.local`:
```
DATABASE_URL=your_postgresql_connection_string_here
```
