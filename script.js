// ============================================================
//  HealthPulse AI — Full Working Dashboard Script
// ============================================================

// ===== DATA ENGINE =====
const DATA = {
  topics: [
    { id: 1, name: 'Influenza A (H3N2)', keywords: ['flu','fever','chills','cough','headache'], score: 87.4, delta: 12, trend: 'up', color: '#22d3ee' },
    { id: 2, name: 'RSV Hospitalization', keywords: ['rsv','respiratory','infant','breathing','bronchiolitis'], score: 76.1, delta: 28, trend: 'up', color: '#fb7185' },
    { id: 3, name: 'COVID XEC Variant', keywords: ['covid','variant','xec','booster','symptoms'], score: 64.8, delta: -5, trend: 'down', color: '#a78bfa' },
    { id: 4, name: 'Measles Outbreak', keywords: ['measles','rash','mmr','vaccine','outbreak'], score: 58.2, delta: 41, trend: 'up', color: '#fbbf24' },
    { id: 5, name: 'Norovirus Surge', keywords: ['norovirus','stomach','vomiting','diarrhea','gastro'], score: 43.5, delta: 8, trend: 'up', color: '#34d399' },
    { id: 6, name: 'Mpox Resurgence', keywords: ['mpox','monkeypox','lesions','clade','transmission'], score: 38.9, delta: 15, trend: 'up', color: '#818cf8' },
    { id: 7, name: 'Mental Health Crisis', keywords: ['anxiety','depression','burnout','therapy','stress'], score: 35.2, delta: -2, trend: 'down', color: '#f472b6' },
    { id: 8, name: 'Dengue Fever Spread', keywords: ['dengue','mosquito','tropical','hemorrhagic','aedes'], score: 31.7, delta: 6, trend: 'up', color: '#fb923c' },
  ],
  alerts: [
    { level: 'critical', title: 'RSV Surge — Northeast US', desc: 'Search volume 340% above 30-day baseline. Z-score: 4.2. Isolation Forest anomaly score: 0.92.', method: 'Z-Score + IF', time: '2 min ago', zscore: 4.2 },
    { level: 'critical', title: 'Measles Misinfo Spike', desc: 'Negative sentiment cluster with conspiracy-theory markers detected across Twitter/X and Reddit.', method: 'Sentiment + IF', time: '18 min ago', zscore: 3.8 },
    { level: 'warning', title: 'Norovirus — School Clusters', desc: 'Localized spike in 3 school districts. Geographic clustering detected in Midwest region.', method: 'Z-Score', time: '45 min ago', zscore: 2.9 },
    { level: 'warning', title: 'COVID Booster Hesitancy', desc: 'Rising negative sentiment around XEC booster uptake. Fear indicators elevated.', method: 'Sentiment', time: '1 hr ago', zscore: 2.6 },
    { level: 'info', title: 'Flu Vaccine Interest Rising', desc: 'Positive trend in 12 states, consistent with seasonal pattern. No anomaly detected.', method: 'Trend Analysis', time: '2 hr ago', zscore: 1.4 },
    { level: 'info', title: 'Mental Health Awareness Peak', desc: 'Spike aligned with national awareness campaign. Sentiment is predominantly positive.', method: 'Trend Analysis', time: '3 hr ago', zscore: 1.1 },
  ],
  sentimentFeed: [
    { text: '"Got my flu shot today — feeling good about protecting the family this season"', sentiment: 'positive', source: 'Twitter/X', conf: '94%' },
    { text: '"RSV is terrifying for parents of newborns. Our hospital is already overwhelmed"', sentiment: 'fearful', source: 'Reddit', conf: '89%' },
    { text: '"New study confirms boosters remain effective against XEC variant"', sentiment: 'positive', source: 'News RSS', conf: '91%' },
    { text: '"DON\'T trust the measles vaccine — wake up people!!!"', sentiment: 'negative', source: 'Twitter/X', conf: '96%' },
    { text: '"Just learned norovirus can spread through contaminated surfaces — important to know"', sentiment: 'neutral', source: 'Reddit', conf: '82%' },
    { text: '"My anxiety has been through the roof. Therapy waitlists are 3 months long"', sentiment: 'negative', source: 'Forum', conf: '87%' },
    { text: '"WHO recommends increased surveillance for mpox clade Ib in endemic regions"', sentiment: 'neutral', source: 'News RSS', conf: '78%' },
    { text: '"Dengue cases dropping in Southeast Asia thanks to mosquito control programs"', sentiment: 'positive', source: 'News RSS', conf: '85%' },
  ],
  regions: [
    { name: 'Northeast US', lat: 41.0, lng: -74.0, intensity: 92, topic: 'RSV' },
    { name: 'Southeast US', lat: 33.7, lng: -84.4, intensity: 68, topic: 'Influenza' },
    { name: 'Midwest US', lat: 41.8, lng: -87.6, intensity: 71, topic: 'Norovirus' },
    { name: 'West Coast US', lat: 37.7, lng: -122.4, intensity: 55, topic: 'COVID XEC' },
    { name: 'UK', lat: 51.5, lng: -0.1, intensity: 63, topic: 'Measles' },
    { name: 'Western Europe', lat: 48.8, lng: 2.3, intensity: 58, topic: 'Influenza' },
    { name: 'South Asia', lat: 28.6, lng: 77.2, intensity: 74, topic: 'Dengue' },
    { name: 'Southeast Asia', lat: 13.7, lng: 100.5, intensity: 61, topic: 'Dengue' },
    { name: 'Brazil', lat: -23.5, lng: -46.6, intensity: 49, topic: 'Dengue' },
    { name: 'Central Africa', lat: -1.3, lng: 29.2, intensity: 45, topic: 'Mpox' },
    { name: 'Australia', lat: -33.8, lng: 151.2, intensity: 38, topic: 'Influenza' },
    { name: 'Japan', lat: 35.6, lng: 139.6, intensity: 42, topic: 'RSV' },
  ]
};

// Generate time-series data
function generateTimeSeries(points, base, volatility) {
  const arr = [];
  let val = base;
  for (let i = 0; i < points; i++) {
    val = Math.max(5, Math.min(100, val + (Math.random() - 0.48) * volatility));
    arr.push(Math.round(val * 10) / 10);
  }
  return arr;
}

function timeLabels(count) {
  const labels = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now - i * 3600000);
    labels.push(d.getHours().toString().padStart(2, '0') + ':00');
  }
  return labels;
}

// ===== NAVIGATION =====
const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.nav-btn');
const pageTitle = document.getElementById('pageTitle');
const titles = { dashboard: 'Dashboard Overview', trends: 'Trend Analysis', sentiment: 'Sentiment Analysis', topics: 'Topic Modeling', alerts: 'Anomaly Alerts', map: 'Geographic Distribution', about: 'About This Project' };

let currentView = 'dashboard';
let mapInitialized = false;
let charts = {};

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const view = btn.dataset.view;
    if (view === currentView) return;
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    views.forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + view).classList.add('active');
    pageTitle.textContent = titles[view] || 'Dashboard';
    currentView = view;
    // Initialize view-specific content
    if (view === 'map' && !mapInitialized) initMap();
    if (view === 'trends') initTrendsView();
    if (view === 'sentiment') initSentimentView();
    if (view === 'topics') initTopicsView();
    if (view === 'alerts') initAlertsView();
    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
  });
});

// Mobile toggle
document.getElementById('menuToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

// ===== CLOCK =====
function updateClock() {
  const el = document.getElementById('topbarTime');
  if (el) el.textContent = new Date().toLocaleString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' local';
}
updateClock();
setInterval(updateClock, 1000);

// ===== CHART DEFAULTS =====
Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = 'rgba(99,179,237,0.06)';
Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.plugins.legend.labels.boxWidth = 10;
Chart.defaults.plugins.legend.labels.padding = 14;
Chart.defaults.elements.line.tension = 0.35;
Chart.defaults.elements.line.borderWidth = 2;
Chart.defaults.elements.point.radius = 0;
Chart.defaults.elements.point.hoverRadius = 4;
Chart.defaults.animation.duration = 800;

// ===== DASHBOARD VIEW (default) =====
function initDashboard() {
  // Main trend chart
  const labels = timeLabels(24);
  charts.mainTrend = new Chart(document.getElementById('mainTrendChart'), {
    type: 'line',
    data: {
      labels,
      datasets: DATA.topics.slice(0, 4).map(t => ({
        label: t.name, borderColor: t.color, backgroundColor: t.color + '15',
        data: generateTimeSeries(24, t.score * 0.7, 8), fill: true
      }))
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { beginAtZero: false, grid: { color: 'rgba(255,255,255,0.03)' } }, x: { grid: { display: false } } } }
  });

  // Sentiment doughnut
  charts.mainSentiment = new Chart(document.getElementById('mainSentimentChart'), {
    type: 'doughnut',
    data: {
      labels: ['Positive', 'Neutral', 'Negative', 'Fearful'],
      datasets: [{ data: [34, 38, 18, 10], backgroundColor: ['#34d399', '#3b82f6', '#fb7185', '#fbbf24'], borderWidth: 0 }]
    },
    options: { responsive: true, cutout: '65%', plugins: { legend: { position: 'bottom' } } }
  });

  // Topics
  renderTopicList('dashTopics', DATA.topics.slice(0, 6));
  // Alerts
  renderAlertList('dashAlerts', DATA.alerts.slice(0, 4));
}

function renderTopicList(containerId, topics) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = topics.map((t, i) => `
    <div class="topic-item">
      <div class="topic-left">
        <span class="topic-rank">#${i + 1}</span>
        <div><div class="topic-name">${t.name}</div><div class="topic-keywords">${t.keywords.slice(0, 3).join(', ')}</div></div>
      </div>
      <div class="topic-right">
        <div class="topic-bar"><div class="topic-bar-fill" style="width:${t.score}%;background:${t.color}"></div></div>
        <span class="topic-score">${t.score}</span>
        <span class="topic-delta ${t.trend}">${t.delta > 0 ? '+' : ''}${t.delta}%</span>
      </div>
    </div>
  `).join('');
}

function renderAlertList(containerId, alerts) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = alerts.map(a => `
    <div class="alert-item">
      <span class="alert-dot ${a.level}"></span>
      <div class="alert-content">
        <div class="alert-title">${a.title}</div>
        <div class="alert-desc">${a.desc}</div>
        <div class="alert-meta">
          <span class="alert-tag ${a.level}">${a.level}</span>
          <span>📊 ${a.method}</span>
          <span>🕐 ${a.time}</span>
          <span>Z: ${a.zscore}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ===== TRENDS VIEW =====
function initTrendsView() {
  if (charts.detailTrend) charts.detailTrend.destroy();
  if (charts.source) charts.source.destroy();
  if (charts.velocity) charts.velocity.destroy();

  const pts = parseInt(document.getElementById('trendRange').value) || 24;
  const labels = timeLabels(pts);
  charts.detailTrend = new Chart(document.getElementById('detailTrendChart'), {
    type: 'line',
    data: { labels, datasets: DATA.topics.map(t => ({ label: t.name, borderColor: t.color, data: generateTimeSeries(pts, t.score * 0.6, 10), fill: false })) },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.03)' } }, x: { grid: { display: false } } } }
  });

  charts.source = new Chart(document.getElementById('sourceChart'), {
    type: 'bar',
    data: {
      labels: ['Twitter/X', 'Reddit', 'Google Trends', 'News RSS', 'Health Forums'],
      datasets: [{ label: 'Documents/hr', data: [1240, 890, 620, 340, 180], backgroundColor: ['#22d3ee', '#a78bfa', '#34d399', '#fbbf24', '#fb7185'], borderRadius: 6, borderWidth: 0 }]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.03)' } }, x: { grid: { display: false } } } }
  });

  charts.velocity = new Chart(document.getElementById('velocityChart'), {
    type: 'bar',
    data: {
      labels: DATA.topics.slice(0, 6).map(t => t.name.split(' ')[0]),
      datasets: [{ label: 'Velocity Score', data: DATA.topics.slice(0, 6).map(t => t.delta), backgroundColor: DATA.topics.slice(0, 6).map(t => t.delta >= 0 ? '#34d399' : '#fb7185'), borderRadius: 6, borderWidth: 0 }]
    },
    options: { responsive: true, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { grid: { color: 'rgba(255,255,255,0.03)' } }, y: { grid: { display: false } } } }
  });
}

document.getElementById('trendRange').addEventListener('change', initTrendsView);

// ===== SENTIMENT VIEW =====
function initSentimentView() {
  if (charts.sentTime) charts.sentTime.destroy();
  if (charts.sentTopic) charts.sentTopic.destroy();

  const labels = timeLabels(24);
  charts.sentTime = new Chart(document.getElementById('sentimentTimeChart'), {
    type: 'line',
    data: { labels, datasets: [
      { label: 'Positive', borderColor: '#34d399', data: generateTimeSeries(24, 35, 5), fill: false },
      { label: 'Neutral', borderColor: '#3b82f6', data: generateTimeSeries(24, 40, 4), fill: false },
      { label: 'Negative', borderColor: '#fb7185', data: generateTimeSeries(24, 17, 4), fill: false },
      { label: 'Fearful', borderColor: '#fbbf24', data: generateTimeSeries(24, 8, 3), fill: false },
    ]},
    options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.03)' } }, x: { grid: { display: false } } } }
  });

  charts.sentTopic = new Chart(document.getElementById('sentimentTopicChart'), {
    type: 'bar',
    data: {
      labels: DATA.topics.slice(0, 6).map(t => t.name.split(' ')[0]),
      datasets: [
        { label: 'Positive', data: [40, 22, 35, 15, 30, 25], backgroundColor: '#34d399', borderRadius: 4 },
        { label: 'Negative', data: [12, 28, 18, 45, 10, 20], backgroundColor: '#fb7185', borderRadius: 4 },
        { label: 'Neutral', data: [48, 50, 47, 40, 60, 55], backgroundColor: '#3b82f6', borderRadius: 4 },
      ]
    },
    options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, max: 100, grid: { color: 'rgba(255,255,255,0.03)' } } } }
  });

  // Feed
  const feed = document.getElementById('sentimentFeed');
  feed.innerHTML = DATA.sentimentFeed.map(f => `
    <div class="feed-item">
      <span class="feed-dot ${f.sentiment}"></span>
      <span class="feed-text">${f.text}</span>
      <span class="feed-source">${f.source}</span>
      <span class="feed-conf" style="color:${f.sentiment === 'positive' ? '#34d399' : f.sentiment === 'negative' ? '#fb7185' : f.sentiment === 'fearful' ? '#fbbf24' : '#3b82f6'}">${f.conf}</span>
    </div>
  `).join('');
}

// ===== TOPICS VIEW =====
function initTopicsView() {
  if (charts.coherence) charts.coherence.destroy();

  const container = document.getElementById('topicCards');
  container.innerHTML = DATA.topics.map((t, i) => `
    <div class="topic-card">
      <div class="topic-card-head">
        <span class="topic-card-num">TOPIC ${i + 1}</span>
        <span class="topic-card-score">Coherence: ${(0.55 + Math.random() * 0.2).toFixed(2)}</span>
      </div>
      <h3 style="color:${t.color}">${t.name}</h3>
      <div class="topic-card-words">${t.keywords.map(w => `<span class="word-tag">${w}</span>`).join('')}</div>
    </div>
  `).join('');

  charts.coherence = new Chart(document.getElementById('coherenceChart'), {
    type: 'bar',
    data: {
      labels: DATA.topics.map((_, i) => 'Topic ' + (i + 1)),
      datasets: [{ label: 'C_v Score', data: DATA.topics.map(() => +(0.55 + Math.random() * 0.2).toFixed(2)), backgroundColor: DATA.topics.map(t => t.color + '80'), borderColor: DATA.topics.map(t => t.color), borderWidth: 1, borderRadius: 6 }]
    },
    options: { responsive: true, plugins: { legend: { display: false } }, scales: { y: { min: 0, max: 1, grid: { color: 'rgba(255,255,255,0.03)' } }, x: { grid: { display: false } } } }
  });
}

// ===== ALERTS VIEW =====
function initAlertsView() {
  if (charts.anomalyTimeline) charts.anomalyTimeline.destroy();
  if (charts.detectionMethod) charts.detectionMethod.destroy();

  renderAlertList('fullAlerts', DATA.alerts);

  const labels = timeLabels(24);
  charts.anomalyTimeline = new Chart(document.getElementById('anomalyTimelineChart'), {
    type: 'line',
    data: { labels, datasets: [
      { label: 'Anomaly Score', borderColor: '#fb7185', backgroundColor: 'rgba(251,113,133,0.1)', data: generateTimeSeries(24, 30, 15), fill: true },
      { label: 'Threshold (2.5σ)', borderColor: 'rgba(251,191,36,0.5)', borderDash: [6, 4], data: Array(24).fill(65), fill: false, pointRadius: 0 }
    ]},
    options: { responsive: true, plugins: { legend: { position: 'bottom' } }, scales: { y: { grid: { color: 'rgba(255,255,255,0.03)' } }, x: { grid: { display: false } } } }
  });

  charts.detectionMethod = new Chart(document.getElementById('detectionMethodChart'), {
    type: 'doughnut',
    data: {
      labels: ['Z-Score Only', 'Isolation Forest Only', 'Both Methods', 'Sentiment Triggered'],
      datasets: [{ data: [28, 18, 38, 16], backgroundColor: ['#22d3ee', '#a78bfa', '#fb7185', '#fbbf24'], borderWidth: 0 }]
    },
    options: { responsive: true, cutout: '55%', plugins: { legend: { position: 'bottom' } } }
  });

  // Filter
  document.getElementById('alertFilter').addEventListener('change', function () {
    const level = this.value;
    const filtered = level === 'all' ? DATA.alerts : DATA.alerts.filter(a => a.level === level);
    renderAlertList('fullAlerts', filtered);
  });
}

// ===== MAP VIEW =====
function initMap() {
  const map = L.map('geoMap', { scrollWheelZoom: true, zoomControl: true }).setView([20, 0], 2);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO', maxZoom: 18
  }).addTo(map);

  DATA.regions.forEach(r => {
    const radius = r.intensity * 350;
    const color = r.intensity > 70 ? '#fb7185' : r.intensity > 50 ? '#fbbf24' : '#22d3ee';
    L.circle([r.lat, r.lng], { radius, color, fillColor: color, fillOpacity: 0.25, weight: 1 }).addTo(map)
      .bindPopup(`<div style="font-family:Inter,sans-serif;font-size:13px"><b>${r.name}</b><br>Topic: ${r.topic}<br>Intensity: <b style="color:${color}">${r.intensity}</b></div>`);
  });

  mapInitialized = true;
  setTimeout(() => map.invalidateSize(), 200);

  // Region chart
  if (charts.region) charts.region.destroy();
  charts.region = new Chart(document.getElementById('regionChart'), {
    type: 'bar',
    data: {
      labels: DATA.regions.map(r => r.name),
      datasets: [{ label: 'Signal Intensity', data: DATA.regions.map(r => r.intensity), backgroundColor: DATA.regions.map(r => r.intensity > 70 ? '#fb7185' : r.intensity > 50 ? '#fbbf24' : '#22d3ee'), borderRadius: 6, borderWidth: 0 }]
    },
    options: { responsive: true, indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { max: 100, grid: { color: 'rgba(255,255,255,0.03)' } }, y: { grid: { display: false } } } }
  });
}

// ===== LIVE DATA UPDATES =====
function liveUpdate() {
  // Update KPIs
  const topicCount = 10 + Math.floor(Math.random() * 6);
  const docs = (45 + Math.random() * 8).toFixed(1) + 'K';
  const alertCount = 2 + Math.floor(Math.random() * 3);
  const sentiment = 58 + Math.floor(Math.random() * 10);
  document.getElementById('kpiTopics').textContent = topicCount;
  document.getElementById('kpiDocuments').textContent = docs;
  document.getElementById('kpiAlerts').textContent = alertCount;
  document.getElementById('kpiSentiment').textContent = sentiment + '%';
  document.getElementById('alertCount').textContent = alertCount;

  // Update main trend chart
  if (charts.mainTrend) {
    charts.mainTrend.data.datasets.forEach(ds => {
      ds.data.shift();
      const last = ds.data[ds.data.length - 1];
      ds.data.push(Math.max(5, Math.min(95, last + (Math.random() - 0.48) * 10)));
    });
    const newLabel = new Date().getHours().toString().padStart(2, '0') + ':' + new Date().getMinutes().toString().padStart(2, '0');
    charts.mainTrend.data.labels.shift();
    charts.mainTrend.data.labels.push(newLabel);
    charts.mainTrend.update('none');
  }

  // Update sentiment chart
  if (charts.mainSentiment) {
    const d = charts.mainSentiment.data.datasets[0].data;
    d[0] = Math.max(10, Math.min(50, d[0] + Math.floor(Math.random() * 5) - 2));
    d[1] = Math.max(10, Math.min(50, d[1] + Math.floor(Math.random() * 5) - 2));
    d[2] = Math.max(5, Math.min(30, d[2] + Math.floor(Math.random() * 3) - 1));
    d[3] = 100 - d[0] - d[1] - d[2];
    charts.mainSentiment.update('none');
  }

  // Update topic scores
  DATA.topics.forEach(t => {
    t.score = Math.max(10, Math.min(98, t.score + (Math.random() - 0.48) * 3));
    t.score = Math.round(t.score * 10) / 10;
  });
  if (currentView === 'dashboard') renderTopicList('dashTopics', DATA.topics.slice(0, 6));
}

// ===== SEARCH =====
document.getElementById('searchInput').addEventListener('input', function () {
  const q = this.value.toLowerCase().trim();
  if (!q) { renderTopicList('dashTopics', DATA.topics.slice(0, 6)); return; }
  const filtered = DATA.topics.filter(t => t.name.toLowerCase().includes(q) || t.keywords.some(k => k.includes(q)));
  renderTopicList('dashTopics', filtered);
});

// ===== REFRESH BUTTON =====
document.getElementById('refreshBtn').addEventListener('click', () => {
  liveUpdate();
  const btn = document.getElementById('refreshBtn');
  btn.style.color = '#22d3ee';
  setTimeout(() => btn.style.color = '', 600);
});

// ===== INIT =====
initDashboard();
setInterval(liveUpdate, 5000);
