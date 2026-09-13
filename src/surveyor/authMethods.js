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
 * Lazily register / access the native Firebase Auth plugin. Returns
 * the plugin object or null if not available (which is fine — we
 * fall back to the web path).
 */
function getNativeAuthPlugin() {
  const cap = window.Capacitor;
  if (!cap) return null;
  // First try the already-registered Plugins map.
  if (cap.Plugins?.FirebaseAuthentication) return cap.Plugins.FirebaseAuthentication;
  // Otherwise register on demand.
  if (typeof cap.registerPlugin === 'function') {
    try { return cap.registerPlugin('FirebaseAuthentication'); }
    catch (_) { return null; }
  }
  return null;
}

// -------------------------------------------------------------
// Google
// -------------------------------------------------------------

export async function signInWithGoogleUnified() {
  if (isNativeCapacitor()) {
    const plugin = getNativeAuthPlugin();
    if (!plugin) throw new Error('Native Firebase Auth plugin unavailable');
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
    const plugin = getNativeAuthPlugin();
    if (!plugin) throw new Error('Native Firebase Auth plugin unavailable');
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
  const plugin = getNativeAuthPlugin();
  if (!plugin) return;
  try { await plugin.signOut(); } catch (_) { /* non-fatal */ }
}
