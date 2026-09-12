/**
 * Access Nature Surveyor — entry point
 *
 * Boots the surveyor app. Responsible for:
 *   1. Auth resolution (via Firebase Auth)
 *   2. Whitelist gate (Firestore 'surveyors' collection, docs keyed by email)
 *   3. Routing to sign-in / access-denied / home
 *
 * The consumer app is untouched; nothing here imports from src/main.js.
 * Shared services (auth, firestore, offlineSync) come from firebase-setup.js.
 */

import { auth, db } from '../../firebase-setup.js';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

import { renderHome } from './home.js';

const bootEl = document.getElementById('svBoot');
const appEl = document.getElementById('svApp');

/**
 * Simple i18n: returns Hebrew if the app language is Hebrew, English otherwise.
 * The surveyor UI is deliberately small enough that we can inline strings.
 */
export function tt(en, he) {
  const lang = document.documentElement.lang;
  return lang === 'he' ? he : en;
}

/**
 * Look up the signed-in user in the whitelist. A user is allowed if a document
 * exists at /surveyors/<lowercased-email> and its `active` field is not false.
 * The doc can also carry {name, role, assignedRegion} for later features.
 */
async function checkWhitelist(user) {
  if (!user?.email) return { allowed: false };
  try {
    const ref = doc(db, 'surveyors', user.email.toLowerCase());
    const snap = await getDoc(ref);
    if (!snap.exists()) return { allowed: false, reason: 'not-listed' };
    const data = snap.data();
    if (data.active === false) return { allowed: false, reason: 'deactivated' };
    return { allowed: true, profile: { ...data, email: user.email, uid: user.uid } };
  } catch (err) {
    console.error('[Surveyor] Whitelist lookup failed:', err);
    return { allowed: false, reason: 'lookup-failed', error: err.message };
  }
}

function showBoot() {
  bootEl?.classList.remove('hidden');
  if (appEl) appEl.hidden = true;
}

function showApp(html) {
  bootEl?.classList.add('hidden');
  if (appEl) {
    appEl.hidden = false;
    appEl.innerHTML = html;
  }
}

/**
 * Sign-in gate — prompts the volunteer to sign in with Google.
 * Google is the only supported provider for the surveyor app because the
 * whitelist is keyed by verified email.
 */
function renderSignIn() {
  showApp(`
    <div class="sv-app centered">
      <div class="sv-gate">
        <div class="sv-gate-icon">🔐</div>
        <h2>${tt('Sign in required', 'נדרשת התחברות')}</h2>
        <p>${tt('This tool is for trained volunteer surveyors.', 'הכלי הזה מיועד לסוקרי שבילים מוסמכים.')}</p>
        <button class="sv-btn sv-btn-primary" id="svSignInBtn">
          <span>${tt('Sign in with Google', 'התחבר עם Google')}</span>
        </button>
      </div>
    </div>
  `);
  document.getElementById('svSignInBtn')?.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    // In wrapped WebViews (Capacitor iOS/Android), signInWithPopup fails
    // with auth/argument-error or auth/operation-not-supported. Detect
    // that early and use redirect flow instead.
    if (isWrappedWebView()) {
      try {
        await signInWithRedirect(auth, provider);
      } catch (err) {
        console.warn('[Surveyor] Redirect sign-in failed:', err);
        alert(tt('Sign-in failed: ', 'ההתחברות נכשלה: ') + err.message);
      }
      return;
    }
    // Normal browser / PWA — popup works fine
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.warn('[Surveyor] Popup sign-in failed:', err);
      // Fallback to redirect if popup somehow refuses in a non-wrapped env
      if (err.code === 'auth/popup-blocked'
          || err.code === 'auth/operation-not-supported-in-this-environment'
          || err.code === 'auth/argument-error') {
        try {
          await signInWithRedirect(auth, provider);
        } catch (err2) {
          console.warn('[Surveyor] Redirect fallback also failed:', err2);
          alert(tt('Sign-in failed: ', 'ההתחברות נכשלה: ') + err2.message);
        }
      } else {
        alert(tt('Sign-in failed: ', 'ההתחברות נכשלה: ') + err.message);
      }
    }
  });
}

function isWrappedWebView() {
  return !!window.Capacitor
    || / Capacitor\//.test(navigator.userAgent)
    || location.protocol === 'capacitor:';
}

function renderAccessDenied(user, reason) {
  const reasonText = reason === 'deactivated'
    ? tt('Your surveyor account is currently inactive. Please contact your coordinator.', 'חשבון הסוקר שלך כרגע לא פעיל. אנא פנה לרכז שלך.')
    : reason === 'lookup-failed'
      ? tt('Could not verify your access. Please check your connection.', 'לא ניתן לאמת את הגישה שלך. בדוק את החיבור לאינטרנט.')
      : tt('This account is not registered as a surveyor. Ask your coordinator to add you.', 'החשבון הזה לא רשום כסוקר. בקש מהרכז להוסיף אותך.');

  showApp(`
    <div class="sv-app centered">
      <div class="sv-gate">
        <div class="sv-gate-icon">🚫</div>
        <h2>${tt('Access denied', 'הגישה נדחתה')}</h2>
        <p>${reasonText}</p>
        <p style="font-size:0.85rem; opacity:0.7">${user.email}</p>
        <button class="sv-btn sv-btn-ghost" id="svSignOutBtn">
          ${tt('Sign out', 'התנתק')}
        </button>
      </div>
    </div>
  `);
  document.getElementById('svSignOutBtn')?.addEventListener('click', () => signOut(auth));
}

// Complete any pending redirect-based sign-in. This resolves the
// signInWithRedirect flow when the user comes back to the app. If no
// redirect happened, getRedirectResult returns null and we proceed
// with the normal auth flow. Errors here are non-fatal — auth listener
// still fires.
getRedirectResult(auth)
  .then((result) => {
    if (result?.user) {
      console.log('[Surveyor] Completed redirect sign-in for', result.user.email);
    }
  })
  .catch((err) => {
    console.warn('[Surveyor] Redirect-result error (non-fatal):', err?.code, err?.message);
  });

/**
 * Boot sequence — listens to Firebase auth state and routes accordingly.
 * A single onAuthStateChanged handler covers sign-in, sign-out, page refresh.
 */
onAuthStateChanged(auth, async (user) => {
  showBoot();

  if (!user) {
    renderSignIn();
    return;
  }

  const { allowed, profile, reason } = await checkWhitelist(user);
  if (!allowed) {
    renderAccessDenied(user, reason);
    return;
  }

  // All checks passed — render the home page
  window.__svUser = profile;
  renderHome(profile);
});

// Expose sign-out for the home page
export function svSignOut() { return signOut(auth); }

console.log('[Surveyor] Entry loaded');
