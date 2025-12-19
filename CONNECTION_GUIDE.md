# How to Connect Mobile App to Backend

## Problem
Windows Firewall is blocking external connections to port 5000.

## Solution Options

### Option 1: Allow Node.js through Windows Firewall (Easiest)
1. Open **Windows Security** → **Firewall & network protection**
2. Click **Allow an app through firewall**
3. Click **Change settings** (requires admin)
4. Find **Node.js** in the list and check both **Private** and **Public**
5. If Node.js isn't in the list:
   - Click **Allow another app**
   - Browse to: `C:\Program Files\nodejs\node.exe`
   - Add it and check both boxes

### Option 2: Use Expo Tunnel (No firewall config needed)
1. Stop the current Expo server
2. Run: `npx expo start --tunnel`
3. This creates a public URL that works anywhere

### Option 3: Use ngrok (Requires signup)
1. Sign up at https://ngrok.com (free)
2. Get your authtoken from the dashboard
3. Run: `ngrok config add-authtoken YOUR_TOKEN`
4. Run: `ngrok http 5000`
5. Copy the https URL (e.g., `https://abc123.ngrok.io`)
6. Update mobile `.env`: `EXPO_PUBLIC_API_URL=https://abc123.ngrok.io`

## Recommended
**Option 1** is the simplest - just allow Node.js through the firewall once and you're done forever.
