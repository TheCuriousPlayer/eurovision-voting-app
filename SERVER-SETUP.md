# Eurovision Voting Server - Network Configuration Guide

## Your Server Details
- **Local IP Address**: 192.168.50.23
- **Local Access**: http://localhost:3000
- **Network Access**: http://192.168.50.23:3000

## Environment Configuration

### For Local Testing (.env.local)
```
GOOGLE_ID=87219256128-7k4p98c0pdp07lg8b3ds0b90u16nbokh.apps.googleusercontent.com 
GOOGLE_SECRET=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
NEXTAUTH_SECRET=2b80d6ad2c49db241a51260e30b2e3fd160b9983ea8ec125bb300c5e83bdd7df
NEXTAUTH_URL=http://localhost:3000
```

### For Network Access (.env.production)
```
GOOGLE_ID=87219256128-7k4p98c0pdp07lg8b3ds0b90u16nbokh.apps.googleusercontent.com 
GOOGLE_SECRET=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
NEXTAUTH_SECRET=2b80d6ad2c49db241a51260e30b2e3fd160b9983ea8ec125bb300c5e83bdd7df
NEXTAUTH_URL=http://192.168.50.23:3000
```

## Google OAuth Configuration
⚠️ **IMPORTANT**: Update your Google OAuth settings:
1. Go to: https://console.developers.google.com/
2. Select your project
3. Go to "Credentials" → "OAuth 2.0 Client IDs"
4. Add these URLs to "Authorized redirect URIs":
   - http://localhost:3000/api/auth/callback/google
   - http://192.168.50.23:3000/api/auth/callback/google

## Server Access Methods

### Method 1: Local Computer Only
- URL: http://localhost:3000
- Use: .env.local configuration
- Access: Only from this computer

### Method 2: Network Access (Same WiFi)
- URL: http://192.168.50.23:3000
- Use: .env.production configuration
- Access: Any device on same network

### Method 3: Internet Access (Advanced)
- Requires router port forwarding (Port 3000)
- Use external IP address
- ⚠️ Security considerations apply

## Firewall Configuration
Windows may block network access. If others can't connect:
1. Open Windows Defender Firewall
2. Click "Allow an app through firewall"
3. Add Node.js and Python (if not already allowed)
4. Or temporarily disable firewall for testing

## Starting the Server
1. Run: `server-manager.bat`
2. Choose option 3: "Start Both Services"
3. Share the URL with others: http://192.168.50.23:3000

## Files Overview
- `server-manager.bat` - Main control panel
- `start-server.bat` - Web server only
- `start-calculator.bat` - Vote calculator only
- `.env.local` - Local development config
- `.env.production` - Network access config (create this file)
