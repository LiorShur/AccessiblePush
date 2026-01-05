/**
 * Announcements Admin Module
 * Simple admin interface for creating and managing in-app announcements
 */

import { db, auth } from '../../firebase-setup.js';
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs,
  updateDoc,
  deleteDoc,
  query, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

class AnnouncementsAdmin {
  constructor() {
    this.announcements = [];
  }

  /**
   * Initialize and render the announcements section
   */
  async renderSection(container) {
    container.innerHTML = `
      <div class="announcements-admin">
        <style>
          .announcements-admin {
            padding: 20px;
          }
          .announce-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          @media (max-width: 900px) {
            .announce-grid {
              grid-template-columns: 1fr;
            }
          }
          .announce-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          .announce-card h3 {
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
            min-height: 120px;
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
          .btn-danger {
            background: #fee2e2;
            color: #991b1b;
            border: 1px solid #fca5a5;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.8em;
          }
          .btn-danger:hover {
            background: #fecaca;
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
            white-space: pre-wrap;
          }
          .stats-row {
            display: flex;
            gap: 16px;
            margin-bottom: 20px;
          }
          .stat-box {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 16px 24px;
            border-radius: 10px;
            text-align: center;
            flex: 1;
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
            max-height: 500px;
            overflow-y: auto;
          }
          .history-item {
            padding: 14px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            margin-bottom: 10px;
            background: white;
          }
          .history-item.inactive {
            opacity: 0.6;
            background: #f9fafb;
          }
          .history-item .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
          }
          .history-item .title {
            font-weight: 600;
            color: #1f2937;
          }
          .history-item .meta {
            font-size: 0.75em;
            color: #9ca3af;
          }
          .history-item .body {
            font-size: 0.85em;
            color: #6b7280;
            line-height: 1.4;
            margin-bottom: 10px;
          }
          .history-item .actions {
            display: flex;
            gap: 8px;
          }
          .history-item .status-badge {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.7em;
            font-weight: 600;
          }
          .history-item .status-badge.active {
            background: #dcfce7;
            color: #166534;
          }
          .history-item .status-badge.inactive {
            background: #f3f4f6;
            color: #6b7280;
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
          .char-count {
            font-size: 0.75em;
            color: #9ca3af;
            text-align: right;
            margin-top: 4px;
          }
        </style>

        <div class="stats-row">
          <div class="stat-box">
            <div class="value" id="activeCount">-</div>
            <div class="label">Active</div>
          </div>
          <div class="stat-box">
            <div class="value" id="totalCount">-</div>
            <div class="label">Total</div>
          </div>
        </div>

        <div class="announce-grid">
          <!-- Create Announcement -->
          <div class="announce-card">
            <h3>📢 Create Announcement</h3>
            
            <form id="announcementForm">
              <div class="form-group">
                <label>Title *</label>
                <input type="text" id="announceTitle" placeholder="Announcement title" required maxlength="100">
                <div class="char-count"><span id="titleCount">0</span>/100</div>
              </div>
              
              <div class="form-group">
                <label>Message *</label>
                <textarea id="announceBody" placeholder="Write your announcement message..." required maxlength="1000"></textarea>
                <div class="char-count"><span id="bodyCount">0</span>/1000</div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label>Type</label>
                  <select id="announceType">
                    <option value="general">📣 General</option>
                    <option value="update">🚀 Update</option>
                    <option value="feature">✨ New Feature</option>
                    <option value="maintenance">🔧 Maintenance</option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Priority</label>
                  <select id="announcePriority">
                    <option value="normal">Normal</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
              </div>
              
              <div class="form-group">
                <label>Preview</label>
                <div class="preview-box">
                  <div class="preview-title" id="previewTitle">Your title here</div>
                  <div class="preview-body" id="previewBody">Your message will appear here...</div>
                </div>
              </div>
              
              <button type="submit" class="btn-primary" id="publishBtn">
                📤 Publish Announcement
              </button>
            </form>
          </div>

          <!-- Announcement History -->
          <div class="announce-card">
            <h3>📋 Announcement History</h3>
            <div class="history-list" id="historyList">
              <div class="empty-state">
                <div class="icon">📭</div>
                <div>No announcements yet</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Setup event listeners
    this.setupEventListeners();
    
    // Load data
    await this.loadAnnouncements();
  }

  /**
   * Setup form event listeners
   */
  setupEventListeners() {
    const form = document.getElementById('announcementForm');
    const titleInput = document.getElementById('announceTitle');
    const bodyInput = document.getElementById('announceBody');

    // Live preview & character count
    titleInput?.addEventListener('input', () => {
      this.updatePreview();
      document.getElementById('titleCount').textContent = titleInput.value.length;
    });
    
    bodyInput?.addEventListener('input', () => {
      this.updatePreview();
      document.getElementById('bodyCount').textContent = bodyInput.value.length;
    });

    // Form submission
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.publishAnnouncement();
    });
  }

  /**
   * Update preview
   */
  updatePreview() {
    const title = document.getElementById('announceTitle')?.value || 'Your title here';
    const body = document.getElementById('announceBody')?.value || 'Your message will appear here...';
    
    document.getElementById('previewTitle').textContent = title;
    document.getElementById('previewBody').textContent = body;
  }

  /**
   * Load announcements
   */
  async loadAnnouncements() {
    try {
      const q = query(
        collection(db, 'announcements'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      
      const snapshot = await getDocs(q);
      this.announcements = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Update stats
      const active = this.announcements.filter(a => a.active).length;
      document.getElementById('activeCount').textContent = active;
      document.getElementById('totalCount').textContent = this.announcements.length;
      
      // Render history
      this.renderHistory();
      
    } catch (error) {
      console.error('Error loading announcements:', error);
      document.getElementById('historyList').innerHTML = `
        <div class="empty-state">
          <div class="icon">⚠️</div>
          <div>Failed to load announcements</div>
          <div style="font-size: 0.85em; margin-top: 8px;">${error.message}</div>
        </div>
      `;
    }
  }

  /**
   * Render history list
   */
  renderHistory() {
    const historyList = document.getElementById('historyList');
    
    if (this.announcements.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <div class="icon">📭</div>
          <div>No announcements yet</div>
          <div style="font-size: 0.85em; margin-top: 8px;">Create your first announcement!</div>
        </div>
      `;
      return;
    }
    
    historyList.innerHTML = this.announcements.map(a => {
      const date = a.createdAt?.toDate?.() || new Date();
      const timeAgo = this.getTimeAgo(date);
      const typeEmoji = {
        general: '📣',
        update: '🚀',
        feature: '✨',
        maintenance: '🔧'
      }[a.type] || '📣';
      
      return `
        <div class="history-item ${a.active ? '' : 'inactive'}">
          <div class="header">
            <div>
              <span class="status-badge ${a.active ? 'active' : 'inactive'}">
                ${a.active ? '● Active' : '○ Inactive'}
              </span>
              <span style="margin-left: 8px;">${typeEmoji}</span>
              ${a.priority === 'high' ? '<span style="color: #dc2626; margin-left: 4px;">🔴</span>' : ''}
            </div>
            <div class="meta">${timeAgo}</div>
          </div>
          <div class="title">${this.escapeHtml(a.title)}</div>
          <div class="body">${this.escapeHtml(a.body).substring(0, 150)}${a.body.length > 150 ? '...' : ''}</div>
          <div class="actions">
            ${a.active ? 
              `<button class="btn-secondary" onclick="announcementsAdmin.toggleActive('${a.id}', false)">Deactivate</button>` :
              `<button class="btn-secondary" onclick="announcementsAdmin.toggleActive('${a.id}', true)">Activate</button>`
            }
            <button class="btn-danger" onclick="announcementsAdmin.deleteAnnouncement('${a.id}')">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Publish announcement
   */
  async publishAnnouncement() {
    const btn = document.getElementById('publishBtn');
    const originalText = btn.textContent;
    
    try {
      btn.disabled = true;
      btn.textContent = '⏳ Publishing...';
      
      const title = document.getElementById('announceTitle').value.trim();
      const body = document.getElementById('announceBody').value.trim();
      const type = document.getElementById('announceType').value;
      const priority = document.getElementById('announcePriority').value;
      
      if (!title || !body) {
        throw new Error('Title and message are required');
      }
      
      const announcement = {
        title,
        body,
        type,
        priority,
        active: true,
        author: auth.currentUser?.email || 'Admin',
        authorId: auth.currentUser?.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'announcements'), announcement);
      
      // Clear form
      document.getElementById('announceTitle').value = '';
      document.getElementById('announceBody').value = '';
      document.getElementById('announceType').value = 'general';
      document.getElementById('announcePriority').value = 'normal';
      document.getElementById('titleCount').textContent = '0';
      document.getElementById('bodyCount').textContent = '0';
      this.updatePreview();
      
      // Show success
      alert('✅ Announcement published!\n\nUsers will see this message when they open the app.');
      
      // Reload list
      await this.loadAnnouncements();
      
    } catch (error) {
      console.error('Error publishing:', error);
      alert('❌ Error: ' + error.message);
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }

  /**
   * Toggle active status
   */
  async toggleActive(id, active) {
    try {
      await updateDoc(doc(db, 'announcements', id), {
        active,
        updatedAt: serverTimestamp()
      });
      await this.loadAnnouncements();
    } catch (error) {
      console.error('Error updating:', error);
      alert('❌ Error: ' + error.message);
    }
  }

  /**
   * Delete announcement
   */
  async deleteAnnouncement(id) {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      await deleteDoc(doc(db, 'announcements', id));
      await this.loadAnnouncements();
    } catch (error) {
      console.error('Error deleting:', error);
      alert('❌ Error: ' + error.message);
    }
  }

  /**
   * Get time ago string
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
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
  }
}

// Export singleton
export const announcementsAdmin = new AnnouncementsAdmin();
window.announcementsAdmin = announcementsAdmin;
export default announcementsAdmin;
