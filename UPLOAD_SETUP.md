# Strava Upload Feature - Quick Start

## 🚀 Setup Guide

### 1. Get Strava API Credentials

1. Visit: https://www.strava.com/settings/api
2. Click "Create an App"
3. Fill in:
    - **Application Name**: FreePower
    - **Category**: Training
    - **Website**: `http://localhost:5173`
    - **Authorization Callback Domain**: `localhost`
4. Copy your **Client ID** and **Client Secret**

### 2. Configure Environment Variables

**Local Development:**

Open `.env` file and add your credentials:

```bash
PUBLIC_STRAVA_APP_ID=your_client_id_here
STRAVA_CLIENT_SECRET=your_client_secret_here
```

**Production (Netlify):**

1. Go to Netlify Dashboard → Site Settings → Environment Variables
2. Add the same two variables:
    - `PUBLIC_STRAVA_APP_ID`
    - `STRAVA_CLIENT_SECRET`
3. Update Strava app callback domain to include your Netlify domain

### 3. Restart Dev Server

```bash
pnpm dev
```

## 🎯 How to Use

1. **Connect Strava**:
    - Click user icon (top right)
    - Click "Connect" next to Strava
    - Authorize the app

2. **Complete a Workout**:
    - Finish your workout and stop it
    - A completion overlay automatically appears
    - Review stats, edit name/description
    - Click "Save & Upload"
    - Done! ✨

## 🔐 Security

- Client secret stays on server (never sent to browser)
- Tokens stored in localStorage
- Automatic token refresh before expiration
- `.env` file is in `.gitignore` (never committed)

## 🧪 Testing

1. Connect to Strava via user menu
2. Complete a workout
3. Upload overlay should auto-appear when stopped
4. Verify activity appears on Strava

## 🐛 Troubleshooting

**"Server configuration error"**
→ Check `.env` file exists with correct values, restart server
→ For production: Verify environment variables are set in Netlify

**"Authorization was denied"**
→ User cancelled OAuth, try again

**"Failed to exchange code"**
→ Verify callback domain includes `localhost` (dev) or your Netlify domain (prod)

## 📖 Full Documentation

See [UPLOAD_FEATURE.md](UPLOAD_FEATURE.md) for detailed architecture, production deployment, and extending to other platforms.
