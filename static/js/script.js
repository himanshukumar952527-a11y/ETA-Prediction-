// ============================================
// DYNAMIC ETA FORECAST — FRONTEND LOGIC
// Dummy data for now. Replace fetchTrainData()
// with a real API call when the backend is ready.
// ============================================

const searchForm = document.getElementById("searchForm");
const trainInput = document.getElementById("trainInput");
const chips = document.querySelectorAll(".chip[data-train]");
const myTrainsChip = document.getElementById("myTrainsChip");
const recentChip = document.getElementById("recentChip");
const resultsContainer = document.getElementById("resultsContainer");
const mapModalOverlay = document.getElementById("mapModalOverlay");
const mapModalClose = document.getElementById("mapModalClose");
const mapSvgContainer = document.getElementById("mapSvgContainer");
const mapModalSubtitle = document.getElementById("mapModalSubtitle");
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

let currentResultData = null;

// ---------- STATION COORDINATES ----------
const STATION_COORDS = {
  "Mumbai Central (MMCT)": [22, 78],
  "Surat": [28, 68],
  "Vadodara Jn": [30, 63],
  "Vadodara Jn (BRC)": [30, 63],
  "Ratlam Jn": [36, 55],
  "Kota Jn": [42, 46],
  "New Delhi": [46, 22],
  "New Delhi (NDLS)": [46, 22],
  "Howrah (HWH)": [78, 55],
  "Asansol Jn": [70, 50],
  "Dhanbad Jn": [68, 46],
  "Dhanbad Jn (DHN)": [68, 46],
  "Gaya Jn": [62, 40],
  "Mughalsarai": [56, 34],
  "Sealdah (SDAH)": [79, 56],
  "Allahabad Jn": [54, 32],
  "Kanpur Central": [50, 28],
  "Kanpur Central (CNB)": [50, 28],
  "Tundla Jn": [48, 25]
};

// ---------- DUMMY DATA STORE ----------
// NOTE: "platform" is the expected/predicted platform number.
// "platformConfidence" flags cases where allocation may still change
// closer to arrival (kept honest — real platform assignment often
// firms up only in the last few km, per interlocking/yard planning).
const DUMMY_TRAINS = {
  "12951": {
    number: "12951",
    name: "Mumbai Rajdhani Express",
    origin: "Mumbai Central (MMCT)",
    destination: "New Delhi (NDLS)",
    route: "Mumbai Central (MMCT) → New Delhi (NDLS)",
    delayMinutes: 18,
    confidence: "high",
    nextStation: "Vadodara Jn (BRC)",
    nextEtaTime: "14:32",
    nextPlatform: "3",
    nextPlatformConfidence: "confirmed",
    destinationEtaTime: "08:35 (+1 day)",
    destinationPlatform: "1",
    destinationPlatformConfidence: "confirmed",
    lastUpdated: "2 min ago",
    reason: "Running late due to congestion near Surat; recovered 6 min after last halt.",
    punctuality30d: 71,
    stops: [
      { name: "Mumbai Central (MMCT)", sched: "16:00", predicted: "16:00", status: "ontime", delta: "Origin", passed: true, platform: "1", platformConfidence: "confirmed" },
      { name: "Surat", sched: "12:48", predicted: "13:04", status: "delay", delta: "+16 min", passed: true, platform: "2", platformConfidence: "confirmed" },
      { name: "Vadodara Jn", sched: "14:14", predicted: "14:32", status: "delay", delta: "+18 min", current: true, platform: "3", platformConfidence: "confirmed" },
      { name: "Ratlam Jn", sched: "16:42", predicted: "16:55", status: "delay", delta: "+13 min", platform: "1", platformConfidence: "expected" },
      { name: "Kota Jn", sched: "19:50", predicted: "19:58", status: "ontime", delta: "+8 min", platform: "4", platformConfidence: "expected" },
      { name: "New Delhi", sched: "08:35", predicted: "08:35", status: "ontime", delta: "On time", platform: "1", platformConfidence: "confirmed" }
    ],
    alerts: [
      { text: "Temporary speed restriction (30 km/h) between Surat–Vadodara due to track maintenance.", time: "Active until 15:00" },
      { text: "Moderate congestion reported ahead near Ratlam Jn.", time: "Updated 5 min ago" }
    ]
  },
  "12301": {
    number: "12301",
    name: "Howrah Rajdhani Express",
    origin: "Howrah (HWH)",
    destination: "New Delhi (NDLS)",
    route: "Howrah (HWH) → New Delhi (NDLS)",
    delayMinutes: 0,
    confidence: "high",
    nextStation: "Dhanbad Jn (DHN)",
    nextEtaTime: "18:47",
    nextPlatform: "2",
    nextPlatformConfidence: "confirmed",
    destinationEtaTime: "10:00 (+1 day)",
    destinationPlatform: "1",
    destinationPlatformConfidence: "confirmed",
    lastUpdated: "1 min ago",
    reason: "Running on schedule. No active restrictions on this section.",
    punctuality30d: 88,
    stops: [
      { name: "Howrah (HWH)", sched: "16:55", predicted: "16:55", status: "ontime", delta: "Origin", passed: true, platform: "9", platformConfidence: "confirmed" },
      { name: "Asansol Jn", sched: "17:35", predicted: "17:35", status: "ontime", delta: "On time", passed: true, platform: "3", platformConfidence: "confirmed" },
      { name: "Dhanbad Jn", sched: "18:47", predicted: "18:47", status: "ontime", delta: "On time", current: true, platform: "2", platformConfidence: "confirmed" },
      { name: "Gaya Jn", sched: "21:08", predicted: "21:10", status: "ontime", delta: "+2 min", platform: "1", platformConfidence: "expected" },
      { name: "Mughalsarai", sched: "23:35", predicted: "23:40", status: "ontime", delta: "+5 min", platform: "5", platformConfidence: "expected" },
      { name: "New Delhi", sched: "10:00", predicted: "10:00", status: "ontime", delta: "On time", platform: "1", platformConfidence: "confirmed" }
    ],
    alerts: [
      { text: "No active alerts on this route currently.", time: "Checked just now" }
    ]
  },
  "12259": {
    number: "12259",
    name: "Sealdah Duronto Express",
    origin: "Sealdah (SDAH)",
    destination: "New Delhi (NDLS)",
    route: "Sealdah (SDAH) → New Delhi (NDLS)",
    delayMinutes: 42,
    confidence: "medium",
    nextStation: "Kanpur Central (CNB)",
    nextEtaTime: "05:58",
    nextPlatform: "5",
    nextPlatformConfidence: "expected",
    destinationEtaTime: "11:20",
    destinationPlatform: "2",
    destinationPlatformConfidence: "expected",
    lastUpdated: "4 min ago",
    reason: "Delay accumulated due to a preceding freight movement and one unscheduled signal halt near Allahabad.",
    punctuality30d: 54,
    stops: [
      { name: "Sealdah (SDAH)", sched: "23:55", predicted: "23:55", status: "ontime", delta: "Origin", passed: true, platform: "8", platformConfidence: "confirmed" },
      { name: "Allahabad Jn", sched: "02:20", predicted: "02:58", status: "severe", delta: "+38 min", passed: true, platform: "6", platformConfidence: "confirmed" },
      { name: "Kanpur Central", sched: "05:16", predicted: "05:58", status: "severe", delta: "+42 min", current: true, platform: "5", platformConfidence: "expected" },
      { name: "Tundla Jn", sched: "08:05", predicted: "08:40", status: "delay", delta: "+35 min", platform: "2", platformConfidence: "expected" },
      { name: "New Delhi", sched: "10:40", predicted: "11:20", status: "delay", delta: "+40 min", platform: "2", platformConfidence: "expected" }
    ],
    alerts: [
      { text: "Unscheduled signal halt recorded near Allahabad Jn.", time: "Occurred 45 min ago" },
      { text: "Preceding freight train causing minor congestion till Kanpur.", time: "Updated 10 min ago" }
    ]
  }
};

// ---------- EVENT WIRING ----------

searchForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const query = trainInput.value.trim();
  if (!query) {
    trainInput.focus();
    return;
  }
  handleSearch(query);
});

chips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const trainNo = chip.getAttribute("data-train");
    trainInput.value = trainNo;
    handleSearch(trainNo);
  });
});

myTrainsChip.addEventListener("click", () => {
  console.log("My Trains — to be implemented with login/backend.");
});

recentChip.addEventListener("click", () => {
  console.log("Recent Searches — to be implemented with localStorage/backend.");
});

mapModalClose.addEventListener("click", closeMapModal);
mapModalOverlay.addEventListener("click", (e) => {
  if (e.target === mapModalOverlay) closeMapModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMapModal();
});

// ---------- THEME TOGGLE ----------

function applyTheme(theme) {
  document.body.setAttribute("data-theme", theme);
  themeIcon.textContent = theme === "dark" ? "☀️" : "🌙";
  localStorage.setItem("eta_theme", theme);
}

themeToggle.addEventListener("click", () => {
  const current = document.body.getAttribute("data-theme");
  applyTheme(current === "dark" ? "light" : "dark");
});

(function initTheme() {
  const saved = localStorage.getItem("eta_theme");
  applyTheme(saved === "dark" ? "dark" : "light");
})();

// ---------- SEARCH HANDLER ----------

function handleSearch(query) {
  const key = query.trim();
  resultsContainer.innerHTML = `<div class="empty-state"><div class="empty-icon">🚆</div><p>${t("fetching")} <strong>${escapeHtml(key)}</strong>...</p></div>`;

  setTimeout(() => {
    const data = fetchTrainData(key);
    if (!data) {
      currentResultData = null;
      renderNotFound(key);
      return;
    }
    currentResultData = data;
    renderResultCard(data);
  }, 500);
}

function fetchTrainData(query) {
  const normalized = query.trim().toLowerCase();
  return Object.values(DUMMY_TRAINS).find(
    (tr) => tr.number === normalized || tr.name.toLowerCase().includes(normalized)
  );
}

window.rerenderCurrentResult = function () {
  if (currentResultData) {
    renderResultCard(currentResultData);
  }
};

// ---------- RENDERING ----------

function renderNotFound(query) {
  resultsContainer.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">❓</div>
      <p>${t("notFound")} "<strong>${escapeHtml(query)}</strong>". ${t("notFoundHint")}</p>
    </div>
  `;
}

function renderResultCard(data) {
  const statusClass = data.delayMinutes > 0 ? "delayed" : "ontime";
  const statusText = data.delayMinutes > 0 ? t("runningLate", { min: data.delayMinutes }) : t("onTime");

  resultsContainer.innerHTML = `
    <div class="result-card">
      ${renderHeader(data, statusClass, statusText)}
      ${renderEtaPanel(data)}
      ${renderTimeline(data)}
      ${renderMapButtonSection(data)}
      ${renderAlerts(data)}
    </div>
    ${renderBottomGrid(data)}
  `;

  const mapBtn = document.getElementById("showMapBtn");
  if (mapBtn) {
    mapBtn.addEventListener("click", () => openMapModal(data));
  }
}

function renderHeader(data, statusClass, statusText) {
  const confKey = data.confidence === "high" ? "confHigh" : data.confidence === "medium" ? "confMedium" : "confLow";
  return `
    <div class="result-header">
      <div>
        <div class="train-id">${data.number} · ${escapeHtml(data.name)}</div>
        <div class="train-route">${escapeHtml(data.route)}</div>
      </div>
      <div class="status-group">
        <span class="status-badge ${statusClass}">${statusText}</span>
        <span class="confidence-badge ${data.confidence}">
          <span class="confidence-dot"></span>
          ${t(confKey)}
        </span>
      </div>
    </div>
  `;
}

// ---------- PLATFORM HELPERS ----------

function platformBadgeHtml(platformNo, confidenceLevel, size) {
  if (!platformNo) return "";
  const isConfirmed = confidenceLevel === "confirmed";
  const cls = isConfirmed ? "platform-badge confirmed" : "platform-badge expected";
  const sizeCls = size === "lg" ? " platform-badge-lg" : "";
  const label = isConfirmed ? t("platformConfirmed") : t("platformExpected");
  return `
    <span class="${cls}${sizeCls}" title="${escapeHtml(label)}">
      <span class="platform-badge-icon">🛤️</span>
      <span class="platform-badge-text">${t("platformShort")} ${escapeHtml(platformNo)}</span>
      <span class="platform-badge-tag">${label}</span>
    </span>
  `;
}

function renderEtaPanel(data) {
  return `
    <div class="eta-panel">
      <div class="eta-main">
        <span class="eta-label">${t("nextStationEta")}</span>
        <span class="eta-value">${data.nextEtaTime}</span>
        <span class="eta-station">${escapeHtml(data.nextStation)}</span>
        <div class="eta-platform-row">
          ${platformBadgeHtml(data.nextPlatform, data.nextPlatformConfidence, "lg")}
        </div>
        <span class="eta-updated">${t("updated")} ${data.lastUpdated}</span>
      </div>
      <div class="eta-secondary">
        <span class="eta-label">${t("destinationEta")}</span>
        <span class="eta-value" style="font-size:24px;">${data.destinationEtaTime}</span>
        <div class="eta-platform-row">
          ${platformBadgeHtml(data.destinationPlatform, data.destinationPlatformConfidence, "")}
        </div>
      </div>
      <div class="eta-reason">
        <span class="icon">ℹ️</span>
        <span>${escapeHtml(data.reason)}</span>
      </div>
    </div>
  `;
}

function renderTimeline(data) {
  const stops = data.stops.map((s) => `
    <div class="timeline-stop">
      <div class="stop-dot ${s.current ? "current" : s.status}"></div>
      <div class="stop-name">${escapeHtml(s.name)}</div>
      <div class="stop-times">Sched: ${s.sched} &middot; <span class="predicted">${s.predicted}</span></div>
      ${platformBadgeHtml(s.platform, s.platformConfidence, "")}
      <div class="stop-delta ${s.status}">${escapeHtml(s.delta)}</div>
    </div>
  `).join("");

  return `
    <div class="timeline-section">
      <div class="section-title">${t("upcomingStations")}</div>
      <div class="timeline">${stops}</div>
    </div>
  `;
}

function renderMapButtonSection(data) {
  return `
    <div class="map-strip-section">
      <div class="section-title-row">
        <div class="section-title">${t("routeOverview")}</div>
        <button class="show-map-btn" id="showMapBtn">🗺️ ${t("showOnMap")}</button>
      </div>
      <div class="map-strip-mini">
        <div class="map-track"></div>
        <div class="map-train-icon-mini">🚆</div>
      </div>
    </div>
  `;
}

function renderAlerts(data) {
  if (!data.alerts || data.alerts.length === 0) return "";
  const items = data.alerts.map((a) => `
    <div class="alert-item">
      <span class="alert-icon">⚠️</span>
      <div class="alert-text">
        <strong>${escapeHtml(a.text)}</strong>
        <span>${escapeHtml(a.time)}</span>
      </div>
    </div>
  `).join("");

  return `
    <div class="alerts-section">
      <div class="section-title">${t("activeAlerts")}</div>
      ${items}
    </div>
  `;
}

function renderBottomGrid(data) {
  return `
    <div class="bottom-grid">
      <div class="info-card">
        <div class="section-title">${t("punctuality30")}</div>
        <div class="punctuality-bar-track">
          <div class="punctuality-bar-fill" style="width:${data.punctuality30d}%;"></div>
        </div>
        <div class="punctuality-text">${t("punctualityText", { pct: data.punctuality30d })}</div>
      </div>
      <div class="info-card">
        <div class="section-title">${t("actions")}</div>
        <div class="action-buttons">
          <button class="action-btn primary" onclick="alert('${t("setAlert")}: ${escapeHtml(data.nextStation)} · ${t("platformShort")} ${escapeHtml(data.nextPlatform || "-")}')">🔔 ${t("setAlert")}</button>
          <button class="action-btn" onclick="alert('${t("shareEta")} (demo)')">🔗 ${t("shareEta")}</button>
        </div>
      </div>
    </div>
  `;
}

// ---------- MAP MODAL (NTES-style SVG route map) ----------

function openMapModal(data) {
  mapModalSubtitle.textContent = `${data.number} · ${data.name}`;
  mapSvgContainer.innerHTML = buildRouteMapSvg(data);
  mapModalOverlay.classList.add("open");
  document.body.classList.add("modal-open");
}

function closeMapModal() {
  mapModalOverlay.classList.remove("open");
  document.body.classList.remove("modal-open");
}

function buildRouteMapSvg(data) {
  const points = data.stops
    .map((s) => ({ ...s, coord: STATION_COORDS[s.name] }))
    .filter((s) => s.coord);

  if (points.length === 0) {
    return `<p style="padding:30px;text-align:center;color:#888;">Map data unavailable for this route.</p>`;
  }

  const currentIdx = points.findIndex((p) => p.current);
  const splitIdx = currentIdx >= 0 ? currentIdx : 0;

  const toXY = (p) => `${p.coord[0]},${p.coord[1]}`;
  const coveredPts = points.slice(0, splitIdx + 1).map(toXY).join(" ");
  const remainingPts = points.slice(splitIdx).map(toXY).join(" ");

  const markers = points.map((p, i) => {
    const isCurrent = i === splitIdx;
    const isPassed = i < splitIdx;
    const dotClass = isCurrent ? "map-dot-current" : (isPassed ? "map-dot-passed" : "map-dot-upcoming");
    const platformSuffix = p.platform ? ` (PF ${escapeHtml(p.platform)})` : "";
    return `
      <g class="map-station-group">
        <circle cx="${p.coord[0]}" cy="${p.coord[1]}" r="${isCurrent ? 1.6 : 1.1}" class="${dotClass}" />
        <text x="${p.coord[0]}" y="${p.coord[1] - 2.2}" class="map-station-label">${escapeHtml(p.name.split(" (")[0])}${platformSuffix}</text>
      </g>
    `;
  }).join("");

  const currentPoint = points[splitIdx];

  return `
    <svg viewBox="0 0 100 100" class="india-map-svg" preserveAspectRatio="xMidYMid meet">
      <path d="M35,5 C55,3 68,12 72,20 C80,25 85,35 82,45 C88,55 86,65 78,68 C80,78 70,85 60,88 C55,95 45,96 40,90 C30,92 20,88 22,78 C10,75 8,62 15,55 C8,48 10,35 20,30 C18,20 25,8 35,5 Z"
            class="india-outline" />
      <polyline points="${coveredPts}" class="route-line covered" />
      <polyline points="${remainingPts}" class="route-line remaining" />
      ${markers}
      <circle cx="${currentPoint.coord[0]}" cy="${currentPoint.coord[1]}" r="2.2" class="live-position-ring" />
      <circle cx="${currentPoint.coord[0]}" cy="${currentPoint.coord[1]}" r="1.3" class="live-position-dot" />
    </svg>
  `;
}

// ---------- UTILITIES ----------

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

console.log("Dynamic ETA Forecast frontend — platform numbers, map view, language switch and theme toggle loaded.");
