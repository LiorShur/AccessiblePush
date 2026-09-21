/**
 * Native Permissions Handler
 * Requests necessary permissions on app startup for Capacitor native apps
 */

export async function requestNativePermissions() {
  // Only run on native platforms
  if (!window.Capacitor?.isNativePlatform()) {
    console.log('[Permissions] Running as web app, using browser permissions');
    return true;
  }

  console.log('[Permissions] Running as native app, requesting permissions...');

  try {
    // Access the native plugin via Capacitor.registerPlugin instead of
    // ES module import — this project isn't bundled, so bare npm names
    // like '@capacitor/geolocation' can't resolve as module specifiers.
    const Geolocation = window.Capacitor.Plugins?.Geolocation
      || window.Capacitor.registerPlugin('Geolocation');
    if (!Geolocation) {
      throw new Error('Geolocation plugin not registered');
    }

    // Install a shim so any code using navigator.geolocation on native
    // routes through the Capacitor plugin. WKWebView on iOS does NOT
    // honour the web geolocation API by default, so this fixes tracking.
    installGeolocationShim(Geolocation);

    // Check current permission status
    const status = await Geolocation.checkPermissions();
    console.log('[Permissions] Current location status:', status.location);

    if (status.location === 'granted') {
      console.log('[Permissions] Location already granted');
      return true;
    }

    if (status.location === 'denied') {
      console.log('[Permissions] Location denied - user must enable in settings');
      showPermissionDialog();
      return false;
    }

    // Request permission
    console.log('[Permissions] Requesting location permission...');
    const result = await Geolocation.requestPermissions();
    console.log('[Permissions] Permission result:', result.location);

    if (result.location === 'granted') {
      console.log('[Permissions] Location permission granted!');
      return true;
    } else {
      console.log('[Permissions] Location permission denied');
      showPermissionDialog();
      return false;
    }

  } catch (error) {
    console.error('[Permissions] Error requesting permissions:', error);
    return false;
  }
}

/**
 * Show dialog explaining how to enable permissions
 */
function showPermissionDialog() {
  const dialog = document.createElement('div');
  dialog.id = 'permission-dialog';
  dialog.style.cssText = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100000;
    padding: 20px;
  `;

  dialog.innerHTML = `
    <div style="
      background: #1a1a1a;
      border-radius: 16px;
      padding: 24px;
      max-width: 320px;
      text-align: center;
      color: white;
    ">
      <div style="font-size: 48px; margin-bottom: 16px;">📍</div>
      <h2 style="margin: 0 0 12px; font-size: 20px;">Location Permission Required</h2>
      <p style="margin: 0 0 20px; color: #aaa; font-size: 14px; line-height: 1.5;">
        Access Nature needs location access to track your trails and show your position on the map.
      </p>
      <p style="margin: 0 0 20px; color: #888; font-size: 13px;">
        Please enable location in:<br>
        <strong>Settings → Apps → Access Nature → Permissions → Location</strong>
      </p>
      <button onclick="this.closest('#permission-dialog').remove()" style="
        background: #4CAF50;
        color: white;
        border: none;
        padding: 12px 32px;
        border-radius: 8px;
        font-size: 16px;
        cursor: pointer;
      ">OK</button>
    </div>
  `;

  document.body.appendChild(dialog);
}

/**
 * Initialize permissions on app load
 */
export async function initializePermissions() {
  if (window.Capacitor?.isNativePlatform()) {
    // Wait a moment for app to fully load
    setTimeout(async () => {
      await requestNativePermissions();
    }, 1000);
  }
}

// Auto-initialize
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePermissions);
  } else {
    initializePermissions();
  }
}

// ------------------------------------------------------------------
// WKWebView geolocation shim — routes navigator.geolocation calls
// through the native Capacitor Geolocation plugin. Only installed on
// native Capacitor. Idempotent.
// ------------------------------------------------------------------
function installGeolocationShim(Geolocation) {
  if (!Geolocation || window.__svGeoShimInstalled) return;
  window.__svGeoShimInstalled = true;
  if (!navigator.geolocation) {
    // WKWebView may not expose navigator.geolocation at all — create it
    navigator.geolocation = /** @type {any} */ ({});
  }

  const wrapPos = (p) => ({
    coords: {
      latitude: p.coords?.latitude,
      longitude: p.coords?.longitude,
      accuracy: p.coords?.accuracy,
      altitude: p.coords?.altitude,
      altitudeAccuracy: p.coords?.altitudeAccuracy,
      heading: p.coords?.heading,
      speed: p.coords?.speed,
    },
    timestamp: p.timestamp || Date.now(),
  });

  navigator.geolocation.getCurrentPosition = function (success, error, options) {
    // Wrap in Promise.resolve so it works whether the plugin returns a
    // real Promise (iOS) or a synchronous value (some Android builds).
    Promise.resolve(Geolocation.getCurrentPosition({
      enableHighAccuracy: options?.enableHighAccuracy ?? true,
      timeout: options?.timeout ?? 15000,
      maximumAge: options?.maximumAge ?? 0,
    }))
      .then(pos => success && success(wrapPos(pos)))
      .catch(err => error && error({ code: 2, message: err?.message || 'position unavailable' }));
  };

  // watchPosition returns a watch id (string on native). We track a
  // mapping to satisfy the clearWatch API even though the plugin's
  // watch id isn't numeric.
  const watchIds = new Map();
  let seq = 1;
  navigator.geolocation.watchPosition = function (success, error, options) {
    const id = seq++;
    // The plugin's watchPosition MAY return a Promise<string> (iOS +
    // recent Android) OR fire the callback without returning a
    // thenable (older Android builds and some webviews). Wrap the
    // return value in Promise.resolve so we can always chain safely.
    const watchReturn = Geolocation.watchPosition({
      enableHighAccuracy: options?.enableHighAccuracy ?? true,
      timeout: options?.timeout ?? 30000,
      maximumAge: options?.maximumAge ?? 5000,
    }, (pos, err) => {
      if (err) {
        error && error({ code: 2, message: err?.message || 'position unavailable' });
        return;
      }
      success && success(wrapPos(pos));
    });
    Promise.resolve(watchReturn)
      .then(nativeId => {
        if (nativeId) watchIds.set(id, nativeId);
      })
      .catch(err => {
        error && error({ code: 2, message: err?.message || 'watch failed' });
      });
    return id;
  };

  navigator.geolocation.clearWatch = function (id) {
    const nativeId = watchIds.get(id);
    if (nativeId) {
      Geolocation.clearWatch({ id: nativeId }).catch(() => {});
      watchIds.delete(id);
    }
  };

  console.log('[Permissions] Native geolocation shim installed');
}
