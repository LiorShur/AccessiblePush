/**
 * Access Nature - Centralized Application Configuration
 *
 * This file contains all configurable values for the application.
 * Import and use these constants instead of hardcoding values.
 *
 * Usage:
 *   import { TIMEOUTS, LIMITS, RETRIES } from './config/appConfig.js';
 */

// ============================================
// TIMEOUT VALUES (in milliseconds)
// ============================================

export const TIMEOUTS = {
  // API and network timeouts
  API_REQUEST: 25000,        // 25 seconds for API calls
  FIRESTORE_QUERY: 25000,    // 25 seconds for Firestore queries
  IMAGE_UPLOAD: 60000,       // 60 seconds for image uploads

  // UI debounce/delay times
  DEBOUNCE_SHORT: 300,       // 300ms for search inputs
  DEBOUNCE_MEDIUM: 500,      // 500ms for resize events
  DEBOUNCE_LONG: 1000,       // 1 second for expensive operations

  // Toast/notification durations
  TOAST_SHORT: 3000,         // 3 seconds
  TOAST_MEDIUM: 5000,        // 5 seconds
  TOAST_LONG: 8000,          // 8 seconds

  // Animation/transition durations
  ANIMATION_FAST: 150,
  ANIMATION_NORMAL: 300,
  ANIMATION_SLOW: 500,

  // GPS and location
  GPS_TIMEOUT: 10000,        // 10 seconds to acquire position
  GPS_MAX_AGE: 5000,         // 5 seconds cache for position

  // Offline sync
  SYNC_RETRY_DELAY: 5000,    // 5 seconds between sync retries
  ONLINE_CHECK_INTERVAL: 30000, // 30 seconds

  // Session/auth
  AUTH_STATE_CHECK: 2000,    // 2 seconds to wait for auth state
  SESSION_TIMEOUT: 3600000   // 1 hour (not currently used)
};

// ============================================
// RETRY CONFIGURATION
// ============================================

export const RETRIES = {
  // Network operations
  API_MAX_RETRIES: 3,
  FIRESTORE_MAX_RETRIES: 2,
  IMAGE_UPLOAD_RETRIES: 3,

  // Sync operations
  OFFLINE_SYNC_RETRIES: 5,

  // Delays between retries (exponential backoff base)
  RETRY_BASE_DELAY: 1000,    // 1 second base
  RETRY_MAX_DELAY: 30000     // 30 seconds max
};

// ============================================
// SIZE LIMITS
// ============================================

export const LIMITS = {
  // File sizes (in bytes)
  MAX_IMAGE_SIZE: 10 * 1024 * 1024,           // 10MB max upload
  IMAGE_COMPRESSION_THRESHOLD: 500 * 1024,     // Compress if > 500KB
  MAX_DOCUMENT_SIZE: 1 * 1024 * 1024,          // 1MB max Firestore doc

  // Image dimensions
  MAX_IMAGE_WIDTH: 1920,
  MAX_IMAGE_HEIGHT: 1080,
  THUMBNAIL_SIZE: 200,

  // Content limits
  MAX_TRAIL_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 2000,
  MAX_NOTE_LENGTH: 500,
  MAX_PHOTOS_PER_TRAIL: 50,

  // Storage quotas (for free tier)
  FREE_MAX_SAVED_ROUTES: 5,
  FREE_MAX_CLOUD_GUIDES: 3,
  PLUS_MAX_CLOUD_GUIDES: 25,

  // GPS tracking
  MIN_TRACKING_DISTANCE: 5,     // meters between points
  GPS_FILTER_ACCURACY: 50,      // ignore readings > 50m accuracy
  MAX_GPS_POINTS: 10000         // max points per trail
};

// ============================================
// GPS CONFIGURATION
// ============================================

export const GPS = {
  // Geolocation options
  HIGH_ACCURACY: true,
  MAXIMUM_AGE: 5000,          // 5 seconds
  TIMEOUT: 10000,             // 10 seconds

  // Tracking thresholds
  MIN_DISTANCE_METERS: 5,     // Record point every 5 meters
  MIN_TIME_SECONDS: 3,        // Or every 3 seconds
  ACCURACY_THRESHOLD: 50,     // Ignore if accuracy > 50m

  // Noise filtering
  MAX_SPEED_MPS: 15,          // Max realistic hiking speed (15 m/s ≈ 33 mph)
  OUTLIER_DISTANCE: 100       // Distance that triggers outlier check
};

// ============================================
// UI CONFIGURATION
// ============================================

export const UI = {
  // Touch targets (WCAG minimum)
  MIN_TOUCH_TARGET: 44,       // 44x44 pixels

  // Breakpoints (in pixels)
  BREAKPOINT_SM: 320,
  BREAKPOINT_MD: 768,
  BREAKPOINT_LG: 1024,
  BREAKPOINT_XL: 1440,

  // Modal/overlay z-index
  Z_INDEX_DROPDOWN: 100,
  Z_INDEX_MODAL: 1000,
  Z_INDEX_TOAST: 1100,
  Z_INDEX_LOADER: 1200,

  // Pagination
  ITEMS_PER_PAGE: 20,
  TRAILS_PER_PAGE: 10,

  // Map defaults
  DEFAULT_ZOOM: 15,
  MIN_ZOOM: 3,
  MAX_ZOOM: 19,
  DEFAULT_CENTER: [37.7749, -122.4194]  // San Francisco
};

// ============================================
// FEATURE FLAGS
// ============================================

export const FEATURES = {
  // Beta features (can be toggled)
  ENABLE_OFFLINE_SYNC: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_PHOTO_COMPRESSION: true,
  ENABLE_ANALYTICS: true,
  ENABLE_ERROR_MONITORING: true,

  // Experimental features (disabled by default)
  ENABLE_VOICE_NAVIGATION: false,
  ENABLE_AR_OVERLAY: false,
  ENABLE_SOCIAL_SHARING: true,

  // Debug features
  ENABLE_DEBUG_PANEL: false,
  ENABLE_MOBILE_CONSOLE: false,
  VERBOSE_LOGGING: false
};

// ============================================
// API ENDPOINTS
// ============================================

export const ENDPOINTS = {
  // OpenStreetMap
  OSM_TILES: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  OSM_NOMINATIM: 'https://nominatim.openstreetmap.org',

  // Weather (if configured)
  OPENWEATHER_API: 'https://api.openweathermap.org/data/2.5',

  // Open311 (barrier reporting)
  OPEN311_BASE: 'https://open311.org/api/v2'
};

// ============================================
// ERROR MESSAGES
// ============================================

export const ERRORS = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',

  // Auth errors
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password.',
  AUTH_EMAIL_IN_USE: 'An account with this email already exists.',
  AUTH_WEAK_PASSWORD: 'Password must be at least 6 characters.',
  AUTH_NOT_SIGNED_IN: 'Please sign in to continue.',

  // GPS errors
  GPS_PERMISSION_DENIED: 'Location access denied. Please enable location services.',
  GPS_UNAVAILABLE: 'Location unavailable. Please try again.',
  GPS_TIMEOUT: 'Could not determine your location. Please try again.',

  // Storage errors
  STORAGE_QUOTA_EXCEEDED: 'Storage limit reached. Please delete some trails.',
  UPLOAD_FAILED: 'Failed to upload. Please try again.',

  // Generic
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.'
};

// ============================================
// ACCESSIBILITY
// ============================================

export const A11Y = {
  // Focus ring style
  FOCUS_RING_COLOR: '#2c5530',
  FOCUS_RING_WIDTH: 3,
  FOCUS_RING_OFFSET: 2,

  // High contrast colors
  HIGH_CONTRAST_TEXT: '#000000',
  HIGH_CONTRAST_BG: '#FFFFFF',
  HIGH_CONTRAST_LINK: '#0000EE',

  // Animation
  REDUCED_MOTION_DURATION: 0
};

// ============================================
// APP METADATA
// ============================================

export const APP = {
  NAME: 'Access Nature',
  VERSION: '1.0.0-beta',
  BUILD: '2026.03.23',
  SUPPORT_EMAIL: 'support@accessnature.app',
  BETA_EMAIL: 'beta@accessnature.app',
  WEBSITE: 'https://accessnature.app'
};

// Default export for convenience
export default {
  TIMEOUTS,
  RETRIES,
  LIMITS,
  GPS,
  UI,
  FEATURES,
  ENDPOINTS,
  ERRORS,
  A11Y,
  APP
};
