# Railway Deployment Guide - Eurovision Voting App

## Why Railway?
✅ **FREE Tier** - $5 credit monthly (enough for small apps)
✅ **Next.js Support** - Full-stack applications
✅ **Database Support** - PostgreSQL, MySQL included
✅ **Python Support** - Can run your calculator script
✅ **No Configuration** - Automatic detection

## Quick Deploy
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Next.js
6. Add environment variables:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
7. Deploy!

## Python Calculator
Railway can run your Python script as a separate service:
1. Add new service to your project
2. Connect same repository
3. Set start command: `python src/app/eurovision2023/votes/calculate_cumulative.py`

## Best For
- Full-stack apps with databases
- When you need the Python calculator running
