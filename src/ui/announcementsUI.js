/**
 * Announcements UI Component
 * Displays admin announcements to users
 * - Bell icon with unread badge (via topToolbarUI)
 * - Auto-show new announcements
 * - Modal to view all announcements
 */

import { announcementsService } from '../services/announcementsService.js';
import { topToolbarUI } from './topToolbarUI.js';

class AnnouncementsUI {
  constructor() {
    this.isModalOpen = false;
    this.initialized = false;
  }

  /**
   * Initialize the announcements UI
   */
  async initialize() {
    if (this.initialized) return;
    
    // Initialize the toolbar (contains bell, feedback, contrast buttons)
    topToolbarUI.initialize();
    
    // Set up callbacks
    announcementsService.onNewAnnouncement = (announcement) => {
      this.showNewAnnouncementBanner(announcement);
    };
    
    announcementsService.onUnreadCountChange = (count) => {
      this.updateBadge(count);
    };
    
    // Initialize the service
    await announcementsService.initialize();
    
    // Update badge with initial count
    this.updateBadge(announcementsService.getUnreadCount());
    
    // Show centered banner if there are unread announcements on first load
    const unread = announcementsService.getUnread();
    if (unread.length > 0) {
      // Show centered banner after a short delay
      setTimeout(() => {
        this.showCenteredBanner(unread.length);
      }, 1500);
    }
    
    this.initialized = true;
    console.log('📢 Announcements UI initialized');
  }

  /**
   * Show centered banner on sign-in with unread count
   */
  showCenteredBanner(unreadCount) {
    // Remove any existing banner
    document.getElementById('announcement-center-banner')?.remove();
    document.getElementById('announcement-center-banner-overlay')?.remove();
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'announcement-center-banner-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.3);
      z-index: 10002;
    `;
    overlay.onclick = () => this.dismissCenteredBanner();
    
    // Create banner
    const banner = document.createElement('div');
    banner.id = 'announcement-center-banner';
    banner.innerHTML = `
      <style>
        #announcement-center-banner {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #1e3a2f, #2c5530);
          color: white;
          padding: 24px 32px;
          border-radius: 20px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.3);
          z-index: 10003;
          text-align: center;
          cursor: pointer;
          animation: popIn 0.3s ease-out;
          min-width: 280px;
        }
        @keyframes popIn {
          from { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
          to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
        #announcement-center-banner:hover {
          transform: translate(-50%, -50%) scale(1.02);
        }
        #announcement-center-banner .icon {
          font-size: 40px;
          margin-bottom: 12px;
          display: block;
        }
        #announcement-center-banner .title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        #announcement-center-banner .subtitle {
          font-size: 14px;
          opacity: 0.9;
        }
        #announcement-center-banner .tap-hint {
          font-size: 12px;
          opacity: 0.7;
          margin-top: 12px;
        }
      </style>
      <div class="icon">📢</div>
      <div class="title">${unreadCount} New Announcement${unreadCount > 1 ? 's' : ''}</div>
      <div class="subtitle">You have unread messages</div>
      <div class="tap-hint">Tap to view</div>
    `;
    
    // Click banner to open modal
    banner.addEventListener('click', () => {
      this.dismissCenteredBanner();
      this.openModal();
    });
    
    document.body.appendChild(overlay);
    document.body.appendChild(banner);
    
    // Auto-dismiss after 3 seconds and start wiggle
    setTimeout(() => {
      this.dismissCenteredBanner();
      this.startWiggle();
    }, 3000);
  }

  /**
   * Dismiss the centered banner
   */
  dismissCenteredBanner() {
    const banner = document.getElementById('announcement-center-banner');
    const overlay = document.getElementById('announcement-center-banner-overlay');
    
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.2s';
      setTimeout(() => overlay.remove(), 200);
    }
    
    if (banner) {
      banner.style.animation = 'popIn 0.2s ease-out reverse forwards';
      setTimeout(() => banner.remove(), 200);
    }
  }

  /**
   * Update the badge count via toolbar
   */
  updateBadge(count) {
    topToolbarUI.updateBadge(count);
  }

  /**
   * Start wiggle animation via toolbar
   */
  startWiggle() {
    if (announcementsService.getUnreadCount() > 0) {
      topToolbarUI.startWiggle();
    }
  }

  /**
   * Stop wiggle animation via toolbar
   */
  stopWiggle() {
    topToolbarUI.stopWiggle();
  }

  /**
   * Show banner for new announcement
   */
  showNewAnnouncementBanner(announcement) {
    // Remove any existing banner
    document.getElementById('announcement-banner')?.remove();
    
    const banner = document.createElement('div');
    banner.id = 'announcement-banner';
    banner.innerHTML = `
      <style>
        #announcement-banner {
          position: fixed;
          top: 60px;
          left: 16px;
          right: 16px;
          max-width: 500px;
          margin: 0 auto;
          background: linear-gradient(135deg, #1e3a2f, #2c5530);
          color: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          z-index: 10001;
          animation: slideDown 0.4s ease-out;
          overflow: hidden;
        }
        @keyframes slideDown {
          from { transform: translateY(-100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        #announcement-banner .banner-header {
          padding: 12px 16px;
          background: rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        #announcement-banner .banner-content {
          padding: 16px 20px;
        }
        #announcement-banner .banner-title {
          font-weight: 700;
          font-size: 16px;
          margin-bottom: 6px;
        }
        #announcement-banner .banner-body {
          font-size: 14px;
          opacity: 0.9;
          line-height: 1.5;
        }
        #announcement-banner .banner-actions {
          padding: 12px 16px;
          background: rgba(0,0,0,0.1);
          display: flex;
          gap: 10px;
        }
        #announcement-banner .btn-view {
          flex: 1;
          background: white;
          color: #1e3a2f;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        }
        #announcement-banner .btn-dismiss {
          background: rgba(255,255,255,0.2);
          color: white;
          border: none;
          padding: 10px 16px;
          border-radius: 8px;
          cursor: pointer;
        }
        #announcement-banner .close-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        #announcement-banner .close-btn:hover {
          background: rgba(255,255,255,0.3);
        }
      </style>
      <button class="close-btn" onclick="announcementsUI.dismissBanner('${announcement.id}')">×</button>
      <div class="banner-header">
        <span>📢</span>
        <span>New Announcement</span>
      </div>
      <div class="banner-content">
        <div class="banner-title">${this.escapeHtml(announcement.title)}</div>
        <div class="banner-body">${this.escapeHtml(announcement.body).substring(0, 150)}${announcement.body.length > 150 ? '...' : ''}</div>
      </div>
      <div class="banner-actions">
        <button class="btn-view" onclick="announcementsUI.openModal(); announcementsUI.dismissBanner('${announcement.id}')">View All</button>
        <button class="btn-dismiss" onclick="announcementsUI.dismissBanner('${announcement.id}')">Dismiss</button>
      </div>
    `;
    
    document.body.appendChild(banner);
    
    // Auto-dismiss after 15 seconds, then start wiggle
    setTimeout(() => {
      this.dismissBanner(announcement.id, true);
      this.startWiggle();
    }, 15000);
  }

  /**
   * Dismiss the banner
   */
  dismissBanner(announcementId, silent = false) {
    const banner = document.getElementById('announcement-banner');
    if (banner) {
      banner.style.animation = 'slideDown 0.3s ease-out reverse';
      setTimeout(() => banner.remove(), 300);
    }
    
    if (announcementId && !silent) {
      announcementsService.markAsRead(announcementId);
    }
  }

  /**
   * Open the announcements modal
   */
  openModal() {
    if (this.isModalOpen) return;
    this.isModalOpen = true;
    
    // Stop wiggle when opening modal
    this.stopWiggle();
    
    const announcements = announcementsService.getAll();
    
    const modal = document.createElement('div');
    modal.id = 'announcements-modal';
    modal.innerHTML = `
      <style>
        #announcements-modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10002;
          padding: 20px;
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        #announcements-modal .modal-content {
          background: white;
          border-radius: 20px;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          animation: scaleIn 0.2s ease-out;
          overflow: hidden;
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); }
          to { transform: scale(1); }
        }
        #announcements-modal .modal-header {
          padding: 20px;
          background: linear-gradient(135deg, #1e3a2f, #2c5530);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        #announcements-modal .modal-header h2 {
          margin: 0;
          font-size: 1.2em;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        #announcements-modal .modal-close {
          background: rgba(255,255,255,0.2);
          border: none;
          color: white;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
        }
        #announcements-modal .modal-close:hover {
          background: rgba(255,255,255,0.3);
        }
        #announcements-modal .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 0;
        }
        #announcements-modal .announcement-item {
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
          cursor: pointer;
          transition: background 0.15s;
        }
        #announcements-modal .announcement-item:hover {
          background: #f9fafb;
        }
        #announcements-modal .announcement-item.unread {
          background: #f0fdf4;
          border-left: 4px solid #22c55e;
        }
        #announcements-modal .announcement-item.unread:hover {
          background: #dcfce7;
        }
        #announcements-modal .announcement-item .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 6px;
        }
        #announcements-modal .announcement-item .title {
          font-weight: 600;
          color: #1f2937;
          font-size: 15px;
        }
        #announcements-modal .announcement-item .time {
          font-size: 12px;
          color: #9ca3af;
          white-space: nowrap;
          margin-left: 12px;
        }
        #announcements-modal .announcement-item .body {
          font-size: 14px;
          color: #6b7280;
          line-height: 1.5;
        }
        #announcements-modal .announcement-item .attachments {
          display: flex;
          gap: 8px;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        #announcements-modal .announcement-item .attachment-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: #e0f2fe;
          color: #0369a1;
          border-radius: 6px;
          font-size: 12px;
          text-decoration: none;
        }
        #announcements-modal .announcement-item .attachment-link:hover {
          background: #bae6fd;
        }
        #announcements-modal .announcement-item .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
          margin-right: 8px;
        }
        #announcements-modal .announcement-item .badge.new {
          background: #dcfce7;
          color: #166534;
        }
        #announcements-modal .announcement-item .badge.update {
          background: #dbeafe;
          color: #1e40af;
        }
        #announcements-modal .announcement-item .badge.important {
          background: #fee2e2;
          color: #991b1b;
        }
        #announcements-modal .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #6b7280;
        }
        #announcements-modal .empty-state .icon {
          font-size: 48px;
          margin-bottom: 12px;
        }
        #announcements-modal .modal-footer {
          padding: 12px 20px;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          text-align: center;
        }
        #announcements-modal .mark-all-btn {
          background: none;
          border: none;
          color: #2c5530;
          font-weight: 600;
          cursor: pointer;
          font-size: 14px;
        }
        #announcements-modal .mark-all-btn:hover {
          text-decoration: underline;
        }
        
        /* Expanded view */
        #announcements-modal .announcement-expanded {
          padding: 20px;
        }
        #announcements-modal .announcement-expanded .back-btn {
          background: #f3f4f6;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 14px;
          margin-bottom: 16px;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        #announcements-modal .announcement-expanded .title {
          font-size: 20px;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 8px;
        }
        #announcements-modal .announcement-expanded .meta {
          font-size: 13px;
          color: #9ca3af;
          margin-bottom: 16px;
        }
        #announcements-modal .announcement-expanded .body {
          font-size: 15px;
          line-height: 1.7;
          color: #374151;
          white-space: pre-wrap;
        }
        #announcements-modal .announcement-expanded .attachments {
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }
        #announcements-modal .announcement-expanded .attachments h4 {
          font-size: 14px;
          color: #6b7280;
          margin: 0 0 10px 0;
        }
        #announcements-modal .announcement-expanded .attachment-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          margin-right: 10px;
          margin-bottom: 10px;
        }
        #announcements-modal .announcement-expanded .attachment-btn:hover {
          background: #dcfce7;
        }
      </style>
      <div class="modal-content">
        <div class="modal-header">
          <h2>📢 Announcements</h2>
          <button class="modal-close" onclick="announcementsUI.closeModal()">×</button>
        </div>
        <div class="modal-body" id="announcements-list">
          ${this.renderAnnouncementsList(announcements)}
        </div>
        ${announcements.length > 0 ? `
          <div class="modal-footer">
            <button class="mark-all-btn" onclick="announcementsUI.markAllRead()">
              ✓ Mark all as read
            </button>
          </div>
        ` : ''}
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.closeModal();
    });
    
    // Close on Escape
    const escHandler = (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  /**
   * Render announcements list
   */
  renderAnnouncementsList(announcements) {
    if (announcements.length === 0) {
      return `
        <div class="empty-state">
          <div class="icon">📭</div>
          <div>No announcements yet</div>
          <div style="font-size: 13px; margin-top: 8px;">Check back later for updates!</div>
        </div>
      `;
    }
    
    return announcements.map(a => {
      const isUnread = !announcementsService.isRead(a.id);
      const timeAgo = announcementsService.getTimeAgo(a.createdAt);
      const badgeClass = a.priority === 'high' ? 'important' : (a.type === 'update' ? 'update' : 'new');
      const badgeText = a.priority === 'high' ? 'Important' : (a.type === 'update' ? 'Update' : 'New');
      
      // Build attachments HTML
      let attachmentsHtml = '';
      if (a.linkUrl || a.documentUrl) {
        attachmentsHtml = '<div class="attachments">';
        if (a.linkUrl) {
          attachmentsHtml += `<a href="${this.escapeHtml(a.linkUrl)}" target="_blank" class="attachment-link" onclick="event.stopPropagation()">🔗 Link</a>`;
        }
        if (a.documentUrl) {
          attachmentsHtml += `<a href="${this.escapeHtml(a.documentUrl)}" target="_blank" class="attachment-link" onclick="event.stopPropagation()">📎 Document</a>`;
        }
        attachmentsHtml += '</div>';
      }
      
      return `
        <div class="announcement-item ${isUnread ? 'unread' : ''}" onclick="announcementsUI.viewAnnouncement('${a.id}')">
          <div class="header">
            <div class="title">
              ${isUnread ? `<span class="badge ${badgeClass}">${badgeText}</span>` : ''}
              ${this.escapeHtml(a.title)}
            </div>
            <div class="time">${timeAgo}</div>
          </div>
          <div class="body">${this.escapeHtml(a.body).substring(0, 100)}${a.body.length > 100 ? '...' : ''}</div>
          ${attachmentsHtml}
        </div>
      `;
    }).join('');
  }

  /**
   * View a single announcement
   */
  viewAnnouncement(id) {
    const announcement = announcementsService.getAll().find(a => a.id === id);
    if (!announcement) return;
    
    // Mark as read
    announcementsService.markAsRead(id);
    
    const listEl = document.getElementById('announcements-list');
    if (!listEl) return;
    
    const timeAgo = announcementsService.getTimeAgo(announcement.createdAt);
    
    // Build attachments HTML
    let attachmentsHtml = '';
    if (announcement.linkUrl || announcement.documentUrl) {
      attachmentsHtml = '<div class="attachments"><h4>📎 Attachments</h4>';
      if (announcement.linkUrl) {
        attachmentsHtml += `<a href="${this.escapeHtml(announcement.linkUrl)}" target="_blank" class="attachment-btn">🔗 Open Link</a>`;
      }
      if (announcement.documentUrl) {
        const docName = announcement.documentName || 'Document';
        attachmentsHtml += `<a href="${this.escapeHtml(announcement.documentUrl)}" target="_blank" class="attachment-btn">📄 ${this.escapeHtml(docName)}</a>`;
      }
      attachmentsHtml += '</div>';
    }
    
    listEl.innerHTML = `
      <div class="announcement-expanded">
        <button class="back-btn" onclick="announcementsUI.showList()">
          ← Back to list
        </button>
        <div class="title">${this.escapeHtml(announcement.title)}</div>
        <div class="meta">
          Posted ${timeAgo}
          ${announcement.author ? ` by ${this.escapeHtml(announcement.author)}` : ''}
        </div>
        <div class="body">${this.escapeHtml(announcement.body)}</div>
        ${attachmentsHtml}
      </div>
    `;
  }

  /**
   * Show the list view
   */
  showList() {
    const listEl = document.getElementById('announcements-list');
    if (!listEl) return;
    
    const announcements = announcementsService.getAll();
    listEl.innerHTML = this.renderAnnouncementsList(announcements);
  }

  /**
   * Mark all as read
   */
  markAllRead() {
    announcementsService.markAllAsRead();
    this.showList(); // Refresh the list
  }

  /**
   * Close the modal
   */
  closeModal() {
    const modal = document.getElementById('announcements-modal');
    if (modal) {
      modal.style.animation = 'fadeIn 0.2s ease-out reverse';
      setTimeout(() => modal.remove(), 200);
    }
    this.isModalOpen = false;
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Export singleton
export const announcementsUI = new AnnouncementsUI();
window.announcementsUI = announcementsUI;
export default announcementsUI;
