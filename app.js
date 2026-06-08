/* ============================================================
   APP.JS — Dashboard Controller
   Layture Instagram & Ads Analytics Dashboard
   4-Tab Layout: Account Overview | Ads Overview | Traffic | Conversion
   ============================================================ */


// ============ TAB NAVIGATION ============
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    const target = document.getElementById('tab-' + tab.dataset.tab);
    if (target) target.classList.add('active');
  });
});


// ============ DATE RANGE FILTER ============
document.getElementById('dateRange').addEventListener('change', function() {
  renderDashboard(parseInt(this.value));
});


// ============ UTILITY FUNCTIONS ============

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function setChange(id, change) {
  const el = document.getElementById(id);
  if (el) {
    el.textContent = change.label;
    el.className = 'kpi-change ' + change.class;
  }
}

function setHalfChange(id, data, field) {
  const half = Math.floor(data.length / 2);
  if (half === 0) return;
  const firstHalf = sumField(data.slice(0, half), field);
  const secondHalf = sumField(data.slice(half), field);
  setChange(id, calcChange(secondHalf, firstHalf));
}

function show(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = '';
}

function hide(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = 'none';
}

function groupBy(data, field) {
  const groups = {};
  data.forEach(row => {
    const key = row[field] || 'Other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(row);
  });
  return groups;
}

/* getSpend and totalSpend are defined in config.js (needed by ads.js too) */

/* formatCurrency and formatPercent are defined in config.js */


// ============ TAB 1: ACCOUNT OVERVIEW ============

function updateOverviewKPIs(profile, posts, reels) {
  // Followers
  if (profile.length > 0) {
    const latest = parseInt(profile[profile.length - 1].Followers) || 0;
    const earliest = parseInt(profile[0].Followers) || 0;
    setText('kpi-followers', formatNumber(latest));
    setChange('kpi-followers-change', calcChange(latest, earliest));
  }

  // Total Reach
  if (profile.length > 0) {
    const totalReach = sumField(profile, 'Reach');
    setText('kpi-reach', formatNumber(totalReach));
    setHalfChange('kpi-reach-change', profile, 'Reach');
  }

  // Profile Views
  if (profile.length > 0) {
    const totalPV = sumField(profile, 'Profile Views');
    setText('kpi-profile-views', formatNumber(totalPV));
    setHalfChange('kpi-profile-views-change', profile, 'Profile Views');
  }

  // Website Clicks
  if (profile.length > 0) {
    const totalClicks = sumField(profile, 'Website Clicks');
    setText('kpi-website-clicks', formatNumber(totalClicks));
    setHalfChange('kpi-website-clicks-change', profile, 'Website Clicks');
  }

  // Engagement Rate
  if (posts.length > 0) {
    const avgEng = avgField(posts, 'Engagement Rate');
    setText('kpi-engagement', avgEng.toFixed(2) + '%');
    setHalfChange('kpi-engagement-change', posts, 'Engagement Rate');
  }

  // Reel Plays
  if (reels.length > 0) {
    const totalPlays = sumField(reels, 'Plays');
    setText('kpi-reel-plays', formatNumber(totalPlays));
    setHalfChange('kpi-reel-plays-change', reels, 'Plays');
  }
}


// ============ TAB 2: ADS OVERVIEW ============

function updateAdsOverviewKPIs(ads) {
  if (ads.length === 0) {
    show('ads-no-data');
    return;
  }
  hide('ads-no-data');

  const spend = totalSpend(ads);
  const totalPV = sumField(ads, 'Page Visits');
  const totalClicks = sumField(ads, 'Link Clicks') || sumField(ads, 'Clicks');
  const avgCtr = avgField(ads, 'CTR');
  const avgCpc = totalClicks > 0 ? spend / totalClicks : 0;
  const costPerPV = totalPV > 0 ? spend / totalPV : 0;

  setText('kpi-all-spend', formatCurrency(spend));
  setText('kpi-all-pv', formatNumber(totalPV));
  setText('kpi-all-cost-pv', costPerPV > 0 ? formatCurrency(costPerPV) : '--');
  setText('kpi-all-clicks', formatNumber(totalClicks));
  setText('kpi-all-cpc', formatCurrency(avgCpc));
  setText('kpi-all-ctr', formatPercent(avgCtr));
}


// ============ TAB 3: TRAFFIC CAMPAIGN ============

function updateTrafficKPIs(ads) {
  const trafficAds = ads.filter(r =>
    (r['Campaign Objective'] || '').toUpperCase().includes('TRAFFIC')
  );

  if (trafficAds.length === 0) {
    setText('kpi-traffic-spend', '--');
    setText('kpi-traffic-pv', '--');
    setText('kpi-traffic-cost-pv', '--');
    setText('kpi-traffic-clicks', '--');
    setText('kpi-traffic-cpc', '--');
    setText('kpi-traffic-ctr', '--');
    return trafficAds;
  }

  const spend = totalSpend(trafficAds);
  const pv = sumField(trafficAds, 'Page Visits');
  const clicks = sumField(trafficAds, 'Link Clicks') || sumField(trafficAds, 'Clicks');
  const costPerPV = pv > 0 ? spend / pv : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;
  const ctr = avgField(trafficAds, 'CTR');

  setText('kpi-traffic-spend', formatCurrency(spend));
  setText('kpi-traffic-pv', formatNumber(pv));
  setText('kpi-traffic-cost-pv', costPerPV > 0 ? formatCurrency(costPerPV) : '--');
  setText('kpi-traffic-clicks', formatNumber(clicks));
  setText('kpi-traffic-cpc', formatCurrency(cpc));
  setText('kpi-traffic-ctr', formatPercent(ctr));

  // Color benchmark for cost per PV (green if < $2)
  const cpvEl = document.getElementById('kpi-traffic-cost-pv');
  if (cpvEl && costPerPV > 0) {
    cpvEl.style.color = costPerPV < 2 ? '#00d2a0' : '#e35353';
  }

  return trafficAds;
}


// ============ TAB 4: CONVERSION CAMPAIGN ============

function updateConversionKPIs(ads) {
  const convAds = ads.filter(r =>
    (r['Campaign Objective'] || '').toUpperCase().includes('SALES')
  );

  if (convAds.length === 0) {
    setText('kpi-conv-spend', '--');
    setText('kpi-conv-atc', '--');
    setText('kpi-conv-checkout', '--');
    setText('kpi-conv-pv', '--');
    setText('kpi-conv-cost-pv', '--');
    setText('kpi-conv-cpc', '--');
    return convAds;
  }

  const spend = totalSpend(convAds);
  const pv = sumField(convAds, 'Page Visits');
  const clicks = sumField(convAds, 'Link Clicks') || sumField(convAds, 'Clicks');
  const conversions = sumField(convAds, 'Conversions');
  const costPerPV = pv > 0 ? spend / pv : 0;
  const cpc = clicks > 0 ? spend / clicks : 0;

  setText('kpi-conv-spend', formatCurrency(spend));
  setText('kpi-conv-atc', formatNumber(conversions) || '--');
  setText('kpi-conv-checkout', '--'); // Checkout data from separate action, show when available
  setText('kpi-conv-pv', formatNumber(pv));
  setText('kpi-conv-cost-pv', costPerPV > 0 ? formatCurrency(costPerPV) : '--');
  setText('kpi-conv-cpc', formatCurrency(cpc));

  return convAds;
}


// ============ MAIN RENDER ============

function renderDashboard(days) {
  days = days || 14;

  const profile = filterByDays(DATA.profile, days);
  const posts = filterByDays(DATA.posts, days);
  const reels = filterByDays(DATA.reels, days);
  const ads = filterByDays(DATA.ads, days);

  // --- Tab 1: Account Overview ---
  updateOverviewKPIs(profile, posts, reels);
  renderFollowersChart(profile);
  renderReachChart(profile);
  renderEngagementOverviewChart(posts);
  renderReelsChart(reels);
  renderPostTypeChart(posts);
  renderTopPostsTable(posts);
  renderReelsTable(reels);

  // --- Tab 2: Ads Overview ---
  if (ads.length > 0) {
    updateAdsOverviewKPIs(ads);
    renderAllDailySpendChart(ads);
    renderSpendByCampaignChart(ads);
    renderAllCpcTrendChart(ads);
    renderTopCreativesTable(ads);
    renderCampaignSummaryTable(ads);
  } else {
    show('ads-no-data');
  }

  // --- Tab 3: Traffic Campaign ---
  const trafficAds = updateTrafficKPIs(ads);
  if (trafficAds && trafficAds.length > 0) {
    renderTrafficDailySpendChart(trafficAds);
    renderTrafficCostPvTrendChart(trafficAds);
    renderTrafficPvByAdsetChart(trafficAds);
    renderTrafficTopCreativesTable(trafficAds);
    renderTrafficAdSetsTable(trafficAds);
  }

  // --- Tab 4: Conversion Campaign ---
  const convAds = updateConversionKPIs(ads);
  if (convAds && convAds.length > 0) {
    renderConvDailySpendChart(convAds);
    renderConvCostPvTrendChart(convAds);
    renderConvPvByAdsetChart(convAds);
    renderConvTopCreativesTable(convAds);
    renderConvAdSetsTable(convAds);
  }

  // Update timestamp
  document.getElementById('lastUpdated').textContent =
    'Updated: ' + new Date().toLocaleString();
}


// ============ INITIALIZATION ============

async function init() {
  const loadingEl = document.getElementById('loading');

  try {
    await loadAllData();
    renderDashboard(14);

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
    console.error('Dashboard init failed:', error);
    loadingEl.innerHTML = `
      <p style="color: #e35353;">Failed to load dashboard data.</p>
      <p style="color: #808080;">${error.message}</p>
      <button onclick="location.reload()" style="margin-top: 16px; padding: 10px 24px;
        background: #d1334e; color: white; border: none; cursor: pointer;">Retry</button>
    `;
  }
}

init();
