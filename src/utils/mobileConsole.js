/**
 * Mobile Console Utility
 * Captures and displays console output for debugging on mobile devices
 * OPTIMIZED: Only intercepts console when explicitly enabled
 */

class MobileConsole {
  constructor() {
    this.logs = [];
    this.maxLogs = 200;
    this.isVisible = false;
    this.isEnabled = false; // Console interception disabled by default
    this.panel = null;
    this.logContainer = null;
    this.badge = null;
    this.unreadCount = 0;
    this.originalConsole = {}; // Store original console methods
  }

  init() {
    // Don't create floating toggle button - access via More Options modal > DEV TOOLS
    // Console interception starts when show() is called
    console.log('[MobileConsole] Ready - access via More Options > DEV TOOLS');
  }

  createToggleButton() {
    // Create toggle button (floating)
    this.toggleBtn = document.createElement('button');
    this.toggleBtn.id = 'mobileConsoleToggle';
    this.toggleBtn.innerHTML = '🐛';
    this.toggleBtn.title = 'Toggle Console';
    this.toggleBtn.style.cssText = `
      position: fixed;
      bottom: 80px;
      right: 10px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: #1a1a2e;
      color: white;
      border: 2px solid #666;
      font-size: 20px;
      z-index: 99999;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
    `;
    this.toggleBtn.onclick = () => this.toggle();

    // Badge for unread count
    this.badge = document.createElement('span');
    this.badge.style.cssText = `
      position: absolute;
      top: -5px;
      right: -5px;
      background: #f44336;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 11px;
      display: none;
      align-items: center;
      justify-content: center;
    `;
    this.toggleBtn.appendChild(this.badge);

    document.body.appendChild(this.toggleBtn);
  }

  createPanel() {
    if (this.panel) return; // Already created

    // Create panel
    this.panel = document.createElement('div');
    this.panel.id = 'mobileConsolePanel';
    this.panel.style.cssText = `
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 50vh;
      background: #1a1a2e;
      color: #e0e0e0;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 12px;
      z-index: 99998;
      display: none;
      flex-direction: column;
      border-top: 2px solid #4CAF50;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #252540;
      border-bottom: 1px solid #333;
      flex-shrink: 0;
    `;
    header.innerHTML = `
      <span style="font-weight: bold; color: #4CAF50;">Console <span style="font-size:10px;color:#888;">(v${window.APP_VERSION || '?'})</span></span>
      <div style="display: flex; gap: 8px;">
        <button id="mcCopy" style="padding: 6px 12px; background: #2196F3; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">Copy All</button>
        <button id="mcClear" style="padding: 6px 12px; background: #ff9800; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">Clear</button>
        <button id="mcClose" style="padding: 6px 12px; background: #f44336; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer;">Close</button>
      </div>
    `;

    // Filter buttons
    const filters = document.createElement('div');
    filters.style.cssText = `
      display: flex;
      gap: 4px;
      padding: 6px 12px;
      background: #1e1e32;
      border-bottom: 1px solid #333;
      flex-shrink: 0;
      overflow-x: auto;
    `;
    filters.innerHTML = `
      <button class="mc-filter active" data-filter="all" style="padding: 4px 10px; background: #4CAF50; color: white; border: none; border-radius: 12px; font-size: 11px; cursor: pointer;">All</button>
      <button class="mc-filter" data-filter="log" style="padding: 4px 10px; background: #333; color: #aaa; border: none; border-radius: 12px; font-size: 11px; cursor: pointer;">Log</button>
      <button class="mc-filter" data-filter="warn" style="padding: 4px 10px; background: #333; color: #aaa; border: none; border-radius: 12px; font-size: 11px; cursor: pointer;">Warn</button>
      <button class="mc-filter" data-filter="error" style="padding: 4px 10px; background: #333; color: #aaa; border: none; border-radius: 12px; font-size: 11px; cursor: pointer;">Error</button>
      <button class="mc-filter" data-filter="info" style="padding: 4px 10px; background: #333; color: #aaa; border: none; border-radius: 12px; font-size: 11px; cursor: pointer;">Info</button>
    `;

    // Log container
    this.logContainer = document.createElement('div');
    this.logContainer.id = 'mobileConsoleLogs';
    this.logContainer.style.cssText = `
      flex: 1;
      overflow-y: auto;
      padding: 8px;
      -webkit-overflow-scrolling: touch;
    `;

    this.panel.appendChild(header);
    this.panel.appendChild(filters);
    this.panel.appendChild(this.logContainer);

    document.body.appendChild(this.panel);

    // Event listeners
    this.panel.querySelector('#mcCopy').onclick = () => this.copyLogs();
    this.panel.querySelector('#mcClear').onclick = () => this.clear();
    this.panel.querySelector('#mcClose').onclick = () => this.toggle();

    // Filter listeners
    this.currentFilter = 'all';
    filters.querySelectorAll('.mc-filter').forEach(btn => {
      btn.onclick = () => {
        filters.querySelectorAll('.mc-filter').forEach(b => {
          b.style.background = '#333';
          b.style.color = '#aaa';
          b.classList.remove('active');
        });
        btn.style.background = '#4CAF50';
        btn.style.color = 'white';
        btn.classList.add('active');
        this.currentFilter = btn.dataset.filter;
        this.renderLogs();
      };
    });
  }

  enableConsoleInterception() {
    if (this.isEnabled) return;

    const methods = ['log', 'warn', 'error', 'info', 'debug'];

    methods.forEach(method => {
      this.originalConsole[method] = console[method].bind(console);
      console[method] = (...args) => {
        this.addLog(method, args);
        this.originalConsole[method](...args);
      };
    });

    // Capture uncaught errors
    this.errorHandler = (e) => {
      this.addLog('error', [`Uncaught: ${e.message}`, `at ${e.filename}:${e.lineno}`]);
    };
    this.rejectionHandler = (e) => {
      this.addLog('error', [`Unhandled Promise: ${e.reason}`]);
    };

    window.addEventListener('error', this.errorHandler);
    window.addEventListener('unhandledrejection', this.rejectionHandler);

    this.isEnabled = true;
    if (this.toggleBtn) {
      this.toggleBtn.style.borderColor = '#4CAF50';
      this.toggleBtn.style.opacity = '1';
    }

    console.log('[MobileConsole] Console interception ENABLED');
  }

  disableConsoleInterception() {
    if (!this.isEnabled) return;

    // Restore original console methods
    Object.keys(this.originalConsole).forEach(method => {
      console[method] = this.originalConsole[method];
    });

    // Remove error handlers
    if (this.errorHandler) {
      window.removeEventListener('error', this.errorHandler);
    }
    if (this.rejectionHandler) {
      window.removeEventListener('unhandledrejection', this.rejectionHandler);
    }

    this.isEnabled = false;
    if (this.toggleBtn) {
      this.toggleBtn.style.borderColor = '#666';
      this.toggleBtn.style.opacity = '0.7';
    }

    console.log('[MobileConsole] Console interception DISABLED');
  }

  addLog(type, args) {
    const timestamp = new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    this.logs.push({ type, message, timestamp });

    // Trim old logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Update badge (if toggle button exists)
    if (!this.isVisible && this.badge) {
      this.unreadCount++;
      this.badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
      this.badge.style.display = 'flex';
    }

    // Render if visible
    if (this.isVisible && this.logContainer) {
      this.renderLogs();
    }
  }

  renderLogs() {
    if (!this.logContainer) return;

    const filteredLogs = this.currentFilter === 'all'
      ? this.logs
      : this.logs.filter(l => l.type === this.currentFilter);

    this.logContainer.innerHTML = filteredLogs.map(log => {
      const colors = {
        log: '#e0e0e0',
        info: '#2196F3',
        warn: '#ff9800',
        error: '#f44336',
        debug: '#9c27b0'
      };
      const bgColors = {
        error: 'rgba(244, 67, 54, 0.1)',
        warn: 'rgba(255, 152, 0, 0.1)'
      };

      return `
        <div style="
          padding: 6px 8px;
          border-bottom: 1px solid #333;
          color: ${colors[log.type] || '#e0e0e0'};
          background: ${bgColors[log.type] || 'transparent'};
          word-break: break-word;
          white-space: pre-wrap;
        ">
          <span style="color: #666; font-size: 10px;">${log.timestamp}</span>
          <span style="
            display: inline-block;
            padding: 1px 4px;
            border-radius: 3px;
            font-size: 9px;
            margin: 0 4px;
            background: ${colors[log.type]}22;
            color: ${colors[log.type]};
            text-transform: uppercase;
          ">${log.type}</span>
          <div style="margin-top: 2px;">${this.escapeHtml(log.message)}</div>
        </div>
      `;
    }).join('');

    // Scroll to bottom
    this.logContainer.scrollTop = this.logContainer.scrollHeight;
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  toggle() {
    // Create panel on first use
    if (!this.panel) {
      this.createPanel();
    }

    // Enable console interception on first open
    if (!this.isEnabled) {
      this.enableConsoleInterception();
    }

    this.isVisible = !this.isVisible;
    this.panel.style.display = this.isVisible ? 'flex' : 'none';

    if (this.isVisible) {
      this.unreadCount = 0;
      if (this.badge) {
        this.badge.style.display = 'none';
      }
      this.renderLogs();
    }
  }

  copyLogs() {
    const text = this.logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.message}`).join('\n');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Logs copied to clipboard!');
      }).catch(() => {
        this.fallbackCopy(text);
      });
    } else {
      this.fallbackCopy(text);
    }
  }

  fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.cssText = 'position: fixed; top: 0; left: 0; opacity: 0;';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999);

    try {
      document.execCommand('copy');
      this.showToast('Logs copied!');
    } catch {
      this.showSelectableModal(text);
    }

    document.body.removeChild(textarea);
  }

  showSelectableModal(text) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.9);
      z-index: 999999;
      display: flex;
      flex-direction: column;
      padding: 20px;
    `;
    modal.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
        <span style="color: white; font-weight: bold;">Select and copy manually:</span>
        <button onclick="this.parentElement.parentElement.remove()" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px;">Close</button>
      </div>
      <textarea readonly style="flex: 1; font-family: monospace; font-size: 11px; padding: 10px; background: #1a1a2e; color: #e0e0e0; border: 1px solid #333; border-radius: 4px;">${this.escapeHtml(text)}</textarea>
    `;
    document.body.appendChild(modal);
    modal.querySelector('textarea').select();
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #4CAF50;
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 999999;
      font-size: 14px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
  }

  clear() {
    this.logs = [];
    this.renderLogs();
    this.showToast('Console cleared');
  }
}

// Create singleton
const mobileConsole = new MobileConsole();

// Auto-initialize when DOM is ready (only creates button, no console interception)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => mobileConsole.init());
} else {
  mobileConsole.init();
}

export { mobileConsole };
export default mobileConsole;
