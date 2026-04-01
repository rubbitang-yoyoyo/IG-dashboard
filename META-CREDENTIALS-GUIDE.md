# How to Get Meta API Credentials

This guide walks you through getting all the credentials needed to connect your Instagram Dashboard to real data.

---

## What You Need

| Credential | Example | Where to Get |
|------------|---------|--------------|
| Instagram Account ID | `17841400123456789` | Meta Business Suite |
| Ad Account ID | `act_123456789` | Meta Business Suite |
| Access Token | `EAABsbCS...` (long string) | Facebook Developer Portal |
| App ID | `123456789012345` | Facebook Developer Portal |
| App Secret | `abc123def456...` | Facebook Developer Portal |

---

## Prerequisites

Before starting, make sure you have:

- [ ] An **Instagram Business** or **Creator** account (not personal)
- [ ] A **Facebook Page** connected to your Instagram account
- [ ] Admin access to a **Meta Business Suite** account
- [ ] A **Facebook Developer** account (free to create)

---

## PART 1: Convert to Business/Creator Account (if needed)

If your Instagram is still a personal account:

1. Open **Instagram app** on your phone
2. Go to **Settings** → **Account**
3. Tap **Switch to Professional Account**
4. Choose **Business** or **Creator**
5. Connect to your **Facebook Page** when prompted

---

## PART 2: Get Instagram Account ID

### Method A: Using Meta Business Suite (Easiest)

1. Go to [business.facebook.com](https://business.facebook.com)
2. Click **Settings** (gear icon) → **Business Settings**
3. In left sidebar: **Accounts** → **Instagram Accounts**
4. Click on your Instagram account
5. Your **Instagram Account ID** is displayed (17-digit number starting with `17841...`)

### Method B: Using Graph API Explorer

1. Go to [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)
2. Select your app from the dropdown
3. Click **Generate Access Token**
4. In the query field, enter: `me/accounts`
5. Click **Submit**
6. Find your Facebook Page in the results
7. Copy the Page `id`
8. Now query: `{PAGE_ID}?fields=instagram_business_account`
9. The `instagram_business_account.id` is your **Instagram Account ID**

---

## PART 3: Get Ad Account ID

1. Go to [business.facebook.com](https://business.facebook.com)
2. Click **Settings** (gear icon) → **Business Settings**
3. In left sidebar: **Accounts** → **Ad Accounts**
4. Click on your ad account
5. Your **Ad Account ID** is shown (e.g., `123456789`)
6. **Add `act_` prefix** → Final format: `act_123456789`

### Alternative: From Ads Manager URL

1. Go to [adsmanager.facebook.com](https://adsmanager.facebook.com)
2. Look at the URL in your browser
3. Find `act=123456789` in the URL
4. Your Ad Account ID is `act_123456789`

---

## PART 4: Create a Facebook App

You need a Facebook App to generate access tokens.

### Step 4.1: Create the App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click **My Apps** (top right) → **Create App**
3. Select **Business** as the app type → **Next**
4. Fill in:
   - **App Name**: `Instagram Dashboard` (or any name)
   - **Contact Email**: your email
   - **Business Account**: select your business (or skip)
5. Click **Create App**

### Step 4.2: Add Instagram Graph API

1. In your app dashboard, find **Add Products**
2. Find **Instagram Graph API** → Click **Set Up**
3. This enables Instagram API access for your app

### Step 4.3: Add Marketing API (for Ads data)

1. Go back to **Add Products**
2. Find **Marketing API** → Click **Set Up**
3. This enables Ads API access

### Step 4.4: Get App ID and App Secret

1. In left sidebar, click **Settings** → **Basic**
2. You'll see:
   - **App ID**: `123456789012345` ← Copy this
   - **App Secret**: Click **Show** → Copy this

⚠️ **Keep your App Secret private!** Never share it publicly.

---

## PART 5: Generate Access Token

### Step 5.1: Get Short-Lived Token

1. Go to [developers.facebook.com/tools/explorer](https://developers.facebook.com/tools/explorer)
2. Select your app from **Meta App** dropdown
3. Click **Generate Access Token**
4. A popup asks for permissions. Grant these:
   - `instagram_basic`
   - `instagram_manage_insights`
   - `pages_show_list`
   - `pages_read_engagement`
   - `ads_read` (for ad metrics)
   - `read_insights`
5. Click **Generate Access Token**
6. Copy the token (starts with `EAABsbCS...`)

This token expires in ~1 hour. We need to convert it to a long-lived token.

### Step 5.2: Convert to Long-Lived Token (60 days)

**Option A: Use the Graph API Explorer**

1. In Graph API Explorer, enter this query:
```
oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN
```

2. Replace:
   - `YOUR_APP_ID` → your App ID
   - `YOUR_APP_SECRET` → your App Secret
   - `YOUR_SHORT_LIVED_TOKEN` → the token you just generated

3. Click **Submit**
4. Copy the new `access_token` from the response

**Option B: Use this URL in your browser**

```
https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=YOUR_SHORT_LIVED_TOKEN
```

Replace the placeholders and paste in browser. Copy the `access_token` from the JSON response.

### Step 5.3: Get Page Access Token (Never Expires)

For a token that never expires:

1. In Graph API Explorer, use your long-lived token
2. Query: `me/accounts`
3. Find your Facebook Page in results
4. Copy the `access_token` for that page

This Page Access Token doesn't expire as long as:
- You remain an admin of the page
- The app permissions aren't revoked

---

## PART 6: Verify Your Credentials

### Test Instagram API

In Graph API Explorer, query:
```
{YOUR_INSTAGRAM_ACCOUNT_ID}?fields=username,followers_count,media_count
```

You should see your Instagram username and stats.

### Test Ads API

Query:
```
{YOUR_AD_ACCOUNT_ID}/insights?fields=spend,impressions,clicks&date_preset=last_7d
```

You should see your ad spend and performance data.

---

## PART 7: Add Credentials to Apps Script

1. Open your Google Sheet
2. Go to **Extensions** → **Apps Script**
3. Find the `CONFIG` section at the top
4. Replace placeholder values:

```javascript
const CONFIG = {
  // Instagram
  INSTAGRAM_ACCOUNT_ID: '17841400123456789',  // Your Instagram ID
  
  // Ads
  AD_ACCOUNT_ID: 'act_123456789',  // Your Ad Account ID (with act_ prefix)
  
  // Authentication
  ACCESS_TOKEN: 'EAABsbCS1234...',  // Your long-lived access token
  APP_ID: '123456789012345',         // Your App ID
  APP_SECRET: 'abc123def456...',     // Your App Secret
  
  // Settings
  DAYS_TO_FETCH: 90,
  TIMEZONE: 'America/New_York',
};
```

5. Click **Save**
6. Run **Test Connection** from the Instagram Dashboard menu
7. If successful, run **Fetch Data Now**

---

## Summary Checklist

- [ ] Instagram account is Business/Creator type
- [ ] Instagram is connected to a Facebook Page
- [ ] Got **Instagram Account ID** from Business Suite
- [ ] Got **Ad Account ID** (with `act_` prefix)
- [ ] Created Facebook App
- [ ] Got **App ID** and **App Secret**
- [ ] Generated **Access Token** with correct permissions
- [ ] Converted to long-lived token
- [ ] Added all credentials to Apps Script
- [ ] Tested connection successfully

---

## Troubleshooting

| Error | Solution |
|-------|----------|
| "Invalid OAuth access token" | Token expired. Generate a new one. |
| "Unsupported get request" | Wrong Instagram Account ID. Use the 17841... number. |
| "(#100) You must provide an ad account ID" | Missing `act_` prefix on Ad Account ID |
| "User does not have permission" | Check app permissions include `instagram_manage_insights` |
| "Application does not have capability" | Add Instagram Graph API product to your app |
| "Error validating access token" | Token was revoked. Generate new one and re-authorize. |

---

## Token Auto-Refresh

The Apps Script includes automatic token refresh:

- Runs every 7 days via trigger
- Exchanges current token for a new one
- Stores new token in the **Config** sheet tab
- Requires `APP_ID` and `APP_SECRET` to work

If auto-refresh fails, check the **Log** sheet tab for errors.

---

## Security Best Practices

1. **Never share** your App Secret or Access Token publicly
2. **Don't commit** credentials to public GitHub repos
3. **Use environment variables** if deploying elsewhere
4. **Restrict app permissions** to only what's needed
5. **Monitor** the Log sheet for unauthorized access attempts

---

## Useful Links

- [Meta Business Suite](https://business.facebook.com)
- [Facebook Developers](https://developers.facebook.com)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer)
- [Ads Manager](https://adsmanager.facebook.com)
- [Instagram Graph API Docs](https://developers.facebook.com/docs/instagram-api)
- [Marketing API Docs](https://developers.facebook.com/docs/marketing-apis)
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken)
