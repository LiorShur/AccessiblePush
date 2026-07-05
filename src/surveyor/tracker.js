/**
 * Surveyor tracker — streamlined tracking session.
 *
 * Reuses the consumer app's core tracking, map, POI and AI modules but
 * skips all the UI cruft (bottom nav, upsells, safety/pocket-mode gates,
 * announcements, etc.). The result is a full-screen map with three big
 * controls: Start, Survey, Stop.
 *
 * Flow (when opened with ?preflight=1):
 *   1. Auth + whitelist gate (redirect to surveyor.html on failure)
 *   2. Pre-flight modal — GPS, battery, storage, network checks
 *   3. Start unlocks → tracking begins → POI FABs appear
 *   4. Stop → reviewer checklist + completeness score → submit
 */

import { auth, db } from '../../firebase-setup.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

import { AppState } from '../core/storage.js';
import { MapController } from '../core/map.js';
import { TrackingController } from '../core/tracking.js';
import { TimerController } from '../core/timer.js';
import { poiElements } from '../features/poiElements.js';
import { AccessibilityFormV2Quick } from '../features/accessibilityFormV2Quick.js';

import { runPreflight } from './preflight.js';
import { runChecklist } from './checklist.js';

// ------------------------------------------------------------------
// Small helpers
// ------------------------------------------------------------------
function tt(en, he) {
  return document.documentElement.lang === 'he' ? he : en;
}

function urlHasFlag(name) {
  return new URLSearchParams(location.search).has(name);
}

function redirectHome() {
  location.replace('surveyor.html');
}

async function checkWhitelist(user) {
  if (!user?.email) return null;
  try {
    const snap = await getDoc(doc(db, 'surveyors', user.email.toLowerCase()));
    if (!snap.exists()) return null;
    const data = snap.data();
    if (data.active === false) return null;
    return { ...data, email: user.email, uid: user.uid, displayName: user.displayName };
  } catch (err) {
    console.error('[SurveyorTracker] Whitelist lookup failed:', err);
    return null;
  }
}

// ------------------------------------------------------------------
// Controllers container (shared across the page)
// ------------------------------------------------------------------
const surveyor = {
  profile: null,
  state: null,
  map: null,
  tracking: null,
  timer: null,
  accessibility: null,
  surveyStarted: false,
  routeStartTs: null,
};

// Expose for POI module / debugging
window.__surveyorApp = surveyor;

// ------------------------------------------------------------------
// Init sequence
// ------------------------------------------------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) return redirectHome();
  const profile = await checkWhitelist(user);
  if (!profile) return redirectHome();

  surveyor.profile = profile;
  await bootTracker();
});

async function bootTracker() {
  console.log('[SurveyorTracker] Booting for', surveyor.profile.email);

  // Wire minimal controllers. AppState / TrackingController rely on
  // window.i18n / window.t in a couple of places — we shim to no-op.
  window.i18n = window.i18n || { t: (k) => k };
  window.t = window.t || ((k) => k);

  surveyor.state = new AppState();
  surveyor.map = new MapController();
  surveyor.tracking = new TrackingController(surveyor.state);
  surveyor.timer = new TimerController();
  surveyor.accessibility = new AccessibilityFormV2Quick();

  // Set up the same dependency graph the consumer app uses.
  surveyor.tracking.setDependencies({
    map: surveyor.map,
    timer: surveyor.timer,
  });

  // Initialize the map, then the POI system (POI needs the Leaflet instance).
  await surveyor.map.initialize();
  poiElements.init(surveyor.map.map, surveyor.map.markerCluster || null);

  // Expose in the shape the POI module expects to find the tracking state.
  window.AccessNatureApp = {
    controllers: {
      state: surveyor.state,
      map: surveyor.map,
      poiElements,
    },
    getController: (name) => surveyor[name] || null,
  };

  // Translate any data-en/data-he strings we baked into the HTML.
  translateStaticStrings();

  // Wire the UI
  wireControls();
  startStatsLoop();

  // Watch tracking state so we can flip the UI + auto-restart the survey
  // reminder timer.
  window.addEventListener('trackingStarted', () => {
    document.getElementById('svControls')?.classList.add('tracking');
    document.getElementById('svControlsActive')?.removeAttribute('hidden');
    // Prompt to fill the accessibility survey if not done yet.
    document.getElementById('svSurveyBtn')?.classList.add('needs-attention');
  });

  window.addEventListener('trackingStopped', () => {
    document.getElementById('svControls')?.classList.remove('tracking');
    document.getElementById('svControlsActive')?.setAttribute('hidden', '');
  });

  // If the URL asked for pre-flight, show it immediately.
  if (urlHasFlag('preflight')) {
    const passed = await runPreflight({ tracker: surveyor });
    if (!passed) {
      // User bailed — enable the Start button so they can retry.
      console.log('[SurveyorTracker] Pre-flight cancelled');
    }
  }
}

// ------------------------------------------------------------------
// UI wiring
// ------------------------------------------------------------------
function wireControls() {
  document.getElementById('svBackBtn')?.addEventListener('click', () => {
    if (surveyor.state?.isTracking) {
      if (!confirm(tt(
        'You are currently tracking. Leaving will pause the survey. Continue?',
        'סקר בעיצומו. יציאה תשהה את הסקר. להמשיך?'))) return;
    }
    redirectHome();
  });

  document.getElementById('svStartBtn')?.addEventListener('click', async () => {
    // Even if pre-flight was skipped, run it now for safety.
    const passed = await runPreflight({ tracker: surveyor, allowSkipIfPassing: true });
    if (!passed) return;

    try {
      await surveyor.tracking.start();
      surveyor.surveyStarted = true;
      surveyor.routeStartTs = Date.now();
    } catch (err) {
      console.error('[SurveyorTracker] Start failed:', err);
      alert(tt('Could not start tracking: ', 'לא ניתן להתחיל מעקב: ') + err.message);
    }
  });

  document.getElementById('svPauseBtn')?.addEventListener('click', () => {
    if (surveyor.state.isPaused) {
      surveyor.tracking.resume?.();
      document.getElementById('svPauseLabel').textContent = tt('⏸ Pause', '⏸ השהה');
    } else {
      surveyor.tracking.pause?.();
      document.getElementById('svPauseLabel').textContent = tt('▶ Resume', '▶ המשך');
    }
  });

  document.getElementById('svStopBtn')?.addEventListener('click', async () => {
    const result = await runChecklist({ tracker: surveyor });
    if (!result?.submit) return;

    try {
      await surveyor.tracking.stop();
      // The tracker's stop() opens the consumer save prompt; the
      // checklist handler in checklist.js overrides that behaviour by
      // saving via saveSurveyorRoute() and then redirecting home.
    } catch (err) {
      console.error('[SurveyorTracker] Stop failed:', err);
    }
  });

  document.getElementById('svSurveyBtn')?.addEventListener('click', async () => {
    // Opens the shared accessibility form. Reused verbatim from consumer.
    try {
      await surveyor.accessibility.open((data) => {
        document.getElementById('svSurveyBtn')?.classList.remove('needs-attention');
      });
    } catch (err) {
      console.warn('[SurveyorTracker] Survey open failed:', err);
    }
  });
}

// ------------------------------------------------------------------
// Live top-bar stats
// ------------------------------------------------------------------
function startStatsLoop() {
  const distEl = document.getElementById('svDistance');
  const durEl = document.getElementById('svDuration');
  const accEl = document.getElementById('svAccuracy');

  window.addEventListener('positionUpdate', (e) => {
    const acc = e.detail?.accuracy;
    if (acc == null) return;
    accEl.textContent = `${acc.toFixed(0)}m`;
    accEl.className = 'sv-topbar-value ' + (
      acc <= 10 ? 'sv-topbar-value--ok'
      : acc <= 30 ? 'sv-topbar-value--warn'
      : 'sv-topbar-value--bad'
    );
  });

  setInterval(() => {
    if (!surveyor.state) return;
    distEl.textContent = surveyor.state.getTotalDistance().toFixed(2);
    const ms = surveyor.timer?.getElapsed?.() ?? surveyor.state.getElapsedTime() ?? 0;
    durEl.textContent = formatDuration(ms);
  }, 500);
}

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n) => n.toString().padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${pad(m)}:${pad(sec)}`;
}

// ------------------------------------------------------------------
// Translate the small set of static labels we baked into the HTML.
// (Everything dynamic uses the module's own tt() helper.)
// ------------------------------------------------------------------
function translateStaticStrings() {
  const lang = document.documentElement.lang === 'he' ? 'he' : 'en';
  document.querySelectorAll('[data-en][data-he]').forEach(el => {
    el.textContent = el.dataset[lang];
  });
}
