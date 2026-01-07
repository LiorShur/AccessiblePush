// ==============================================
// ACCESS NATURE - TOAST NOTIFICATION SYSTEM
// Non-blocking notifications replacing alert()
// 
// File: src/utils/toast.js
// Version: 2.1 - With i18n support
// ==============================================

/**
 * Toast translations
 */
const toastTranslations = {
  en: {
    // Success messages
    saved: "Saved successfully",
    deleted: "Deleted successfully",
    updated: "Updated successfully",
    submitted: "Submitted successfully",
    uploaded: "Uploaded successfully",
    copied: "Copied to clipboard",
    routeSaved: "Route saved successfully!",
    reportSubmitted: "Report submitted successfully!",
    profileUpdated: "Profile updated successfully",
    settingsSaved: "Settings saved",
    feedbackSent: "Thank you for your feedback!",
    
    // Error messages
    genericError: "Something went wrong. Please try again.",
    networkError: "Network error. Check your connection.",
    saveError: "Failed to save. Please try again.",
    loadError: "Failed to load data",
    uploadError: "Upload failed. Please try again.",
    deleteError: "Failed to delete",
    locationError: "Could not get your location",
    locationDenied: "Location access denied",
    cameraError: "Could not access camera",
    cameraDenied: "Camera access denied",
    authRequired: "Please sign in to continue",
    permissionDenied: "You don't have permission for this",
    sessionExpired: "Session expired. Please sign in again.",
    fileTooLarge: "File is too large",
    invalidFileType: "Invalid file type",
    requiredField: "Please fill in all required fields",
    
    // Warning messages
    unsavedChanges: "You have unsaved changes",
    offlineMode: "You're offline. Some features may be limited.",
    slowConnection: "Slow connection detected",
    
    // Info messages
    syncing: "Syncing data...",
    syncComplete: "Sync complete",
    savedLocally: "Changes saved locally",
    willSyncOnline: "Will sync when online",
    processing: "Processing...",
    loading: "Loading...",
    
    // Tracking
    trackingStarted: "Recording started",
    trackingStopped: "Recording stopped",
    trackingPaused: "Recording paused",
    trackingResumed: "Recording resumed",
    waypointAdded: "Waypoint added",
    photoAdded: "Photo added",
    noteAdded: "Note added",
    
    // Close button
    close: "Close"
  },
  he: {
    // Success messages
    saved: "נשמר בהצלחה",
    deleted: "נמחק בהצלחה",
    updated: "עודכן בהצלחה",
    submitted: "נשלח בהצלחה",
    uploaded: "הועלה בהצלחה",
    copied: "הועתק ללוח",
    routeSaved: "המסלול נשמר בהצלחה!",
    reportSubmitted: "הדיווח נשלח בהצלחה!",
    profileUpdated: "הפרופיל עודכן בהצלחה",
    settingsSaved: "ההגדרות נשמרו",
    feedbackSent: "תודה על המשוב שלך!",
    
    // Error messages
    genericError: "משהו השתבש. נסה שוב.",
    networkError: "שגיאת רשת. בדוק את החיבור שלך.",
    saveError: "השמירה נכשלה. נסה שוב.",
    loadError: "טעינת הנתונים נכשלה",
    uploadError: "ההעלאה נכשלה. נסה שוב.",
    deleteError: "המחיקה נכשלה",
    locationError: "לא ניתן לקבל את המיקום שלך",
    locationDenied: "הגישה למיקום נדחתה",
    cameraError: "לא ניתן לגשת למצלמה",
    cameraDenied: "הגישה למצלמה נדחתה",
    authRequired: "נא להתחבר כדי להמשיך",
    permissionDenied: "אין לך הרשאה לפעולה זו",
    sessionExpired: "פג תוקף ההתחברות. נא להתחבר שוב.",
    fileTooLarge: "הקובץ גדול מדי",
    invalidFileType: "סוג קובץ לא חוקי",
    requiredField: "נא למלא את כל השדות הנדרשים",
    
    // Warning messages
    unsavedChanges: "יש לך שינויים שלא נשמרו",
    offlineMode: "אתה במצב לא מקוון. חלק מהתכונות עלולות להיות מוגבלות.",
    slowConnection: "זוהה חיבור איטי",
    
    // Info messages
    syncing: "מסנכרן נתונים...",
    syncComplete: "הסנכרון הושלם",
    savedLocally: "השינויים נשמרו מקומית",
    willSyncOnline: "יסונכרן כשתהיה מקוון",
    processing: "מעבד...",
    loading: "טוען...",
    
    // Tracking
    trackingStarted: "ההקלטה התחילה",
    trackingStopped: "ההקלטה הופסקה",
    trackingPaused: "ההקלטה מושהית",
    trackingResumed: "ההקלטה ממשיכה",
    waypointAdded: "נקודת ציון נוספה",
    photoAdded: "תמונה נוספה",
    noteAdded: "הערה נוספה",
    
    // Close button
    close: "סגור"
  }
};

/**
 * Get toast translation
 */
function getToastTranslation(key) {
  const lang = localStorage.getItem('accessNature_language') || 'en';
  return toastTranslations[lang]?.[key] || toastTranslations['en']?.[key] || key;
}

class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = new Map();
    this.toastCounter = 0;
    this.initialized = false;
  }

  /**
   * Get translation helper
   */
  t(key) {
    return getToastTranslation(key);
  }

  init() {
    if (this.initialized) return;
    
    // Inject styles if not already present
    if (!document.getElementById('toast-styles')) {
      const style = document.createElement('style');
      style.id = 'toast-styles';
      style.textContent = `
        .toast-container {
          position: fixed;
          top: 80px;
          right: 16px;
          z-index: 99999;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
          max-width: 380px;
          width: calc(100% - 32px);
        }
        
        /* RTL support */
        [dir="rtl"] .toast-container {
          right: auto;
          left: 16px;
        }
        
        [dir="rtl"] .toast {
          border-left: none;
          border-right: 4px solid #6b7280;
          transform: translateX(-100%);
        }
        
        [dir="rtl"] .toast.show {
          transform: translateX(0);
        }
        
        [dir="rtl"] .toast.hide {
          transform: translateX(-100%);
        }
        
        [dir="rtl"] .toast-success { border-right-color: #10b981; }
        [dir="rtl"] .toast-error { border-right-color: #ef4444; }
        [dir="rtl"] .toast-warning { border-right-color: #f59e0b; }
        [dir="rtl"] .toast-info { border-right-color: #3b82f6; }
        
        @media (max-width: 480px) {
          .toast-container {
            top: 70px;
            left: 16px;
            right: 16px;
            max-width: none;
          }
          
          [dir="rtl"] .toast-container {
            left: 16px;
            right: 16px;
          }
        }
        
        .toast {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 14px 16px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
          border-left: 4px solid #6b7280;
          pointer-events: auto;
          opacity: 0;
          transform: translateX(100%);
          transition: all 0.3s ease;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .toast.show {
          opacity: 1;
          transform: translateX(0);
        }
        
        .toast.hide {
          opacity: 0;
          transform: translateX(100%);
        }
        
        .toast-icon {
          flex-shrink: 0;
          font-size: 20px;
          line-height: 1;
        }
        
        .toast-content {
          flex: 1;
          min-width: 0;
        }
        
        .toast-title {
          font-weight: 600;
          color: #111827;
          margin-bottom: 2px;
          font-size: 14px;
        }
        
        .toast-message {
          color: #4b5563;
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
        }
        
        .toast-close {
          flex-shrink: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          color: #9ca3af;
          font-size: 18px;
          padding: 0;
          transition: all 0.2s;
        }
        
        .toast-close:hover {
          background: #f3f4f6;
          color: #6b7280;
        }
        
        /* Toast types */
        .toast-success { border-left-color: #10b981; }
        .toast-success .toast-icon { color: #10b981; }
        
        .toast-error { border-left-color: #ef4444; }
        .toast-error .toast-icon { color: #ef4444; }
        
        .toast-warning { border-left-color: #f59e0b; }
        .toast-warning .toast-icon { color: #f59e0b; }
        
        .toast-info { border-left-color: #3b82f6; }
        .toast-info .toast-icon { color: #3b82f6; }
        
        /* Progress bar */
        .toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: #e5e7eb;
          border-radius: 0 0 12px 12px;
          overflow: hidden;
        }
        
        .toast-progress-bar {
          height: 100%;
          background: currentColor;
          animation: toast-progress linear forwards;
        }
        
        @keyframes toast-progress {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        .toast:hover .toast-progress-bar {
          animation-play-state: paused;
        }
      `;
      document.head.appendChild(style);
    }

    // Create container
    if (!document.getElementById('toast-container')) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'toast-container';
      this.container.setAttribute('aria-live', 'polite');
      document.body.appendChild(this.container);
    } else {
      this.container = document.getElementById('toast-container');
    }
    
    this.initialized = true;
  }

  show(message, type = 'info', options = {}) {
    this.init();
    
    const config = {
      title: null,
      duration: 4000,
      closable: true,
      translateKey: null, // If provided, will translate the message
      ...options
    };

    // Translate message if key provided
    const displayMessage = config.translateKey ? this.t(config.translateKey) : message;

    const toastId = `toast-${++this.toastCounter}`;
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.style.position = 'relative';

    let html = `
      <div class="toast-icon">${icons[type] || icons.info}</div>
      <div class="toast-content">
        ${config.title ? `<div class="toast-title">${this.escapeHtml(config.title)}</div>` : ''}
        <div class="toast-message">${this.escapeHtml(displayMessage)}</div>
      </div>
    `;

    if (config.closable) {
      html += `<button class="toast-close" aria-label="${this.t('close')}">×</button>`;
    }

    if (config.duration > 0) {
      html += `
        <div class="toast-progress">
          <div class="toast-progress-bar" style="animation-duration: ${config.duration}ms; color: inherit;"></div>
        </div>
      `;
    }

    toast.innerHTML = html;
    this.container.appendChild(toast);
    this.toasts.set(toastId, toast);

    // Event listeners
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.dismiss(toastId));
    }

    // Show animation
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    // Haptic feedback based on toast type
    this.triggerHaptic(type);

    // Auto dismiss
    if (config.duration > 0) {
      setTimeout(() => this.dismiss(toastId), config.duration);
    }

    return toastId;
  }
  
  /**
   * Trigger haptic feedback for toast type
   * @param {string} type - Toast type
   */
  triggerHaptic(type) {
    if (typeof window.displayPreferences?.haptic === 'function') {
      const hapticMap = {
        success: 'success',
        error: 'error',
        warning: 'warning',
        info: 'light'
      };
      window.displayPreferences.haptic(hapticMap[type] || 'light');
    } else if (navigator.vibrate) {
      // Fallback if displayPreferences not loaded
      const patterns = {
        success: [10, 50, 10],
        error: [50, 30, 50],
        warning: [20, 30, 20],
        info: [10]
      };
      try {
        navigator.vibrate(patterns[type] || patterns.info);
      } catch (e) {}
    }
  }

  dismiss(toastId) {
    const toast = this.toasts.get(toastId);
    if (!toast) return;

    toast.classList.remove('show');
    toast.classList.add('hide');

    setTimeout(() => {
      toast.remove();
      this.toasts.delete(toastId);
    }, 300);
  }

  dismissAll() {
    this.toasts.forEach((_, id) => this.dismiss(id));
  }

  // Convenience methods
  success(message, options = {}) {
    return this.show(message, 'success', options);
  }

  error(message, options = {}) {
    return this.show(message, 'error', { duration: 6000, ...options });
  }

  warning(message, options = {}) {
    return this.show(message, 'warning', { duration: 5000, ...options });
  }

  info(message, options = {}) {
    return this.show(message, 'info', options);
  }
  
  // Translated convenience methods
  successKey(key, options = {}) {
    return this.show(this.t(key), 'success', options);
  }
  
  errorKey(key, options = {}) {
    return this.show(this.t(key), 'error', { duration: 6000, ...options });
  }
  
  warningKey(key, options = {}) {
    return this.show(this.t(key), 'warning', { duration: 5000, ...options });
  }
  
  infoKey(key, options = {}) {
    return this.show(this.t(key), 'info', options);
  }

  escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Create singleton
const toastManager = new ToastManager();

// Export functions
export const toast = {
  show: (message, type, options) => toastManager.show(message, type, options),
  success: (message, options) => toastManager.success(message, options),
  error: (message, options) => toastManager.error(message, options),
  warning: (message, options) => toastManager.warning(message, options),
  info: (message, options) => toastManager.info(message, options),
  // Translated versions
  successKey: (key, options) => toastManager.successKey(key, options),
  errorKey: (key, options) => toastManager.errorKey(key, options),
  warningKey: (key, options) => toastManager.warningKey(key, options),
  infoKey: (key, options) => toastManager.infoKey(key, options),
  // Utilities
  dismiss: (id) => toastManager.dismiss(id),
  dismissAll: () => toastManager.dismissAll(),
  t: (key) => toastManager.t(key)
};

// Export translations for external use
export { toastTranslations, getToastTranslation };

// Make globally available
if (typeof window !== 'undefined') {
  window.toast = toast;
  window.getToastTranslation = getToastTranslation;
}

export default toast;