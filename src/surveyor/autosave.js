/**
 * Auto-save + idle-nudge for the surveyor tracker.
 *
 * Auto-save
 * ---------
 * Every 60 seconds while tracking, we write a snapshot of the current
 * route to IndexedDB. If the browser/OS kills the app mid-survey the
 * volunteer can recover on next launch instead of losing hours of work.
 * (The consumer app has route recovery too; we lean into the same store.)
 *
 * Idle nudge
 * ----------
 * If 5 min pass while walking (>50 m moved) with no new POI added, a
 * gentle toast asks the volunteer to consider capturing features. Toast
 * is dismissible and non-blocking. Resets when a POI is added.
 */

const AUTOSAVE_INTERVAL_MS = 60_000;
const NUDGE_INTERVAL_MS = 5 * 60_000;
const NUDGE_MIN_DISTANCE_KM = 0.05; // 50 m

let autosaveTimer = null;
let nudgeTimer = null;
let lastPoiCount = 0;
let lastNudgeDistanceKm = 0;

/**
 * Wire the auto-save and idle-nudge loops to the current surveyor session.
 * Call once after tracking starts.
 */
export function attachAutosaveAndNudge(tracker) {
  detach(); // in case of double-wire

  // Auto-save loop
  autosaveTimer = setInterval(() => saveSnapshot(tracker).catch(() => {}), AUTOSAVE_INTERVAL_MS);

  // Idle-nudge loop
  lastPoiCount = poiCount();
  lastNudgeDistanceKm = tracker.state.getTotalDistance();
  nudgeTimer = setInterval(() => maybeNudge(tracker), NUDGE_INTERVAL_MS);

  // Detach when tracking stops
  window.addEventListener('trackingStopped', detach, { once: true });
}

function detach() {
  if (autosaveTimer) { clearInterval(autosaveTimer); autosaveTimer = null; }
  if (nudgeTimer)    { clearInterval(nudgeTimer);    nudgeTimer = null; }
}

function poiCount() {
  return (window.AccessNatureApp?.controllers?.poiElements?.getElements?.() || []).length;
}

async function saveSnapshot(tracker) {
  if (!tracker?.state) return;
  const routeData = tracker.state.getRouteData();
  if (!routeData || routeData.length === 0) return;

  const snapshot = {
    surveyorId: tracker.profile.uid,
    surveyorEmail: tracker.profile.email,
    routeData,
    routeInfo: {
      totalDistance: tracker.state.getTotalDistance(),
      elapsedTime: tracker.state.getElapsedTime(),
      date: new Date().toISOString(),
    },
    poiElements: window.AccessNatureApp?.controllers?.poiElements?.getElements?.() || [],
    savedAt: Date.now(),
  };
  try {
    localStorage.setItem('sv_autosave', JSON.stringify(snapshot));
  } catch (err) {
    console.warn('[Surveyor] Autosave failed (likely quota):', err.message);
  }
}

function maybeNudge(tracker) {
  const currentDistance = tracker.state.getTotalDistance();
  const movedKm = currentDistance - lastNudgeDistanceKm;
  const currentPois = poiCount();
  const newPois = currentPois - lastPoiCount;

  if (movedKm >= NUDGE_MIN_DISTANCE_KM && newPois === 0) {
    showNudgeToast();
  }
  lastNudgeDistanceKm = currentDistance;
  lastPoiCount = currentPois;
}

function showNudgeToast() {
  const lang = document.documentElement.lang === 'he' ? 'he' : 'en';
  const msg = lang === 'he'
    ? 'עברת קטע ללא סימון — יש כאן משהו לתעד?'
    : 'You have walked a stretch without adding a POI — any features to note?';

  const el = document.createElement('div');
  el.className = 'sv-nudge-toast';
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('visible'));

  const remove = () => {
    el.classList.remove('visible');
    setTimeout(() => el.remove(), 300);
  };
  el.addEventListener('click', remove);
  setTimeout(remove, 6000);
}

/**
 * Check for a recoverable auto-saved session (called on tracker page load).
 * Only offer if the snapshot is < 24 h old and belongs to the same volunteer.
 */
export function checkForRecoverableSession(profile) {
  const raw = localStorage.getItem('sv_autosave');
  if (!raw) return null;
  try {
    const s = JSON.parse(raw);
    if (s.surveyorEmail !== profile.email) return null;
    if (Date.now() - s.savedAt > 24 * 60 * 60 * 1000) {
      localStorage.removeItem('sv_autosave');
      return null;
    }
    return s;
  } catch (_) {
    return null;
  }
}

export function clearAutosave() {
  localStorage.removeItem('sv_autosave');
}
