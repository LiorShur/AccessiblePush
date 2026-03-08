// Main application entry point with all modules
import { AppState } from './core/storage.js';
import { MapController } from './core/map.js';
import { TrackingController } from './core/tracking.js';
import { TimerController } from './core/timer.js';
import { NavigationController } from './ui/navigation.js';
import { CompassController } from './ui/compass.js';
import { offlineIndicator } from './ui/offlineIndicator.js';
import { loadingStates } from './ui/loadingStates.js';
import { gamificationUI } from './ui/gamificationUI.js';
import { mobilityProfileUI } from './ui/mobilityProfileUI.js';
import { announcementsUI } from './ui/announcementsUI.js';
import { topToolbarUI } from './ui/topToolbarUI.js';
import { accessibilityRating } from './features/accessibilityRating.js';
import { trailSearch } from './features/trailSearch.js';
import { AccessibilityFormV2Quick } from './features/accessibilityFormV2Quick.js';
import { trailGuideGeneratorV2 } from './features/trailGuideGeneratorV2.js';
import { MediaController } from './features/media.js';
import { ExportController } from './features/export.js';
import { FirebaseController } from './features/firebase.js';
import authController from './features/auth.js';  // Use singleton, not class
import { toast } from './utils/toast.js';
import { modal } from './utils/modal.js';
import { showError, getErrorMessage } from './utils/errorMessages.js';
import { betaFeedback } from './utils/betaFeedback.js';
import { t } from './i18n/i18n.js';
import { poiElements } from './features/poiElements.js';
import { mobileConsole } from './utils/mobileConsole.js'; // Mobile debug console

class AccessNatureApp {
  constructor() {
    this.controllers = {};
    this.isInitialized = false;
  }

// UPDATED: Initialize method with backup restore handling
async initialize() {
  if (this.isInitialized) return;

  try {
    console.log('🌲 Access Nature starting...');

    // Initialize core systems
    this.controllers.state = new AppState();
    this.controllers.map = new MapController();
    this.controllers.tracking = new TrackingController(this.controllers.state);
    this.controllers.timer = new TimerController();

    // Initialize UI controllers
    this.controllers.navigation = new NavigationController();
    this.controllers.compass = new CompassController();

    // Initialize feature controllers
    this.controllers.accessibility = new AccessibilityFormV2Quick();
    this.controllers.trailGuide = trailGuideGeneratorV2;  // Trail guide generator
    this.controllers.media = new MediaController(this.controllers.state);
    this.controllers.export = new ExportController(this.controllers.state);
    this.controllers.firebase = new FirebaseController();
    this.controllers.auth = authController;  // Use singleton, already created in auth.js

    // Set up dependencies
    this.setupControllerDependencies();

    // Initialize all controllers
    await this.initializeControllers();

    // Set up the main UI event listeners
    this.setupMainEventListeners();

    // Set up error handling
    this.setupErrorHandling();

    // Initialize offline indicator (shows when user goes offline)
    offlineIndicator.initialize();

    // NEW: Check for unsaved route BEFORE loading initial state
    await this.handleUnsavedRoute();

    // Load saved state
    await this.loadInitialState();

    this.isInitialized = true;
    console.log('✅ App initialization complete');

  } catch (error) {
    console.error('❌ App initialization failed:', error);
    showError(error);
    toast.errorKey('refreshRequired', { duration: 0 });
  }
}

// 1. FIXED: Update the handleUnsavedRoute method
async handleUnsavedRoute() {
  try {
    // IMPORTANT: Wait for state controller to be ready
    await this.waitForStateController();
    
    // Skip if we're already tracking (page might have refreshed during tracking)
    if (this.controllers.state?.isTracking) {
      console.log('⚡ Skipping restore check - tracking is active');
      return;
    }
    
    // Skip if we already handled restore this session
    const sessionHandled = sessionStorage.getItem('restore_handled');
    if (sessionHandled) {
      console.log('⚡ Skipping restore check - already handled this session');
      return;
    }
    
    const backupData = await this.controllers.state.checkForUnsavedRoute();
    
    if (backupData) {
      // Mark as handled for this session (prevent re-prompting on page interactions)
      sessionStorage.setItem('restore_handled', 'true');
      
      const success = await this.showRestoreDialog(backupData);
      
      if (success) {
        console.log('✅ Route restoration completed');
        
        // FIXED: Set up timer with restored elapsed time
        const timerController = this.controllers.timer;
        const elapsedTime = this.controllers.state.getElapsedTime();
        
        if (timerController && elapsedTime > 0) {
          timerController.setElapsedTime(elapsedTime);
          console.log(`⏱️ Timer initialized with ${this.formatElapsedTime(elapsedTime)} elapsed`);
        }
        
      } else {
        console.log('🗑️ User chose to discard backup or restoration failed');
      }
    }
  } catch (error) {
    console.error('❌ Error handling unsaved route:', error);
    try {
      await this.controllers.state.clearRouteBackup();
    } catch (clearError) {
      console.error('❌ Failed to clear backup:', clearError);
    }
  }
}

// 2. NEW: Wait for state controller to be ready
async waitForStateController() {
  let attempts = 0;
  const maxAttempts = 10;
  
  while (attempts < maxAttempts) {
    if (this.controllers.state && this.controllers.state.dbReady !== undefined) {
      // Wait a bit more if IndexedDB is still initializing
      if (this.controllers.state.dbReady === false) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      return;
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    attempts++;
  }
  
  console.warn('⚠️ State controller initialization timeout');
}

// NEW: Show enhanced restore dialog
// FIXED: Show enhanced restore dialog
async showRestoreDialog(backupData) {
  try {
    // Validate backupData structure
    if (!backupData || typeof backupData !== 'object') {
      console.error('❌ Invalid backup data structure');
      return false;
    }

    const lang = localStorage.getItem('accessNature_language') || 'en';
    const backupDate = new Date(backupData.backupTime || Date.now()).toLocaleString(lang === 'he' ? 'he-IL' : 'en-US');
    const routeData = backupData.routeData || [];
    const pointCount = routeData.length;
    const distance = (backupData.totalDistance || 0).toFixed(2);
    
    // Safely filter route data
    const locationPoints = routeData.filter(p => p && p.type === 'location').length;
    const photos = routeData.filter(p => p && p.type === 'photo').length;
    const notes = routeData.filter(p => p && p.type === 'text').length;
    
    // Calculate time since backup
    const backupTime = backupData.backupTime || Date.now();
    const backupAge = Date.now() - backupTime;
    const hoursAgo = Math.floor(backupAge / (1000 * 60 * 60));
    const minutesAgo = Math.floor((backupAge % (1000 * 60 * 60)) / (1000 * 60));
    
    let timeAgoText = '';
    if (hoursAgo > 0) {
      timeAgoText = `${hoursAgo}${t('trackerUI.restoreRoute.hoursShort')} ${minutesAgo}${t('trackerUI.restoreRoute.minutesShort')} ${t('trackerUI.restoreRoute.ago')}`;
    } else {
      timeAgoText = `${minutesAgo}${t('trackerUI.restoreRoute.minutesShort')} ${t('trackerUI.restoreRoute.ago')}`;
    }

    // Create detailed restore dialog
    const restoreMessage = `🔄 ${t('trackerUI.restoreRoute.found')}

📅 ${t('trackerUI.restoreRoute.created')}: ${backupDate}
⏰ ${t('trackerUI.restoreRoute.time')}: ${timeAgoText}

📊 ${t('trackerUI.restoreRoute.routeDetails')}:
📏 ${t('trackerUI.restoreRoute.distance')}: ${distance} ${t('trackerUI.km')}
📍 ${t('trackerUI.restoreRoute.gpsPoints')}: ${locationPoints}
📷 ${t('trackerUI.restoreRoute.photos')}: ${photos}
📝 ${t('trackerUI.restoreRoute.notes')}: ${notes}
📋 ${t('trackerUI.restoreRoute.totalData')}: ${pointCount} ${t('trackerUI.restoreRoute.entries')}

${t('trackerUI.restoreRoute.notSaved')}

${t('trackerUI.restoreRoute.wouldYouLikeToRestore')}`;

    const shouldRestore = await modal.confirm(restoreMessage, `📍 ${t('trackerUI.restoreRoute.title')}`);
    
    if (shouldRestore) {
      console.log('👤 User chose to restore route');
      
      const success = this.controllers.state.restoreFromBackup(backupData);
      
      if (success) {
        // Show success message without action options to avoid conflicts
        this.showRestoreSuccessMessage(backupData);
        return true;
      } else {
        toast.errorKey('restoreFailed');
        this.controllers.state.clearRouteBackup();
        return false;
      }
    } else {
      // User chose to start fresh
      console.log('👤 User chose to start fresh');
      
      // Double-check with warning about data loss
      const discardMessage = `${t('trackerUI.restoreRoute.willDelete')}:
• ${distance} ${t('trackerUI.km')} ${t('trackerUI.restoreRoute.ofDistance')}
• ${locationPoints} ${t('trackerUI.restoreRoute.gpsPoints')}
• ${photos} ${t('trackerUI.restoreRoute.photos')}
• ${notes} ${t('trackerUI.restoreRoute.notes')}

${t('trackerUI.restoreRoute.cannotUndo')}`;
      
      const confirmDiscard = await modal.confirm(discardMessage, `⚠️ ${t('trackerUI.restoreRoute.discardRoute')}`);
      
      if (confirmDiscard) {
        this.controllers.state.clearRouteBackup();
        toast.successKey('dataDiscarded');
        return false;
      } else {
        // User changed their mind, try restore again
        console.log('👤 User changed mind, attempting restore...');
        const success = this.controllers.state.restoreFromBackup(backupData);
        if (success) {
          this.showRestoreSuccessMessage(backupData);
          return true;
        } else {
          this.showError('❌ Failed to restore route.');
          return false;
        }
      }
    }
  } catch (error) {
    console.error('❌ Error in restore dialog:', error);
    this.showError('❌ Error during route restoration.');
    this.controllers.state.clearRouteBackup();
    return false;
  }
}

// FIXED: Simple success message without action dialogs
showRestoreSuccessMessage(backupData) {
  const distance = (backupData.totalDistance || 0).toFixed(2);
  const pointCount = (backupData.routeData || []).filter(p => p && p.type === 'location').length;
  
  this.showSuccessMessage(`✅ Route restored! ${distance} km and ${pointCount} GPS points recovered. Check the map and click ▶ to continue tracking.`);
  
  console.log(`✅ Route restored: ${distance} km, ${pointCount} GPS points`);
  console.log('💡 User can now: 1) Resume tracking with ▶, 2) Save route, 3) View on map');
}

// NEW: Show restore success dialog with options
// UPDATED: Show restore success dialog without auto-popup
showRestoreSuccessDialog(backupData) {
  const distance = (backupData.totalDistance || 0).toFixed(2);
  const pointCount = backupData.routeData.filter(p => p.type === 'location').length;
  
  // Show success message only
  this.showSuccessMessage('✅ Route restored successfully! Check route on map.');
  
  console.log(`✅ Route restored: ${distance} km, ${pointCount} GPS points`);
  console.log('💡 User can now: 1) Resume tracking, 2) Save route, 3) View on map');
  
  // Don't show the options dialog automatically - let user decide
}

// UPDATED: Continue tracking from restored route
continueRestoredRoute() {
  try {
    console.log('🚀 Preparing to continue restored route...');
    
    // Set up timer with restored elapsed time
    const timerController = this.controllers.timer;
    const elapsedTime = this.controllers.state.getElapsedTime();
    
    if (timerController && elapsedTime > 0) {
      timerController.setElapsedTime(elapsedTime);
      console.log(`⏱️ Timer prepared with ${this.formatElapsedTime(elapsedTime)} elapsed`);
    }
    
    // Update tracking buttons but don't auto-start
    const trackingController = this.controllers.tracking;
    if (trackingController) {
      trackingController.updateTrackingButtons();
    }
    
    this.showSuccessMessage('🚀 Ready to continue! Click ▶ to resume tracking.');
    
  } catch (error) {
    console.error('❌ Failed to prepare continued tracking:', error);
    this.showError('❌ Failed to prepare tracking continuation.');
  }
}

// NEW: Helper method to format elapsed time
formatElapsedTime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

// NEW: Save restored route
async saveRestoredRoute() {
  try {
    console.log('💾 Saving restored route...');
    
    const trackingController = this.controllers.tracking;
    if (trackingController && typeof trackingController.saveRoute === 'function') {
      await trackingController.saveRoute();
    } else {
      // Fallback manual save
      const defaultName = `Restored Route ${new Date().toLocaleDateString()}`;
      const routeName = await modal.prompt('Enter a name for this restored route:', 'Name Your Route', defaultName) || defaultName;
      await this.controllers.state.saveSession(routeName);
      toast.successKey('routeSaved');
    }
  } catch (error) {
    console.error('❌ Failed to save restored route:', error);
    toast.errorKey('saveError');
  }
}

// NEW: View restored route on map
viewRestoredRoute() {
  try {
    console.log('👁️ Viewing restored route on map...');
    
    const mapController = this.controllers.map;
    if (mapController) {
      // The route should already be redrawn by restoreFromBackup
      // Just ensure map is focused on the route
      this.showSuccessMessage('👁️ Route displayed on map');
    }
  } catch (error) {
    console.error('❌ Failed to view route on map:', error);
    this.showError('❌ Failed to display route on map.');
  }
}

// UPDATED: Enhanced success message method
showSuccessMessage(message) {
  const successDiv = document.createElement('div');
  successDiv.textContent = message;
  successDiv.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    padding: 15px 25px;
    border-radius: 25px;
    z-index: 9999;
    font-size: 16px;
    font-weight: 500;
    box-shadow: 0 6px 25px rgba(76, 175, 80, 0.4);
    animation: slideDown 0.4s ease;
    max-width: 80%;
    text-align: center;
  `;

  // Add CSS animation if not already added
  if (!document.getElementById('successMessageCSS')) {
    const style = document.createElement('style');
    style.id = 'successMessageCSS';
    style.textContent = `
      @keyframes slideDown {
        from {
          transform: translate(-50%, -100%);
          opacity: 0;
        }
        to {
          transform: translate(-50%, 0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(successDiv);
  setTimeout(() => {
    if (successDiv.parentNode) {
      successDiv.remove();
    }
  }, 4000);
}

// UPDATED: Enhanced error message method
showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.textContent = message;
  errorDiv.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;
    padding: 15px 25px;
    border-radius: 25px;
    z-index: 9999;
    font-size: 16px;
    font-weight: 500;
    box-shadow: 0 6px 25px rgba(220, 53, 69, 0.4);
    animation: slideDown 0.4s ease;
    max-width: 80%;
    text-align: center;
  `;

  document.body.appendChild(errorDiv);
  setTimeout(() => {
    if (errorDiv.parentNode) {
      errorDiv.remove();
    }
  }, 5000);
}

// ... rest of your existing methods stay the same ...

  // NEW: Setup main event listeners for tracking buttons
  setupMainEventListeners() {
    // Start button
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
      startBtn.addEventListener('click', async () => {
        try {
          console.log('🎯 Start button clicked');
          await this.controllers.tracking.start();
        } catch (error) {
          console.error('Failed to start tracking:', error);
          toast.errorKey('trackingFailed');
        }
      });
    }

    // Pause button
    const pauseBtn = document.getElementById('pauseBtn');
    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        console.log('⏸️ Pause button clicked');
        this.controllers.tracking.togglePause();
      });
    }

    // Stop button
    const stopBtn = document.getElementById('stopBtn');
    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        console.log('⏹️ Stop button clicked');
        this.controllers.tracking.stop();
      });
    }

    console.log('✅ Main event listeners set up');
  }

  setupControllerDependencies() {
    this.controllers.tracking.setDependencies({
      timer: this.controllers.timer,
      map: this.controllers.map,
      media: this.controllers.media
    });

    this.controllers.export.setDependencies({
      map: this.controllers.map,
      accessibility: this.controllers.accessibility
    });

    this.controllers.compass.setDependencies({
      map: this.controllers.map
    });
  }

  async initializeControllers() {
    const initPromises = Object.entries(this.controllers).map(async ([name, controller]) => {
      try {
        if (typeof controller.initialize === 'function') {
          await controller.initialize();
          console.log(`✅ ${name} controller initialized`);
        }
      } catch (error) {
        console.error(`❌ Failed to initialize ${name} controller:`, error);
        // Don't throw - let other controllers initialize
      }
    });

    await Promise.all(initPromises);

    // Initialize POI elements after map is ready (share cluster group with MapController)
    if (this.controllers.map?.map) {
      try {
        const clusterGroup = this.controllers.map.markerClusterGroup;
        poiElements.init(this.controllers.map.map, clusterGroup);
        // Store reference for route attachment
        this.controllers.poiElements = poiElements;
        console.log('✅ POI elements initialized' + (clusterGroup ? ' with clustering' : ''));
      } catch (error) {
        console.error('❌ Failed to initialize POI elements:', error);
      }
    }
  }

  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      this.handleError(event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      this.handleError(event.reason);
      event.preventDefault();
    });
  }

  async loadInitialState() {
    try {
      const backup = localStorage.getItem('route_backup');
      if (backup) {
        const shouldRestore = await modal.confirm(t('trackerUI.restoreRoute.message'), `📍 ${t('trackerUI.restoreRoute.title')}`);
        if (shouldRestore) {
          console.log('✅ Restored from backup');
        } else {
          localStorage.removeItem('route_backup');
        }
      }

      if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
      }

    } catch (error) {
      console.error('Failed to load initial state:', error);
    }
  }

  handleError(error) {
    console.error('App error:', error);
    
    const isCritical = error instanceof TypeError || 
                      error instanceof ReferenceError ||
                      error.message?.includes('Firebase') ||
                      error.message?.includes('geolocation');

    if (isCritical) {
      this.showError('A critical error occurred. Some features may not work properly.');
    }
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #dc3545;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      z-index: 9999;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  getController(name) {
    return this.controllers[name];
  }
}

// Global app instance
let app = null;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('📄 DOM loaded, initializing app...');
  app = new AccessNatureApp();
  await app.initialize();
  window.AccessNatureApp = app;
});

// Global functions for HTML onclick handlers
window.openAccessibilityForm = (callback) => {
  console.log('🔧 Opening accessibility form');
  app?.getController('accessibility')?.open(callback);
};

window.closeAccessibilityForm = () => {
  console.log('🔧 Closing accessibility form');
  app?.getController('accessibility')?.close();
};

window.addTextNote = () => {
  console.log('📝 Adding text note');
  app?.getController('media')?.addTextNote();
};

window.showRouteDataOnMap = () => {
  console.log('🗺️ Showing route data on map');
  const routeData = app?.getController('state')?.getRouteData();
  app?.getController('map')?.showRouteData(routeData);
};

window.togglePanel = (panelId) => {
  console.log('📱 Toggling panel:', panelId);
  app?.getController('navigation')?.togglePanel(panelId);
};

window.showStorageMonitor = () => {
  console.log('💾 Showing storage monitor');
  app?.getController('navigation')?.showStorageMonitor();
};

window.triggerImport = () => {
  console.log('📥 Triggering import');
  app?.getController('export')?.triggerImport();
};

window.confirmAndResetApp = async () => {
  console.log('🔄 Confirming app reset');
  const confirmed = await modal.confirm('This will delete all your data and reset the app completely.', '⚠️ Reset Everything?');
  if (confirmed) {
    app?.getController('state')?.clearAllAppData();
    location.reload();
  }
};

// Add this to your existing global functions in main.js
window.loadMyTrailGuides = () => {
  console.log('🌐 Global loadMyTrailGuides called');
  const app = window.AccessNatureApp;
  const auth = app?.getController('auth');
  
  if (auth && typeof auth.loadMyTrailGuides === 'function') {
    auth.loadMyTrailGuides();
  } else {
    console.error('Auth controller or method not available');
    toast.errorKey('authNotAvailable');
  }
};

// Add these to your existing global functions
window.loadMyTrailGuides = () => app?.getController('auth')?.loadMyTrailGuides();
window.viewMyTrailGuide = (guideId) => app?.getController('auth')?.viewTrailGuide(guideId);
window.toggleGuideVisibility = (guideId, makePublic) => app?.getController('auth')?.toggleTrailGuideVisibility(guideId, makePublic);
window.deleteTrailGuide = (guideId) => app?.getController('auth')?.deleteTrailGuide(guideId);

// Make utilities available for debugging
window.offlineIndicator = offlineIndicator;
window.loadingStates = loadingStates;
window.gamificationUI = gamificationUI;
window.mobilityProfileUI = mobilityProfileUI;
window.accessibilityRating = accessibilityRating;
window.trailSearch = trailSearch;
window.mobileConsole = mobileConsole;
window.showError = showError;
window.getErrorMessage = getErrorMessage;

// Setup badge notification popups
gamificationUI.setupBadgeNotifications();

// Initialize mobility profile UI
mobilityProfileUI.initialize();

// Initialize beta feedback system
betaFeedback.initialize();

// Connect offlineMapsUI to the map when available
setTimeout(() => {
  const mapController = window.AccessNatureApp?.getController('map');
  if (mapController?.map && window.offlineMapsUI) {
    window.offlineMapsUI.setMap(mapController.map);
    console.log('✅ Offline Maps UI connected to map');
  }
}, 2000);

export { AccessNatureApp, offlineIndicator, loadingStates, gamificationUI, mobilityProfileUI, accessibilityRating, trailSearch, showError, getErrorMessage, betaFeedback };