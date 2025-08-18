# Netlify Deployment Guide - Eurovision Voting App

## Why Netlify?
✅ **FREE** - 100GB bandwidth/month
✅ **Easy Setup** - Drag & drop or GitHub
✅ **Custom Domains** - Free subdomain
✅ **Form Handling** - Built-in forms
✅ **Functions** - Serverless functions

## Deployment Steps
1. Build your app: `npm run build`
2. Go to https://netlify.com
3. Sign up with GitHub
4. Click "Add new site" → "Import from Git"
5. Select your repository
6. Configure:
   - Build command: `npm run build`
   - Publish directory: `.next`
7. Add environment variables
8. Deploy!

## Note
Netlify works better for static sites. For Next.js with API routes, Vercel is better.
