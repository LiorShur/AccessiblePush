/**
 * Version Manager
 * Automatically detects and notifies users of app updates
 * Handles cache busting and update notifications
 */

// Current app version - INCREMENT THIS WITH EACH UPDATE
const APP_VERSION = '1.2.7';
const VERSION_KEY = 'accessNature_appVersion';
const LAST_CHECK_KEY = 'accessNature_lastVersionCheck';

class VersionManager {
  constructor() {
    this.currentVersion = APP_VERSION;
    this.previousVersion = null;
    this.updateInfo = null;
  }

  /**
   * Initialize version manager - call on app startup
   */
  init() {
    this.previousVersion = localStorage.getItem(VERSION_KEY);

    console.log(`[Version] Current: ${this.currentVersion}, Previous: ${this.previousVersion || 'none'}`);

    // Check if this is a new version
    if (this.previousVersion && this.previousVersion !== this.currentVersion) {
      this.handleVersionUpdate();
    } else if (!this.previousVersion) {
      // First time user
      console.log('[Version] First time user, setting version');
      this.saveVersion();
    }

    // Always save current version
    this.saveVersion();

    // Add version to window for debugging
    window.APP_VERSION = this.currentVersion;

    return this;
  }

  /**
   * Save current version to localStorage
   */
  saveVersion() {
    localStorage.setItem(VERSION_KEY, this.currentVersion);
    localStorage.setItem(LAST_CHECK_KEY, Date.now().toString());
  }

  /**
   * Handle version update - show notification
   */
  handleVersionUpdate() {
    console.log(`[Version] 🎉 Updated from ${this.previousVersion} to ${this.currentVersion}`);

    // Get changelog for this version
    const changelog = this.getChangelog(this.currentVersion);

    // Show update notification after a short delay (let app initialize first)
    setTimeout(() => {
      this.showUpdateNotification(changelog);
    }, 1500);
  }

  /**
   * Get changelog for a specific version
   */
  getChangelog(version) {
    const changelogs = {
      '1.2.7': {
        title: 'Mobile Console Fix',
        changes: [
          '🐛 Fixed mobile console toggle button',
          '🔧 Fixed Copy/Clear/Close buttons in console'
        ]
      },
      '1.2.6': {
        title: 'Critical Bug Fix',
        changes: [
          '🔧 Fixed mobile console initialization error',
          '🗺️ Map now loads correctly',
          '📋 Added version update notifications'
        ]
      },
      '1.2.5': {
        title: 'Debug & Mobile Tools',
        changes: [
          '🐛 Added mobile console for debugging',
          '📍 Fixed POI elements saving to cloud',
          '🗺️ Improved marker clustering diagnostics',
          '🔧 Added debug logging for troubleshooting'
        ]
      },
      '1.2.4': {
        title: 'Marker & Clustering Fixes',
        changes: [
          '🗺️ Fixed marker clustering for loaded routes',
          '📍 POI elements now load from database',
          '🧹 Markers clear properly after save/discard'
        ]
      },
      '1.2.3': {
        title: 'Trail Guide Improvements',
        changes: [
          '🗺️ Added marker clustering to trail guides',
          '📱 Fixed toggle markers in trail guide maps'
        ]
      }
    };

    return changelogs[version] || {
      title: 'Update Available',
      changes: ['Bug fixes and improvements']
    };
  }

  /**
   * Show update notification UI
   */
  showUpdateNotification(changelog) {
    // Create notification element
    const notification = document.createElement('div');
    notification.id = 'versionUpdateNotification';
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #1a1a2e 0%, #252540 100%);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 100000;
      max-width: 90vw;
      width: 340px;
      border: 1px solid #4CAF50;
      animation: slideDown 0.3s ease-out;
    `;

    notification.innerHTML = `
      <style>
        @keyframes slideDown {
          from { transform: translateX(-50%) translateY(-100%); opacity: 0; }
          to { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        #versionUpdateNotification ul {
          margin: 8px 0 0 0;
          padding-left: 20px;
          font-size: 13px;
          color: #ccc;
        }
        #versionUpdateNotification li {
          margin: 4px 0;
        }
      </style>
      <div style="display: flex; justify-content: space-between; align-items: flex-start;">
        <div>
          <div style="font-size: 11px; color: #4CAF50; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
            🎉 Updated to v${this.currentVersion}
          </div>
          <div style="font-weight: bold; font-size: 15px; margin-bottom: 4px;">
            ${changelog.title}
          </div>
        </div>
        <button onclick="this.parentElement.parentElement.remove()" style="
          background: none;
          border: none;
          color: #888;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          line-height: 1;
        ">×</button>
      </div>
      <ul>
        ${changelog.changes.map(c => `<li>${c}</li>`).join('')}
      </ul>
      <div style="margin-top: 12px; display: flex; gap: 8px;">
        <button onclick="location.reload()" style="
          flex: 1;
          padding: 8px 12px;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
        ">Refresh for Latest</button>
        <button onclick="this.parentElement.parentElement.remove()" style="
          padding: 8px 12px;
          background: #333;
          color: #ccc;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          cursor: pointer;
        ">Dismiss</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-dismiss after 15 seconds
    setTimeout(() => {
      if (document.getElementById('versionUpdateNotification')) {
        notification.style.animation = 'slideDown 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
      }
    }, 15000);
  }

  /**
   * Force clear cache and reload
   */
  async forceUpdate() {
    console.log('[Version] Force updating...');

    // Clear caches if available
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('[Version] Caches cleared');
    }

    // Clear localStorage version to trigger update notification
    localStorage.removeItem(VERSION_KEY);

    // Hard reload
    window.location.reload(true);
  }

  /**
   * Get version info for display
   */
  getVersionInfo() {
    return {
      current: this.currentVersion,
      previous: this.previousVersion,
      isNewVersion: this.previousVersion && this.previousVersion !== this.currentVersion
    };
  }

  /**
   * Manually show version info
   */
  showVersionInfo() {
    const changelog = this.getChangelog(this.currentVersion);
    this.showUpdateNotification(changelog);
  }
}

// Create singleton
const versionManager = new VersionManager();

// Export
export { versionManager, APP_VERSION };
export default versionManager;
