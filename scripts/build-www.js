/**
 * Build script for Capacitor
 * Copies web assets to www/ directory for native builds
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const WWW = path.join(ROOT, 'www');

// Files and folders to copy
const COPY_LIST = [
  // HTML pages
  'index.html',
  'tracker.html',
  'map.html',
  'explore.html',
  'reports.html',
  'profile.html',
  'admin.html',
  'offline.html',
  'privacy.html',
  'terms.html',
  'beta-guide.html',
  'unified-map.html',
  'route-recovery.html',
  'fab-comparison.html',
  'fab-flow-mockup.html',

  // JavaScript
  'sw.js',
  'auth.js',
  'firebase-setup.js',
  'reports-page.js',

  // Manifest
  'manifest.json',

  // Directories
  'src',
  'assets'
];

// Folders to skip inside directories
const SKIP_PATTERNS = [
  'node_modules',
  '.git',
  'android',
  'ios',
  'www',
  'scripts',
  '.gitignore'
];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFileSync(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function copyDirSync(src, dest) {
  ensureDir(dest);

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip certain patterns
    if (SKIP_PATTERNS.some(p => entry.name === p || entry.name.startsWith('.'))) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function build() {
  console.log('🔨 Building www/ for Capacitor...\n');

  // Clean www directory
  if (fs.existsSync(WWW)) {
    fs.rmSync(WWW, { recursive: true });
  }
  ensureDir(WWW);

  let copied = 0;

  for (const item of COPY_LIST) {
    const srcPath = path.join(ROOT, item);
    const destPath = path.join(WWW, item);

    if (!fs.existsSync(srcPath)) {
      console.log(`  ⚠️  Skipping (not found): ${item}`);
      continue;
    }

    const stat = fs.statSync(srcPath);

    if (stat.isDirectory()) {
      copyDirSync(srcPath, destPath);
      console.log(`  📁 ${item}/`);
    } else {
      copyFileSync(srcPath, destPath);
      console.log(`  📄 ${item}`);
    }
    copied++;
  }

  console.log(`\n✅ Build complete! Copied ${copied} items to www/\n`);
}

build();
