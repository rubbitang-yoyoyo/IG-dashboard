/* ============================================================
   ADS.JS — Ads Charts & Tables
   Layture Instagram & Ads Dashboard
   Functions for: Ads Overview, Traffic Campaign, Conversion Campaign
   ============================================================ */

const ADS_COLORS = {
  accent: '#d1334e',
  accentLight: '#e35353',
  success: '#00d2a0',
  white: '#ffffff',
  warning: '#ffb800',
  muted: '#808080',
  blue: '#6496ff',
  purple: '#a855f7',
  palette: ['#d1334e', '#6496ff', '#00d2a0', '#ffb800', '#a855f7', '#e35353', '#ffffff'],
};


// ============================================================
//  TAB 2: ADS OVERVIEW — Charts & Tables
// ============================================================

/** Daily Spend — All Campaigns (line + area) */
function renderAllDailySpendChart(adsData) {
  destroyChart('chart-all-daily-spend');
  const ctx = document.getElementById('chart-all-daily-spend');
  if (!ctx || adsData.length === 0) return;
  ctx.parentElement.style.height = '300px';

  const byDate = {};
  adsData.forEach(row => {
    const d = row.Date;
    if (!d) return;
    if (!byDate[d]) byDate[d] = { spend: 0, clicks: 0 };
    byDate[d].spend += getSpend(row);
    byDate[d].clicks += parseInt(row['Link Clicks']) || parseInt(row['Clicks']) || 0;
  });

  const dates = Object.keys(byDate).sort();

  chartInstances['chart-all-daily-spend'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'Daily Spend (HK$)',
          data: dates.map(d => byDate[d].spend.toFixed(2)),
          borderColor: ADS_COLORS.accent,
          backgroundColor: 'rgba(209, 51, 78, 0.12)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 5,
          yAxisID: 'y',
        },
        {
          label: 'Link Clicks',
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
        x: { ...defaultOptions.scales.x, type: 'category' },
        y: {
          ...defaultOptions.scales.y,
          position: 'left',
          title: { display: true, text: 'Spend (HK$)', color: '#636b80' }
        },
        y1: {
          ...defaultOptions.scales.y,
          position: 'right',
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Clicks', color: '#636b80' }
        }
      }
    }
  });
}


/** Spend by Campaign — Doughnut */
function renderSpendByCampaignChart(adsData) {
  destroyChart('chart-spend-by-campaign');
  const ctx = document.getElementById('chart-spend-by-campaign');
  if (!ctx || adsData.length === 0) return;
  ctx.parentElement.style.height = '300px';

  const byCampaign = {};
  adsData.forEach(row => {
    const name = row['Campaign Name'] || 'Unknown';
    if (!byCampaign[name]) byCampaign[name] = 0;
    byCampaign[name] += getSpend(row);
  });

  const labels = Object.keys(byCampaign);
  const values = labels.map(l => byCampaign[l]);

  chartInstances['chart-spend-by-campaign'] = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: ADS_COLORS.palette.slice(0, labels.length),
        borderColor: '#1a1a1a',
        borderWidth: 2,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: ADS_COLORS.muted,
            font: { size: 11, family: 'Antonio, sans-serif' },
            padding: 12
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => `${ctx.label}: HK$${ctx.parsed.toFixed(2)}`
          }
        }
      }
    }
  });
}


/** CPC Trend — All Campaigns (line) */
function renderAllCpcTrendChart(adsData) {
  destroyChart('chart-all-cpc-trend');
  const ctx = document.getElementById('chart-all-cpc-trend');
  if (!ctx || adsData.length === 0) return;
  ctx.parentElement.style.height = '300px';

  const byDate = {};
  adsData.forEach(row => {
    const d = row.Date;
    if (!d) return;
    if (!byDate[d]) byDate[d] = { totalSpend: 0, totalClicks: 0, pv: 0 };
    byDate[d].totalSpend += getSpend(row);
    byDate[d].totalClicks += parseInt(row['Link Clicks']) || 0;
    byDate[d].pv += parseInt(row['Page Visits']) || 0;
  });

  const dates = Object.keys(byDate).sort();
  const cpcData = dates.map(d => {
    const { totalSpend, totalClicks } = byDate[d];
    return totalClicks > 0 ? (totalSpend / totalClicks).toFixed(2) : 0;
  });
  const cpvData = dates.map(d => {
    const { totalSpend, pv } = byDate[d];
    return pv > 0 ? (totalSpend / pv).toFixed(2) : 0;
  });

  chartInstances['chart-all-cpc-trend'] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'CPC (HK$)',
          data: cpcData,
          borderColor: ADS_COLORS.blue,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 1,
        },
        {
          label: 'Cost/PV (HK$)',
          data: cpvData,
          borderColor: ADS_COLORS.warning,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 1,
        }
      ]
    },
    options: {
      ...defaultOptions,
      scales: {
        x: { ...defaultOptions.scales.x, type: 'category' },
        y: {
          ...defaultOptions.scales.y,
          title: { display: true, text: 'HK$', color: '#636b80' }
        }
      }
    }
  });
}


/** Top 5 Best Performing Creatives (by lowest cost per PV) */
function renderTopCreativesTable(adsData) {
  const tbody = document.querySelector('#table-top-creatives tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  // Aggregate by Ad Name
  const byAd = {};
  adsData.forEach(row => {
    const name = row['Ad Name'] || 'Unknown';
    if (!byAd[name]) byAd[name] = { adSet: row['Ad Set Name'] || '', spend: 0, pv: 0, clicks: 0, ctrSum: 0, count: 0 };
    byAd[name].spend += getSpend(row);
    byAd[name].pv += parseInt(row['Page Visits']) || 0;
    byAd[name].clicks += parseInt(row['Link Clicks']) || 0;
    byAd[name].ctrSum += parseFloat(row['CTR']) || 0;
    byAd[name].count++;
  });

  // Sort by cost per PV (ascending), exclude those with 0 PV
  const sorted = Object.entries(byAd)
    .filter(([_, d]) => d.pv > 0)
    .map(([name, d]) => ({
      name,
      adSet: d.adSet,
      spend: d.spend,
      pv: d.pv,
      costPv: d.spend / d.pv,
      clicks: d.clicks,
      ctr: d.count > 0 ? (d.ctrSum / d.count) : 0,
      cpc: d.clicks > 0 ? d.spend / d.clicks : 0,
    }))
    .sort((a, b) => a.costPv - b.costPv)
    .slice(0, 5);

  sorted.forEach((row, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td class="text-truncate">${row.name}</td>
      <td class="text-truncate">${row.adSet}</td>
      <td>HK$${row.spend.toFixed(2)}</td>
      <td>${row.pv}</td>
      <td class="${row.costPv < 2 ? 'text-success' : 'text-danger'}">HK$${row.costPv.toFixed(2)}</td>
      <td>${row.clicks}</td>
      <td>${row.ctr.toFixed(2)}%</td>
      <td>HK$${row.cpc.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });

  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-muted">No data with page visits available</td></tr>';
  }
}


/** Campaign Summary Table */
function renderCampaignSummaryTable(adsData) {
  const tbody = document.querySelector('#table-campaign-summary tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  const byCampaign = {};
  adsData.forEach(row => {
    const name = row['Campaign Name'] || 'Unknown';
    if (!byCampaign[name]) byCampaign[name] = {
      objective: row['Campaign Objective'] || '',
      status: row['Status'] || '',
      spend: 0, pv: 0, clicks: 0, ctrSum: 0, count: 0
    };
    byCampaign[name].spend += getSpend(row);
    byCampaign[name].pv += parseInt(row['Page Visits']) || 0;
    byCampaign[name].clicks += parseInt(row['Link Clicks']) || 0;
    byCampaign[name].ctrSum += parseFloat(row['CTR']) || 0;
    byCampaign[name].count++;
  });

  Object.entries(byCampaign)
    .sort((a, b) => b[1].spend - a[1].spend)
    .forEach(([name, d]) => {
      const costPv = d.pv > 0 ? d.spend / d.pv : 0;
      const cpc = d.clicks > 0 ? d.spend / d.clicks : 0;
      const ctr = d.count > 0 ? d.ctrSum / d.count : 0;
      const objLabel = formatObjective(d.objective);
      const statusClass = d.status.toUpperCase() === 'ACTIVE' ? 'text-success' : 'text-muted';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="text-truncate">${name}</td>
        <td>${objLabel}</td>
        <td class="${statusClass}">${d.status}</td>
        <td>HK$${d.spend.toFixed(2)}</td>
        <td>${d.pv}</td>
        <td>${costPv > 0 ? 'HK$' + costPv.toFixed(2) : '--'}</td>
        <td>${d.clicks}</td>
        <td>HK$${cpc.toFixed(2)}</td>
        <td>${ctr.toFixed(2)}%</td>
      `;
      tbody.appendChild(tr);
    });
}


// ============================================================
//  TAB 3: TRAFFIC CAMPAIGN — Charts & Tables
// ============================================================

/** Daily Spend — Traffic Campaign */
function renderTrafficDailySpendChart(trafficAds) {
  renderCampaignDailyChart('chart-traffic-daily-spend', trafficAds, 'Traffic');
}

/** Cost per PV Trend — Traffic */
function renderTrafficCostPvTrendChart(trafficAds) {
  renderCostPvTrendChart('chart-traffic-cost-pv-trend', trafficAds);
}

/** Page Visits by Ad Set — Traffic (bar) */
function renderTrafficPvByAdsetChart(trafficAds) {
  renderPvByAdsetChart('chart-traffic-pv-by-adset', trafficAds);
}

/** Top 5 Traffic Creatives */
function renderTrafficTopCreativesTable(trafficAds) {
  renderCampaignTopCreatives('#table-traffic-top-creatives tbody', trafficAds);
}

/** Traffic Ad Set Breakdown Table */
function renderTrafficAdSetsTable(trafficAds) {
  renderAdSetBreakdownTable('#table-traffic-adsets tbody', trafficAds);
}


// ============================================================
//  TAB 4: CONVERSION CAMPAIGN — Charts & Tables
// ============================================================

/** Daily Spend — Conversion Campaign */
function renderConvDailySpendChart(convAds) {
  renderCampaignDailyChart('chart-conv-daily-spend', convAds, 'Conversion');
}

/** Cost per PV Trend — Conversion */
function renderConvCostPvTrendChart(convAds) {
  renderCostPvTrendChart('chart-conv-cost-pv-trend', convAds);
}

/** Page Visits by Ad Set — Conversion (bar) */
function renderConvPvByAdsetChart(convAds) {
  renderPvByAdsetChart('chart-conv-pv-by-adset', convAds);
}

/** Top 5 Conversion Creatives */
function renderConvTopCreativesTable(convAds) {
  renderCampaignTopCreatives('#table-conv-top-creatives tbody', convAds);
}

/** Conversion Ad Set Breakdown Table */
function renderConvAdSetsTable(convAds) {
  renderAdSetBreakdownTable('#table-conv-adsets tbody', convAds);
}


// ============================================================
//  SHARED CHART RENDERERS (used by both Traffic & Conversion)
// ============================================================

/** Generic daily spend line chart for a single campaign */
function renderCampaignDailyChart(canvasId, adsData, label) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx || adsData.length === 0) return;
  ctx.parentElement.style.height = '300px';

  const byDate = {};
  adsData.forEach(row => {
    const d = row.Date;
    if (!d) return;
    if (!byDate[d]) byDate[d] = { spend: 0, pv: 0 };
    byDate[d].spend += getSpend(row);
    byDate[d].pv += parseInt(row['Page Visits']) || 0;
  });

  const dates = Object.keys(byDate).sort();

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          label: `${label} Spend (HK$)`,
          data: dates.map(d => byDate[d].spend.toFixed(2)),
          borderColor: ADS_COLORS.accent,
          backgroundColor: 'rgba(209, 51, 78, 0.12)',
          fill: true,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
          yAxisID: 'y',
        },
        {
          label: 'Page Visits',
          data: dates.map(d => byDate[d].pv),
          borderColor: ADS_COLORS.success,
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 2,
          yAxisID: 'y1',
        }
      ]
    },
    options: {
      ...defaultOptions,
      scales: {
        x: { ...defaultOptions.scales.x, type: 'category' },
        y: {
          ...defaultOptions.scales.y,
          position: 'left',
          title: { display: true, text: 'Spend (HK$)', color: '#636b80' }
        },
        y1: {
          ...defaultOptions.scales.y,
          position: 'right',
          grid: { drawOnChartArea: false },
          title: { display: true, text: 'Page Visits', color: '#636b80' }
        }
      }
    }
  });
}


/** Cost per PV trend line chart */
function renderCostPvTrendChart(canvasId, adsData) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx || adsData.length === 0) return;
  ctx.parentElement.style.height = '300px';

  const byDate = {};
  adsData.forEach(row => {
    const d = row.Date;
    if (!d) return;
    if (!byDate[d]) byDate[d] = { spend: 0, pv: 0 };
    byDate[d].spend += getSpend(row);
    byDate[d].pv += parseInt(row['Page Visits']) || 0;
  });

  const dates = Object.keys(byDate).sort();
  const cpvData = dates.map(d => {
    const { spend, pv } = byDate[d];
    return pv > 0 ? (spend / pv).toFixed(2) : null;
  });

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Cost per Page Visit (HK$)',
        data: cpvData,
        borderColor: ADS_COLORS.warning,
        backgroundColor: 'rgba(255, 184, 0, 0.08)',
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 3,
        spanGaps: true,
      }]
    },
    options: {
      ...defaultOptions,
      scales: {
        x: { ...defaultOptions.scales.x, type: 'category' },
        y: {
          ...defaultOptions.scales.y,
          title: { display: true, text: 'HK$ per PV', color: '#636b80' }
        }
      },
      plugins: {
        ...defaultOptions.plugins,
        annotation: {
          annotations: {
            target: {
              type: 'line',
              yMin: 2,
              yMax: 2,
              borderColor: '#00d2a0',
              borderWidth: 1,
              borderDash: [6, 4],
              label: { content: 'Target: $2', enabled: true }
            }
          }
        }
      }
    }
  });
}


/** Page Visits by Ad Set — horizontal bar */
function renderPvByAdsetChart(canvasId, adsData) {
  destroyChart(canvasId);
  const ctx = document.getElementById(canvasId);
  if (!ctx || adsData.length === 0) return;
  ctx.parentElement.style.height = '300px';

  const byAdSet = {};
  adsData.forEach(row => {
    const name = row['Ad Set Name'] || 'Unknown';
    if (!byAdSet[name]) byAdSet[name] = 0;
    byAdSet[name] += parseInt(row['Page Visits']) || 0;
  });

  const sorted = Object.entries(byAdSet).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map(([name]) => name.length > 30 ? name.slice(0, 30) + '...' : name);
  const values = sorted.map(([, v]) => v);

  chartInstances[canvasId] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Page Visits',
        data: values,
        backgroundColor: ADS_COLORS.palette.slice(0, labels.length),
        borderWidth: 0,
        borderRadius: 2,
      }]
    },
    options: {
      ...defaultOptions,
      indexAxis: 'y',
      scales: {
        x: {
          ...defaultOptions.scales.x,
          title: { display: true, text: 'Page Visits', color: '#636b80' }
        },
        y: {
          ...defaultOptions.scales.y,
          ticks: { ...defaultOptions.scales.y.ticks, font: { size: 10, family: 'Antonio, sans-serif' } }
        }
      },
      plugins: {
        ...defaultOptions.plugins,
        legend: { display: false }
      }
    }
  });
}


// ============================================================
//  SHARED TABLE RENDERERS
// ============================================================

/** Top 5 Creatives table for a specific campaign type */
function renderCampaignTopCreatives(selector, adsData) {
  const tbody = document.querySelector(selector);
  if (!tbody) return;
  tbody.innerHTML = '';

  const byAd = {};
  adsData.forEach(row => {
    const name = row['Ad Name'] || 'Unknown';
    if (!byAd[name]) byAd[name] = { adSet: row['Ad Set Name'] || '', spend: 0, pv: 0, clicks: 0, ctrSum: 0, count: 0 };
    byAd[name].spend += getSpend(row);
    byAd[name].pv += parseInt(row['Page Visits']) || 0;
    byAd[name].clicks += parseInt(row['Link Clicks']) || 0;
    byAd[name].ctrSum += parseFloat(row['CTR']) || 0;
    byAd[name].count++;
  });

  const sorted = Object.entries(byAd)
    .filter(([_, d]) => d.pv > 0)
    .map(([name, d]) => ({
      name,
      adSet: d.adSet,
      pv: d.pv,
      costPv: d.spend / d.pv,
      spend: d.spend,
      ctr: d.count > 0 ? d.ctrSum / d.count : 0,
    }))
    .sort((a, b) => a.costPv - b.costPv)
    .slice(0, 5);

  sorted.forEach((row, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td class="text-truncate">${row.name}</td>
      <td class="text-truncate">${row.adSet}</td>
      <td>${row.pv}</td>
      <td class="${row.costPv < 2 ? 'text-success' : 'text-danger'}">HK$${row.costPv.toFixed(2)}</td>
      <td>HK$${row.spend.toFixed(2)}</td>
      <td>${row.ctr.toFixed(2)}%</td>
    `;
    tbody.appendChild(tr);
  });

  if (sorted.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-muted">No data available</td></tr>';
  }
}


/** Ad Set Breakdown Table (interest, location, spend, PV, cost/PV, clicks, CPC, CTR) */
function renderAdSetBreakdownTable(selector, adsData) {
  const tbody = document.querySelector(selector);
  if (!tbody) return;
  tbody.innerHTML = '';

  const byAdSet = {};
  adsData.forEach(row => {
    const name = row['Ad Set Name'] || 'Unknown';
    if (!byAdSet[name]) byAdSet[name] = {
      interest: row['Interest Targeting'] || '--',
      location: row['Location Targeting'] || '--',
      spend: 0, pv: 0, clicks: 0, ctrSum: 0, count: 0
    };
    byAdSet[name].spend += getSpend(row);
    byAdSet[name].pv += parseInt(row['Page Visits']) || 0;
    byAdSet[name].clicks += parseInt(row['Link Clicks']) || 0;
    byAdSet[name].ctrSum += parseFloat(row['CTR']) || 0;
    byAdSet[name].count++;
    // Update targeting if current row has data
    if (row['Interest Targeting']) byAdSet[name].interest = row['Interest Targeting'];
    if (row['Location Targeting']) byAdSet[name].location = row['Location Targeting'];
  });

  Object.entries(byAdSet)
    .sort((a, b) => b[1].spend - a[1].spend)
    .forEach(([name, d]) => {
      const costPv = d.pv > 0 ? d.spend / d.pv : 0;
      const cpc = d.clicks > 0 ? d.spend / d.clicks : 0;
      const ctr = d.count > 0 ? d.ctrSum / d.count : 0;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="text-truncate">${name}</td>
        <td class="text-truncate text-small">${d.interest}</td>
        <td class="text-truncate text-small">${d.location}</td>
        <td>HK$${d.spend.toFixed(2)}</td>
        <td>${d.pv}</td>
        <td class="${costPv > 0 && costPv < 2 ? 'text-success' : costPv > 0 ? 'text-danger' : ''}">${costPv > 0 ? 'HK$' + costPv.toFixed(2) : '--'}</td>
        <td>${d.clicks}</td>
        <td>HK$${cpc.toFixed(2)}</td>
        <td>${ctr.toFixed(2)}%</td>
      `;
      tbody.appendChild(tr);
    });

  if (Object.keys(byAdSet).length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="text-muted">No ad set data available</td></tr>';
  }
}


// ============================================================
//  HELPER
// ============================================================

/** Format campaign objective for display */
function formatObjective(obj) {
  if (!obj) return '--';
  const map = {
    'OUTCOME_TRAFFIC': 'Traffic',
    'OUTCOME_SALES': 'Conversions',
    'OUTCOME_LEADS': 'Leads',
    'OUTCOME_ENGAGEMENT': 'Engagement',
    'OUTCOME_AWARENESS': 'Awareness',
  };
  return map[obj.toUpperCase()] || obj.replace('OUTCOME_', '');
}
