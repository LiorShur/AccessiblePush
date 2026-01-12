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
    linkCopied: "Link copied to clipboard!",
    routeSaved: "Route saved successfully!",
    reportSubmitted: "Report submitted successfully!",
    profileUpdated: "Profile updated successfully",
    settingsSaved: "Settings saved",
    feedbackSent: "Thank you for your feedback!",
    trailShared: "Trail shared!",
    dataDiscarded: "Route data discarded. Starting fresh.",
    
    // Error messages
    genericError: "Something went wrong. Please try again.",
    networkError: "Network error. Check your connection.",
    saveError: "Failed to save. Please try again.",
    loadError: "Failed to load data",
    uploadError: "Upload failed. Please try again.",
    deleteError: "Failed to delete",
    locationError: "Could not get your location",
    locationDenied: "Location access denied. Please enable it in browser settings.",
    locationUnavailable: "Location unavailable. GPS signal may be weak.",
    locationTimeout: "Location request timed out. Please try again.",
    cameraError: "Could not access camera",
    cameraDenied: "Camera access denied",
    authRequired: "Please sign in to continue",
    permissionDenied: "You don't have permission for this",
    sessionExpired: "Session expired. Please sign in again.",
    fileTooLarge: "File is too large",
    invalidFileType: "Invalid file type",
    requiredField: "Please fill in all required fields",
    refreshRequired: "Please refresh the page to try again.",
    restoreFailed: "Failed to restore route. Starting fresh.",
    trackingFailed: "Failed to start tracking",
    authNotAvailable: "Auth controller not available. Please refresh the page.",
    trailNotFound: "Trail guide not found",
    trailPrivate: "This trail guide is private",
    trailContentUnavailable: "Trail guide content not available",
    trailLoadFailed: "Failed to load trail guide",
    likeFailed: "Failed to update like. Please try again.",
    
    // Warning messages
    unsavedChanges: "You have unsaved changes",
    offlineMode: "You're offline. Some features may be limited.",
    slowConnection: "Slow connection detected",
    dataLoadFailed: "Unable to load data. Check your connection.",
    someDataFailed: "Some data failed to load. Pull to refresh.",
    enterSearchTerm: "Please enter a search term",
    selectCategory: "Please select a feedback category",
    provideSummary: "Please provide a summary",
    signInToLike: "Please sign in to like trails",
    noTrailGuides: "No trail guides found. Record a trail first!",
    guideNotFound: "Guide not found",
    displayGuideFailed: "Failed to display trail guide",
    signInToViewGuides: "Please sign in first to view your trail guides",
    noGuidesCreated: "No trail guides found. Record a route in the tracker to create trail guides.",
    loadGuidesFailed: "Failed to load trail guides",
    dataRefreshed: "Data refreshed!",
    refreshFailed: "Refresh failed. Please try again.",
    
    // Info messages
    syncing: "Syncing data...",
    syncComplete: "Sync complete",
    savedLocally: "Changes saved locally",
    savedLocallyWillSync: "Feedback saved locally. Will sync when online.",
    willSyncOnline: "Will sync when online",
    processing: "Processing...",
    loading: "Loading...",
    allowLocation: "Please allow location access when prompted",
    surveyHint: "Tap the ♿ button anytime to fill the survey",
    savedLocallyCloudFailed: "Saved locally! Cloud upload failed - you can retry from Local Storage.",
    networkSavedLocally: "Network error - route saved locally. Will sync when online.",
    routeDataTooLarge: "Route data too large. Try taking fewer photos.",
    
    // Auth & Session
    sessionExpiredSignIn: "Your session has expired. Please sign in again.",
    seeYouNextTime: "See you next time! 👋",
    logoutFailed: "Logout failed. Please try again.",
    saveInProgress: "Save already in progress...",
    noRouteData: "No route data available. Record a route first, then save to cloud.",
    noValidRouteData: "No valid route data to save to cloud",
    permissionDeniedFirestore: "Permission denied. Please check your Firestore security rules.",
    storageQuotaExceeded: "Storage quota exceeded. Please contact support.",
    firebaseError: "Firebase error",
    routeLoadInvalid: "Unable to load route - invalid data",
    noCloudRoutes: "No cloud routes found. Start tracking and save your first route!",
    foundCloudRoutes: "Found cloud routes!",
    connectionSlow: "Connection slow, retrying...",
    requestTimeout: "Request timed out. Please check your internet connection and try again.",
    databaseIndexRequired: "Database index required. Please contact support.",
    loadRoutesFailed: "Failed to load routes",
    routeLoadedSuccess: "Route loaded successfully!",
    routeDeletedSuccess: "Route deleted successfully",
    deleteRouteFailed: "Failed to delete route",
    guideGeneratedSuccess: "Trail guide generated successfully!",
    guideGenerateFailed: "Failed to generate trail guide",
    guidePublic: "Trail guide is now public!",
    guidePrivate: "Trail guide is now private",
    visibilityChangeFailed: "Failed to change visibility",
    guideDeleted: "Trail guide deleted",
    guideDeleteFailed: "Failed to delete trail guide",
    
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
    linkCopied: "הקישור הועתק ללוח!",
    routeSaved: "המסלול נשמר בהצלחה!",
    reportSubmitted: "הדיווח נשלח בהצלחה!",
    profileUpdated: "הפרופיל עודכן בהצלחה",
    settingsSaved: "ההגדרות נשמרו",
    feedbackSent: "תודה על המשוב שלך!",
    trailShared: "השביל שותף!",
    dataDiscarded: "נתוני המסלול נמחקו. מתחיל מחדש.",
    
    // Error messages
    genericError: "משהו השתבש. נסה שוב.",
    networkError: "שגיאת רשת. בדוק את החיבור שלך.",
    saveError: "השמירה נכשלה. נסה שוב.",
    loadError: "טעינת הנתונים נכשלה",
    uploadError: "ההעלאה נכשלה. נסה שוב.",
    deleteError: "המחיקה נכשלה",
    locationError: "לא ניתן לקבל את המיקום שלך",
    locationDenied: "הגישה למיקום נדחתה. אנא אפשר בהגדרות הדפדפן.",
    locationUnavailable: "המיקום לא זמין. אות ה-GPS חלש.",
    locationTimeout: "בקשת המיקום פגה. נסה שוב.",
    cameraError: "לא ניתן לגשת למצלמה",
    cameraDenied: "הגישה למצלמה נדחתה",
    authRequired: "נא להתחבר כדי להמשיך",
    permissionDenied: "אין לך הרשאה לפעולה זו",
    sessionExpired: "פג תוקף ההתחברות. נא להתחבר שוב.",
    fileTooLarge: "הקובץ גדול מדי",
    invalidFileType: "סוג קובץ לא חוקי",
    requiredField: "נא למלא את כל השדות הנדרשים",
    refreshRequired: "נא לרענן את הדף ולנסות שוב.",
    restoreFailed: "שחזור המסלול נכשל. מתחיל מחדש.",
    trackingFailed: "התחלת ההקלטה נכשלה",
    authNotAvailable: "בקר האימות לא זמין. נא לרענן את הדף.",
    trailNotFound: "מדריך השביל לא נמצא",
    trailPrivate: "מדריך שביל זה הוא פרטי",
    trailContentUnavailable: "תוכן מדריך השביל לא זמין",
    trailLoadFailed: "טעינת מדריך השביל נכשלה",
    likeFailed: "עדכון הלייק נכשל. נסה שוב.",
    
    // Warning messages
    unsavedChanges: "יש לך שינויים שלא נשמרו",
    offlineMode: "אתה במצב לא מקוון. חלק מהתכונות עלולות להיות מוגבלות.",
    slowConnection: "זוהה חיבור איטי",
    dataLoadFailed: "לא ניתן לטעון נתונים. בדוק את החיבור.",
    someDataFailed: "חלק מהנתונים לא נטענו. משוך לרענון.",
    enterSearchTerm: "נא להזין מונח חיפוש",
    selectCategory: "נא לבחור קטגוריית משוב",
    provideSummary: "נא לספק תקציר",
    signInToLike: "נא להתחבר כדי לסמן לייק לשבילים",
    noTrailGuides: "לא נמצאו מדריכי שבילים. הקלט שביל קודם!",
    guideNotFound: "המדריך לא נמצא",
    displayGuideFailed: "הצגת מדריך השביל נכשלה",
    signInToViewGuides: "נא להתחבר כדי לצפות במדריכי השבילים שלך",
    noGuidesCreated: "לא נמצאו מדריכי שבילים. הקלט מסלול כדי ליצור מדריכים.",
    loadGuidesFailed: "טעינת מדריכי השבילים נכשלה",
    dataRefreshed: "הנתונים רועננו!",
    refreshFailed: "הרענון נכשל. נסה שוב.",
    
    // Info messages
    syncing: "מסנכרן נתונים...",
    syncComplete: "הסנכרון הושלם",
    savedLocally: "השינויים נשמרו מקומית",
    savedLocallyWillSync: "המשוב נשמר מקומית. יסונכרן כשתהיה מקוון.",
    willSyncOnline: "יסונכרן כשתהיה מקוון",
    processing: "מעבד...",
    loading: "טוען...",
    allowLocation: "נא לאשר גישה למיקום כשתתבקש",
    surveyHint: "לחץ על כפתור ♿ בכל עת למילוי הסקר",
    savedLocallyCloudFailed: "נשמר מקומית! העלאה לענן נכשלה - ניתן לנסות שוב מאחסון מקומי.",
    networkSavedLocally: "שגיאת רשת - המסלול נשמר מקומית. יסונכרן כשתהיה מקוון.",
    routeDataTooLarge: "נתוני המסלול גדולים מדי. נסה לצלם פחות תמונות.",
    
    // Auth & Session
    sessionExpiredSignIn: "פג תוקף ההתחברות. נא להתחבר שוב.",
    seeYouNextTime: "להתראות! 👋",
    logoutFailed: "ההתנתקות נכשלה. נסה שוב.",
    saveInProgress: "שמירה בתהליך...",
    noRouteData: "אין נתוני מסלול זמינים. הקלט מסלול קודם, ואז שמור לענן.",
    noValidRouteData: "אין נתוני מסלול תקינים לשמירה בענן",
    permissionDeniedFirestore: "הגישה נדחתה. בדוק את הרשאות Firestore.",
    storageQuotaExceeded: "מכסת האחסון מלאה. פנה לתמיכה.",
    firebaseError: "שגיאת Firebase",
    routeLoadInvalid: "לא ניתן לטעון מסלול - נתונים לא תקינים",
    noCloudRoutes: "לא נמצאו מסלולים בענן. התחל להקליט ושמור את המסלול הראשון!",
    foundCloudRoutes: "נמצאו מסלולים בענן!",
    connectionSlow: "חיבור איטי, מנסה שוב...",
    requestTimeout: "הבקשה פגה. בדוק את חיבור האינטרנט ונסה שוב.",
    databaseIndexRequired: "נדרש אינדקס מסד נתונים. פנה לתמיכה.",
    loadRoutesFailed: "טעינת המסלולים נכשלה",
    routeLoadedSuccess: "המסלול נטען בהצלחה!",
    routeDeletedSuccess: "המסלול נמחק בהצלחה",
    deleteRouteFailed: "מחיקת המסלול נכשלה",
    guideGeneratedSuccess: "מדריך השביל נוצר בהצלחה!",
    guideGenerateFailed: "יצירת מדריך השביל נכשלה",
    guidePublic: "מדריך השביל כעת ציבורי!",
    guidePrivate: "מדריך השביל כעת פרטי",
    visibilityChangeFailed: "שינוי הנראות נכשל",
    guideDeleted: "מדריך השביל נמחק",
    guideDeleteFailed: "מחיקת מדריך השביל נכשלה",
    
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