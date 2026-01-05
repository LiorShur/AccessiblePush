/**
 * Push Notification Admin Module
 * Handles sending push notifications from admin dashboard
 */

import { db, auth } from '../../firebase-setup.js';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

class NotificationAdmin {
  constructor() {
    this.subscribers = [];
    this.notificationHistory = [];
  }

  /**
   * Initialize and render the notifications section
   */
  async renderSection(container) {
    container.innerHTML = `
      <div class="notifications-admin">
        <style>
          .notifications-admin {
            padding: 20px;
          }
          .notif-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          @media (max-width: 900px) {
            .notif-grid {
              grid-template-columns: 1fr;
            }
          }
          .notif-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          .notif-card h3 {
            margin: 0 0 16px 0;
            font-size: 1.1em;
            color: #1e3a2f;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .form-group {
            margin-bottom: 16px;
          }
          .form-group label {
            display: block;
            margin-bottom: 6px;
            font-weight: 500;
            color: #374151;
            font-size: 0.9em;
          }
          .form-group input,
          .form-group textarea,
          .form-group select {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 0.95em;
            transition: border-color 0.2s, box-shadow 0.2s;
          }
          .form-group input:focus,
          .form-group textarea:focus,
          .form-group select:focus {
            outline: none;
            border-color: #2c5530;
            box-shadow: 0 0 0 3px rgba(44, 85, 48, 0.1);
          }
          .form-group textarea {
            min-height: 80px;
            resize: vertical;
          }
          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .btn-primary {
            background: linear-gradient(135deg, #2c5530, #1e3a2f);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            font-size: 1em;
            transition: transform 0.15s, box-shadow 0.15s;
          }
          .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(44, 85, 48, 0.3);
          }
          .btn-primary:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
          }
          .btn-secondary {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9em;
          }
          .btn-secondary:hover {
            background: #e5e7eb;
          }
          .preview-box {
            background: linear-gradient(135deg, #1e3a2f, #2c5530);
            color: white;
            padding: 16px;
            border-radius: 12px;
            margin-top: 12px;
          }
          .preview-box .preview-title {
            font-weight: 600;
            margin-bottom: 4px;
          }
          .preview-box .preview-body {
            font-size: 0.9em;
            opacity: 0.9;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 20px;
          }
          .stat-box {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 16px;
            border-radius: 10px;
            text-align: center;
          }
          .stat-box .value {
            font-size: 1.8em;
            font-weight: 700;
            color: #166534;
          }
          .stat-box .label {
            font-size: 0.8em;
            color: #6b7280;
            margin-top: 4px;
          }
          .history-list {
            max-height: 400px;
            overflow-y: auto;
          }
          .history-item {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            align-items: flex-start;
            gap: 12px;
          }
          .history-item:last-child {
            border-bottom: none;
          }
          .history-item .icon {
            width: 36px;
            height: 36px;
            background: #dcfce7;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .history-item .content {
            flex: 1;
            min-width: 0;
          }
          .history-item .title {
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 2px;
          }
          .history-item .body {
            font-size: 0.85em;
            color: #6b7280;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .history-item .meta {
            font-size: 0.75em;
            color: #9ca3af;
            margin-top: 4px;
          }
          .recipient-badges {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
            margin-top: 8px;
          }
          .recipient-badge {
            background: #e0f2fe;
            color: #0369a1;
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 0.75em;
            font-weight: 500;
          }
          .empty-state {
            text-align: center;
            padding: 40px 20px;
            color: #6b7280;
          }
          .empty-state .icon {
            font-size: 48px;
            margin-bottom: 12px;
          }
          .config-notice {
            background: #fef3c7;
            border: 1px solid #fcd34d;
            border-radius: 8px;
            padding: 12px 16px;
            margin-bottom: 20px;
            font-size: 0.9em;
            color: #92400e;
          }
          .config-notice a {
            color: #92400e;
            font-weight: 600;
          }
        </style>

        <div id="configNotice" class="config-notice" style="display: none;">
          ⚠️ Push notifications require setup. 
          <a href="#" onclick="notificationAdmin.showSetupModal(); return false;">Configure VAPID keys</a>
        </div>

        <div class="stats-grid">
          <div class="stat-box">
            <div class="value" id="totalSubscribers">-</div>
            <div class="label">Subscribers</div>
          </div>
          <div class="stat-box">
            <div class="value" id="activeSubscribers">-</div>
            <div class="label">Active</div>
          </div>
          <div class="stat-box">
            <div class="value" id="notificationsSent">-</div>
            <div class="label">Sent (30d)</div>
          </div>
        </div>

        <div class="notif-grid">
          <!-- Compose Notification -->
          <div class="notif-card">
            <h3>📢 Send Notification</h3>
            
            <form id="notificationForm">
              <div class="form-group">
                <label>Title *</label>
                <input type="text" id="notifTitle" placeholder="Notification title" required maxlength="100">
              </div>
              
              <div class="form-group">
                <label>Message *</label>
                <textarea id="notifBody" placeholder="Notification message..." required maxlength="500"></textarea>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Recipients</label>
                  <select id="notifRecipients">
                    <option value="all">All Subscribers</option>
                    <option value="beta">Beta Users Only</option>
                    <option value="active">Active Users (30d)</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Priority</label>
                  <select id="notifPriority">
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label>Link URL (optional)</label>
                <input type="text" id="notifUrl" placeholder="./tracker.html or https://...">
              </div>
              
              <div class="form-group">
                <label>Preview</label>
                <div class="preview-box">
                  <div class="preview-title" id="previewTitle">Your title here</div>
                  <div class="preview-body" id="previewBody">Your message will appear here...</div>
                </div>
              </div>
              
              <button type="submit" class="btn-primary" id="sendBtn">
                🚀 Send Notification
              </button>
            </form>
          </div>

          <!-- Notification History -->
          <div class="notif-card">
            <h3>📋 Recent Notifications</h3>
            <div class="history-list" id="historyList">
              <div class="empty-state">
                <div class="icon">📭</div>
                <div>No notifications sent yet</div>
              </div>
            </div>
            <button class="btn-secondary" style="margin-top: 12px; width: 100%;" onclick="notificationAdmin.loadHistory()">
              🔄 Refresh History
            </button>
          </div>
        </div>
      </div>
    `;

    // Setup event listeners
    this.setupEventListeners();
    
    // Load initial data
    await this.loadStats();
    await this.loadHistory();
    await this.checkConfig();
  }

  /**
   * Setup form event listeners
   */
  setupEventListeners() {
    const form = document.getElementById('notificationForm');
    const titleInput = document.getElementById('notifTitle');
    const bodyInput = document.getElementById('notifBody');

    // Live preview
    titleInput?.addEventListener('input', () => this.updatePreview());
    bodyInput?.addEventListener('input', () => this.updatePreview());

    // Form submission
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.sendNotification();
    });
  }

  /**
   * Update preview
   */
  updatePreview() {
    const title = document.getElementById('notifTitle')?.value || 'Your title here';
    const body = document.getElementById('notifBody')?.value || 'Your message will appear here...';
    
    document.getElementById('previewTitle').textContent = title;
    document.getElementById('previewBody').textContent = body;
  }

  /**
   * Check if VAPID keys are configured
   */
  async checkConfig() {
    try {
      const configDoc = await getDoc(doc(db, 'app_config', 'push_notifications'));
      const notice = document.getElementById('configNotice');
      
      if (!configDoc.exists() || !configDoc.data().vapidKey) {
        if (notice) {
          notice.style.display = 'block';
          notice.innerHTML = `
            ⚠️ Push notifications require setup. 
            <a href="#" onclick="notificationAdmin.showSetupModal(); return false;" style="color: #92400e; font-weight: 600;">Configure VAPID keys</a>
            <button onclick="notificationAdmin.showSetupModal()" style="margin-left: 12px; padding: 6px 12px; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
              🔧 Setup Now
            </button>
          `;
        }
      } else {
        if (notice) notice.style.display = 'none';
      }
    } catch (error) {
      console.error('Error checking config:', error);
      // Show setup anyway if we can't check (likely permissions issue)
      const notice = document.getElementById('configNotice');
      if (notice) {
        notice.style.display = 'block';
        notice.innerHTML = `
          ⚠️ First time setup required. 
          <button onclick="notificationAdmin.showSetupModal()" style="margin-left: 12px; padding: 6px 12px; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">
            🔧 Setup Push Notifications
          </button>
          <div style="margin-top: 8px; font-size: 0.85em;">
            You'll also need to update Firestore rules. <a href="#" onclick="notificationAdmin.showRulesHelp(); return false;">View required rules</a>
          </div>
        `;
      }
    }
  }

  /**
   * Load subscriber stats
   */
  async loadStats() {
    try {
      const subsQuery = query(collection(db, 'push_subscriptions'));
      const subsSnapshot = await getDocs(subsQuery);
      
      let total = 0;
      let active = 0;
      
      subsSnapshot.forEach(doc => {
        total++;
        if (doc.data().active) active++;
      });
      
      document.getElementById('totalSubscribers').textContent = total;
      document.getElementById('activeSubscribers').textContent = active;
      
      // Count notifications in last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const notifsQuery = query(
        collection(db, 'notifications_sent'),
        where('sentAt', '>=', thirtyDaysAgo),
        limit(100)
      );
      
      try {
        const notifsSnapshot = await getDocs(notifsQuery);
        document.getElementById('notificationsSent').textContent = notifsSnapshot.size;
      } catch (e) {
        // Index might not exist
        document.getElementById('notificationsSent').textContent = '0';
      }
      
      this.subscribers = subsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
    } catch (error) {
      console.error('Error loading stats:', error);
      // Show zeros but don't break the UI
      document.getElementById('totalSubscribers').textContent = '0';
      document.getElementById('activeSubscribers').textContent = '0';
      document.getElementById('notificationsSent').textContent = '0';
      
      // Show permission notice if that's the issue
      if (error.message?.includes('permission')) {
        const notice = document.getElementById('configNotice');
        if (notice && notice.style.display === 'none') {
          notice.style.display = 'block';
          notice.innerHTML = `
            ⚠️ Permission denied. Please update your 
            <a href="#" onclick="notificationAdmin.showRulesHelp(); return false;" style="color: #92400e; font-weight: 600;">Firestore security rules</a>
            to access push notification data.
          `;
        }
      }
    }
  }

  /**
   * Load notification history
   */
  async loadHistory() {
    const historyList = document.getElementById('historyList');
    
    try {
      const historyQuery = query(
        collection(db, 'notifications_sent'),
        orderBy('sentAt', 'desc'),
        limit(20)
      );
      
      const snapshot = await getDocs(historyQuery);
      
      if (snapshot.empty) {
        historyList.innerHTML = `
          <div class="empty-state">
            <div class="icon">📭</div>
            <div>No notifications sent yet</div>
            <div style="font-size: 0.85em; margin-top: 8px; color: #9ca3af;">
              Send your first notification using the form
            </div>
          </div>
        `;
        return;
      }
      
      historyList.innerHTML = snapshot.docs.map(doc => {
        const data = doc.data();
        const date = data.sentAt?.toDate?.() || new Date();
        const timeAgo = this.getTimeAgo(date);
        
        return `
          <div class="history-item">
            <div class="icon">📬</div>
            <div class="content">
              <div class="title">${this.escapeHtml(data.title)}</div>
              <div class="body">${this.escapeHtml(data.body)}</div>
              <div class="meta">
                ${timeAgo} • ${data.recipientCount || 0} recipients
                ${data.status === 'pending' || data.status === 'queued' ? '⏳ Queued' : data.status === 'sent' ? '✅ Sent' : '❌ Failed'}
              </div>
            </div>
          </div>
        `;
      }).join('');
      
    } catch (error) {
      console.error('Error loading history:', error);
      
      // Check if it's a permissions or index issue
      if (error.message?.includes('permission')) {
        historyList.innerHTML = `
          <div class="empty-state">
            <div class="icon">🔒</div>
            <div>Permission denied</div>
            <div style="font-size: 0.85em; margin-top: 8px;">
              <a href="#" onclick="notificationAdmin.showRulesHelp(); return false;">Update Firestore rules</a>
            </div>
          </div>
        `;
      } else if (error.message?.includes('index')) {
        historyList.innerHTML = `
          <div class="empty-state">
            <div class="icon">📊</div>
            <div>Index required</div>
            <div style="font-size: 0.85em; margin-top: 8px; color: #9ca3af;">
              Check console for index creation link
            </div>
          </div>
        `;
      } else {
        historyList.innerHTML = `
          <div class="empty-state">
            <div class="icon">📭</div>
            <div>No history yet</div>
            <div style="font-size: 0.85em; margin-top: 8px; color: #9ca3af;">
              History will appear after you send notifications
            </div>
          </div>
        `;
      }
    }
  }

  /**
   * Send notification
   */
  async sendNotification() {
    const btn = document.getElementById('sendBtn');
    const originalText = btn.textContent;
    
    try {
      btn.disabled = true;
      btn.textContent = '⏳ Sending...';
      
      const title = document.getElementById('notifTitle').value.trim();
      const body = document.getElementById('notifBody').value.trim();
      const recipients = document.getElementById('notifRecipients').value;
      const priority = document.getElementById('notifPriority').value;
      const url = document.getElementById('notifUrl').value.trim();
      
      if (!title || !body) {
        throw new Error('Title and message are required');
      }
      
      // Get recipient tokens based on selection
      let targetSubscribers = this.subscribers.filter(s => s.active && s.token);
      
      if (recipients === 'beta') {
        targetSubscribers = targetSubscribers.filter(s => s.isBetaUser);
      } else if (recipients === 'active') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        targetSubscribers = targetSubscribers.filter(s => {
          const lastActive = s.updatedAt?.toDate?.() || new Date(0);
          return lastActive >= thirtyDaysAgo;
        });
      }
      
      if (targetSubscribers.length === 0) {
        throw new Error('No subscribers match the selected criteria');
      }
      
      // Create notification record in Firestore
      // This will be picked up by a Cloud Function to actually send
      const notificationDoc = {
        title,
        body,
        url: url || null,
        priority,
        recipients,
        recipientCount: targetSubscribers.length,
        tokens: targetSubscribers.map(s => s.token),
        status: 'pending',
        sentBy: auth.currentUser?.uid,
        sentByEmail: auth.currentUser?.email,
        sentAt: serverTimestamp(),
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'notifications_queue'), notificationDoc);
      
      // Also log to history
      await addDoc(collection(db, 'notifications_sent'), {
        ...notificationDoc,
        queueId: docRef.id,
        status: 'queued'
      });
      
      // Clear form
      document.getElementById('notifTitle').value = '';
      document.getElementById('notifBody').value = '';
      document.getElementById('notifUrl').value = '';
      this.updatePreview();
      
      // Show success
      alert(`✅ Notification queued!\n\nWill be sent to ${targetSubscribers.length} subscribers.\n\nNote: Requires Cloud Function to process queue.`);
      
      // Reload history
      await this.loadHistory();
      
    } catch (error) {
      console.error('Error sending notification:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }

  /**
   * Show Firestore rules help
   */
  showRulesHelp() {
    const rulesText = `// Add these rules to your Firestore rules

// App configuration - only admins can read/write
match /app_config/{configId} {
  allow read: if isAdmin();
  allow write: if isAdmin();
}

// Push subscriptions - users can manage their own
match /push_subscriptions/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  allow read: if isAdmin();
}

// Notification queue - only admins can create
match /notifications_queue/{notificationId} {
  allow read, create: if isAdmin();
}

// Notification history - admins can read/create
match /notifications_sent/{notificationId} {
  allow read, create: if isAdmin();
}

// Helper function - add your admin emails
function isAdmin() {
  return request.auth != null && 
         request.auth.token.email in ['liorshur@gmail.com'];
}`;

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <style>
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }
        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 600px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
        }
        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-header h2 {
          margin: 0;
          font-size: 1.2em;
        }
        .modal-body {
          padding: 20px;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
        }
        .rules-code {
          background: #1f2937;
          color: #e5e7eb;
          padding: 16px;
          border-radius: 8px;
          font-family: monospace;
          font-size: 0.8em;
          white-space: pre-wrap;
          overflow-x: auto;
          max-height: 400px;
          overflow-y: auto;
        }
        .copy-btn {
          margin-top: 12px;
          padding: 10px 20px;
          background: #2c5530;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
        }
      </style>
      <div class="modal-content">
        <div class="modal-header">
          <h2>📋 Firestore Security Rules</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom: 16px;">Add these rules to your Firestore security rules in the Firebase Console:</p>
          <div class="rules-code">${this.escapeHtml(rulesText)}</div>
          <button class="copy-btn" onclick="navigator.clipboard.writeText(\`${rulesText.replace(/`/g, '\\`')}\`); this.textContent='✅ Copied!'; setTimeout(() => this.textContent='📋 Copy Rules', 2000);">
            📋 Copy Rules
          </button>
          <p style="margin-top: 16px; font-size: 0.9em; color: #6b7280;">
            Go to: Firebase Console → Firestore Database → Rules → Edit and add these rules
          </p>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  /**
   * Show setup modal for configuring VAPID keys
   */
  showSetupModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <style>
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          padding: 20px;
        }
        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
        }
        .modal-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-header h2 {
          margin: 0;
          font-size: 1.2em;
        }
        .modal-body {
          padding: 20px;
        }
        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #6b7280;
        }
        .setup-steps {
          font-size: 0.9em;
          line-height: 1.6;
        }
        .setup-steps ol {
          padding-left: 20px;
        }
        .setup-steps li {
          margin-bottom: 12px;
        }
        .setup-steps code {
          background: #f3f4f6;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.85em;
        }
        .vapid-form {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }
      </style>
      <div class="modal-content">
        <div class="modal-header">
          <h2>🔧 Push Notification Setup</h2>
          <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">×</button>
        </div>
        <div class="modal-body">
          <div class="setup-steps">
            <h4>Step 1: Generate VAPID Keys</h4>
            <ol>
              <li>Go to <a href="https://console.firebase.google.com" target="_blank">Firebase Console</a></li>
              <li>Select your project → Project Settings → Cloud Messaging</li>
              <li>Under "Web Push certificates", click "Generate key pair"</li>
              <li>Copy the key pair (public key)</li>
            </ol>
            
            <h4>Step 2: Save Configuration</h4>
            <div class="vapid-form">
              <div class="form-group">
                <label>VAPID Public Key</label>
                <input type="text" id="vapidKeyInput" placeholder="BNxd..." style="font-family: monospace;">
              </div>
              <button class="btn-primary" onclick="notificationAdmin.saveVapidKey()">
                💾 Save Configuration
              </button>
            </div>
            
            <h4 style="margin-top: 20px;">Step 3: Deploy Cloud Function</h4>
            <p>To actually send notifications, deploy the Cloud Function:</p>
            <ol>
              <li>Install Firebase CLI: <code>npm install -g firebase-tools</code></li>
              <li>Initialize functions: <code>firebase init functions</code></li>
              <li>Deploy the notification function (code provided separately)</li>
            </ol>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  /**
   * Save VAPID key to Firestore
   */
  async saveVapidKey() {
    const vapidKey = document.getElementById('vapidKeyInput')?.value?.trim();
    
    if (!vapidKey) {
      alert('Please enter a VAPID key');
      return;
    }
    
    try {
      await setDoc(doc(db, 'app_config', 'push_notifications'), {
        vapidKey: vapidKey,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.email
      }, { merge: true });
      
      alert('✅ VAPID key saved successfully!');
      document.querySelector('.modal-overlay')?.remove();
      await this.checkConfig();
      
    } catch (error) {
      console.error('Error saving VAPID key:', error);
      alert('❌ Error: ' + error.message);
    }
  }

  /**
   * Utility: Get time ago string
   */
  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  }

  /**
   * Utility: Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }
}

// Export singleton
export const notificationAdmin = new NotificationAdmin();
window.notificationAdmin = notificationAdmin;
export default notificationAdmin;