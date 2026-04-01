/* ============================================================
   CONFIG.JS — Configuration & Data Loading
   ============================================================ */

// ============ UPDATE THIS ============
// Your published Google Sheet URL (CSV export format)
// To get this:
// 1. Open your Google Sheet
// 2. File → Share → Publish to web
// 3. Select each sheet tab → CSV format
// 4. Copy the URLs below

const DASHBOARD_CONFIG = {
  // Replace these URLs with your published Google Sheet CSV links
  // Format: https://docs.google.com/spreadsheets/d/e/2PACX-1vRbeTPHgv7YwyJuDuUmUqvNfU_XA3RJ-qwmUcDaUUMTv-brGsLQMcSfz31oFuPXo2rXD725gUOWM5wT/pub?output=csv
  sheets: {
    profile:    'YOUR_PROFILE_METRICS_CSV_URL',
    posts:      'YOUR_POST_METRICS_CSV_URL',
    stories:    'YOUR_STORY_METRICS_CSV_URL',
    reels:      'YOUR_REEL_METRICS_CSV_URL',
    ads:        'YOUR_AD_METRICS_CSV_URL',
    campaigns:  'YOUR_CAMPAIGN_METRICS_CSV_URL',
  },

  // Dashboard settings
  currency: 'USD',
  currencySymbol: '$',
  refreshInterval: 300000, // Auto-refresh every 5 minutes (in ms)
};


// ============ DATA STORE ============
const DATA = {
  profile: [],
  posts: [],
  stories: [],
  reels: [],
  ads: [],
  campaigns: [],
  loaded: false,
};


// ============ CSV PARSER ============
function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index] ? values[index].trim() : '';
    });
    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}


// ============ DATA LOADER ============
async function loadAllData() {
  const sheets = DASHBOARD_CONFIG.sheets;
  const loaders = [];

  for (const [key, url] of Object.entries(sheets)) {
    if (url && !url.startsWith('YOUR_')) {
      loaders.push(
        fetchSheetData(url)
          .then(data => { DATA[key] = data; })
          .catch(err => {
            console.warn(`Failed to load ${key}:`, err);
            DATA[key] = [];
          })
      );
    } else {
      // Use demo data if URL not configured
      DATA[key] = generateDemoData(key);
    }
  }

  await Promise.all(loaders);
  DATA.loaded = true;
}

async function fetchSheetData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  return parseCSV(text);
}


// ============ DEMO DATA GENERATOR ============
// Generates sample data so the dashboard works before connecting real data
function generateDemoData(type) {
  const days = 90;
  const data = [];
  const now = new Date();

  if (type === 'profile') {
    let followers = 5000;
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      followers += Math.floor(Math.random() * 30) - 5;
      data.push({
        'Date': formatDate(date),
        'Followers': String(followers),
        'Follows': String(Math.floor(followers * 0.15)),
        'Media Count': String(200 + Math.floor(i * 0.3)),
        'Impressions': String(Math.floor(Math.random() * 5000 + 2000)),
        'Reach': String(Math.floor(Math.random() * 3000 + 1000)),
        'Profile Views': String(Math.floor(Math.random() * 200 + 50)),
        'Website Clicks': String(Math.floor(Math.random() * 50 + 10)),
      });
    }
  }

  if (type === 'posts') {
    const types = ['IMAGE', 'VIDEO', 'CAROUSEL_ALBUM'];
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i * 2);
      const reach = Math.floor(Math.random() * 5000 + 500);
      const likes = Math.floor(Math.random() * 300 + 20);
      const comments = Math.floor(Math.random() * 30 + 2);
      const saves = Math.floor(Math.random() * 50 + 5);
      const shares = Math.floor(Math.random() * 20 + 1);
      const engagement = likes + comments + saves + shares;
      data.push({
        'Date': formatDate(date),
        'Post ID': `post_${i}`,
        'Type': types[Math.floor(Math.random() * types.length)],
        'Caption': `Sample post caption #${i + 1} with some hashtags...`,
        'Permalink': '#',
        'Timestamp': date.toISOString(),
        'Like Count': String(likes),
        'Comment Count': String(comments),
        'Impressions': String(Math.floor(reach * 1.4)),
        'Reach': String(reach),
        'Saved': String(saves),
        'Shares': String(shares),
        'Engagement': String(engagement),
        'Engagement Rate': ((engagement / reach) * 100).toFixed(2),
      });
    }
  }

  if (type === 'stories') {
    for (let i = 0; i < 20; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      data.push({
        'Date': formatDate(date),
        'Story ID': `story_${i}`,
        'Type': 'IMAGE',
        'Impressions': String(Math.floor(Math.random() * 2000 + 500)),
        'Reach': String(Math.floor(Math.random() * 1500 + 300)),
        'Replies': String(Math.floor(Math.random() * 10)),
        'Taps Forward': String(Math.floor(Math.random() * 100 + 20)),
        'Taps Back': String(Math.floor(Math.random() * 30 + 5)),
        'Exits': String(Math.floor(Math.random() * 50 + 10)),
      });
    }
  }

  if (type === 'reels') {
    for (let i = 0; i < 15; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i * 4);
      data.push({
        'Date': formatDate(date),
        'Reel ID': `reel_${i}`,
        'Caption': `Reel caption #${i + 1}`,
        'Plays': String(Math.floor(Math.random() * 10000 + 1000)),
        'Reach': String(Math.floor(Math.random() * 8000 + 800)),
        'Like Count': String(Math.floor(Math.random() * 500 + 30)),
        'Comment Count': String(Math.floor(Math.random() * 50 + 3)),
        'Saved': String(Math.floor(Math.random() * 100 + 10)),
        'Shares': String(Math.floor(Math.random() * 80 + 5)),
        'Total Interactions': String(Math.floor(Math.random() * 700 + 50)),
      });
    }
  }

  if (type === 'ads') {
    const campaigns = ['Brand Awareness', 'Summer Sale', 'Product Launch', 'Retargeting'];
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
      const spend = (Math.random() * 50 + 10).toFixed(2);
      const impressions = Math.floor(Math.random() * 5000 + 1000);
      const clicks = Math.floor(Math.random() * 100 + 10);
      data.push({
        'Date': formatDate(date),
        'Ad ID': `ad_${i}`,
        'Ad Name': `Ad Creative ${i}`,
        'Ad Set Name': `AdSet ${campaign}`,
        'Campaign Name': campaign,
        'Impressions': String(impressions),
        'Reach': String(Math.floor(impressions * 0.8)),
        'Clicks': String(clicks),
        'Link Clicks': String(Math.floor(clicks * 0.7)),
        'Spend': spend,
        'CPC': (parseFloat(spend) / clicks).toFixed(2),
        'CPM': ((parseFloat(spend) / impressions) * 1000).toFixed(2),
        'CTR': ((clicks / impressions) * 100).toFixed(2),
      });
    }
  }

  if (type === 'campaigns') {
    const campaigns = [
      { name: 'Brand Awareness', objective: 'BRAND_AWARENESS', status: 'ACTIVE' },
      { name: 'Summer Sale', objective: 'CONVERSIONS', status: 'ACTIVE' },
      { name: 'Product Launch', objective: 'REACH', status: 'PAUSED' },
      { name: 'Retargeting', objective: 'CONVERSIONS', status: 'ACTIVE' },
    ];
    campaigns.forEach((c, i) => {
      const spend = (Math.random() * 500 + 100).toFixed(2);
      const impressions = Math.floor(Math.random() * 50000 + 10000);
      const clicks = Math.floor(Math.random() * 1000 + 100);
      data.push({
        'Date': formatDate(now),
        'Campaign ID': `camp_${i}`,
        'Campaign Name': c.name,
        'Objective': c.objective,
        'Status': c.status,
        'Budget': String((Math.random() * 100 + 20).toFixed(2)),
        'Impressions': String(impressions),
        'Reach': String(Math.floor(impressions * 0.75)),
        'Clicks': String(clicks),
        'Spend': spend,
        'CPC': (parseFloat(spend) / clicks).toFixed(2),
        'CPM': ((parseFloat(spend) / impressions) * 1000).toFixed(2),
        'CTR': ((clicks / impressions) * 100).toFixed(2),
      });
    });
  }

  return data;
}


// ============ UTILITY FUNCTIONS ============

function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return String(num);
}

function formatCurrency(num) {
  return DASHBOARD_CONFIG.currencySymbol + parseFloat(num).toFixed(2);
}

function formatPercent(num) {
  return parseFloat(num).toFixed(2) + '%';
}

function filterByDays(data, days, dateField) {
  dateField = dateField || 'Date';
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return data.filter(row => {
    const rowDate = new Date(row[dateField]);
    return rowDate >= cutoff;
  });
}

function sumField(data, field) {
  return data.reduce((sum, row) => sum + (parseFloat(row[field]) || 0), 0);
}

function avgField(data, field) {
  if (data.length === 0) return 0;
  return sumField(data, field) / data.length;
}

function calcChange(current, previous) {
  if (previous === 0) return { value: 0, label: 'N/A', class: 'neutral' };
  const change = ((current - previous) / previous) * 100;
  return {
    value: change,
    label: (change >= 0 ? '+' : '') + change.toFixed(1) + '%',
    class: change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral',
  };
}
