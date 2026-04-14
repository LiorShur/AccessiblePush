/**
 * Platform Detection Utility
 *
 * Detects whether the app is running as:
 * - PWA (in browser or installed PWA)
 * - Native Android (via Capacitor)
 * - Native iOS (via Capacitor)
 *
 * Provides unified API that uses native features when available,
 * falling back to web APIs for PWA mode.
 */

class Platform {
  constructor() {
    this._isNative = null;
    this._platform = null;
    this._capacitorReady = false;
    this._plugins = {};
  }

  /**
   * Initialize platform detection and load Capacitor if available
   */
  async initialize() {
    // Check if Capacitor is available
    if (typeof window !== 'undefined' && window.Capacitor) {
      this._isNative = window.Capacitor.isNativePlatform();
      this._platform = window.Capacitor.getPlatform();
      this._capacitorReady = true;

      if (this._isNative) {
        await this._loadNativePlugins();
        console.log(`[Platform] Running as native ${this._platform} app`);
      } else {
        console.log('[Platform] Running as web app (Capacitor available)');
      }
    } else {
      this._isNative = false;
      this._platform = 'web';
      console.log('[Platform] Running as PWA (no Capacitor)');
    }

    return this;
  }

  /**
   * Load native Capacitor plugins
   */
  async _loadNativePlugins() {
    try {
      // These will be available after `npm install` and `cap sync`
      const { Geolocation } = await import('@capacitor/geolocation');
      const { Camera } = await import('@capacitor/camera');
      const { Haptics } = await import('@capacitor/haptics');
      const { Network } = await import('@capacitor/network');
      const { App } = await import('@capacitor/app');
      const { StatusBar } = await import('@capacitor/status-bar');
      const { SplashScreen } = await import('@capacitor/splash-screen');
      const { Filesystem } = await import('@capacitor/filesystem');
      const { KeepAwake } = await import('@capacitor-community/keep-awake');

      this._plugins = {
        Geolocation,
        Camera,
        Haptics,
        Network,
        App,
        StatusBar,
        SplashScreen,
        Filesystem,
        KeepAwake
      };

      console.log('[Platform] Native plugins loaded');
    } catch (error) {
      console.warn('[Platform] Some native plugins failed to load:', error.message);
    }
  }

  // ============================================
  // Platform Detection
  // ============================================

  get isNative() {
    return this._isNative === true;
  }

  get isWeb() {
    return !this._isNative;
  }

  get isAndroid() {
    return this._platform === 'android';
  }

  get isIOS() {
    return this._platform === 'ios';
  }

  get isPWA() {
    return !this._isNative && (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  get platform() {
    return this._platform;
  }

  // ============================================
  // Unified APIs (Native + Web fallbacks)
  // ============================================

  /**
   * Vibrate with haptic feedback
   * Uses native Haptics on Capacitor, navigator.vibrate on web
   */
  async vibrate(style = 'medium') {
    if (this.isNative && this._plugins.Haptics) {
      const impactStyles = {
        light: 'LIGHT',
        medium: 'MEDIUM',
        heavy: 'HEAVY'
      };
      try {
        await this._plugins.Haptics.impact({
          style: impactStyles[style] || 'MEDIUM'
        });
      } catch (e) {
        console.warn('[Platform] Haptics failed:', e);
      }
    } else if (navigator.vibrate) {
      const durations = { light: 10, medium: 50, heavy: 100 };
      navigator.vibrate(durations[style] || 50);
    }
  }

  /**
   * Keep screen awake (for tracking)
   * Uses native KeepAwake on Capacitor, WakeLock API on web
   */
  async keepAwake(enable = true) {
    if (this.isNative && this._plugins.KeepAwake) {
      try {
        if (enable) {
          await this._plugins.KeepAwake.keepAwake();
          console.log('[Platform] Screen keep-awake enabled (native)');
        } else {
          await this._plugins.KeepAwake.allowSleep();
          console.log('[Platform] Screen keep-awake disabled (native)');
        }
        return true;
      } catch (e) {
        console.warn('[Platform] KeepAwake failed:', e);
      }
    }

    // Web fallback using Wake Lock API
    if ('wakeLock' in navigator) {
      try {
        if (enable) {
          this._wakeLock = await navigator.wakeLock.request('screen');
          console.log('[Platform] Screen keep-awake enabled (web)');
        } else if (this._wakeLock) {
          await this._wakeLock.release();
          this._wakeLock = null;
          console.log('[Platform] Screen keep-awake disabled (web)');
        }
        return true;
      } catch (e) {
        console.warn('[Platform] WakeLock failed:', e);
      }
    }

    return false;
  }

  /**
   * Get current GPS position
   * Uses native Geolocation on Capacitor, navigator.geolocation on web
   */
  async getCurrentPosition(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };
    const opts = { ...defaultOptions, ...options };

    if (this.isNative && this._plugins.Geolocation) {
      try {
        const position = await this._plugins.Geolocation.getCurrentPosition(opts);
        return {
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed
          },
          timestamp: position.timestamp
        };
      } catch (e) {
        console.warn('[Platform] Native geolocation failed:', e);
        throw e;
      }
    }

    // Web fallback
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, opts);
    });
  }

  /**
   * Watch GPS position changes
   * Returns a watch ID that can be used to clear the watch
   */
  watchPosition(successCallback, errorCallback, options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };
    const opts = { ...defaultOptions, ...options };

    if (this.isNative && this._plugins.Geolocation) {
      // Capacitor Geolocation.watchPosition returns a Promise with callback ID
      this._plugins.Geolocation.watchPosition(opts, (position, err) => {
        if (err) {
          errorCallback?.(err);
        } else if (position) {
          successCallback?.({
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              altitudeAccuracy: position.coords.altitudeAccuracy,
              heading: position.coords.heading,
              speed: position.coords.speed
            },
            timestamp: position.timestamp
          });
        }
      }).then(watchId => {
        this._geoWatchId = watchId;
      });

      return 'native';
    }

    // Web fallback
    return navigator.geolocation.watchPosition(successCallback, errorCallback, opts);
  }

  /**
   * Stop watching GPS position
   */
  async clearWatch(watchId) {
    if (this.isNative && this._plugins.Geolocation && watchId === 'native') {
      if (this._geoWatchId) {
        await this._plugins.Geolocation.clearWatch({ id: this._geoWatchId });
        this._geoWatchId = null;
      }
    } else if (watchId && watchId !== 'native') {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  /**
   * Take a photo
   * Uses native Camera on Capacitor, file input on web
   */
  async takePhoto(options = {}) {
    if (this.isNative && this._plugins.Camera) {
      const { CameraResultType, CameraSource } = await import('@capacitor/camera');
      try {
        const photo = await this._plugins.Camera.getPhoto({
          quality: options.quality || 80,
          allowEditing: false,
          resultType: CameraResultType.Uri,
          source: CameraSource.Camera,
          saveToGallery: options.saveToGallery || false
        });
        return {
          uri: photo.webPath,
          path: photo.path,
          format: photo.format
        };
      } catch (e) {
        console.warn('[Platform] Native camera failed:', e);
        throw e;
      }
    }

    // Web fallback - trigger file input
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';

      input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
          resolve({
            uri: URL.createObjectURL(file),
            file: file,
            format: file.type
          });
        } else {
          reject(new Error('No file selected'));
        }
      };

      input.click();
    });
  }

  /**
   * Check network status
   */
  async getNetworkStatus() {
    if (this.isNative && this._plugins.Network) {
      return await this._plugins.Network.getStatus();
    }

    // Web fallback
    return {
      connected: navigator.onLine,
      connectionType: navigator.onLine ? 'unknown' : 'none'
    };
  }

  /**
   * Hide splash screen (native only)
   */
  async hideSplashScreen() {
    if (this.isNative && this._plugins.SplashScreen) {
      await this._plugins.SplashScreen.hide();
    }
  }

  /**
   * Set status bar style (native only)
   */
  async setStatusBarStyle(style = 'dark') {
    if (this.isNative && this._plugins.StatusBar) {
      const { Style } = await import('@capacitor/status-bar');
      await this._plugins.StatusBar.setStyle({
        style: style === 'light' ? Style.Light : Style.Dark
      });
    }
  }

  /**
   * Listen for app state changes (foreground/background)
   */
  onAppStateChange(callback) {
    if (this.isNative && this._plugins.App) {
      this._plugins.App.addListener('appStateChange', callback);
    } else {
      // Web fallback
      document.addEventListener('visibilitychange', () => {
        callback({ isActive: !document.hidden });
      });
    }
  }

  /**
   * Get plugin directly (for advanced use)
   */
  getPlugin(name) {
    return this._plugins[name];
  }
}

// Create singleton instance
export const platform = new Platform();

// Auto-initialize
if (typeof window !== 'undefined') {
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      platform.initialize().then(() => {
        window.platform = platform;
      });
    });
  } else {
    platform.initialize().then(() => {
      window.platform = platform;
    });
  }
}

export default platform;
