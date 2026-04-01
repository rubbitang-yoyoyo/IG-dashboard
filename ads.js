/* ============================================================
   ADS.JS — Ads chart rendering (Layture theme)
   ============================================================ */

// Layture colors (reference from charts.js)
const ADS_COLORS = {
  accent: '#d1334e',
  accentLight: '#e35353',
  success: '#00d2a0',
  white: '#ffffff',
  warning: '#ffb800',
  muted: '#808080',
};

function renderDailySpendChart(adsData) {
  destroyChart('chart-daily-spend');
  const ctx = document.getElementById('chart-daily-spend');
  if (!ctx || adsData.length === 0) return;

  ctx.parentElement.style.height = '300px';

  // Aggregate spend by date
  const byDate = {};
  adsData.forEach(row => {
    const d = row.Date;
    if (!byDate[d]) byDate[d] = 0;
    byDate[d] += parseFloat(row.Spend) || 0;
  });

  const dates = Object.keys(byDate).sort();

  chartInstances['chart-daily-spend'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Daily Spend ($)',
        data: dates.map(d => byDate[d].toFixed(2)),
        borderColor: ADS_COLORS.accent,
        backgroundColor: 'rgba(209, 51, 78, 0.15)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 6,
      }]
    },
    options: {
      ...defaultOptions,
      plugins: {
        ...defaultOptions.plugins,
        legend: { display: false },
      }
    }
  });
}


function renderCampaignSpendChart(campaigns) {
  destroyChart('chart-campaign-spend');
  const ctx = document.getElementById('chart-campaign-spend');
  if (!ctx || campaigns.length === 0) return;

  ctx.parentElement.style.height = '300px';

  const colors = [ADS_COLORS.accent, ADS_COLORS.success, ADS_COLORS.white, ADS_COLORS.warning, ADS_COLORS.muted, ADS_COLORS.accentLight];

  chartInstances['chart-campaign-spend'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: campaigns.map(c => c['Campaign Name'] || 'Unknown'),
      datasets: [{
        data: campaigns.map(c => parseFloat(c.Spend) || 0),
        backgroundColor: colors.slice(0, campaigns.length),
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
          labels: { color: '#9ca3b4', padding: 12, font: { size: 11 } }
        },
        tooltip: {
          ...defaultOptions.plugins.tooltip,
          callbacks: {
            label: function(context) {
              return context.label + ': $' + parseFloat(context.raw).toFixed(2);
            }
          }
        }
      }
    }
  });
}


function renderCpcCtrChart(adsData) {
  destroyChart('chart-cpc-ctr');
  const ctx = document.getElementById('chart-cpc-ctr');
  if (!ctx || adsData.length === 0) return;

  ctx.parentElement.style.height = '300px';

  // Aggregate by date
  const byDate = {};
  adsData.forEach(row => {
    const d = row.Date;
    if (!byDate[d]) byDate[d] = { cpc: [], ctr: [] };
    byDate[d].cpc.push(parseFloat(row.CPC) || 0);
    byDate[d].ctr.push(parseFloat(row.CTR) || 0);
  });

  const dates = Object.keys(byDate).sort().slice(-30);

  chartInstances['chart-cpc-ctr'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'CPC ($)',
          data: dates.map(d => {
            const vals = byDate[d].cpc;
            return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
          }),
          borderColor: ADS_COLORS.warning,
          tension: 0.3,
          yAxisID: 'y',
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          label: 'CTR (%)',
          data: dates.map(d => {
            const vals = byDate[d].ctr;
            return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
          }),
          borderColor: ADS_COLORS.success,
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
          title: { display: true, text: 'CPC ($)', color: '#636b80' }
        },
        y1: {
          ...defaultOptions.scales.y,
          position: 'right',
          title: { display: true, text: 'CTR (%)', color: '#636b80' },
          grid: { drawOnChartArea: false }
        }
      }
    }
  });
}


function renderCampaignsTable(campaigns) {
  const tbody = document.querySelector('#table-campaigns tbody');
  if (!tbody) return;

  tbody.innerHTML = campaigns.map(c => {
    const statusClass = c.Status === 'ACTIVE' ? 'positive' : 'neutral';
    return `
      <tr>
        <td>${c['Campaign Name'] || ''}</td>
        <td><span class="kpi-change ${statusClass}">${c.Status || ''}</span></td>
        <td>${formatNumber(parseInt(c.Impressions) || 0)}</td>
        <td>${formatNumber(parseInt(c.Reach) || 0)}</td>
        <td>${formatNumber(parseInt(c.Clicks) || 0)}</td>
        <td>${formatCurrency(c.Spend || 0)}</td>
        <td>${formatCurrency(c.CPC || 0)}</td>
        <td>${formatCurrency(c.CPM || 0)}</td>
        <td>${formatPercent(c.CTR || 0)}</td>
      </tr>
    `;
  }).join('');
}
