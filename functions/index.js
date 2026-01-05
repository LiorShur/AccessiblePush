/**
 * Firebase Cloud Functions for Push Notifications
 * 
 * Deploy with: firebase deploy --only functions
 * 
 * Required setup:
 * 1. npm install -g firebase-tools
 * 2. firebase login
 * 3. firebase init functions (select JavaScript or TypeScript)
 * 4. Copy this file to functions/index.js
 * 5. npm install firebase-admin firebase-functions
 * 6. firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const db = admin.firestore();
const messaging = admin.messaging();

/**
 * Process notification queue - triggered when a new notification is added
 */
exports.processNotificationQueue = functions.firestore
  .document('notifications_queue/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data();
    const notificationId = context.params.notificationId;
    
    console.log(`Processing notification ${notificationId}:`, notification.title);
    
    if (!notification.tokens || notification.tokens.length === 0) {
      console.log('No tokens to send to');
      await snap.ref.update({ status: 'failed', error: 'No tokens', processedAt: admin.firestore.FieldValue.serverTimestamp() });
      return;
    }
    
    try {
      // Prepare message
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          url: notification.url || '',
          notificationId: notificationId,
          sentAt: new Date().toISOString()
        },
        android: {
          priority: notification.priority === 'high' ? 'high' : 'normal',
          notification: {
            icon: 'ic_notification',
            color: '#2c5530',
            clickAction: 'OPEN_APP'
          }
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body
              },
              badge: 1,
              sound: 'default'
            }
          }
        },
        webpush: {
          notification: {
            icon: './assets/icons/icon.svg',
            badge: './assets/icons/icon.svg',
            vibrate: [100, 50, 100],
            requireInteraction: false
          },
          fcmOptions: {
            link: notification.url || './index.html'
          }
        }
      };
      
      // Send to all tokens
      const tokens = notification.tokens.filter(t => t && t.length > 0);
      
      if (tokens.length === 0) {
        await snap.ref.update({ status: 'failed', error: 'No valid tokens', processedAt: admin.firestore.FieldValue.serverTimestamp() });
        return;
      }
      
      console.log(`Sending to ${tokens.length} tokens`);
      
      // Use sendEachForMulticast for better error handling
      const response = await messaging.sendEachForMulticast({
        tokens: tokens,
        ...message
      });
      
      console.log(`Sent: ${response.successCount} success, ${response.failureCount} failed`);
      
      // Track failed tokens for cleanup
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.log(`Token ${idx} failed:`, resp.error?.message);
          failedTokens.push(tokens[idx]);
          
          // Mark invalid tokens for removal
          if (resp.error?.code === 'messaging/invalid-registration-token' ||
              resp.error?.code === 'messaging/registration-token-not-registered') {
            // Could cleanup invalid tokens here
          }
        }
      });
      
      // Update notification status
      await snap.ref.update({
        status: 'sent',
        successCount: response.successCount,
        failureCount: response.failureCount,
        failedTokens: failedTokens.slice(0, 10), // Store first 10 failed tokens
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      
      // Update the sent history record
      const historyQuery = await db.collection('notifications_sent')
        .where('queueId', '==', notificationId)
        .limit(1)
        .get();
      
      if (!historyQuery.empty) {
        await historyQuery.docs[0].ref.update({
          status: 'sent',
          successCount: response.successCount,
          failureCount: response.failureCount
        });
      }
      
      console.log(`Notification ${notificationId} processed successfully`);
      
    } catch (error) {
      console.error('Error sending notification:', error);
      await snap.ref.update({
        status: 'failed',
        error: error.message,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
  });

/**
 * Scheduled cleanup of old notifications and invalid tokens
 * Runs daily at 3 AM
 */
exports.cleanupNotifications = functions.pubsub
  .schedule('0 3 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Running notification cleanup');
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    try {
      // Delete old processed notifications from queue
      const oldNotifications = await db.collection('notifications_queue')
        .where('status', 'in', ['sent', 'failed'])
        .where('processedAt', '<', thirtyDaysAgo)
        .limit(100)
        .get();
      
      const batch = db.batch();
      oldNotifications.docs.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
      
      console.log(`Deleted ${oldNotifications.size} old notifications`);
      
      // Mark inactive subscriptions (no update in 90 days)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      
      const staleSubscriptions = await db.collection('push_subscriptions')
        .where('active', '==', true)
        .where('updatedAt', '<', ninetyDaysAgo)
        .limit(50)
        .get();
      
      const staleBatch = db.batch();
      staleSubscriptions.docs.forEach(doc => {
        staleBatch.update(doc.ref, { 
          active: false, 
          deactivatedAt: admin.firestore.FieldValue.serverTimestamp(),
          deactivationReason: 'stale'
        });
      });
      await staleBatch.commit();
      
      console.log(`Deactivated ${staleSubscriptions.size} stale subscriptions`);
      
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  });

/**
 * HTTP endpoint to send a test notification (for debugging)
 * Only callable by authenticated admins
 */
exports.sendTestNotification = functions.https.onCall(async (data, context) => {
  // Verify admin
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
  }
  
  // Check if user is admin (you could check a custom claim or specific UIDs)
  const adminEmails = ['liorshur@gmail.com']; // Add your admin emails
  const userEmail = context.auth.token.email;
  
  if (!adminEmails.includes(userEmail)) {
    throw new functions.https.HttpsError('permission-denied', 'Must be admin');
  }
  
  const { token, title, body } = data;
  
  if (!token || !title || !body) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }
  
  try {
    const response = await messaging.send({
      token: token,
      notification: { title, body },
      webpush: {
        notification: {
          icon: './assets/icons/icon.svg',
          badge: './assets/icons/icon.svg'
        }
      }
    });
    
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Test notification failed:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

/**
 * Welcome notification when user subscribes
 */
exports.onNewSubscription = functions.firestore
  .document('push_subscriptions/{userId}')
  .onCreate(async (snap, context) => {
    const subscription = snap.data();
    
    if (!subscription.token || !subscription.active) return;
    
    try {
      await messaging.send({
        token: subscription.token,
        notification: {
          title: '🎉 Notifications Enabled!',
          body: 'You\'ll now receive updates about new trails and app features.'
        },
        webpush: {
          notification: {
            icon: './assets/icons/icon.svg',
            badge: './assets/icons/icon.svg'
          }
        }
      });
      console.log(`Welcome notification sent to ${context.params.userId}`);
    } catch (error) {
      console.log('Welcome notification failed:', error.message);
    }
  });
