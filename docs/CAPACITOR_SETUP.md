# Capacitor Setup Guide

This guide explains how to build the Access Nature app as a native Android (and iOS) application using Capacitor.

## Prerequisites

- Node.js 18+ and npm
- Android Studio (for Android builds)
- Xcode (for iOS builds, macOS only)
- Java JDK 17+

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Add Android Platform

```bash
npx cap add android
```

This creates the `android/` directory with a native Android project.

### 3. Sync Web Assets

After any changes to the web app:

```bash
npx cap sync
```

Or just copy without updating native dependencies:

```bash
npx cap copy
```

## Building for Android

### Development Build

```bash
# Open in Android Studio
npx cap open android

# Or run directly on connected device
npx cap run android
```

### Using npm scripts

```bash
# Sync and open Android Studio
npm run android:studio

# Build debug APK
npm run cap:build:android
```

The debug APK will be at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### Release Build

1. Create a keystore (one-time):
```bash
keytool -genkey -v -keystore release-key.keystore -alias access-nature -keyalg RSA -keysize 2048 -validity 10000
```

2. Update `capacitor.config.ts` with keystore details or create `android/app/release-signing.properties`:
```properties
storeFile=../../release-key.keystore
storePassword=YOUR_STORE_PASSWORD
keyAlias=access-nature
keyPassword=YOUR_KEY_PASSWORD
```

3. Build release:
```bash
npm run cap:build:android:release
```

## Android-Specific Configuration

### App Icon

Replace the icons in:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- `android/app/src/main/res/mipmap-*/ic_launcher_round.png`

Use Android Studio's Image Asset Studio for easy generation.

### Splash Screen

The splash screen is configured in `capacitor.config.ts` under the `SplashScreen` plugin:
- Background color: `#2c5530` (brand green)
- Spinner: enabled (white, large)
- Duration: 2.5 seconds with 300ms fade-out

To replace the splash image (logo) with a custom PNG:
- `android/app/src/main/res/drawable/splash.png`
- `android/app/src/main/res/drawable-land-*/splash.png`
- `android/app/src/main/res/drawable-port-*/splash.png`

**Recommended**: Use `@capacitor/assets` to auto-generate all splash/icon assets from a single source image:
```bash
npm install --save-dev @capacitor/assets
npx capacitor-assets generate --assetPath assets/icons/icon.svg
```

**Note**: The web interface also has a splash loader (logo + spinner) in `index.html` that shows during initial page load. This provides a smooth transition from the native splash screen on Android, and serves as the splash on the web version. It auto-hides when stats finish loading, or after 3 seconds as a fallback.

### Permissions

The following permissions are configured in `android/app/src/main/AndroidManifest.xml`:

```xml
<!-- Location (GPS tracking) -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

<!-- Camera (photo capture) -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Storage (saving photos/routes) -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />

<!-- Network -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Keep screen on during tracking -->
<uses-permission android:name="android.permission.WAKE_LOCK" />

<!-- Vibration (haptic feedback) -->
<uses-permission android:name="android.permission.VIBRATE" />
```

### Background Location Tracking

For Android 10+, background location requires:

1. Add to `AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
```

2. Request permission in two steps (Android requirement):
   - First request foreground location
   - Then request background location separately

The `platform.js` utility handles this automatically.

## iOS Setup (Future)

```bash
# Add iOS platform (requires macOS)
npx cap add ios

# Open in Xcode
npx cap open ios
```

## Hybrid PWA/Native Architecture

The app uses a hybrid architecture:

1. **Same codebase** for PWA and native
2. **Platform detection** via `src/utils/platform.js`
3. **Native features** when available, web fallbacks otherwise

### Using the Platform Utility

```javascript
import { platform } from './src/utils/platform.js';

// Check platform
if (platform.isNative) {
  console.log('Running as native app');
} else if (platform.isPWA) {
  console.log('Running as installed PWA');
} else {
  console.log('Running in browser');
}

// Use unified APIs
await platform.vibrate('medium');
await platform.keepAwake(true);
const position = await platform.getCurrentPosition();
const photo = await platform.takePhoto();
```

## Troubleshooting

### Capacitor plugins not found

```bash
npx cap sync
```

### Android Studio not finding SDK

Set `ANDROID_HOME` environment variable:
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Build fails with Java version error

Ensure Java 17+ is installed and `JAVA_HOME` is set correctly.

### Web assets not updating

```bash
npx cap copy android
```

## Development Workflow

1. Make changes to web code
2. Test in browser
3. Run `npx cap copy` to sync changes
4. Test on device/emulator with `npx cap run android`
5. For production, build release APK

## Live Reload (Development)

For faster development with live reload:

1. Start a local server:
```bash
npm start  # or npx serve .
```

2. Update `capacitor.config.ts`:
```typescript
server: {
  url: 'http://YOUR_LOCAL_IP:3000',
  cleartext: true
}
```

3. Rebuild and run:
```bash
npx cap copy android
npx cap run android
```

Remember to remove the `url` setting for production builds!
