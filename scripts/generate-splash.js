/**
 * Generate Android splash screen drawable
 *
 * Since we don't have image manipulation libraries in this environment,
 * this script provides instructions for creating the splash drawable.
 *
 * Run this after: npx cap add android
 */

const fs = require('fs');
const path = require('path');

const ANDROID_RES = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');

// Check if android folder exists
if (!fs.existsSync(ANDROID_RES)) {
  console.log(`
===============================================
ANDROID SPLASH SCREEN SETUP
===============================================

The android folder doesn't exist yet. Run these commands first:

1. npx cap add android
2. Then run this script again, OR follow manual steps below.

MANUAL SETUP:
-------------
1. Copy your logo SVG (assets/icons/icon.svg) to a PNG converter
   - Recommended: https://cloudconvert.com/svg-to-png
   - Export at 480x480px with transparent background

2. Create splash drawable files in Android Studio:
   - Open android folder in Android Studio
   - Right-click res/drawable → New → Image Asset
   - Select "Splash Screen" type
   - Import your PNG logo
   - This auto-generates all density variants

3. Or manually create these files with your logo PNG:
   - android/app/src/main/res/drawable/splash.png
   - android/app/src/main/res/drawable-hdpi/splash.png
   - android/app/src/main/res/drawable-mdpi/splash.png
   - android/app/src/main/res/drawable-xhdpi/splash.png
   - android/app/src/main/res/drawable-xxhdpi/splash.png
   - android/app/src/main/res/drawable-xxxhdpi/splash.png

4. Update colors.xml to use brand color:
   File: android/app/src/main/res/values/colors.xml
   Add: <color name="splash_background">#2C5530</color>

5. Rebuild: npx cap sync android && cd android && ./gradlew assembleDebug
`);
  process.exit(0);
}

// Android folder exists - provide specific guidance
console.log(`
===============================================
ANDROID SPLASH SCREEN SETUP
===============================================

Your android folder exists at: ${ANDROID_RES}

To add the Accessible logo to your native splash screen:

OPTION A: Quick (solid color + spinner only)
--------------------------------------------
The capacitor.config.ts is already configured to show a white spinner
on the brand green background (#2c5530). This works without any images.

OPTION B: Full logo splash (recommended)
-----------------------------------------
1. Convert assets/icons/icon.svg to PNG:
   - Use https://cloudconvert.com/svg-to-png
   - Export at 480x480px with TRANSPARENT background

2. In Android Studio:
   - Open the android folder
   - Right-click res/drawable → New → Image Asset
   - Asset type: "Image"
   - Name: splash
   - Path: Select your PNG
   - Click Next → Finish

3. Update splash background color:
   Edit: ${ANDROID_RES}/values/styles.xml

   Find the SplashTheme style and update:
   <item name="android:background">@color/splash_background</item>

   In ${ANDROID_RES}/values/colors.xml, add:
   <color name="splash_background">#2C5530</color>

4. Rebuild:
   npx cap sync android
   cd android && ./gradlew assembleDebug

The web splash loader (logo + spinner in index.html) will show once
the WebView loads, providing a seamless branded experience.
`);
