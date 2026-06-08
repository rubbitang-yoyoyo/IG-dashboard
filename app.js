/* ============================================================
   APP.JS — Dashboard Controller
   Layture Instagram Analytics Dashboard
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


// ============ OVERVIEW TAB KPIs ============
function updateCampaignKPIs(profile, posts, reels, ads) {
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

  // Funnel
  if (profile.length > 0) {
    const totalPV = sumField(profile, 'Profile Views');
    const totalClicks = sumField(profile, 'Website Clicks');
    document.getElementById('funnel-profile-views').textContent = formatNumber(totalPV);
    document.getElementById('funnel-website-clicks').textContent = formatNumber(totalClicks);

    // Adjust funnel bar widths proportionally
    if (totalPV > 0) {
      const clickPct = Math.max((totalClicks / totalPV) * 100, 10);
      const funnelBars = document.querySelectorAll('.funnel-bar');
      if (funnelBars.length >= 2) {
        funnelBars[1].style.width = clickPct + '%';
      }
    }
  }
}


// ============ ORGANIC TAB KPIs ============
function updateOrganicKPIs(posts, reels) {
  if (posts.length > 0) {
    setText('kpi-total-posts', posts.length);
    setText('kpi-avg-likes', formatNumber(Math.round(avgField(posts, 'Like Count'))));
    setText('kpi-avg-comments', formatNumber(Math.round(avgField(posts, 'Comment Count'))));
    setText('kpi-avg-saves', formatNumber(Math.round(avgField(posts, 'Saved'))));
  }

  if (reels.length > 0) {
    setText('kpi-total-reels', reels.length);
    setText('kpi-total-reel-plays', formatNumber(sumField(reels, 'Plays')));
  }
}


// ============ ADS TAB KPIs ============
function updateAdsKPIs(ads, campaigns) {
  if (ads.length === 0) return;

  // Show ads sections, hide pending notice
  hide('ads-pending');
  show('ads-kpis');
  show('ads-charts');

  // Compute effective spend: if Spend column is 0 but CPC has values, estimate from CPC * Link Clicks
  let totalSpend = sumField(ads, 'Spend');
  if (totalSpend === 0) {
    totalSpend = ads.reduce((sum, row) => {
      const cpc = parseFloat(row['CPC']) || 0;
      const linkClicks = parseInt(row['Link Clicks']) || 0;
      return sum + (cpc * linkClicks);
    }, 0);
  }

  const totalClicks = sumField(ads, 'Link Clicks') || sumField(ads, 'Clicks');
  const totalPV = sumField(ads, 'Page Visits');
  const avgCtr = avgField(ads, 'CTR');
  const avgCpc = avgField(ads, 'CPC');
  const costPerPV = totalPV > 0 ? totalSpend / totalPV : 0;

  setText('kpi-total-spend', formatCurrency(totalSpend));
  setText('kpi-total-pv', formatNumber(totalPV));
  setText('kpi-cost-per-pv', costPerPV > 0 ? formatCurrency(costPerPV) : '--');
  setText('kpi-avg-ctr', formatPercent(avgCtr));
  setText('kpi-avg-cpc', formatCurrency(avgCpc));
  setText('kpi-total-clicks', formatNumber(totalClicks));

  // Budget remaining
  const el = document.getElementById('kpi-budget-remaining');
  if (el) el.textContent = '';
}


// ============ AUDIENCE A/B TEST KPIs ============
function updateABTestKPIs(ads) {
  if (ads.length === 0) return;

  hide('ab-pending');
  show('ab-kpis');
  show('ab-charts');
  show('ab-table');

  // Group by ad set name (audience) and campaign name (creative)
  const byAudience = groupBy(ads, 'Ad Set Name');
  const byCreative = groupBy(ads, 'Campaign Name');

  // Find best audience by CTR
  let bestAudience = '', bestAudienceCtr = 0;
  for (const [name, rows] of Object.entries(byAudience)) {
    const ctr = avgField(rows, 'CTR');
    if (ctr > bestAudienceCtr) {
      bestAudienceCtr = ctr;
      bestAudience = name;
    }
  }

  // Find best creative by CPC (lowest)
  let bestCreative = '', bestCreativeCpc = Infinity;
  for (const [name, rows] of Object.entries(byCreative)) {
    const cpc = avgField(rows, 'CPC');
    if (cpc < bestCreativeCpc && cpc > 0) {
      bestCreativeCpc = cpc;
      bestCreative = name;
    }
  }

  setText('kpi-best-audience', bestAudience || '--');
  setText('kpi-best-creative', bestCreative || '--');
  setText('kpi-lowest-cpc', bestCreativeCpc < Infinity ? formatCurrency(bestCreativeCpc) : '--');
  setText('kpi-highest-ctr', bestAudienceCtr > 0 ? formatPercent(bestAudienceCtr) : '--');
}


// ============ MAIN RENDER ============
function renderDashboard(days) {
  days = days || 14;

  const profile = filterByDays(DATA.profile, days);
  const posts = filterByDays(DATA.posts, days);
  const stories = filterByDays(DATA.stories, days);
  const reels = filterByDays(DATA.reels, days);
  const ads = filterByDays(DATA.ads, days);
  const campaigns = DATA.campaigns;

  // Overview
  updateCampaignKPIs(profile, posts, reels, ads);
  renderFollowersChart(profile);
  renderReachChart(profile);
  renderEngagementOverviewChart(posts);

  // Organic & Content
  updateOrganicKPIs(posts, reels);
  renderOrganicReachChart(profile);
  renderPostTypeChart(posts);
  renderEngagementBreakdownChart(posts);
  renderReelsChart(reels);
  renderReelsEngagementChart(reels);
  renderStoriesChart(stories);
  renderTopPostsTable(posts);
  renderReelsTable(reels);

  // Ads
  if (ads.length > 0) {
    updateAdsKPIs(ads, campaigns);
    renderDailySpendChart(ads);
    renderCampaignSpendChart(campaigns);
    renderCpcCtrChart(ads);
    renderCampaignTables(ads, campaigns);

    // A/B Test (functions defined in ads.js)
    if (typeof renderAudienceCtrChart === 'function') {
      updateABTestKPIs(ads);
      renderAudienceCtrChart(ads);
      renderCreativeCpcChart(ads);
      renderAdGroupPerformanceChart(ads);
      renderAdGroupsTable(ads);
    }
  }

  // Update timestamp
  document.getElementById('lastUpdated').textContent =
    'Updated: ' + new Date().toLocaleString();
}


// ============ HELPER FUNCTIONS ============

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

function colorBenchmark(id, value, threshold, higherIsBetter) {
  const el = document.getElementById(id);
  if (!el) return;
  if (higherIsBetter) {
    el.style.color = value >= threshold ? '#00d2a0' : '#e35353';
  } else {
    el.style.color = value <= threshold ? '#00d2a0' : '#e35353';
  }
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
