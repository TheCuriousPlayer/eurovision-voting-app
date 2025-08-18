# Render Deployment Guide - Eurovision Voting App

## Why Render?
✅ **FREE Tier** - Static sites forever free
✅ **Web Services** - $0 for 750 hours/month
✅ **Auto Deploy** - GitHub integration
✅ **SSL Included** - HTTPS by default
✅ **Python Support** - Background services

## Static Site (Basic)
1. Go to https://render.com
2. Sign up with GitHub
3. Click "New Static Site"
4. Connect repository
5. Build command: `npm run build && npm run export`
6. Publish directory: `out`

## Web Service (Full App)
1. Click "New Web Service"
2. Connect repository
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables
6. Deploy!

## Python Service
Create separate service for calculator:
1. "New Background Worker"
2. Start command: `python src/app/eurovision2023/votes/calculate_cumulative.py`

## Note
Free tier has some limitations but great for getting started!
