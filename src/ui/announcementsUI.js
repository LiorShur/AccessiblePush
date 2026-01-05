/**
 * Announcements UI Component
 * Displays admin announcements to users
 * - Bell icon with unread badge
 * - Auto-show new announcements
 * - Modal to view all announcements
 */

import { announcementsService } from '../services/announcementsService.js';

class AnnouncementsUI {
  constructor() {
    this.isModalOpen = false;
    this.bellElement = null;
    this.initialized = false;
  }

  /**
   * Initialize the announcements UI
   */
  async initialize() {
    if (this.initialized) return;
    
    // Create the bell icon
    this.createBellIcon();
    
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
    
    // Show any unread announcements on first load
    const unread = announcementsService.getUnread();
    if (unread.length > 0) {
      // Show the most recent unread announcement after a delay
      setTimeout(() => {
        this.showNewAnnouncementBanner(unread[0]);
      }, 2000);
    }
    
    this.initialized = true;
    console.log('📢 Announcements UI initialized');
  }

  /**
   * Create the bell icon in the nav
   */
  createBellIcon() {
    // Check if bell already exists
    if (document.getElementById('announcementsBell')) return;
    
    // Find nav menu or create floating bell
    const navMenu = document.getElementById('navMenu');
    
    const bellContainer = document.createElement('div');
    bellContainer.id = 'announcementsBell';
    bellContainer.innerHTML = `
      <style>
        #announcementsBell {
          position: fixed;
          top: 12px;
          right: 60px;
          z-index: 1000;
        }
        #announcementsBell .bell-btn {
          background: rgba(255, 255, 255, 0.95);
          border: 1px solid #e5e7eb;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          position: relative;
        }
        #announcementsBell .bell-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        #announcementsBell .bell-btn:active {
          transform: scale(0.95);
        }
        #announcementsBell .badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #ef4444;
          color: white;
          font-size: 11px;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }
        #announcementsBell .badge.hidden {
          display: none;
        }
        #announcementsBell .badge.pulse {
          animation: badgePulse 1s ease-in-out infinite;
        }
        @keyframes badgePulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.2); }
        }
        
        /* High contrast support */
        .high-contrast #announcementsBell .bell-btn {
          background: #000;
          border-color: #fff;
        }
        .high-contrast #announcementsBell .bell-btn .icon {
          filter: invert(1);
        }
      </style>
      <button class="bell-btn" onclick="announcementsUI.openModal()" aria-label="View announcements">
        <span class="icon">🔔</span>
        <span class="badge hidden" id="announcementsBadge">0</span>
      </button>
    `;
    
    document.body.appendChild(bellContainer);
    this.bellElement = bellContainer;
  }

  /**
   * Update the badge count
   */
  updateBadge(count) {
    const badge = document.getElementById('announcementsBadge');
    if (!badge) return;
    
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.classList.remove('hidden');
      badge.classList.add('pulse');
      
      // Stop pulsing after a few seconds
      setTimeout(() => badge.classList.remove('pulse'), 3000);
    } else {
      badge.classList.add('hidden');
    }
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
    
    // Auto-dismiss after 15 seconds
    setTimeout(() => {
      this.dismissBanner(announcement.id, true);
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
        #announcements-modal .announcement-item .priority-high {
          color: #dc2626;
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
