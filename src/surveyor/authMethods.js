/**
 * Unified auth methods — native on wrapped Capacitor apps,
 * Firebase JS SDK (popup/redirect) on the web.
 *
 * The Firebase JS SDK's OAuth flows (signInWithPopup /
 * signInWithRedirect) don't work in Capacitor iOS's capacitor://
 * origin — Firebase throws auth/argument-error. On wrapped apps
 * we use the @capacitor-firebase/authentication plugin which runs
 * native Google Sign-In (iOS) or Sign in with Apple, gets a
 * credential, then hands it to the JS SDK via signInWithCredential
 * so onAuthStateChanged still fires as usual.
 *
 * Set `FirebaseAuthentication.skipNativeAuth = true` in
 * capacitor.config.ts so the plugin doesn't ALSO sign in on the
 * native side — the JS SDK stays the single source of truth.
 */

import {
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  OAuthProvider,
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';

import { auth } from '../../firebase-setup.js';

// -------------------------------------------------------------
// Platform detection
// -------------------------------------------------------------

function isNativeCapacitor() {
  const cap = window.Capacitor;
  if (!cap) return false;
  // Capacitor 6 exposes isNativePlatform(); older versions use
  // getPlatform() !== 'web'. Support both.
  if (typeof cap.isNativePlatform === 'function') return cap.isNativePlatform();
  if (typeof cap.getPlatform === 'function') return cap.getPlatform() !== 'web';
  return false;
}

/**
 * Lazily register / access the native Firebase Auth plugin. Throws a
 * descriptive error if the plugin isn't installed, so the UI can show
 * something more actionable than "plugin unavailable".
 */
function getNativeAuthPlugin() {
  const cap = window.Capacitor;
  if (!cap) {
    throw new Error('Capacitor bridge not found — running on plain web?');
  }
  const platform = cap.getPlatform?.() || 'unknown';

  let plugin = cap.Plugins?.FirebaseAuthentication;

  if (!plugin && typeof cap.registerPlugin === 'function') {
    try {
      plugin = cap.registerPlugin('FirebaseAuthentication');
    } catch (err) {
      throw new Error(`registerPlugin failed on ${platform}: ${err?.message || err}`);
    }
  }

  if (!plugin) {
    throw new Error(`FirebaseAuthentication plugin not registered on ${platform}`);
  }

  // Verify a method exists — otherwise the plugin proxy is dead
  // (native side didn't install the pod / gradle module).
  if (typeof plugin.signInWithGoogle !== 'function') {
    throw new Error(
      `FirebaseAuthentication native module missing on ${platform}. ` +
      `Fix: on macOS run "npx cap sync ios" (installs the pod); ` +
      `on PC run "npx cap sync android" then rebuild the APK.`
    );
  }

  return plugin;
}

// -------------------------------------------------------------
// Google
// -------------------------------------------------------------

export async function signInWithGoogleUnified() {
  if (isNativeCapacitor()) {
    const plugin = getNativeAuthPlugin(); // throws with a helpful message if missing
    // skipNativeAuth:true — plugin returns the credential without
    // touching Firebase's native side; JS SDK signs in below so its
    // onAuthStateChanged fires normally.
    const result = await plugin.signInWithGoogle({ skipNativeAuth: true });
    const idToken = result?.credential?.idToken;
    const accessToken = result?.credential?.accessToken;
    if (!idToken) throw new Error('Google sign-in did not return an ID token');
    const credential = GoogleAuthProvider.credential(idToken, accessToken);
    return signInWithCredential(auth, credential);
  }
  // Web / PWA — popup works fine here
  return signInWithPopup(auth, new GoogleAuthProvider());
}

// -------------------------------------------------------------
// Apple
// -------------------------------------------------------------

export async function signInWithAppleUnified() {
  if (isNativeCapacitor()) {
    const plugin = getNativeAuthPlugin(); // throws with a helpful message if missing
    const result = await plugin.signInWithApple({
      skipNativeAuth: true,
      scopes: ['email', 'name'],
    });
    const idToken = result?.credential?.idToken;
    const rawNonce = result?.credential?.nonce;
    if (!idToken) throw new Error('Apple sign-in did not return an ID token');
    const provider = new OAuthProvider('apple.com');
    const credential = provider.credential({ idToken, rawNonce });
    return signInWithCredential(auth, credential);
  }
  // Web / PWA
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  return signInWithPopup(auth, provider);
}

// -------------------------------------------------------------
// Sign out — also clear native side so the next tap on Google/Apple
// re-prompts the account picker instead of silently reusing the
// previous account.
// -------------------------------------------------------------

export async function nativeSignOut() {
  if (!isNativeCapacitor()) return;
  try {
    const plugin = getNativeAuthPlugin();
    await plugin.signOut();
  } catch (_) {
    // Non-fatal — the JS SDK signOut runs regardless
  }
}
