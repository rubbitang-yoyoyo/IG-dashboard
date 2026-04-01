/* ============================================================
   APP.JS — Main initialization & tab management
   ============================================================ */

// ============ TAB NAVIGATION ============
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    // Update active tab button
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    // Show corresponding content
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    const target = document.getElementById('tab-' + tab.dataset.tab);
    if (target) target.classList.add('active');
  });
});


// ============ DATE RANGE FILTER ============
document.getElementById('dateRange').addEventListener('change', function() {
  renderDashboard(parseInt(this.value));
});


// ============ KPI UPDATERS ============
function updateOverviewKPIs(profile, posts, ads, days) {
  // Followers
  if (profile.length > 0) {
    const latest = parseInt(profile[profile.length - 1].Followers) || 0;
    const earliest = parseInt(profile[0].Followers) || 0;
    document.getElementById('kpi-followers').textContent = formatNumber(latest);
    const change = calcChange(latest, earliest);
    const el = document.getElementById('kpi-followers-change');
    el.textContent = change.label;
    el.className = 'kpi-change ' + change.class;
  }

  // Reach
  if (profile.length > 0) {
    const totalReach = sumField(profile, 'Reach');
    document.getElementById('kpi-reach').textContent = formatNumber(totalReach);
    // Compare halves
    const half = Math.floor(profile.length / 2);
    const firstHalf = sumField(profile.slice(0, half), 'Reach');
    const secondHalf = sumField(profile.slice(half), 'Reach');
    const change = calcChange(secondHalf, firstHalf);
    const el = document.getElementById('kpi-reach-change');
    el.textContent = change.label;
    el.className = 'kpi-change ' + change.class;
  }

  // Impressions
  if (profile.length > 0) {
    const totalImpressions = sumField(profile, 'Impressions');
    document.getElementById('kpi-impressions').textContent = formatNumber(totalImpressions);
    const half = Math.floor(profile.length / 2);
    const firstHalf = sumField(profile.slice(0, half), 'Impressions');
    const secondHalf = sumField(profile.slice(half), 'Impressions');
    const change = calcChange(secondHalf, firstHalf);
    const el = document.getElementById('kpi-impressions-change');
    el.textContent = change.label;
    el.className = 'kpi-change ' + change.class;
  }

  // Engagement Rate
  if (posts.length > 0) {
    const avgEng = avgField(posts, 'Engagement Rate');
    document.getElementById('kpi-engagement').textContent = avgEng.toFixed(2) + '%';
  }

  // Ad Spend
  if (ads.length > 0) {
    const totalSpend = sumField(ads, 'Spend');
    document.getElementById('kpi-spend').textContent = formatCurrency(totalSpend);
    const half = Math.floor(ads.length / 2);
    const firstHalf = sumField(ads.slice(0, half), 'Spend');
    const secondHalf = sumField(ads.slice(half), 'Spend');
    const change = calcChange(secondHalf, firstHalf);
    const el = document.getElementById('kpi-spend-change');
    el.textContent = change.label;
    el.className = 'kpi-change ' + change.class;
  }

  // ROAS
  if (ads.length > 0) {
    const totalSpend = sumField(ads, 'Spend');
    const totalClicks = sumField(ads, 'Clicks');
    if (totalSpend > 0) {
      const roas = (totalClicks / totalSpend).toFixed(2);
      document.getElementById('kpi-roas').textContent = roas + 'x';
    }
  }
}


function updateAdsKPIs(ads) {
  if (ads.length === 0) return;

  document.getElementById('kpi-total-spend').textContent = formatCurrency(sumField(ads, 'Spend'));
  document.getElementById('kpi-avg-cpc').textContent = formatCurrency(avgField(ads, 'CPC'));
  document.getElementById('kpi-avg-cpm').textContent = formatCurrency(avgField(ads, 'CPM'));
  document.getElementById('kpi-avg-ctr').textContent = formatPercent(avgField(ads, 'CTR'));
}


// ============ MAIN RENDER ============
function renderDashboard(days) {
  days = days || 30;

  const profile = filterByDays(DATA.profile, days);
  const posts = filterByDays(DATA.posts, days);
  const stories = filterByDays(DATA.stories, days);
  const reels = filterByDays(DATA.reels, days);
  const ads = filterByDays(DATA.ads, days);
  const campaigns = DATA.campaigns; // Campaigns are aggregated, not daily

  // Overview
  updateOverviewKPIs(profile, posts, ads, days);
  renderFollowersChart(profile);
  renderReachImpressionsChart(profile);
  renderSpendResultsChart(ads);

  // Organic
  renderOrganicReachChart(profile);
  renderPostTypeChart(posts);
  renderProfileViewsChart(profile);
  renderTopPostsTable(posts);

  // Ads
  updateAdsKPIs(ads);
  renderDailySpendChart(ads);
  renderCampaignSpendChart(campaigns);
  renderCpcCtrChart(ads);
  renderCampaignsTable(campaigns);

  // Content
  renderReelsChart(reels);
  renderStoriesChart(stories);
  renderReelsTable(reels);

  // Update timestamp
  document.getElementById('lastUpdated').textContent =
    'Updated: ' + new Date().toLocaleString();
}


// ============ INITIALIZATION ============
async function init() {
  const loadingEl = document.getElementById('loading');

  try {
    await loadAllData();
    renderDashboard(30);

    // Hide loading
    loadingEl.classList.add('hidden');
    setTimeout(() => loadingEl.remove(), 500);

    // Auto-refresh
    if (DASHBOARD_CONFIG.refreshInterval > 0) {
      setInterval(async () => {
        await loadAllData();
        const days = parseInt(document.getElementById('dateRange').value);
        renderDashboard(days);
      }, DASHBOARD_CONFIG.refreshInterval);
    }

  } catch (error) {
    loadingEl.classList.add('hidden');
    const banner = document.getElementById('error-banner');
    document.getElementById('error-message').textContent =
      'Failed to load data: ' + error.message;
    banner.classList.remove('hidden');
    console.error('Dashboard init error:', error);
  }
}

// Start
init();
