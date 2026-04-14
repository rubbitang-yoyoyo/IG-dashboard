/* ============================================================
   CHARTS.JS — Organic & Content chart rendering
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

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: { color: COLORS.text, padding: 16, font: { size: 12, family: 'Antonio, sans-serif' } }
    },
    tooltip: defaultOptions.plugins.tooltip,
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


function renderReachChart(data) {
  destroyChart('chart-reach');
  const ctx = document.getElementById('chart-reach');
  if (!ctx || data.length === 0) return;

  ctx.parentElement.style.height = '300px';

  chartInstances['chart-reach'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(r => r.Date).slice(-14),
      datasets: [{
        label: 'Reach',
        data: data.map(r => parseInt(r.Reach) || 0).slice(-14),
        backgroundColor: COLORS.success,
        borderRadius: 0,
      }]
    },
    options: {
      ...defaultOptions,
      plugins: {
        ...defaultOptions.plugins,
        legend: { display: false }
      },
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


function renderEngagementOverviewChart(posts) {
  destroyChart('chart-engagement-overview');
  const ctx = document.getElementById('chart-engagement-overview');
  if (!ctx || posts.length === 0) return;

  ctx.parentElement.style.height = '300px';

  // Aggregate engagement by date
  const byDate = {};
  posts.forEach(post => {
    const d = post.Date;
    if (!byDate[d]) byDate[d] = { likes: 0, comments: 0, saves: 0 };
    byDate[d].likes += parseInt(post['Like Count']) || 0;
    byDate[d].comments += parseInt(post['Comment Count']) || 0;
    byDate[d].saves += parseInt(post.Saved) || 0;
  });

  const dates = Object.keys(byDate).sort().slice(-14);

  chartInstances['chart-engagement-overview'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Likes',
          data: dates.map(d => byDate[d].likes),
          backgroundColor: COLORS.accent,
          borderRadius: 0,
        },
        {
          label: 'Comments',
          data: dates.map(d => byDate[d].comments),
          backgroundColor: COLORS.success,
          borderRadius: 0,
        },
        {
          label: 'Saves',
          data: dates.map(d => byDate[d].saves),
          backgroundColor: COLORS.warning,
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
          stacked: true,
        },
        y: {
          ...defaultOptions.scales.y,
          stacked: true,
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
          label: 'Profile Views',
          data: data.map(r => parseInt(r['Profile Views']) || 0),
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
      labels: labels.map(l => `${l} (${byType[l].count})`),
      datasets: [{
        data: labels.map(l => Math.round(byType[l].engagement / byType[l].count)),
        backgroundColor: colors.slice(0, labels.length),
        borderColor: '#1a1a1a',
        borderWidth: 4,
      }]
    },
    options: doughnutOptions,
  });
}


function renderEngagementBreakdownChart(posts) {
  destroyChart('chart-engagement-breakdown');
  const ctx = document.getElementById('chart-engagement-breakdown');
  if (!ctx || posts.length === 0) return;

  ctx.parentElement.style.height = '300px';

  const totalLikes = sumField(posts, 'Like Count');
  const totalComments = sumField(posts, 'Comment Count');
  const totalSaves = sumField(posts, 'Saved');

  chartInstances['chart-engagement-breakdown'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Likes', 'Comments', 'Saves'],
      datasets: [{
        data: [totalLikes, totalComments, totalSaves],
        backgroundColor: [COLORS.accent, COLORS.success, COLORS.warning],
        borderColor: '#1a1a1a',
        borderWidth: 4,
      }]
    },
    options: doughnutOptions,
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
      labels: sorted.map((r, i) => {
        const caption = r.Caption || '';
        return caption.substring(0, 20) + (caption.length > 20 ? '...' : '') || `Reel ${i + 1}`;
      }),
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
    options: {
      ...defaultOptions,
      indexAxis: 'y',
    },
  });
}


function renderReelsEngagementChart(reels) {
  destroyChart('chart-reels-engagement');
  const ctx = document.getElementById('chart-reels-engagement');
  if (!ctx || reels.length === 0) return;

  ctx.parentElement.style.height = '300px';

  const totalLikes = sumField(reels, 'Like Count');
  const totalComments = sumField(reels, 'Comment Count');
  const totalSaves = sumField(reels, 'Saved');
  const totalShares = sumField(reels, 'Shares');

  chartInstances['chart-reels-engagement'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Likes', 'Comments', 'Saves', 'Shares'],
      datasets: [{
        data: [totalLikes, totalComments, totalSaves, totalShares],
        backgroundColor: [COLORS.accent, COLORS.success, COLORS.warning, COLORS.white],
        borderColor: '#1a1a1a',
        borderWidth: 4,
      }]
    },
    options: doughnutOptions,
  });
}


function renderStoriesChart(stories) {
  destroyChart('chart-stories');
  const ctx = document.getElementById('chart-stories');
  if (!ctx || stories.length === 0) {
    // Show no data message
    if (ctx) {
      const parent = ctx.parentElement;
      parent.innerHTML = `
        <h3 class="chart-title">Stories Performance</h3>
        <div style="display:flex;align-items:center;justify-content:center;height:250px;color:#808080;">
          No active stories. Stories data appears when you have active stories (last 24h).
        </div>
      `;
    }
    return;
  }

  ctx.parentElement.style.height = '300px';

  const recent = stories.slice(0, 10);

  chartInstances['chart-stories'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: recent.map(r => r.Date),
      datasets: [
        {
          label: 'Reach',
          data: recent.map(r => parseInt(r.Reach) || 0),
          backgroundColor: COLORS.success,
          borderRadius: 0,
        },
        {
          label: 'Replies',
          data: recent.map(r => parseInt(r.Replies) || 0),
          backgroundColor: COLORS.accent,
          borderRadius: 0,
        },
        {
          label: 'Exits',
          data: recent.map(r => parseInt(r.Exits) || 0),
          backgroundColor: COLORS.muted,
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
      <td>${formatNumber(parseInt(reel['Total Interactions']) || 0)}</td>
    </tr>
  `).join('');
}
