import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.accessnature.app',
  appName: 'Access Nature',
  webDir: 'www',

  // Server configuration for development
  server: {
    // For development, you can enable live reload:
    // url: 'http://YOUR_DEV_SERVER_IP:8080',
    // cleartext: true,
    androidScheme: 'https',
    // iOS: use https scheme so Firebase Auth's origin check accepts
    // the WebView. The default capacitor:// origin makes onAuthState-
    // Changed hang because Firebase can't classify it as a valid
    // origin for its persistence layer.
    iosScheme: 'https',
    hostname: 'localhost',
    allowNavigation: [
      // Firebase Auth handler (project: accessible-76181)
      'accessible-76181.firebaseapp.com',
      'accessible-76181.web.app',
      // Firebase infra
      '*.firebaseio.com',
      '*.googleapis.com',
      '*.gstatic.com',
      '*.firebaseapp.com',
      // Google Sign-In popup
      'accounts.google.com',
      // App Hosting deploy target
      'lstm2016--accessible-76181.us-central1.hosted.app',
      // Cloud Functions (identifyPOI vision endpoint)
      'us-central1-accessible-76181.cloudfunctions.net',
      // Public web hosts
      'liorshur.github.io',
      // Map + geocoder providers
      'nominatim.openstreetmap.org',
      '*.tile.openstreetmap.org',
      '*.basemaps.cartocdn.com',
      // Error tracking
      '*.sentry.io'
    ]
  },

  // Android-specific configuration
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true, // Set to false for production

    // Build configuration
    buildOptions: {
      keystorePath: undefined, // Set for release builds
      keystoreAlias: undefined,
      keystorePassword: undefined,
      keystoreAliasPassword: undefined,
      signingType: 'apksigner'
    }
  },

  // iOS-specific configuration (for future use)
  ios: {
    contentInset: 'automatic',
    allowsLinkPreview: true,
    scrollEnabled: true
  },

  // Plugin configurations
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: false,
      launchFadeOutDuration: 300,
      backgroundColor: '#2c5530',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: true,
      androidSpinnerStyle: 'large',
      iosSpinnerStyle: 'large',
      spinnerColor: '#ffffff',
      splashFullScreen: true,
      splashImmersive: true
    },

    StatusBar: {
      style: 'DARK',
      backgroundColor: '#1a1a1a'
    },

    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true
    },

    Geolocation: {
      // Android: Request background location permission
      // This is needed for tracking while app is in background
    },

    KeepAwake: {
      // Keeps screen on during tracking
    },

    Camera: {
      // Photo capture for trail documentation
    },

    Haptics: {
      // Vibration feedback for pocket mode, buttons, etc.
    }
  }
};

export default config;
