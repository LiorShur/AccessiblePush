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
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  OAuthProvider,
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
  const isIosWrapped = isWrappedIOS();

  // On iOS wrapped app, popup + redirect OAuth flows fail because the
  // origin is capacitor:// which Firebase's OAuth flow rejects. Hide
  // Google/Apple there; email/password works everywhere.
  const socialButtons = isIosWrapped ? '' : `
    <div class="sv-auth-divider"><span>${tt('or', 'או')}</span></div>
    <button type="button" class="sv-auth-oauth sv-auth-google" id="svGoogleBtn">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>${tt('Continue with Google', 'המשך עם Google')}</span>
    </button>
    <button type="button" class="sv-auth-oauth sv-auth-apple" id="svAppleBtn">
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path fill="currentColor" d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
      </svg>
      <span>${tt('Continue with Apple', 'המשך עם Apple')}</span>
    </button>
  `;

  const iosNote = isIosWrapped ? `
    <div class="sv-auth-note">
      ${tt(
        'On this iPhone app, Google / Apple sign-in are not available. Please use email &amp; password, or sign in through Safari at surveyor.html.',
        'באפליקציית iPhone זו, כניסה עם Google / Apple אינה זמינה. השתמשו באימייל וסיסמה, או היכנסו דרך Safari בכתובת surveyor.html.'
      )}
    </div>
  ` : '';

  showApp(`
    <div class="sv-app centered">
      <div class="sv-auth-card">
        <div class="sv-auth-header">
          <div class="sv-auth-icon">🌲</div>
          <h2 id="svAuthTitle">${tt('Surveyor sign in', 'התחברות סוקר')}</h2>
          <p id="svAuthSubtitle">${tt('Access Nature volunteer programme', 'תכנית מתנדבי Access Nature')}</p>
        </div>

        ${iosNote}

        <div class="sv-auth-tabs">
          <button type="button" class="sv-auth-tab active" data-mode="signin">${tt('Sign in', 'כניסה')}</button>
          <button type="button" class="sv-auth-tab" data-mode="register">${tt('Register', 'הרשמה')}</button>
        </div>

        <form id="svAuthForm" class="sv-auth-form" novalidate>
          <label class="sv-auth-field sv-auth-field-name" hidden>
            <span>${tt('Full name', 'שם מלא')}</span>
            <input type="text" id="svAuthName" autocomplete="name">
          </label>

          <label class="sv-auth-field">
            <span>${tt('Email', 'אימייל')}</span>
            <input type="email" id="svAuthEmail" autocomplete="email" required dir="ltr" placeholder="you@example.com">
          </label>

          <label class="sv-auth-field">
            <span>${tt('Password', 'סיסמה')}</span>
            <input type="password" id="svAuthPassword" autocomplete="current-password" required minlength="6" dir="ltr">
          </label>

          <div class="sv-auth-error" id="svAuthError" hidden></div>

          <button type="submit" class="sv-btn sv-btn-primary" id="svAuthSubmit">
            <span id="svAuthSubmitLabel">${tt('Sign in', 'היכנס')}</span>
          </button>

          <div class="sv-auth-links">
            <a href="#" id="svForgotLink">${tt('Forgot password?', 'שכחת סיסמה?')}</a>
          </div>
        </form>

        ${socialButtons}
      </div>
    </div>
  `);

  wireAuthGate();
}

/**
 * Wire up handlers for the sign-in gate: tab switching, form submit,
 * password reset, OAuth buttons.
 */
function wireAuthGate() {
  const form = document.getElementById('svAuthForm');
  const tabs = document.querySelectorAll('.sv-auth-tab');
  const nameField = document.querySelector('.sv-auth-field-name');
  const nameInput = document.getElementById('svAuthName');
  const emailInput = document.getElementById('svAuthEmail');
  const passwordInput = document.getElementById('svAuthPassword');
  const submitBtn = document.getElementById('svAuthSubmit');
  const submitLabel = document.getElementById('svAuthSubmitLabel');
  const errorEl = document.getElementById('svAuthError');
  const forgotLink = document.getElementById('svForgotLink');

  let mode = 'signin'; // or 'register'

  const applyMode = () => {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    nameField.hidden = (mode !== 'register');
    if (mode === 'register') {
      nameInput.required = true;
      passwordInput.autocomplete = 'new-password';
      passwordInput.setAttribute('minlength', '6');
      submitLabel.textContent = tt('Create account', 'צור חשבון');
    } else {
      nameInput.required = false;
      passwordInput.autocomplete = 'current-password';
      submitLabel.textContent = tt('Sign in', 'היכנס');
    }
    showError('');
  };

  tabs.forEach(t => t.addEventListener('click', () => {
    mode = t.dataset.mode;
    applyMode();
  }));

  const showError = (msg) => {
    errorEl.textContent = msg || '';
    errorEl.hidden = !msg;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showError('');
    const email = (emailInput.value || '').trim().toLowerCase();
    const password = passwordInput.value || '';
    const name = (nameInput.value || '').trim();

    if (!email || !password) {
      showError(tt('Enter your email and password.', 'הזינו אימייל וסיסמה.'));
      return;
    }
    if (mode === 'register' && !name) {
      showError(tt('Please enter your full name.', 'אנא הזינו שם מלא.'));
      return;
    }
    if (mode === 'register' && password.length < 6) {
      showError(tt('Password must be at least 6 characters.', 'הסיסמה חייבת להיות 6 תווים לפחות.'));
      return;
    }

    submitBtn.disabled = true;
    const originalLabel = submitLabel.textContent;
    submitLabel.textContent = tt('Please wait…', 'רק רגע…');

    try {
      if (mode === 'register') {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name && cred.user) {
          try { await updateProfile(cred.user, { displayName: name }); } catch (_) {}
        }
        // onAuthStateChanged will fire and handle whitelist check
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.warn('[Surveyor] Email auth failed:', err);
      showError(friendlyAuthError(err));
      submitBtn.disabled = false;
      submitLabel.textContent = originalLabel;
    }
  });

  forgotLink.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = (emailInput.value || '').trim().toLowerCase();
    if (!email) {
      showError(tt(
        'Enter your email above first, then tap forgot password.',
        'הזינו קודם את האימייל, ואז לחצו שכחתי סיסמה.'
      ));
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      showError('');
      alert(tt(
        'Password reset email sent. Check your inbox (and spam).',
        'אימייל לאיפוס סיסמה נשלח. בדקו את תיבת הדואר (וגם ספאם).'
      ));
    } catch (err) {
      console.warn('[Surveyor] Password reset failed:', err);
      showError(friendlyAuthError(err));
    }
  });

  const googleBtn = document.getElementById('svGoogleBtn');
  const appleBtn = document.getElementById('svAppleBtn');

  googleBtn?.addEventListener('click', () => runOAuth(new GoogleAuthProvider(), showError));
  appleBtn?.addEventListener('click', () => {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');
    runOAuth(provider, showError);
  });
}

async function runOAuth(provider, showError) {
  try {
    if (isWrappedWebView()) {
      await signInWithRedirect(auth, provider);
    } else {
      await signInWithPopup(auth, provider);
    }
  } catch (err) {
    console.warn('[Surveyor] OAuth sign-in failed:', err);
    if (err.code === 'auth/popup-closed-by-user') {
      showError(tt('Sign-in was cancelled.', 'ההתחברות בוטלה.'));
    } else if (err.code === 'auth/popup-blocked') {
      // Popup blocked → fall back to redirect
      try {
        await signInWithRedirect(auth, provider);
      } catch (err2) {
        showError(friendlyAuthError(err2));
      }
    } else {
      showError(friendlyAuthError(err));
    }
  }
}

/**
 * Map Firebase auth error codes to actionable messages the volunteer
 * can understand.
 */
function friendlyAuthError(err) {
  const code = err?.code || '';
  const map = {
    'auth/invalid-email':        [ 'Please enter a valid email address.', 'אנא הזינו כתובת אימייל תקינה.' ],
    'auth/user-not-found':       [ 'No account found with this email. Try Register.', 'לא נמצא חשבון עם אימייל זה. נסו הרשמה.' ],
    'auth/wrong-password':       [ 'Wrong password. Try again or use Forgot password.', 'סיסמה שגויה. נסו שוב או השתמשו בשכחתי סיסמה.' ],
    'auth/invalid-credential':   [ 'Wrong email or password.', 'אימייל או סיסמה שגויים.' ],
    'auth/email-already-in-use': [ 'An account with this email already exists. Try Sign in.', 'קיים כבר חשבון עם אימייל זה. נסו להיכנס.' ],
    'auth/weak-password':        [ 'Password is too short (minimum 6 characters).', 'הסיסמה קצרה מדי (מינימום 6 תווים).' ],
    'auth/network-request-failed': [ 'Network error. Check your connection and try again.', 'שגיאת רשת. בדקו את החיבור ונסו שוב.' ],
    'auth/too-many-requests':    [ 'Too many attempts. Please wait a bit and try again.', 'יותר מדי נסיונות. חכו רגע ונסו שוב.' ],
    'auth/argument-error':       [ 'Sign-in method is unavailable here. Try email &amp; password, or use Safari.', 'שיטת התחברות זו אינה זמינה כאן. נסו אימייל וסיסמה או השתמשו ב-Safari.' ],
  };
  const [en, he] = map[code] || [ err?.message || 'Something went wrong. Please try again.', err?.message || 'משהו השתבש. אנא נסו שוב.' ];
  return tt(en, he);
}

function isWrappedWebView() {
  return !!window.Capacitor
    || / Capacitor\//.test(navigator.userAgent)
    || location.protocol === 'capacitor:';
}

function isWrappedIOS() {
  if (!isWrappedWebView()) return false;
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
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
