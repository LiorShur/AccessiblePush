/**
 * Consumer-tracker surveyor adapter.
 *
 * Loaded on tracker.html when the URL carries ?surveyor=1. Everything
 * this module does is additive — the base tracker keeps working for
 * regular users; surveyor mode just layers on top:
 *
 *   1. Auth + whitelist gate; bounces to surveyor.html on failure
 *   2. Slim "Surveyor mode • Back to home" banner
 *   3. Pre-flight modal before tracking starts
 *   4. Reviewer checklist replaces the default Save prompt
 *   5. Successful save redirects to surveyor.html (via checklist)
 *
 * The consumer "sign up for cloud sync" upsell is already skipped for
 * signed-in users, so surveyors (always signed in) don't see it.
 */

import { auth, db } from '../../firebase-setup.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

import { runPreflight } from './preflight.js';
import { runChecklist } from './checklist.js';

const HOME_URL = 'surveyor.html';

// Guard — only run in surveyor mode
if (!new URLSearchParams(location.search).has('surveyor')) {
  console.log('[SurveyorAdapter] Skipped — ?surveyor=1 flag not present');
} else {
  injectSurveyorStyles();
  boot().catch(err => console.error('[SurveyorAdapter] Boot failed:', err));
}

/**
 * The pre-flight and checklist modals rely on surveyor.css +
 * surveyor-tracker.css — those aren't loaded by tracker.html normally,
 * so we pull them in on-demand. Uses <link rel="stylesheet"> so the
 * browser caches them and RTL/base rules apply consistently.
 */
function injectSurveyorStyles() {
  const sheets = ['src/css/surveyor.css', 'src/css/surveyor-tracker.css'];
  sheets.forEach((href) => {
    if (document.querySelector(`link[data-sv-css="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.dataset.svCss = href;
    document.head.appendChild(link);
  });
}

let surveyorProfile = null;
let uiPatched = false;

async function boot() {
  // Wait for Firebase Auth to resolve, then verify the whitelist.
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      // Not signed in — kick back to the surveyor landing which handles auth.
      console.log('[SurveyorAdapter] No user — redirecting to home');
      location.replace(HOME_URL);
      return;
    }
    try {
      const snap = await getDoc(doc(db, 'surveyors', user.email.toLowerCase()));
      if (!snap.exists() || snap.data().active === false) {
        alert(document.documentElement.lang === 'he'
          ? 'החשבון הזה לא רשום כסוקר.'
          : 'This account is not registered as a surveyor.');
        location.replace(HOME_URL);
        return;
      }
      surveyorProfile = {
        ...snap.data(),
        email: user.email,
        uid: user.uid,
        displayName: user.displayName,
      };
      window.__surveyorProfile = surveyorProfile;
      console.log('[SurveyorAdapter] Surveyor authenticated:', surveyorProfile.email);

      installBanner();
      await waitForApp();
      patchTracker();
    } catch (err) {
      console.error('[SurveyorAdapter] Whitelist lookup failed:', err);
      location.replace(HOME_URL);
    }
  });
}

// ------------------------------------------------------------------
// UI: banner
// ------------------------------------------------------------------
function installBanner() {
  if (document.getElementById('svModeBanner')) return;

  const isHe = document.documentElement.lang === 'he';
  const banner = document.createElement('div');
  banner.id = 'svModeBanner';
  banner.innerHTML = `
    <span>✅ ${isHe ? 'מצב סוקר' : 'Surveyor mode'}</span>
    <a href="${HOME_URL}">← ${isHe ? 'חזרה לבית' : 'Back to home'}</a>
  `;
  document.body.appendChild(banner);

  const style = document.createElement('style');
  style.textContent = `
    #svModeBanner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #0f3d1e 0%, #4a7c59 100%);
      color: #eaf3ee;
      padding: calc(env(safe-area-inset-top, 0px) + 6px) 14px 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.85rem;
      font-weight: 600;
      z-index: 100000;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }
    #svModeBanner a {
      color: #ffffff;
      text-decoration: underline;
      font-size: 0.82rem;
    }
    /* Push existing top-of-page controls down so the banner doesn't
       overlap them. If your tracker top toolbar uses a different id,
       add it here. */
    body:has(#svModeBanner) #topToolbar,
    body:has(#svModeBanner) #secondRowControls {
      transform: translateY(28px);
    }
    /* Hide banner in fullscreen tracking mode to preserve vertical space */
    body.fullscreen-mode #svModeBanner { display: none; }
  `;
  document.head.appendChild(style);
}

// ------------------------------------------------------------------
// Controller patching
// ------------------------------------------------------------------

function waitForApp() {
  return new Promise((resolve) => {
    const check = () => {
      const app = window.AccessNatureApp;
      if (app?.controllers?.tracking && app?.controllers?.state) {
        resolve();
      } else {
        setTimeout(check, 100);
      }
    };
    check();
  });
}

function patchTracker() {
  if (uiPatched) return;
  uiPatched = true;

  const tracking = window.AccessNatureApp.controllers.tracking;
  const state = window.AccessNatureApp.controllers.state;
  const trackerCtx = { profile: surveyorProfile, state };

  // --- Pre-flight before Start ---------------------------------------
  const origStart = tracking.start.bind(tracking);
  tracking.start = async function (...args) {
    console.log('[SurveyorAdapter] Running pre-flight before start');
    const passed = await runPreflight({ tracker: trackerCtx });
    if (!passed) {
      console.log('[SurveyorAdapter] Pre-flight not passed / cancelled');
      return false;
    }
    return origStart(...args);
  };

  // --- Checklist replaces default Save prompt ------------------------
  tracking.promptForSave = async function () {
    const routeData = state.getRouteData();
    if (!routeData || routeData.length === 0) {
      console.log('[SurveyorAdapter] No route data — nothing to save');
      return;
    }
    console.log('[SurveyorAdapter] Running reviewer checklist');
    const result = await runChecklist({ tracker: trackerCtx });
    if (!result?.submit) {
      console.log('[SurveyorAdapter] User cancelled checklist — route still in memory');
    }
    // On submit, checklist saves + redirects to surveyor.html itself.
  };

  console.log('[SurveyorAdapter] Tracker patched for surveyor mode');
}
