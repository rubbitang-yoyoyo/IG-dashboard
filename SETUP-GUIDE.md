# Instagram & Meta Ads Dashboard — Setup Guide

## What's Included

```
instagram-dashboard/
├── google-apps-script/
│   └── Code.gs              ← Paste into Google Apps Script
├── dashboard/
│   ├── index.html            ← Main dashboard page
│   ├── styles.css            ← Styling (dark theme)
│   ├── config.js             ← Configuration + data loading
│   ├── charts.js             ← Organic chart rendering
│   ├── ads.js                ← Ads chart rendering
│   └── app.js                ← Initialization + tab management
└── SETUP-GUIDE.md            ← This file
```

---

## Step 1: Set Up Google Sheet + Apps Script

1. Go to [sheets.google.com](https://sheets.google.com) → create a **new blank spreadsheet**
2. Name it **"Instagram Dashboard Data"**
3. Go to **Extensions → Apps Script**
4. Delete the default code in the editor
5. Copy the entire contents of `google-apps-script/Code.gs` and paste it
6. Update the **CONFIG** section at the top:

```javascript
const CONFIG = {
  INSTAGRAM_ACCOUNT_ID: 'YOUR_ACTUAL_ID_HERE',
  AD_ACCOUNT_ID: 'act_YOUR_ACTUAL_ID_HERE',
  ACCESS_TOKEN: 'YOUR_ACTUAL_TOKEN_HERE',
  APP_ID: 'YOUR_ACTUAL_APP_ID',
  APP_SECRET: 'YOUR_ACTUAL_APP_SECRET',
  DAYS_TO_FETCH: 90,
  TIMEZONE: 'America/New_York',  // Change to your timezone
};
```

7. Click **Save** (Ctrl+S)
8. Select **initialSetup** from the function dropdown
9. Click **Run**
10. Grant permissions when prompted
11. Check your spreadsheet — you should see data tabs populated

---

## Step 2: Publish Google Sheet as CSV

This allows the HTML dashboard to read your data.

1. In your Google Sheet, go to **File → Share → Publish to web**
2. For each sheet tab, publish as **CSV**:
   - Select **"Profile Metrics"** tab → CSV → **Publish**
   - Copy the URL
   - Repeat for: Post Metrics, Story Metrics, Reel Metrics, Ad Metrics, Campaign Metrics
3. You'll get URLs like:
   ```
   https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=0&single=true&output=csv
   ```

---

## Step 3: Configure the Dashboard

1. Open `dashboard/config.js`
2. Replace the placeholder URLs with your published CSV URLs:

```javascript
const DASHBOARD_CONFIG = {
  sheets: {
    profile:    'https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=0&single=true&output=csv',
    posts:      'https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=111&single=true&output=csv',
    stories:    'https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=222&single=true&output=csv',
    reels:      'https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=333&single=true&output=csv',
    ads:        'https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=444&single=true&output=csv',
    campaigns:  'https://docs.google.com/spreadsheets/d/e/XXXX/pub?gid=555&single=true&output=csv',
  },
  currency: 'USD',
  currencySymbol: '$',
  refreshInterval: 300000,
};
```

> **Note:** Until you add real URLs, the dashboard shows demo data automatically.

---

## Step 4: Deploy the Dashboard

### Option A: GitHub Pages (Recommended)

1. Create a GitHub repository
2. Push the `dashboard/` folder contents to the repo
3. Go to **Settings → Pages**
4. Source: **Deploy from branch** → `main` → `/root`
5. Your dashboard will be at: `https://yourusername.github.io/repo-name/`

### Option B: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Drag & drop the `dashboard/` folder
3. Get your URL instantly

### Option C: Just open locally

- Double-click `index.html` — it works locally too
- Note: fetching from Google Sheets may not work locally due to CORS
- Demo data will show instead

---

## Step 5: Embed in Google Sites

1. Go to [sites.google.com](https://sites.google.com)
2. Create a **new site**
3. Click **Insert → Embed → By URL**
4. Paste your GitHub Pages / Netlify URL
5. Resize the embed to fill the page
6. Click **Publish**
7. Set sharing permissions (private or public)

---

## Switching Instagram Accounts

To track a different account:

1. Open your Google Sheet → **Extensions → Apps Script**
2. Update these 3 values in CONFIG:
   ```javascript
   INSTAGRAM_ACCOUNT_ID: 'NEW_ACCOUNT_ID',
   AD_ACCOUNT_ID: 'act_NEW_AD_ACCOUNT_ID',
   ACCESS_TOKEN: 'NEW_ACCESS_TOKEN',
   ```
3. Run **initialSetup** again (this clears old data and starts fresh)
4. The dashboard auto-adapts — no changes needed

---

## How Auto Token Refresh Works

- The script runs `refreshAccessToken` every 7 days automatically
- It exchanges the current token for a new one before expiry
- The new token is stored in the **Config** sheet tab
- If refresh fails, check the **Log** sheet tab for errors
- Requires `APP_ID` and `APP_SECRET` to be set

---

## Troubleshooting

| Issue | Solution |
|---|---|
| No data showing | Check the **Log** tab in your Google Sheet for errors |
| "Connection failed" | Verify your Access Token is valid |
| Token expired | Run **Refresh Token** from the Instagram Dashboard menu |
| Wrong metrics | Check that your account is Business/Creator type |
| Dashboard shows demo data | Update the CSV URLs in `config.js` |
| Charts not loading | Open browser console (F12) for errors |

---

## Custom Menu in Google Sheets

After setup, you'll see an **"Instagram Dashboard"** menu:

- **Fetch Data Now** — manually trigger a data pull
- **Refresh Token** — manually refresh the access token
- **Test Connection** — verify your API credentials work
- **Run Initial Setup** — reset everything and start fresh
