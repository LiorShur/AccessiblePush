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
    allowNavigation: [
      'accessnaturebeta-821a2.firebaseapp.com',
      '*.firebaseio.com',
      '*.googleapis.com',
      '*.gstatic.com',
      'nominatim.openstreetmap.org',
      '*.tile.openstreetmap.org',
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
      launchShowDuration: 2500,
      launchAutoHide: true,
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
