/**
 * Dev Tools - Access Nature App
 *
 * Dev tools are accessed via More Options modal > DEV TOOLS section.
 * This file is kept for backwards compatibility and console access.
 *
 * Available tools (via More Options modal):
 * - Mobile Console (🐛)
 * - Route Recovery (🔧)
 * - Storage Monitor (🧪)
 * - Reset App (🔄)
 *
 * Console access:
 *   window.openMobileDebugger()
 *   window.openRouteRecovery()
 *   window.showStorageMonitor()
 */

class DevTools {
  constructor() {
    // No floating toolbar - all tools accessed via More Options modal
  }

  /**
   * Open mobile debugger console
   */
  async openDebugger() {
    try {
      const { mobileDebugger } = await import('./mobileDebugger.js');
      mobileDebugger.toggle();
    } catch (e) {
      console.error('Failed to load mobile debugger:', e);
    }
  }

  /**
   * Open route recovery panel
   */
  async openRecovery() {
    try {
      const { routeRecovery } = await import('./routeRecovery.js');
      routeRecovery.showPanel();
    } catch (e) {
      console.error('Failed to load route recovery:', e);
    }
  }

  /**
   * Legacy methods - kept for backwards compatibility
   * These no longer show a floating toolbar
   */
  show() {
    console.log('ℹ️ Dev tools are now in More Options modal > DEV TOOLS section');
  }

  hide() {
    // No-op - no toolbar to hide
  }

  toggle() {
    console.log('ℹ️ Dev tools are now in More Options modal > DEV TOOLS section');
  }
}

// Create and export singleton
export const devTools = new DevTools();

// Expose to window for console access
if (typeof window !== 'undefined') {
  window.devTools = devTools;
  console.log('🛠️ Dev tools available via More Options modal > DEV TOOLS');
}

export default devTools;
