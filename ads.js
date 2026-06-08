/* ============================================================
   ADS.JS — Ads & A/B Test Charts (Layture Campaign)
   ============================================================ */

const ADS_COLORS = {
  accent: '#d1334e',
  accentLight: '#e35353',
  success: '#00d2a0',
  white: '#ffffff',
  warning: '#ffb800',
  muted: '#808080',
  blue: '#6496ff',
  audiences: ['#e63950', '#6496ff', '#00d2a0', '#ffb800'],
  creatives: ['#e63950', '#6496ff', '#ffffff', '#ffb800'],
};


// ============ ADS TAB CHARTS ============

function renderDailySpendChart(adsData) {
  destroyChart('chart-daily-spend');
  const ctx = document.getElementById('chart-daily-spend');
  if (!ctx || adsData.length === 0) return;

  ctx.parentElement.style.height = '300px';

  const byDate = {};
  adsData.forEach(row => {
    const d = row.Date;
    if (!byDate[d]) byDate[d] = { spend: 0, clicks: 0 };
    // Use Spend if available, otherwise estimate from CPC * Link Clicks
    let spend = parseFloat(row.Spend) || 0;
    if (spend === 0) {
      spend = (parseFloat(row.CPC) || 0) * (parseInt(row['Link Clicks']) || 0);
    }
    byDate[d].spend += spend;
    byDate[d].clicks += parseInt(row['Link Clicks']) || parseInt(row.Clicks) || 0;
  });

  const dates = Object.keys(byDate).sort();

  chartInstances['chart-daily-spend'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Spend (HK$)',
          data: dates.map(d => byDate[d].spend.toFixed(2)),
          borderColor: ADS_COLORS.accent,
          backgroundColor: 'rgba(209, 51, 78, 0.15)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
          yAxisID: 'y',
        },
        {
          label: 'Clicks',
          data: dates.map(d => byDate[d].clicks),
          borderColor: ADS_COLORS.success,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 0,
          yAxisID: 'y1',
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


function renderCampaignSpendChart(campaigns) {
  destroyChart('chart-campaign-spend');
  const ctx = document.getElementById('chart-campaign-spend');
  if (!ctx || campaigns.length === 0) return;

  ctx.parentElement.style.height = '300px';

  // Compute spend: use Spend column, or estimate from CPC * Clicks
  const spendData = campaigns.map(c => {
    let spend = parseFloat(c.Spend) || 0;
    if (spend === 0) {
      spend = (parseFloat(c.CPC) || 0) * (parseInt(c.Clicks) || 0);
    }
    return spend;
  });

  chartInstances['chart-campaign-spend'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: campaigns.map(c => c['Campaign Name'] || 'Unknown'),
      datasets: [{
        data: spendData,
        backgroundColor: ADS_COLORS.audiences.slice(0, campaigns.length),
        borderColor: '#1a1a1a',
        borderWidth: 4,
      }]
    },
    options: {
      ...doughnutOptions,
      plugins: {
        ...doughnutOptions.plugins,
        tooltip: {
          ...defaultOptions.plugins.tooltip,
          callbacks: {
            label: function(context) {
              return context.label + ': ' + DASHBOARD_CONFIG.currencySymbol + parseFloat(context.raw).toFixed(2);
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

  const byDate = {};
  adsData.forEach(row => {
    const d = row.Date;
    if (!byDate[d]) byDate[d] = { cpc: [], ctr: [] };
    byDate[d].cpc.push(parseFloat(row.CPC) || 0);
    byDate[d].ctr.push(parseFloat(row.CTR) || 0);
  });

  const dates = Object.keys(byDate).sort().slice(-30);
  const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

  chartInstances['chart-cpc-ctr'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'CPC (HK$)',
          data: dates.map(d => avg(byDate[d].cpc).toFixed(2)),
          borderColor: ADS_COLORS.warning,
          tension: 0.3,
          yAxisID: 'y',
          borderWidth: 2,
          pointRadius: 0,
        },
        {
          label: 'CTR (%)',
          data: dates.map(d => avg(byDate[d].ctr).toFixed(2)),
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


// ============ A/B TEST TAB CHARTS ============

function renderAudienceCtrChart(adsData) {
  destroyChart('chart-audience-ctr');
  const ctx = document.getElementById('chart-audience-ctr');
  if (!ctx || adsData.length === 0) return;

  ctx.parentElement.style.height = '300px';

  const byAudience = {};
  adsData.forEach(row => {
    const audience = row['Ad Set Name'] || 'Other';
    if (!byAudience[audience]) byAudience[audience] = { ctr: [], clicks: 0, impressions: 0 };
    byAudience[audience].ctr.push(parseFloat(row.CTR) || 0);
    byAudience[audience].clicks += parseInt(row.Clicks) || 0;
    byAudience[audience].impressions += parseInt(row.Impressions) || 0;
  });

  const labels = Object.keys(byAudience);
  const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

  chartInstances['chart-audience-ctr'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Avg CTR (%)',
        data: labels.map(l => avg(byAudience[l].ctr).toFixed(2)),
        backgroundColor: ADS_COLORS.audiences.slice(0, labels.length),
        borderRadius: 0,
      }]
    },
    options: {
      ...defaultOptions,
      plugins: {
        ...defaultOptions.plugins,
        legend: { display: false },
        annotation: {
          annotations: {
            benchmarkLine: {
              type: 'line',
              yMin: 1.0,
              yMax: 1.0,
              borderColor: ADS_COLORS.warning,
              borderDash: [5, 5],
              label: { content: 'Benchmark 1.0%', display: true }
            }
          }
        }
      }
    }
  });
}


function renderCreativeCpcChart(adsData) {
  destroyChart('chart-creative-cpc');
  const ctx = document.getElementById('chart-creative-cpc');
  if (!ctx || adsData.length === 0) return;

  ctx.parentElement.style.height = '300px';

  const byCreative = {};
  adsData.forEach(row => {
    const creative = row['Campaign Name'] || row['Ad Name'] || 'Other';
    if (!byCreative[creative]) byCreative[creative] = { cpc: [], spend: 0 };
    byCreative[creative].cpc.push(parseFloat(row.CPC) || 0);
    byCreative[creative].spend += parseFloat(row.Spend) || 0;
  });

  const labels = Object.keys(byCreative);
  const avg = arr => arr.reduce((a, b) => a + b, 0) / arr.length;

  chartInstances['chart-creative-cpc'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Avg CPC ($)',
        data: labels.map(l => avg(byCreative[l].cpc).toFixed(2)),
        backgroundColor: ADS_COLORS.creatives.slice(0, labels.length),
        borderRadius: 0,
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


function renderAdGroupPerformanceChart(adsData) {
  destroyChart('chart-adgroup-performance');
  const ctx = document.getElementById('chart-adgroup-performance');
  if (!ctx || adsData.length === 0) return;

  ctx.parentElement.style.height = '350px';

  // Group by ad set (audience x creative combination)
  const byAdSet = {};
  adsData.forEach(row => {
    const key = (row['Ad Set Name'] || '') + ' — ' + (row['Ad Name'] || row['Campaign Name'] || '');
    if (!byAdSet[key]) byAdSet[key] = { spend: 0, clicks: 0, impressions: 0 };
    byAdSet[key].spend += parseFloat(row.Spend) || 0;
    byAdSet[key].clicks += parseInt(row.Clicks) || 0;
    byAdSet[key].impressions += parseInt(row.Impressions) || 0;
  });

  const labels = Object.keys(byAdSet).slice(0, 12);

  chartInstances['chart-adgroup-performance'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels.map(l => l.length > 30 ? l.substring(0, 30) + '...' : l),
      datasets: [
        {
          label: 'Spend ($)',
          data: labels.map(l => byAdSet[l].spend.toFixed(2)),
          backgroundColor: ADS_COLORS.accent,
          borderRadius: 0,
        },
        {
          label: 'Clicks',
          data: labels.map(l => byAdSet[l].clicks),
          backgroundColor: ADS_COLORS.success,
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

/**
 * Render campaign tables split by Traffic vs Conversion objective.
 * Uses ad-level data (which has targeting info) grouped by campaign name.
 * Falls back to campaigns data if ad-level is unavailable.
 */
function renderCampaignTables(adsData, campaigns) {
  // Group ad-level data by campaign name to get aggregated metrics + targeting
  const byCampaign = {};
  adsData.forEach(row => {
    const name = row['Campaign Name'] || 'Unknown';
    if (!byCampaign[name]) {
      byCampaign[name] = {
        name: name,
        objective: row['Campaign Objective'] || '',
        spend: 0, pageVisits: 0, clicks: 0, conversions: 0,
        interests: new Set(), locations: new Set(),
        dailyBudget: 0
      };
    }
    // Use Spend if available, otherwise estimate from CPC * Link Clicks
    let rowSpend = parseFloat(row.Spend) || 0;
    if (rowSpend === 0) {
      rowSpend = (parseFloat(row.CPC) || 0) * (parseInt(row['Link Clicks']) || 0);
    }
    byCampaign[name].spend += rowSpend;
    byCampaign[name].pageVisits += parseInt(row['Page Visits']) || 0;
    byCampaign[name].clicks += parseInt(row.Clicks) || 0;
    byCampaign[name].conversions += parseInt(row.Conversions) || 0;
    if (row['Interest Targeting']) row['Interest Targeting'].split(', ').forEach(i => byCampaign[name].interests.add(i));
    if (row['Location Targeting']) row['Location Targeting'].split(', ').forEach(l => byCampaign[name].locations.add(l));
    const db = parseFloat(row['Daily Budget']) || 0;
    if (db > byCampaign[name].dailyBudget) byCampaign[name].dailyBudget = db;
    if (!byCampaign[name].objective && row['Campaign Objective']) {
      byCampaign[name].objective = row['Campaign Objective'];
    }
  });

  // Also pull objective + budget from campaigns data if available
  if (campaigns && campaigns.length > 0) {
    campaigns.forEach(c => {
      const name = c['Campaign Name'] || '';
      if (byCampaign[name]) {
        if (!byCampaign[name].objective && c.Objective) byCampaign[name].objective = c.Objective;
        const db = parseFloat(c['Daily Budget']) || 0;
        if (db > byCampaign[name].dailyBudget) byCampaign[name].dailyBudget = db;
      }
    });
  }

  const allCampaigns = Object.values(byCampaign);

  // Split by objective
  const trafficCampaigns = allCampaigns.filter(c =>
    c.objective.toUpperCase().includes('TRAFFIC') ||
    c.objective.toUpperCase().includes('LINK_CLICKS')
  );
  const conversionCampaigns = allCampaigns.filter(c =>
    c.objective.toUpperCase().includes('CONVERSIONS') ||
    c.objective.toUpperCase().includes('OUTCOME_SALES') ||
    c.objective.toUpperCase().includes('OUTCOME_LEADS')
  );
  const otherCampaigns = allCampaigns.filter(c =>
    !trafficCampaigns.includes(c) && !conversionCampaigns.includes(c)
  );

  const costPerPV = (c) => c.pageVisits > 0 ? c.spend / c.pageVisits : 0;

  // Render Traffic table
  if (trafficCampaigns.length > 0) {
    show('ads-traffic-table');
    const tbody = document.querySelector('#table-traffic-campaigns tbody');
    if (tbody) {
      tbody.innerHTML = trafficCampaigns.map(c => `
        <tr>
          <td>${c.name}</td>
          <td>${formatCurrency(c.spend)}</td>
          <td>${formatNumber(c.pageVisits)}</td>
          <td>${costPerPV(c) > 0 ? formatCurrency(costPerPV(c)) : '—'}</td>
          <td>${c.dailyBudget > 0 ? formatCurrency(c.dailyBudget) : '—'}</td>
          <td>${[...c.interests].join(', ') || '—'}</td>
          <td>${[...c.locations].join(', ') || '—'}</td>
        </tr>
      `).join('');
    }
  }

  // Render Conversion table
  if (conversionCampaigns.length > 0) {
    show('ads-conversion-table');
    const tbody = document.querySelector('#table-conversion-campaigns tbody');
    if (tbody) {
      tbody.innerHTML = conversionCampaigns.map(c => `
        <tr>
          <td>${c.name}</td>
          <td>${[...c.interests].join(', ') || '—'}</td>
          <td>${[...c.locations].join(', ') || '—'}</td>
          <td>${formatCurrency(c.spend)}</td>
          <td>${c.conversions || '—'}</td>
          <td>${costPerPV(c) > 0 ? formatCurrency(costPerPV(c)) : '—'}</td>
          <td>${c.dailyBudget > 0 ? formatCurrency(c.dailyBudget) : '—'}</td>
        </tr>
      `).join('');
    }
  }

  // Show generic table for campaigns with no clear objective, or as fallback
  if (otherCampaigns.length > 0 || (trafficCampaigns.length === 0 && conversionCampaigns.length === 0)) {
    show('ads-table');
    const tbody = document.querySelector('#table-campaigns tbody');
    if (tbody) {
      const displayCampaigns = otherCampaigns.length > 0 ? otherCampaigns : allCampaigns;
      tbody.innerHTML = displayCampaigns.map(c => `
        <tr>
          <td>${c.name}</td>
          <td>${c.objective || '—'}</td>
          <td>${formatCurrency(c.spend)}</td>
          <td>${formatNumber(c.pageVisits)}</td>
          <td>${costPerPV(c) > 0 ? formatCurrency(costPerPV(c)) : '—'}</td>
          <td>${formatNumber(c.clicks)}</td>
          <td>${c.dailyBudget > 0 ? formatCurrency(c.dailyBudget) : '—'}</td>
          <td>${c.conversions || '—'}</td>
          <td>${[...c.interests].join(', ') || '—'}</td>
          <td>${[...c.locations].join(', ') || '—'}</td>
        </tr>
      `).join('');
    }
  }
}


function renderAdGroupsTable(adsData) {
  const tbody = document.querySelector('#table-adgroups tbody');
  if (!tbody) return;

  // Group by ad set + campaign
  const groups = {};
  adsData.forEach(row => {
    const key = (row['Ad Set Name'] || 'Unknown') + '||' + (row['Campaign Name'] || 'Unknown');
    if (!groups[key]) {
      groups[key] = {
        adSet: row['Ad Set Name'] || 'Unknown',
        creative: row['Campaign Name'] || 'Unknown',
        impressions: 0, clicks: 0, spend: 0, ctr: [], cpc: [], conversions: 0
      };
    }
    groups[key].impressions += parseInt(row.Impressions) || 0;
    groups[key].clicks += parseInt(row.Clicks) || 0;
    groups[key].spend += parseFloat(row.Spend) || 0;
    groups[key].ctr.push(parseFloat(row.CTR) || 0);
    groups[key].cpc.push(parseFloat(row.CPC) || 0);
    groups[key].conversions += parseInt(row.Conversions) || 0;
  });

  const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const rows = Object.values(groups).sort((a, b) => b.clicks - a.clicks);

  tbody.innerHTML = rows.map(g => `
    <tr>
      <td>${g.adSet}</td>
      <td>${g.creative}</td>
      <td>${formatNumber(g.impressions)}</td>
      <td>${formatNumber(g.clicks)}</td>
      <td>${formatPercent(avg(g.ctr))}</td>
      <td>${formatCurrency(avg(g.cpc))}</td>
      <td>${formatCurrency(g.spend)}</td>
      <td>${g.conversions || '—'}</td>
    </tr>
  `).join('');
}
