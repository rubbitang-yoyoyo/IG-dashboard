# How to Deploy Dashboard on Google Sites + Google Sheets

## Overview
Since Google Sites can't host custom HTML/CSS/JS directly, we need to:
1. **Google Sheet** → stores data + runs Apps Script
2. **GitHub Pages** (free) → hosts the dashboard HTML
3. **Google Sites** → embeds the GitHub Pages URL

---

## PART 1: Set Up Google Sheets

### Step 1.1: Create the Spreadsheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **+ Blank** to create a new spreadsheet
3. Name it: **Instagram Dashboard Data**

### Step 1.2: Add Apps Script
1. In your spreadsheet, click **Extensions → Apps Script**
2. Delete any default code in the editor
3. Copy ALL the code from `google-apps-script/Code.gs` and paste it
4. Click the **Save** icon (💾) or press `Ctrl+S`
5. Name the project: **Instagram Dashboard Script**

### Step 1.3: Run Initial Setup
1. In the Apps Script editor, find the function dropdown (says "Select function")
2. Select **initialSetup**
3. Click **▶ Run**
4. A popup will ask for permissions → Click **Review Permissions**
5. Choose your Google account
6. Click **Advanced** → **Go to Instagram Dashboard Script (unsafe)**
7. Click **Allow**

### Step 1.4: Check Your Spreadsheet
Go back to your Google Sheet. You should see these tabs:
- **Profile Metrics**
- **Post Metrics**
- **Story Metrics**
- **Reel Metrics**
- **Ad Metrics**
- **Campaign Metrics**
- **Config**
- **Log**

(They'll have demo/empty data until you add real Meta credentials)

---

## PART 2: Publish Sheet Data as CSV

This lets the dashboard read your data.

### Step 2.1: Publish to Web
1. In your Google Sheet, click **File → Share → Publish to web**
2. A popup appears

### Step 2.2: Get CSV URLs for Each Tab
For each data tab, do this:

1. In the "Link" section, change dropdown from "Entire Document" to a specific sheet:
   - **Profile Metrics**
2. Change format from "Web page" to **Comma-separated values (.csv)**
3. Click **Publish**
4. Copy the URL that appears
5. Save it somewhere (Notepad, etc.)

Repeat for these tabs:
- Profile Metrics
- Post Metrics
- Story Metrics
- Reel Metrics
- Ad Metrics
- Campaign Metrics

You'll have 6 URLs that look like:
```
https://docs.google.com/spreadsheets/d/e/2PACX-xxxxx/pub?gid=0&single=true&output=csv
https://docs.google.com/spreadsheets/d/e/2PACX-xxxxx/pub?gid=123456&single=true&output=csv
...
```

---

## PART 3: Host Dashboard on GitHub Pages (Free)

Google Sites can't run custom JavaScript, so we host on GitHub Pages and embed it.

### Step 3.1: Create GitHub Account (if needed)
1. Go to [github.com](https://github.com)
2. Sign up for free

### Step 3.2: Create a Repository
1. Click the **+** icon (top right) → **New repository**
2. Name: `instagram-dashboard`
3. Set to **Public** (required for free GitHub Pages)
4. Check **Add a README file**
5. Click **Create repository**

### Step 3.3: Upload Dashboard Files
1. In your new repo, click **Add file → Upload files**
2. Drag and drop these files from `dashboard/` folder:
   - `index.html`
   - `styles.css`
   - `config.js`
   - `charts.js`
   - `ads.js`
   - `app.js`
3. Scroll down, click **Commit changes**

### Step 3.4: Update config.js with Your CSV URLs
1. Click on `config.js` in your repo
2. Click the **pencil icon** (Edit this file)
3. Find the `sheets:` section and paste your CSV URLs:

```javascript
const DASHBOARD_CONFIG = {
  sheets: {
    profile:    'YOUR_PROFILE_METRICS_CSV_URL',
    posts:      'YOUR_POST_METRICS_CSV_URL',
    stories:    'YOUR_STORY_METRICS_CSV_URL',
    reels:      'YOUR_REEL_METRICS_CSV_URL',
    ads:        'YOUR_AD_METRICS_CSV_URL',
    campaigns:  'YOUR_CAMPAIGN_METRICS_CSV_URL',
  },
  // ... rest stays the same
};
```

4. Click **Commit changes**

### Step 3.5: Enable GitHub Pages
1. Go to your repo's **Settings** tab
2. Scroll down to **Pages** (left sidebar)
3. Under "Source", select **Deploy from a branch**
4. Branch: **main**, Folder: **/ (root)**
5. Click **Save**
6. Wait 1-2 minutes
7. Your URL will be: `https://YOUR-USERNAME.github.io/instagram-dashboard/`

Test this URL in your browser — you should see the dashboard!

---

## PART 4: Embed in Google Sites

### Step 4.1: Create a Google Site
1. Go to [sites.google.com](https://sites.google.com)
2. Click **+ Blank** or choose a template
3. Name your site (e.g., "Layture Analytics")

### Step 4.2: Embed the Dashboard
1. On your Google Site page, click **Insert** (right panel)
2. Click **Embed**
3. Select **By URL**
4. Paste your GitHub Pages URL:
   ```
   https://YOUR-USERNAME.github.io/instagram-dashboard/
   ```
5. Click **Insert**

### Step 4.3: Resize the Embed
1. Click on the embedded frame
2. Drag the corners to make it larger
3. For best results, make it nearly full-width and tall (at least 800px height)

### Step 4.4: Publish Your Google Site
1. Click **Publish** (top right)
2. Choose a URL name (e.g., `layture-dashboard`)
3. Set who can view:
   - **Anyone** = public
   - **Restricted** = only specific people
4. Click **Publish**

Your dashboard is now live at:
```
https://sites.google.com/view/layture-dashboard
```

---

## PART 5: Add Real Instagram/Meta Credentials

### Step 5.1: Get Your Meta Credentials
You need:
1. **Instagram Account ID** — from Meta Business Suite
2. **Ad Account ID** — starts with `act_`
3. **Access Token** — from Facebook Developer Portal
4. **App ID** — from your Facebook App
5. **App Secret** — from your Facebook App

### Step 5.2: Update Apps Script
1. Open your Google Sheet
2. Go to **Extensions → Apps Script**
3. Find the `CONFIG` section at the top:

```javascript
const CONFIG = {
  INSTAGRAM_ACCOUNT_ID: 'YOUR_INSTAGRAM_ACCOUNT_ID',
  AD_ACCOUNT_ID: 'act_YOUR_AD_ACCOUNT_ID',
  ACCESS_TOKEN: 'YOUR_ACCESS_TOKEN',
  APP_ID: 'YOUR_APP_ID',
  APP_SECRET: 'YOUR_APP_SECRET',
  DAYS_TO_FETCH: 90,
  TIMEZONE: 'America/New_York',
};
```

4. Replace the placeholder values with your real credentials
5. Click **Save**
6. Run **initialSetup** again to fetch real data

### Step 5.3: Set Up Automatic Daily Fetch
1. In Apps Script, click the **clock icon** (Triggers)
2. Click **+ Add Trigger**
3. Settings:
   - Function: **fetchAllData**
   - Event source: **Time-driven**
   - Type: **Day timer**
   - Time: **6am to 7am** (or your preference)
4. Click **Save**

Now your data updates daily automatically!

---

## Summary

| Component | Location | Purpose |
|-----------|----------|---------|
| Google Sheet | sheets.google.com | Stores all Instagram/Ad data |
| Apps Script | Inside Google Sheet | Fetches data from Meta APIs daily |
| GitHub Pages | github.io | Hosts the dashboard HTML/CSS/JS |
| Google Sites | sites.google.com | Embeds the dashboard for easy sharing |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Dashboard shows "Demo Data" | Update CSV URLs in config.js on GitHub |
| Embed doesn't load | Check GitHub Pages is enabled and URL is correct |
| No data in sheets | Check Apps Script Log tab for errors |
| "Token expired" error | Run Refresh Token from the Instagram Dashboard menu |
| Charts look broken | Make sure all 6 files are uploaded to GitHub |
| Can't publish Sheet | Make sure "Publish to web" is enabled |

---

## Quick Reference

**Your URLs after setup:**
- Google Sheet: `https://docs.google.com/spreadsheets/d/YOUR-SHEET-ID`
- GitHub Pages: `https://YOUR-USERNAME.github.io/instagram-dashboard/`
- Google Sites: `https://sites.google.com/view/YOUR-SITE-NAME`
