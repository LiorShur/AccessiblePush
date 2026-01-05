/**
 * Push Notification Service
 * Handles FCM subscription, token management, and notification display
 */

import { db, auth } from '../../firebase-setup.js';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  serverTimestamp,
  query,
  where,
  getDocs
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging.js';
import { toast } from '../utils/toast.js';

class PushNotificationService {
  constructor() {
    this.messaging = null;
    this.currentToken = null;
    this.vapidKey = null; // Will be set from Firestore config
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
    this.initialized = false;
  }

  /**
   * Initialize FCM messaging
   */
  async initialize() {
    if (!this.isSupported) {
      console.log('📱 Push notifications not supported in this browser');
      return false;
    }

    if (this.initialized) {
      return true;
    }

    try {
      // Get VAPID key from Firestore config
      const configDoc = await getDoc(doc(db, 'app_config', 'push_notifications'));
      if (configDoc.exists()) {
        this.vapidKey = configDoc.data().vapidKey;
      }

      if (!this.vapidKey) {
        console.warn('⚠️ VAPID key not configured. Push notifications disabled.');
        return false;
      }

      // Import Firebase app
      const { getApp } = await import('https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js');
      const app = getApp();
      
      this.messaging = getMessaging(app);
      this.initialized = true;
      
      // Listen for foreground messages
      this.setupForegroundListener();
      
      console.log('✅ Push notification service initialized');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize push notifications:', error);
      return false;
    }
  }

  /**
   * Check if notifications are enabled for current user
   */
  async isEnabled() {
    if (!this.isSupported) return false;
    
    const permission = Notification.permission;
    if (permission !== 'granted') return false;
    
    // Check if we have a token stored
    const user = auth.currentUser;
    if (!user) return false;
    
    try {
      const tokenDoc = await getDoc(doc(db, 'push_subscriptions', user.uid));
      return tokenDoc.exists() && tokenDoc.data().active;
    } catch (error) {
      return false;
    }
  }

  /**
   * Request notification permission and subscribe
   */
  async subscribe() {
    if (!this.isSupported) {
      toast.error('Push notifications not supported in this browser');
      return null;
    }

    const user = auth.currentUser;
    if (!user) {
      toast.error('Please sign in to enable notifications');
      return null;
    }

    try {
      // Initialize if not done
      if (!this.initialized) {
        const success = await this.initialize();
        if (!success) {
          toast.error('Push notifications not available');
          return null;
        }
      }

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.warning('Notification permission denied');
        return null;
      }

      // Get FCM token
      const registration = await navigator.serviceWorker.ready;
      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey,
        serviceWorkerRegistration: registration
      });

      if (!token) {
        throw new Error('Failed to get FCM token');
      }

      this.currentToken = token;

      // Store token in Firestore
      await this.saveToken(user, token);

      toast.success('🔔 Notifications enabled!');
      console.log('✅ Push subscription successful');
      
      return token;
    } catch (error) {
      console.error('❌ Push subscription failed:', error);
      toast.error('Failed to enable notifications');
      return null;
    }
  }

  /**
   * Unsubscribe from notifications
   */
  async unsubscribe() {
    const user = auth.currentUser;
    if (!user) return false;

    try {
      // Mark subscription as inactive in Firestore
      await setDoc(doc(db, 'push_subscriptions', user.uid), {
        active: false,
        unsubscribedAt: serverTimestamp()
      }, { merge: true });

      this.currentToken = null;
      toast.success('Notifications disabled');
      return true;
    } catch (error) {
      console.error('❌ Unsubscribe failed:', error);
      toast.error('Failed to disable notifications');
      return false;
    }
  }

  /**
   * Save token to Firestore
   */
  async saveToken(user, token) {
    const subscriptionData = {
      token: token,
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || 'Anonymous',
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Device info
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height
      },
      
      // User preferences (can be updated later)
      preferences: {
        newTrails: true,
        updates: true,
        community: true,
        marketing: false
      }
    };

    await setDoc(doc(db, 'push_subscriptions', user.uid), subscriptionData, { merge: true });
    console.log('💾 Push subscription saved to Firestore');
  }

  /**
   * Setup foreground message listener
   */
  setupForegroundListener() {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      console.log('📬 Foreground message received:', payload);
      
      const { title, body, icon, data } = payload.notification || {};
      
      // Show in-app notification
      this.showInAppNotification({
        title: title || 'New Notification',
        body: body || '',
        icon: icon,
        data: data || payload.data
      });
    });
  }

  /**
   * Show in-app notification (when app is in foreground)
   */
  showInAppNotification({ title, body, icon, data }) {
    // Create a custom notification UI
    const notification = document.createElement('div');
    notification.className = 'push-notification-toast';
    notification.innerHTML = `
      <style>
        .push-notification-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          left: 20px;
          max-width: 400px;
          margin: 0 auto;
          background: linear-gradient(135deg, #1e3a2f, #2c5530);
          color: white;
          padding: 16px 20px;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          z-index: 100000;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          animation: slideDown 0.3s ease-out;
          cursor: pointer;
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .push-notification-toast .icon {
          font-size: 24px;
          flex-shrink: 0;
        }
        .push-notification-toast .content {
          flex: 1;
          min-width: 0;
        }
        .push-notification-toast .title {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 4px;
        }
        .push-notification-toast .body {
          font-size: 13px;
          opacity: 0.9;
          line-height: 1.4;
        }
        .push-notification-toast .close {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 14px;
          flex-shrink: 0;
        }
        .push-notification-toast .close:hover {
          background: rgba(255,255,255,0.3);
        }
      </style>
      <div class="icon">🔔</div>
      <div class="content">
        <div class="title">${this.escapeHtml(title)}</div>
        ${body ? `<div class="body">${this.escapeHtml(body)}</div>` : ''}
      </div>
      <button class="close" onclick="this.parentElement.remove()">×</button>
    `;

    // Handle click
    notification.addEventListener('click', (e) => {
      if (e.target.classList.contains('close')) return;
      
      if (data?.url) {
        window.location.href = data.url;
      }
      notification.remove();
    });

    document.body.appendChild(notification);

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideDown 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
      }
    }, 8000);
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Get current permission status
   */
  getPermissionStatus() {
    if (!this.isSupported) return 'unsupported';
    return Notification.permission; // 'granted', 'denied', or 'default'
  }

  /**
   * Check if user is subscribed
   */
  async getSubscriptionStatus() {
    const user = auth.currentUser;
    if (!user) return { subscribed: false, reason: 'not_authenticated' };
    
    if (!this.isSupported) return { subscribed: false, reason: 'not_supported' };
    
    const permission = Notification.permission;
    if (permission === 'denied') return { subscribed: false, reason: 'permission_denied' };
    if (permission === 'default') return { subscribed: false, reason: 'permission_not_requested' };
    
    try {
      const tokenDoc = await getDoc(doc(db, 'push_subscriptions', user.uid));
      if (!tokenDoc.exists()) return { subscribed: false, reason: 'no_subscription' };
      
      const data = tokenDoc.data();
      if (!data.active) return { subscribed: false, reason: 'subscription_inactive' };
      
      return { 
        subscribed: true, 
        token: data.token,
        preferences: data.preferences
      };
    } catch (error) {
      return { subscribed: false, reason: 'error', error: error.message };
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences) {
    const user = auth.currentUser;
    if (!user) return false;

    try {
      await setDoc(doc(db, 'push_subscriptions', user.uid), {
        preferences: preferences,
        updatedAt: serverTimestamp()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to update preferences:', error);
      return false;
    }
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
