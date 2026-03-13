import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, CACHE_SIZE_UNLIMITED, getFirestore } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCTjQP6uun03RQxhS8Iqy_AcqwrXl47LEE",
  authDomain: "accessible-76181.firebaseapp.com",
  projectId: "accessible-76181",
  storageBucket: "accessible-76181.firebasestorage.app",
  messagingSenderId: "41577077348",
  appId: "1:41577077348:web:c7a91c89f552a9f7169d71",
  measurementId: "G-99QRHT5XBH"
};

// Initialize app - check if already exists
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('🔥 Firebase app initialized');
} else {
  app = getApp();
  console.log('🔥 Using existing Firebase app');
}

// Initialize Firestore with persistent cache for offline support (Firebase v10+)
let db;
try {
  // Use initializeFirestore with persistent cache settings
  // This replaces the deprecated enableIndexedDbPersistence
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
    })
  });
  console.log('🔥 Firestore initialized with persistent cache');
} catch (e) {
  // If Firestore is already initialized (e.g., hot reload), use existing instance
  if (e.code === 'failed-precondition' || e.message?.includes('already been called')) {
    db = getFirestore(app);
    console.log('🔥 Using existing Firestore instance');
  } else {
    console.warn('⚠️ Firestore persistent cache init failed, using default:', e.message);
    db = getFirestore(app);
  }
}

export const auth = getAuth(app);
export { db };
export const storage = getStorage(app);

console.log('🔥 Firebase setup complete');