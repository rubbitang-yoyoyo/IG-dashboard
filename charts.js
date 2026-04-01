/* ============================================================
   CHARTS.JS — Organic chart rendering
   ============================================================ */

// Store chart instances for cleanup
const chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    delete chartInstances[id];
  }
}

// Layture-inspired color palette
const COLORS = {
  accent: '#d1334e',
  accentLight: '#e35353',
  success: '#00d2a0',
  white: '#ffffff',
  warning: '#ffb800',
  muted: '#808080',
  text: '#b0b0b0',
  border: '#2a2a2a',
  card: '#1a1a1a',
};

// Default chart options - Layture style
const defaultOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: COLORS.text,
        font: { size: 12, family: 'Antonio, sans-serif' },
        padding: 16
      }
    },
    tooltip: {
      backgroundColor: COLORS.card,
      titleColor: COLORS.white,
      bodyColor: COLORS.text,
      borderColor: COLORS.border,
      borderWidth: 1,
      cornerRadius: 0,
      padding: 14,
      titleFont: { family: 'Anton, sans-serif', size: 13 },
      bodyFont: { family: 'Antonio, sans-serif', size: 12 }
    }
  },
  scales: {
    x: {
      ticks: { color: COLORS.muted, font: { size: 11, family: 'Antonio, sans-serif' } },
      grid: { color: 'rgba(42, 42, 42, 0.6)' }
    },
    y: {
      ticks: { color: COLORS.muted, font: { size: 11, family: 'Antonio, sans-serif' } },
      grid: { color: 'rgba(42, 42, 42, 0.6)' }
    }
  }
};


// ============ OVERVIEW CHARTS ============

function renderFollowersChart(data) {
  destroyChart('chart-followers');
  const ctx = document.getElementById('chart-followers');
  if (!ctx || data.length === 0) return;

  ctx.parentElement.style.height = '300px';

  chartInstances['chart-followers'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(r => r.Date),
      datasets: [{
        label: 'Followers',
        data: data.map(r => parseInt(r.Followers) || 0),
        borderColor: COLORS.accent,
        backgroundColor: 'rgba(209, 51, 78, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: COLORS.accent,
        borderWidth: 2,
      }]
    },
    options: {
      ...defaultOptions,
      plugins: {
        ...defaultOptions.plugins,
        legend: { display: false }
      }
    }
  });
}


function renderReachImpressionsChart(data) {
  destroyChart('chart-reach-impressions');
  const ctx = document.getElementById('chart-reach-impressions');
  if (!ctx || data.length === 0) return;

  ctx.parentElement.style.height = '300px';

  chartInstances['chart-reach-impressions'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(r => r.Date).slice(-14),
      datasets: [
        {
          label: 'Reach',
          data: data.map(r => parseInt(r.Reach) || 0).slice(-14),
          backgroundColor: COLORS.success,
          borderRadius: 0,
        },
        {
          label: 'Impressions',
          data: data.map(r => parseInt(r.Impressions) || 0).slice(-14),
          backgroundColor: COLORS.accent,
          borderRadius: 0,
        }
      ]
    },
    options: {
      ...defaultOptions,
      scales: {
        ...defaultOptions.scales,
        x: {
          ...defaultOptions.scales.x,
          ticks: {
            ...defaultOptions.scales.x.ticks,
            maxRotation: 45,
          }
        }
      }
    }
  });
}


function renderSpendResultsChart(adsData) {
  destroyChart('chart-spend-results');
  const ctx = document.getElementById('chart-spend-results');
  if (!ctx || adsData.length === 0) return;

  ctx.parentElement.style.height = '300px';

  // Aggregate by date
  const byDate = {};
  adsData.forEach(row => {
    const d = row.Date;
    if (!byDate[d]) byDate[d] = { spend: 0, clicks: 0 };
    byDate[d].spend += parseFloat(row.Spend) || 0;
    byDate[d].clicks += parseInt(row.Clicks) || 0;
  });

  const dates = Object.keys(byDate).sort().slice(-14);

  chartInstances['chart-spend-results'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Spend ($)',
          data: dates.map(d => byDate[d].spend.toFixed(2)),
          borderColor: COLORS.accent,
          backgroundColor: 'rgba(209, 51, 78, 0.1)',
          fill: true,
          tension: 0.3,
          yAxisID: 'y',
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          label: 'Clicks',
          data: dates.map(d => byDate[d].clicks),
          borderColor: COLORS.success,
          tension: 0.3,
          yAxisID: 'y1',
          borderWidth: 2,
          pointRadius: 0,
        }
      ]
    },
    options: {
      ...defaultOptions,
      scales: {
        x: defaultOptions.scales.x,
        y: {
          ...defaultOptions.scales.y,
          position: 'left',
          title: { display: true, text: 'Spend ($)', color: '#636b80' }
        },
        y1: {
          ...defaultOptions.scales.y,
          position: 'right',
          title: { display: true, text: 'Clicks', color: '#636b80' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}


// ============ ORGANIC TAB CHARTS ============

function renderOrganicReachChart(data) {
  destroyChart('chart-organic-reach');
  const ctx = document.getElementById('chart-organic-reach');
  if (!ctx || data.length === 0) return;

  ctx.parentElement.style.height = '300px';

  chartInstances['chart-organic-reach'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.map(r => r.Date),
      datasets: [
        {
          label: 'Reach',
          data: data.map(r => parseInt(r.Reach) || 0),
          borderColor: COLORS.success,
          backgroundColor: 'rgba(0, 210, 160, 0.1)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          label: 'Impressions',
          data: data.map(r => parseInt(r.Impressions) || 0),
          borderColor: COLORS.accent,
          backgroundColor: 'rgba(209, 51, 78, 0.05)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
        }
      ]
    },
    options: defaultOptions,
  });
}


function renderPostTypeChart(posts) {
  destroyChart('chart-post-type');
  const ctx = document.getElementById('chart-post-type');
  if (!ctx || posts.length === 0) return;

  ctx.parentElement.style.height = '300px';

  // Aggregate engagement by post type
  const byType = {};
  posts.forEach(post => {
    const type = post.Type || 'OTHER';
    if (!byType[type]) byType[type] = { engagement: 0, count: 0 };
    byType[type].engagement += parseInt(post.Engagement) || 0;
    byType[type].count += 1;
  });

  const labels = Object.keys(byType);
  const colors = [COLORS.accent, COLORS.success, COLORS.white, COLORS.warning, COLORS.muted];

  chartInstances['chart-post-type'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: labels.map(l => Math.round(byType[l].engagement / byType[l].count)),
        backgroundColor: colors.slice(0, labels.length),
        borderColor: '#1a1a1a',
        borderWidth: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#9ca3b4', padding: 16, font: { size: 12 } }
        },
        tooltip: defaultOptions.plugins.tooltip,
      }
    }
  });
}


function renderProfileViewsChart(data) {
  destroyChart('chart-profile-views');
  const ctx = document.getElementById('chart-profile-views');
  if (!ctx || data.length === 0) return;

  ctx.parentElement.style.height = '300px';

  chartInstances['chart-profile-views'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(r => r.Date).slice(-14),
      datasets: [{
        label: 'Profile Views',
        data: data.map(r => parseInt(r['Profile Views']) || 0).slice(-14),
        backgroundColor: COLORS.accent,
        borderRadius: 0,
        borderSkipped: false,
      }]
    },
    options: {
      ...defaultOptions,
      plugins: {
        ...defaultOptions.plugins,
        legend: { display: false }
      }
    }
  });
}


// ============ CONTENT TAB CHARTS ============

function renderReelsChart(reels) {
  destroyChart('chart-reels');
  const ctx = document.getElementById('chart-reels');
  if (!ctx || reels.length === 0) return;

  ctx.parentElement.style.height = '300px';

  const sorted = [...reels].sort((a, b) => (parseInt(b.Plays) || 0) - (parseInt(a.Plays) || 0)).slice(0, 10);

  chartInstances['chart-reels'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map((_, i) => `Reel ${i + 1}`),
      datasets: [
        {
          label: 'Plays',
          data: sorted.map(r => parseInt(r.Plays) || 0),
          backgroundColor: COLORS.accent,
          borderRadius: 0,
        },
        {
          label: 'Reach',
          data: sorted.map(r => parseInt(r.Reach) || 0),
          backgroundColor: COLORS.success,
          borderRadius: 0,
        }
      ]
    },
    options: defaultOptions,
  });
}


function renderStoriesChart(stories) {
  destroyChart('chart-stories');
  const ctx = document.getElementById('chart-stories');
  if (!ctx || stories.length === 0) return;

  ctx.parentElement.style.height = '300px';

  const recent = stories.slice(0, 10);

  chartInstances['chart-stories'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: recent.map(r => r.Date),
      datasets: [
        {
          label: 'Impressions',
          data: recent.map(r => parseInt(r.Impressions) || 0),
          backgroundColor: COLORS.white,
          borderRadius: 0,
        },
        {
          label: 'Exits',
          data: recent.map(r => parseInt(r.Exits) || 0),
          backgroundColor: COLORS.accentLight,
          borderRadius: 0,
        }
      ]
    },
    options: {
      ...defaultOptions,
      indexAxis: 'y',
    }
  });
}


// ============ TABLE RENDERERS ============

function renderTopPostsTable(posts) {
  const tbody = document.querySelector('#table-top-posts tbody');
  if (!tbody) return;

  const sorted = [...posts]
    .sort((a, b) => (parseInt(b.Engagement) || 0) - (parseInt(a.Engagement) || 0))
    .slice(0, 15);

  tbody.innerHTML = sorted.map(post => `
    <tr>
      <td>${post.Date || ''}</td>
      <td>${post.Type || ''}</td>
      <td class="caption-cell" title="${(post.Caption || '').replace(/"/g, '&quot;')}">${post.Caption || ''}</td>
      <td>${formatNumber(parseInt(post['Like Count']) || 0)}</td>
      <td>${formatNumber(parseInt(post['Comment Count']) || 0)}</td>
      <td>${formatNumber(parseInt(post.Saved) || 0)}</td>
      <td>${formatNumber(parseInt(post.Shares) || 0)}</td>
      <td>${formatNumber(parseInt(post.Reach) || 0)}</td>
      <td>${post['Engagement Rate'] || '0'}%</td>
    </tr>
  `).join('');
}


function renderReelsTable(reels) {
  const tbody = document.querySelector('#table-reels tbody');
  if (!tbody) return;

  const sorted = [...reels]
    .sort((a, b) => (parseInt(b.Plays) || 0) - (parseInt(a.Plays) || 0))
    .slice(0, 15);

  tbody.innerHTML = sorted.map(reel => `
    <tr>
      <td>${reel.Date || ''}</td>
      <td class="caption-cell" title="${(reel.Caption || '').replace(/"/g, '&quot;')}">${reel.Caption || ''}</td>
      <td>${formatNumber(parseInt(reel.Plays) || 0)}</td>
      <td>${formatNumber(parseInt(reel.Reach) || 0)}</td>
      <td>${formatNumber(parseInt(reel['Like Count']) || 0)}</td>
      <td>${formatNumber(parseInt(reel['Comment Count']) || 0)}</td>
      <td>${formatNumber(parseInt(reel.Saved) || 0)}</td>
      <td>${formatNumber(parseInt(reel.Shares) || 0)}</td>
    </tr>
  `).join('');
}
