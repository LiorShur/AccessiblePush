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
    // Import Capacitor Geolocation plugin
    const { Geolocation } = await import('@capacitor/geolocation');

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
