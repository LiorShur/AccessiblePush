/**
 * Dev Tools Launcher
 * Access Nature App
 * 
 * Adds floating buttons to access:
 * - Mobile Debugger (console logs on screen)
 * - Route Recovery (import/upload/migrate)
 * 
 * Include this script to enable dev tools on any page.
 * 
 * Usage in HTML:
 *   <script type="module" src="src/features/devTools.js"></script>
 * 
 * Or enable via console:
 *   devTools.show()
 */

class DevTools {
  constructor() {
    this.toolbar = null;
    this.isVisible = false;
  }

  /**
   * Create and show the dev tools toolbar
   */
  show() {
    if (this.toolbar) {
      this.toolbar.style.display = 'flex';
      this.isVisible = true;
      return;
    }

    const toolbar = document.createElement('div');
    toolbar.id = 'dev-tools-toolbar';
    toolbar.innerHTML = `
      <style>
        #dev-tools-toolbar {
          position: fixed;
          bottom: 70px;
          right: 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          z-index: 99997;
        }
        
        .dev-tool-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          color: #fff;
          font-size: 22px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.4);
          transition: all 0.2s;
        }
        
        .dev-tool-btn:active {
          transform: scale(0.95);
        }
        
        .dev-tool-btn.debug {
          border-color: #00d4ff;
        }
        
        .dev-tool-btn.recovery {
          border-color: #4ade80;
        }
        
        .dev-tool-btn.close {
          width: 30px;
          height: 30px;
          font-size: 14px;
          background: rgba(239, 68, 68, 0.8);
          border-color: #ef4444;
        }
        
        .dev-tool-label {
          position: absolute;
          right: 60px;
          background: rgba(0,0,0,0.8);
          color: #fff;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
          white-space: nowrap;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s;
        }
        
        .dev-tool-wrapper {
          position: relative;
        }
        
        .dev-tool-wrapper:active .dev-tool-label {
          opacity: 1;
        }
      </style>
      
      <div class="dev-tool-wrapper">
        <button class="dev-tool-btn debug" id="btn-debugger" title="Mobile Debugger">🐛</button>
        <span class="dev-tool-label">Console</span>
      </div>
      
      <div class="dev-tool-wrapper">
        <button class="dev-tool-btn recovery" id="btn-recovery" title="Route Recovery">🔧</button>
        <span class="dev-tool-label">Recovery</span>
      </div>
      
      <div class="dev-tool-wrapper">
        <button class="dev-tool-btn close" id="btn-hide-tools" title="Hide Tools">✕</button>
      </div>
    `;

    document.body.appendChild(toolbar);
    this.toolbar = toolbar;
    this.isVisible = true;

    // Setup event listeners
    document.getElementById('btn-debugger').addEventListener('click', async () => {
      try {
        const { mobileDebugger } = await import('./mobileDebugger.js');
        mobileDebugger.toggle();
      } catch (e) {
        console.error('Failed to load mobile debugger:', e);
        alert('Failed to load debugger: ' + e.message);
      }
    });

    document.getElementById('btn-recovery').addEventListener('click', async () => {
      try {
        const { routeRecovery } = await import('./routeRecovery.js');
        routeRecovery.showPanel();
      } catch (e) {
        console.error('Failed to load route recovery:', e);
        alert('Failed to load recovery: ' + e.message);
      }
    });

    document.getElementById('btn-hide-tools').addEventListener('click', () => {
      this.hide();
    });

    console.log('🛠️ Dev tools toolbar activated');
  }

  /**
   * Hide the toolbar
   */
  hide() {
    if (this.toolbar) {
      this.toolbar.style.display = 'none';
      this.isVisible = false;
    }
  }

  /**
   * Toggle visibility
   */
  toggle() {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * Add a secret gesture to show dev tools (triple tap in corner)
   */
  enableSecretGesture() {
    let tapCount = 0;
    let tapTimer = null;
    
    const cornerArea = document.createElement('div');
    cornerArea.id = 'devToolsSecretArea';
    cornerArea.style.cssText = `
      position: fixed;
      top: 60px;
      right: 0;
      width: 60px;
      height: 60px;
      z-index: 9999;
      pointer-events: auto;
    `;
    
    cornerArea.addEventListener('click', () => {
      tapCount++;
      
      if (tapTimer) clearTimeout(tapTimer);
      
      tapTimer = setTimeout(() => {
        if (tapCount >= 3) {
          this.toggle();
        }
        tapCount = 0;
      }, 500);
    });
    
    document.body.appendChild(cornerArea);
    console.log('🔓 Secret gesture enabled: triple-tap top-right corner (below toolbar)');
  }
}

// Create and export singleton
export const devTools = new DevTools();

// Expose to window for console access and More Options modal integration
if (typeof window !== 'undefined') {
  window.devTools = devTools;

  // Note: Dev tools are now accessed via More Options modal (Tools section)
  // The secret gesture area has been removed to avoid overlapping with UI elements
  // To show dev tools: window.devTools.show() or use More Options > Tools > Dev Tools

  console.log('🛠️ Dev tools available via window.devTools or More Options modal');
}

export default devTools;
