/* ============================================================
   APP.JS — Main initialization & tab management
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


// ============ KPI UPDATERS ============
function updateOverviewKPIs(profile, posts, reels, days) {
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

  // Total Reach
  if (profile.length > 0) {
    const totalReach = sumField(profile, 'Reach');
    document.getElementById('kpi-reach').textContent = formatNumber(totalReach);
    const half = Math.floor(profile.length / 2);
    const firstHalf = sumField(profile.slice(0, half), 'Reach');
    const secondHalf = sumField(profile.slice(half), 'Reach');
    const change = calcChange(secondHalf, firstHalf);
    const el = document.getElementById('kpi-reach-change');
    el.textContent = change.label;
    el.className = 'kpi-change ' + change.class;
  }

  // Profile Views
  if (profile.length > 0) {
    const totalPV = sumField(profile, 'Profile Views');
    document.getElementById('kpi-profile-views').textContent = formatNumber(totalPV);
    const half = Math.floor(profile.length / 2);
    const firstHalf = sumField(profile.slice(0, half), 'Profile Views');
    const secondHalf = sumField(profile.slice(half), 'Profile Views');
    const change = calcChange(secondHalf, firstHalf);
    const el = document.getElementById('kpi-profile-views-change');
    el.textContent = change.label;
    el.className = 'kpi-change ' + change.class;
  }

  // Engagement Rate
  if (posts.length > 0) {
    const avgEng = avgField(posts, 'Engagement Rate');
    document.getElementById('kpi-engagement').textContent = avgEng.toFixed(2) + '%';
    // Compare first half vs second half of posts
    const half = Math.floor(posts.length / 2);
    const firstHalf = avgField(posts.slice(0, half), 'Engagement Rate');
    const secondHalf = avgField(posts.slice(half), 'Engagement Rate');
    const change = calcChange(secondHalf, firstHalf);
    const el = document.getElementById('kpi-engagement-change');
    el.textContent = change.label;
    el.className = 'kpi-change ' + change.class;
  }

  // Total Posts
  if (posts.length > 0) {
    document.getElementById('kpi-total-posts').textContent = posts.length;
  }

  // Total Reels Plays
  if (reels.length > 0) {
    const totalPlays = sumField(reels, 'Plays');
    document.getElementById('kpi-reel-plays').textContent = formatNumber(totalPlays);
    const half = Math.floor(reels.length / 2);
    const firstHalf = sumField(reels.slice(0, half), 'Plays');
    const secondHalf = sumField(reels.slice(half), 'Plays');
    const change = calcChange(secondHalf, firstHalf);
    const el = document.getElementById('kpi-reel-plays-change');
    el.textContent = change.label;
    el.className = 'kpi-change ' + change.class;
  }
}


function updateOrganicKPIs(posts, profile) {
  if (posts.length > 0) {
    document.getElementById('kpi-avg-likes').textContent =
      formatNumber(Math.round(avgField(posts, 'Like Count')));
    document.getElementById('kpi-avg-comments').textContent =
      formatNumber(Math.round(avgField(posts, 'Comment Count')));
    document.getElementById('kpi-avg-saves').textContent =
      formatNumber(Math.round(avgField(posts, 'Saved')));
  }

  if (profile.length > 0) {
    const totalClicks = sumField(profile, 'Website Clicks');
    document.getElementById('kpi-website-clicks').textContent = formatNumber(totalClicks);
  }
}


function updateContentKPIs(reels) {
  if (reels.length === 0) return;

  document.getElementById('kpi-total-reels').textContent = reels.length;
  document.getElementById('kpi-total-reel-plays').textContent =
    formatNumber(sumField(reels, 'Plays'));
  document.getElementById('kpi-avg-reel-reach').textContent =
    formatNumber(Math.round(avgField(reels, 'Reach')));
  document.getElementById('kpi-avg-reel-interactions').textContent =
    formatNumber(Math.round(avgField(reels, 'Total Interactions')));
}


function updateAdsKPIs(ads) {
  if (ads.length === 0) return;

  // Show ads sections, hide pending notice
  document.getElementById('ads-pending').style.display = 'none';
  document.getElementById('ads-kpis').style.display = '';
  document.getElementById('ads-charts').style.display = '';
  document.getElementById('ads-table').style.display = '';

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
  const campaigns = DATA.campaigns;

  // Overview
  updateOverviewKPIs(profile, posts, reels, days);
  renderFollowersChart(profile);
  renderReachChart(profile);
  renderEngagementOverviewChart(posts);

  // Organic
  updateOrganicKPIs(posts, profile);
  renderOrganicReachChart(profile);
  renderPostTypeChart(posts);
  renderEngagementBreakdownChart(posts);
  renderTopPostsTable(posts);

  // Content
  updateContentKPIs(reels);
  renderReelsChart(reels);
  renderReelsEngagementChart(reels);
  renderStoriesChart(stories);
  renderReelsTable(reels);

  // Ads (only if data exists)
  if (ads.length > 0) {
    updateAdsKPIs(ads);
    renderDailySpendChart(ads);
    renderCampaignSpendChart(campaigns);
    renderCpcCtrChart(ads);
    renderCampaignsTable(campaigns);
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
