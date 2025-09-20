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
GOOGLE_ID=***
GOOGLE_SECRET=***
NEXTAUTH_SECRET=***
NEXTAUTH_URL=https://eurotr.vercel.app
```

## Local Development:

For local development, add to `.env.local`:
```
DATABASE_URL=your_postgresql_connection_string_here
```
