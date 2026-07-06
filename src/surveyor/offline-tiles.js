/**
 * Offline map tile pre-download for surveyors.
 *
 * Flow:
 *   1. Open a Leaflet map inside a modal.
 *   2. Volunteer draws a bounding box on the survey area.
 *   3. We compute the tile coordinates needed at zooms 13–17 (~200 KB avg
 *      per tile for our chosen tile server), summarize the estimate.
 *   4. On confirm, fetch tiles in batches and store them in IndexedDB
 *      keyed by "z/x/y". Show progress.
 *   5. Tiles get served offline via the interceptor in offline-tile-serve.js
 *      (installed automatically when this module is imported).
 *
 * Uses CartoDB Voyager (matches the trail-guide default) so labels are
 * consistent between online and offline views.
 */

// Small inline i18n — importing tt from ./index.js would drag the entire
// surveyor entry (including its onAuthStateChanged handler) into every
// page that uses offline tiles, which then tries to render the home
// screen on the tracker page. Keep this module standalone.
function tt(en, he) {
  return document.documentElement.lang === 'he' ? he : en;
}

const TILE_URL = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png';
const TILE_SUBDOMAINS = ['a', 'b', 'c', 'd'];
const ZOOM_LEVELS = [13, 14, 15, 16, 17];
const DB_NAME = 'sv_offline_tiles';
const STORE = 'tiles';
const CONCURRENCY = 6;

let db = null;

// ------------------------------------------------------------------
// IndexedDB helpers
// ------------------------------------------------------------------
function openDb() {
  if (db) return Promise.resolve(db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => { db = req.result; resolve(db); };
    req.onerror = () => reject(req.error);
  });
}

async function putTile(key, blob) {
  const d = await openDb();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(blob, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getTile(key) {
  const d = await openDb();
  return new Promise((resolve) => {
    const tx = d.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}

// Expose the getter globally so Leaflet tile layers can consult it.
window.__svOfflineTileGet = getTile;

// ------------------------------------------------------------------
// Tile math
// ------------------------------------------------------------------
function lngLatToTile(lng, lat, z) {
  const n = 2 ** z;
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n
  );
  return { x, y };
}

function enumerateTiles(bbox) {
  const list = [];
  for (const z of ZOOM_LEVELS) {
    const nw = lngLatToTile(bbox.west, bbox.north, z);
    const se = lngLatToTile(bbox.east, bbox.south, z);
    for (let x = nw.x; x <= se.x; x++) {
      for (let y = nw.y; y <= se.y; y++) {
        list.push({ z, x, y });
      }
    }
  }
  return list;
}

function tileUrl({ z, x, y }, idx = 0) {
  const s = TILE_SUBDOMAINS[idx % TILE_SUBDOMAINS.length];
  return TILE_URL.replace('{s}', s).replace('{z}', z).replace('{x}', x).replace('{y}', y);
}

// ------------------------------------------------------------------
// UI — modal with map + bbox picker
// ------------------------------------------------------------------
export async function openOfflineTiles() {
  await ensureLeaflet();

  const overlay = document.createElement('div');
  overlay.className = 'sv-offline-overlay';
  overlay.innerHTML = `
    <div class="sv-offline-modal" role="dialog" aria-modal="true">
      <div class="sv-offline-header">
        <h2>${tt('Offline map area', 'איזור מפה לא-מקוונת')}</h2>
        <button class="sv-offline-close" aria-label="Close">×</button>
      </div>
      <div class="sv-offline-hint">
        ${tt(
          'Drag the map, then tap "Select area". Draw a box on the survey region. Smaller = faster download.',
          'הזיזו את המפה ולחצו "בחר איזור". סמנו מלבן על איזור הסקר. איזור קטן יותר = הורדה מהירה יותר.'
        )}
      </div>
      <div class="sv-offline-map" id="svOfflineMap"></div>
      <div class="sv-offline-summary" id="svOfflineSummary">${tt('No area selected', 'לא נבחר איזור')}</div>
      <div class="sv-offline-progress" id="svOfflineProgress" hidden>
        <div class="sv-offline-progress-bar"><div class="sv-offline-progress-fill" id="svOfflineFill"></div></div>
        <div class="sv-offline-progress-label" id="svOfflineProgressLabel">0%</div>
      </div>
      <div class="sv-btn-row">
        <button class="sv-btn sv-btn-ghost" id="svOfflineSelect">${tt('Select area', 'בחר איזור')}</button>
        <button class="sv-btn sv-btn-primary" id="svOfflineDownload" disabled>${tt('Download', 'הורד')}</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const close = () => overlay.remove();
  overlay.querySelector('.sv-offline-close').addEventListener('click', close);

  const map = L.map(overlay.querySelector('#svOfflineMap'), { zoomControl: true }).setView([31.7, 35.2], 12);
  L.tileLayer(TILE_URL, { subdomains: TILE_SUBDOMAINS }).addTo(map);

  let selectionRect = null;
  let selecting = false;
  let dragStart = null;

  const selectBtn = overlay.querySelector('#svOfflineSelect');
  const downloadBtn = overlay.querySelector('#svOfflineDownload');
  const summary = overlay.querySelector('#svOfflineSummary');

  selectBtn.addEventListener('click', () => {
    selecting = true;
    map.dragging.disable();
    map.getContainer().style.cursor = 'crosshair';
    selectBtn.textContent = tt('Draw box…', 'מסמנים…');
  });

  map.on('mousedown touchstart', (e) => {
    if (!selecting) return;
    const p = e.latlng || (e.touches?.[0] && map.mouseEventToLatLng(e.touches[0]));
    if (!p) return;
    dragStart = p;
    if (selectionRect) map.removeLayer(selectionRect);
    selectionRect = L.rectangle([dragStart, dragStart], { color: '#4ea672', weight: 2 }).addTo(map);
  });

  map.on('mousemove touchmove', (e) => {
    if (!selecting || !dragStart) return;
    const p = e.latlng || (e.touches?.[0] && map.mouseEventToLatLng(e.touches[0]));
    if (!p || !selectionRect) return;
    selectionRect.setBounds([dragStart, p]);
    updateSummary();
  });

  map.on('mouseup touchend', () => {
    if (!selecting) return;
    selecting = false;
    map.dragging.enable();
    map.getContainer().style.cursor = '';
    selectBtn.textContent = tt('Re-select area', 'סמן איזור מחדש');
    dragStart = null;
    updateSummary();
    downloadBtn.disabled = !selectionRect;
  });

  function updateSummary() {
    if (!selectionRect) return;
    const b = selectionRect.getBounds();
    const bbox = { north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() };
    const tiles = enumerateTiles(bbox);
    const est = Math.round((tiles.length * 22) / 1024); // ~22 KB avg per Carto raster tile
    summary.textContent =
      `${tiles.length} ${tt('tiles', 'אריחים')} · ~${est} MB`;
  }

  downloadBtn.addEventListener('click', async () => {
    if (!selectionRect) return;
    downloadBtn.disabled = true;
    selectBtn.disabled = true;

    const b = selectionRect.getBounds();
    const bbox = { north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() };
    const tiles = enumerateTiles(bbox);
    const progressWrap = overlay.querySelector('#svOfflineProgress');
    const fill = overlay.querySelector('#svOfflineFill');
    const label = overlay.querySelector('#svOfflineProgressLabel');
    progressWrap.hidden = false;

    let done = 0, failed = 0;
    await runPool(tiles, CONCURRENCY, async (t, i) => {
      const key = `${t.z}/${t.x}/${t.y}`;
      const existing = await getTile(key);
      if (existing) { done++; return; }
      try {
        const res = await fetch(tileUrl(t, i));
        if (!res.ok) throw new Error(res.statusText);
        const blob = await res.blob();
        await putTile(key, blob);
        done++;
      } catch (err) {
        failed++;
      } finally {
        const pct = Math.round(((done + failed) / tiles.length) * 100);
        fill.style.width = `${pct}%`;
        label.textContent = `${pct}% (${done}/${tiles.length}${failed ? ` · ${failed} ${tt('failed', 'נכשלו')}` : ''})`;
      }
    });

    label.textContent = `✓ ${done} ${tt('tiles saved', 'אריחים נשמרו')}`;
    setTimeout(close, 1200);
  });
}

/**
 * Install an offline-aware tile layer on the surveyor map.
 * Strips the existing tile layer and replaces it with a CartoDB Voyager
 * layer whose createTile() consults IndexedDB before hitting the network.
 * Falls back to network for anything not pre-downloaded.
 */
export function attachOfflineTileLayer(leafletMap) {
  if (!leafletMap || !window.L) return;

  // Remove any existing tile layers so we don't stack them.
  leafletMap.eachLayer((layer) => {
    if (layer instanceof L.TileLayer) {
      leafletMap.removeLayer(layer);
    }
  });

  const OfflineTileLayer = L.TileLayer.extend({
    createTile(coords, done) {
      const tile = document.createElement('img');
      tile.setAttribute('crossorigin', 'anonymous');
      tile.alt = '';
      tile.style.width = tile.style.height = '256px';

      const key = `${coords.z}/${coords.x}/${coords.y}`;
      const netUrl = this.getTileUrl(coords);

      // Try IndexedDB first, then fall back to network.
      (async () => {
        try {
          const blob = await getTile(key);
          if (blob) {
            tile.src = URL.createObjectURL(blob);
          } else {
            tile.src = netUrl;
          }
        } catch (_) {
          tile.src = netUrl;
        }
        tile.onload = () => done(null, tile);
        tile.onerror = () => done(new Error('tile load failed'), tile);
      })();

      return tile;
    },
  });

  new OfflineTileLayer(TILE_URL, {
    subdomains: TILE_SUBDOMAINS,
    attribution: '© OpenStreetMap contributors © CARTO',
    maxZoom: 19,
  }).addTo(leafletMap);
}

// Simple concurrency pool
async function runPool(items, size, worker) {
  const queue = items.slice();
  let i = 0;
  const runners = Array.from({ length: Math.min(size, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      const idx = i++;
      await worker(item, idx);
    }
  });
  await Promise.all(runners);
}

// ------------------------------------------------------------------
// Lazy-load Leaflet from unpkg the same way the tracker page does.
// ------------------------------------------------------------------
function ensureLeaflet() {
  if (window.L) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.css';
    document.head.appendChild(link);
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.3/dist/leaflet.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}
