# Workout Upload Feature

## Overview

Automatic upload of completed workouts to Strava. Architecture supports extending to additional platforms like RideWithGPS.

## Setup Instructions

### 1. Register Your Application with Strava

1. Go to https://www.strava.com/settings/api
2. Create a new application
3. Fill in the required information:
    - **Application Name**: FreePower (or your preferred name)
    - **Category**: Training
    - **Website**: Your website or `http://localhost:5173`
    - **Authorization Callback Domain**: `localhost` (for development)
4. After creation, you'll receive:
    - **Client ID**
    - **Client Secret**

### 2. Configure Environment Variables

**Local Development:**

1. Open `.env` and add your Strava credentials:

    ```
    PUBLIC_STRAVA_APP_ID=your_client_id_here
    STRAVA_CLIENT_SECRET=your_client_secret_here
    ```

2. **Important**: Never commit your `.env` file to version control!

**Production (Netlify):**

See Production Deployment section below.

### 3. Development Setup

```bash
pnpm install
pnpm dev
```

Open browser to `http://localhost:5173`

## Usage

### Connecting to Strava

1. Click the user icon in the top-right corner
2. In the dropdown menu, find "Upload Services"
3. Click "Connect" next to Strava
4. Authorize the application in the Strava OAuth flow
5. You'll be redirected back with a success message

### Uploading Workouts

1. Complete a workout session
2. When you stop the workout, a "Workout Complete" overlay will appear
3. Review your workout stats
4. Edit the workout name and description if desired
5. Ensure "Upload to Strava" is checked
6. Click "Save & Upload"
7. Your workout will be uploaded to Strava automatically

### Disconnecting

1. Open the user menu
2. Click "Disconnect" next to Strava
3. Your tokens will be cleared from localStorage

## Architecture

## Architecture Overview

### Key Components

**Authentication Layer** (`src/utils/auth/`)

- OAuth 2.0 flow handling
- Token management and auto-refresh
- Platform-agnostic types for extensibility

**Upload Service** (`src/utils/upload/`)

- Multi-platform upload orchestration
- Platform-specific upload implementations
- Error handling and retry logic

**FIT File Generation** (`src/utils/fitFileGenerator.ts`)

- Converts workout data to FIT format
- Includes all metrics (power, HR, cadence, speed, distance)
- Reusable for both download and upload

**API Routes** (`src/routes/api/strava/token/`)

- Server-side token exchange (keeps client secret secure)
- Token refresh endpoint
- Handles OAuth callback

**User Interface**

- `CompleteWorkout.svelte` - Post-workout upload overlay
- `StravaConnect.svelte` - Connection management in user menu
- Automatic display on workout completion

### OAuth Flow

1. User clicks "Connect" → Redirects to Strava authorization
2. User authorizes → Strava redirects back with authorization code
3. Callback page exchanges code for tokens via secure API route
4. Tokens stored in localStorage (via Svelte store)
5. Automatic refresh before expiration (6-hour token lifespan)

### Upload Flow

1. Workout completes → Overlay automatically displays
2. User reviews stats and customizes name/description
3. FIT file generated from recorded data
4. Upload service sends to selected platforms
5. Success confirmation with activity link

## Security

- **Client Secret**: Secured in server environment variables, never exposed to browser
- **Tokens**: Stored in localStorage (consider encryption for production)
- **HTTPS**: Required for production OAuth
- **Token Refresh**: Automatic before expiration
- **Scope**: Minimal permissions (`activity:write`, `activity:read`)

## Extending to Other Platforms

Architecture supports adding platforms like RideWithGPS:

1. Create auth utility: `src/utils/auth/ridewithgpsAuth.ts`
2. Create upload utility: `src/utils/upload/ridewithgpsUpload.ts`
3. Create connection UI: `src/components/UserMenu/components/RideWithGPSConnect.svelte`
4. Add OAuth callback route: `src/routes/auth/ridewithgps/callback/+page.svelte`
5. Add token API routes: `src/routes/api/ridewithgps/token/+server.ts`
6. Update upload service to include new platform
7. Add checkbox in `CompleteWorkout.svelte`

The types and service layer already support this pattern.

## Troubleshooting

### "Server configuration error"

- **Local**: Check that `.env` file exists and contains valid credentials, restart dev server
- **Production**: Verify environment variables are set in Netlify dashboard
- Check variable names match exactly: `PUBLIC_STRAVA_APP_ID` and `STRAVA_CLIENT_SECRET`

### "Authorization was denied or cancelled"

- User cancelled the OAuth flow
- Try connecting again

### "Failed to exchange authorization code"

- **Local**: Check that your Strava app's callback domain includes `localhost`
- **Production**: Check that your Strava app's callback domain includes your Netlify domain
- Verify client ID and secret are correct in environment variables
- Check browser console and Network tab for detailed errors
- Verify client ID and secret are correct
- Check browser console for detailed errors

### "Upload failed"

- Ensure you're connected to Strava
- Check that tokens haven't been revoked on Strava's website
- Verify internet connection
- Check browser console for API errors

## Production Deployment (Netlify)

### Step 1: Update Strava App Settings

1. Go to https://www.strava.com/settings/api
2. Edit your Strava application
3. Update **Authorization Callback Domain**:
    - Add your production domain: `your-app-name.netlify.app`
    - Keep `localhost` for local development
    - Example: `localhost, freepower.netlify.app`

### Step 2: Configure Netlify Environment Variables

1. **In Netlify Dashboard**:
    - Go to: Site settings → Environment variables
    - Or: Build & deploy → Environment

2. **Add Variables**:
    - **Key**: `PUBLIC_STRAVA_APP_ID`  
      **Value**: Your Strava Client ID
    - **Key**: `STRAVA_CLIENT_SECRET`  
      **Value**: Your Strava Client Secret

3. **Important**:
    - These are the same values from your local `.env` file
    - Don't commit your `.env` file to Git (already in `.gitignore`)
    - Netlify will automatically inject these during build/runtime

4. **Redeploy**: Trigger a new deploy for changes to take effect

### Step 3: Verify Deployment

1. Visit your deployed site
2. Open user menu
3. Click "Connect" next to Strava
4. Should redirect to Strava OAuth (with your production URL)
5. After authorization, should redirect back successfully

### Additional Production Considerations

- **HTTPS**: Netlify provides this automatically ✅
- **Token Security**: Consider encrypting tokens in localStorage for production
- **Error Handling**: Add error tracking (Sentry, LogRocket, etc.)
- **Rate Limiting**: Be aware of Strava API rate limits (see below)

### Strava API Rate Limits

- **100 requests per 15 minutes** per application
- **1,000 requests per day** per application
- These limits are shared across all your app users
- Plan accordingly for scaling

## API References

- [Strava API Documentation](https://developers.strava.com/docs/reference/)
- [Strava Authentication Guide](https://developers.strava.com/docs/authentication/)
- [FIT File Format Specification](https://developer.garmin.com/fit/protocol/)
