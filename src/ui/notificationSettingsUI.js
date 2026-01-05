/**
 * Notification Settings UI Component
 * Allows users to manage their push notification preferences
 */

import { pushNotificationService } from '../services/pushNotificationService.js';
import { auth } from '../../firebase-setup.js';
import { toast } from '../utils/toast.js';

class NotificationSettingsUI {
  constructor() {
    this.isOpen = false;
  }

  /**
   * Show notification prompt banner (non-intrusive)
   */
  async showPromptBanner() {
    // Don't show if not supported or already subscribed
    if (!pushNotificationService.isSupported) return;
    
    const status = await pushNotificationService.getSubscriptionStatus();
    if (status.subscribed) return;
    
    // Don't show if user is not logged in
    if (!auth.currentUser) return;
    
    // Don't show if dismissed recently
    const dismissed = localStorage.getItem('notif_prompt_dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (Date.now() - dismissedTime < sevenDays) return;
    }
    
    // Remove any existing banner
    document.getElementById('notif-prompt-banner')?.remove();
    
    const banner = document.createElement('div');
    banner.id = 'notif-prompt-banner';
    banner.innerHTML = `
      <style>
        #notif-prompt-banner {
          position: fixed;
          bottom: 80px;
          left: 16px;
          right: 16px;
          max-width: 400px;
          margin: 0 auto;
          background: linear-gradient(135deg, #1e3a2f, #2c5530);
          color: white;
          padding: 16px 20px;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          z-index: 9999;
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        #notif-prompt-banner .banner-content {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        #notif-prompt-banner .banner-icon {
          font-size: 28px;
          flex-shrink: 0;
        }
        #notif-prompt-banner .banner-text {
          flex: 1;
        }
        #notif-prompt-banner .banner-title {
          font-weight: 600;
          margin-bottom: 4px;
        }
        #notif-prompt-banner .banner-body {
          font-size: 0.85em;
          opacity: 0.9;
          line-height: 1.4;
        }
        #notif-prompt-banner .banner-actions {
          display: flex;
          gap: 10px;
          margin-top: 14px;
        }
        #notif-prompt-banner .btn-enable {
          flex: 1;
          background: white;
          color: #1e3a2f;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        #notif-prompt-banner .btn-enable:active {
          transform: scale(0.98);
        }
        #notif-prompt-banner .btn-later {
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
        }
        #notif-prompt-banner .btn-close {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 14px;
        }
      </style>
      <button class="btn-close" onclick="notificationSettingsUI.dismissBanner(true)">×</button>
      <div class="banner-content">
        <div class="banner-icon">🔔</div>
        <div class="banner-text">
          <div class="banner-title">Stay Updated</div>
          <div class="banner-body">Get notified about new accessible trails and app updates</div>
        </div>
      </div>
      <div class="banner-actions">
        <button class="btn-enable" onclick="notificationSettingsUI.enableFromBanner()">Enable Notifications</button>
        <button class="btn-later" onclick="notificationSettingsUI.dismissBanner(true)">Later</button>
      </div>
    `;
    
    document.body.appendChild(banner);
  }

  /**
   * Dismiss the prompt banner
   */
  dismissBanner(remember = false) {
    const banner = document.getElementById('notif-prompt-banner');
    if (banner) {
      banner.style.animation = 'slideUp 0.3s ease-out reverse';
      setTimeout(() => banner.remove(), 300);
    }
    
    if (remember) {
      localStorage.setItem('notif_prompt_dismissed', Date.now().toString());
    }
  }

  /**
   * Enable notifications from banner
   */
  async enableFromBanner() {
    this.dismissBanner(false);
    
    const result = await pushNotificationService.subscribe();
    if (result) {
      localStorage.removeItem('notif_prompt_dismissed');
    }
  }

  /**
   * Show full notification settings modal
   */
  async showSettingsModal() {
    if (this.isOpen) return;
    this.isOpen = true;
    
    const status = await pushNotificationService.getSubscriptionStatus();
    const permission = pushNotificationService.getPermissionStatus();
    
    const modal = document.createElement('div');
    modal.id = 'notif-settings-modal';
    modal.innerHTML = `
      <style>
        #notif-settings-modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        #notif-settings-modal .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 400px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          animation: scaleIn 0.2s ease-out;
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); }
          to { transform: scale(1); }
        }
        #notif-settings-modal .modal-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        #notif-settings-modal .modal-header h2 {
          margin: 0;
          font-size: 1.2em;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        #notif-settings-modal .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
          padding: 4px;
        }
        #notif-settings-modal .modal-body {
          padding: 20px;
        }
        #notif-settings-modal .status-card {
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        #notif-settings-modal .status-card.enabled {
          background: #dcfce7;
          border: 1px solid #86efac;
        }
        #notif-settings-modal .status-card.disabled {
          background: #fef3c7;
          border: 1px solid #fcd34d;
        }
        #notif-settings-modal .status-card.blocked {
          background: #fee2e2;
          border: 1px solid #fca5a5;
        }
        #notif-settings-modal .status-icon {
          font-size: 32px;
        }
        #notif-settings-modal .status-text {
          flex: 1;
        }
        #notif-settings-modal .status-title {
          font-weight: 600;
          margin-bottom: 2px;
        }
        #notif-settings-modal .status-subtitle {
          font-size: 0.85em;
          color: #6b7280;
        }
        #notif-settings-modal .toggle-btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 1em;
          cursor: pointer;
          transition: transform 0.15s;
        }
        #notif-settings-modal .toggle-btn:active {
          transform: scale(0.98);
        }
        #notif-settings-modal .toggle-btn.enable {
          background: linear-gradient(135deg, #2c5530, #1e3a2f);
          color: white;
        }
        #notif-settings-modal .toggle-btn.disable {
          background: #ef4444;
          color: white;
        }
        #notif-settings-modal .preferences {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
        #notif-settings-modal .preferences h4 {
          margin: 0 0 12px 0;
          font-size: 0.95em;
          color: #374151;
        }
        #notif-settings-modal .pref-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        #notif-settings-modal .pref-item:last-child {
          border-bottom: none;
        }
        #notif-settings-modal .pref-label {
          font-size: 0.9em;
        }
        #notif-settings-modal .pref-toggle {
          width: 48px;
          height: 26px;
          background: #d1d5db;
          border-radius: 13px;
          border: none;
          cursor: pointer;
          position: relative;
          transition: background 0.2s;
        }
        #notif-settings-modal .pref-toggle.active {
          background: #22c55e;
        }
        #notif-settings-modal .pref-toggle::after {
          content: '';
          position: absolute;
          width: 22px;
          height: 22px;
          background: white;
          border-radius: 50%;
          top: 2px;
          left: 2px;
          transition: left 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        #notif-settings-modal .pref-toggle.active::after {
          left: 24px;
        }
        #notif-settings-modal .help-text {
          margin-top: 16px;
          padding: 12px;
          background: #f9fafb;
          border-radius: 8px;
          font-size: 0.8em;
          color: #6b7280;
        }
      </style>
      <div class="modal-content">
        <div class="modal-header">
          <h2>🔔 Notifications</h2>
          <button class="modal-close" onclick="notificationSettingsUI.closeModal()">×</button>
        </div>
        <div class="modal-body">
          ${this.renderStatusCard(status, permission)}
          ${this.renderToggleButton(status, permission)}
          ${status.subscribed ? this.renderPreferences(status.preferences) : ''}
          ${this.renderHelpText(permission)}
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal();
    });
  }

  /**
   * Render status card
   */
  renderStatusCard(status, permission) {
    if (permission === 'denied') {
      return `
        <div class="status-card blocked">
          <div class="status-icon">🚫</div>
          <div class="status-text">
            <div class="status-title">Notifications Blocked</div>
            <div class="status-subtitle">Please enable in browser settings</div>
          </div>
        </div>
      `;
    }
    
    if (status.subscribed) {
      return `
        <div class="status-card enabled">
          <div class="status-icon">✅</div>
          <div class="status-text">
            <div class="status-title">Notifications Enabled</div>
            <div class="status-subtitle">You'll receive updates and alerts</div>
          </div>
        </div>
      `;
    }
    
    return `
      <div class="status-card disabled">
        <div class="status-icon">🔕</div>
        <div class="status-text">
          <div class="status-title">Notifications Disabled</div>
          <div class="status-subtitle">Enable to stay updated</div>
        </div>
      </div>
    `;
  }

  /**
   * Render toggle button
   */
  renderToggleButton(status, permission) {
    if (permission === 'denied') {
      return `
        <button class="toggle-btn enable" onclick="notificationSettingsUI.openBrowserSettings()">
          Open Browser Settings
        </button>
      `;
    }
    
    if (status.subscribed) {
      return `
        <button class="toggle-btn disable" onclick="notificationSettingsUI.toggleNotifications()">
          🔕 Disable Notifications
        </button>
      `;
    }
    
    return `
      <button class="toggle-btn enable" onclick="notificationSettingsUI.toggleNotifications()">
        🔔 Enable Notifications
      </button>
    `;
  }

  /**
   * Render preferences section
   */
  renderPreferences(preferences = {}) {
    return `
      <div class="preferences">
        <h4>Notification Types</h4>
        <div class="pref-item">
          <span class="pref-label">🗺️ New Trails</span>
          <button class="pref-toggle ${preferences.newTrails !== false ? 'active' : ''}" 
                  onclick="notificationSettingsUI.togglePreference('newTrails', this)"></button>
        </div>
        <div class="pref-item">
          <span class="pref-label">🚀 App Updates</span>
          <button class="pref-toggle ${preferences.updates !== false ? 'active' : ''}" 
                  onclick="notificationSettingsUI.togglePreference('updates', this)"></button>
        </div>
        <div class="pref-item">
          <span class="pref-label">👥 Community Activity</span>
          <button class="pref-toggle ${preferences.community !== false ? 'active' : ''}" 
                  onclick="notificationSettingsUI.togglePreference('community', this)"></button>
        </div>
      </div>
    `;
  }

  /**
   * Render help text
   */
  renderHelpText(permission) {
    if (permission === 'denied') {
      return `
        <div class="help-text">
          <strong>How to enable:</strong><br>
          1. Click the lock icon in your browser's address bar<br>
          2. Find "Notifications" and change to "Allow"<br>
          3. Refresh the page
        </div>
      `;
    }
    
    return `
      <div class="help-text">
        Notifications are sent sparingly and you can disable them anytime.
      </div>
    `;
  }

  /**
   * Close modal
   */
  closeModal() {
    const modal = document.getElementById('notif-settings-modal');
    if (modal) {
      modal.style.animation = 'fadeIn 0.2s ease-out reverse';
      setTimeout(() => modal.remove(), 200);
    }
    this.isOpen = false;
  }

  /**
   * Toggle notifications on/off
   */
  async toggleNotifications() {
    const status = await pushNotificationService.getSubscriptionStatus();
    
    if (status.subscribed) {
      const confirmed = confirm('Are you sure you want to disable notifications?');
      if (!confirmed) return;
      
      await pushNotificationService.unsubscribe();
    } else {
      await pushNotificationService.subscribe();
    }
    
    // Refresh modal
    this.closeModal();
    setTimeout(() => this.showSettingsModal(), 100);
  }

  /**
   * Toggle a specific preference
   */
  async togglePreference(prefName, button) {
    button.classList.toggle('active');
    
    const status = await pushNotificationService.getSubscriptionStatus();
    const newPreferences = {
      ...status.preferences,
      [prefName]: button.classList.contains('active')
    };
    
    await pushNotificationService.updatePreferences(newPreferences);
    toast.success('Preference updated');
  }

  /**
   * Open browser notification settings
   */
  openBrowserSettings() {
    toast.info('Look for the lock icon in your address bar to change notification settings');
    
    // Can't programmatically open browser settings, but we can guide the user
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'notifications' }).then(result => {
        console.log('Notification permission:', result.state);
      });
    }
  }
}

// Export singleton
export const notificationSettingsUI = new NotificationSettingsUI();
window.notificationSettingsUI = notificationSettingsUI;
export default notificationSettingsUI;
