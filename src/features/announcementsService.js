/**
 * Announcements Service
 * Simple in-app messaging system for beta testing
 * No push notifications - just database-driven messages
 */

import { db, auth } from '../../firebase-setup.js';
import { 
  collection, 
  doc, 
  getDoc,
  getDocs,
  setDoc,
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js';

class AnnouncementsService {
  constructor() {
    this.announcements = [];
    this.readIds = new Set();
    this.unsubscribe = null;
    this.onNewAnnouncement = null; // Callback for new announcements
    this.onUnreadCountChange = null; // Callback for unread count changes
  }

  /**
   * Initialize the service and start listening for announcements
   */
  async initialize() {
    // Load read announcements from localStorage
    this.loadReadIds();
    
    // Start listening for announcements
    this.startListening();
    
    console.log('📢 Announcements service initialized');
  }

  /**
   * Load read announcement IDs from localStorage
   */
  loadReadIds() {
    try {
      const stored = localStorage.getItem('accessNature_readAnnouncements');
      if (stored) {
        const ids = JSON.parse(stored);
        this.readIds = new Set(ids);
      }
    } catch (e) {
      console.warn('Failed to load read announcements:', e);
    }
  }

  /**
   * Save read announcement IDs to localStorage
   */
  saveReadIds() {
    try {
      const ids = Array.from(this.readIds);
      localStorage.setItem('accessNature_readAnnouncements', JSON.stringify(ids));
    } catch (e) {
      console.warn('Failed to save read announcements:', e);
    }
  }

  /**
   * Start real-time listener for announcements
   */
  startListening() {
    // Stop any existing listener
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    try {
      // Query active announcements from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const announcementsQuery = query(
        collection(db, 'announcements'),
        where('active', '==', true),
        where('createdAt', '>=', Timestamp.fromDate(thirtyDaysAgo)),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      this.unsubscribe = onSnapshot(announcementsQuery, 
        (snapshot) => {
          const previousIds = new Set(this.announcements.map(a => a.id));
          
          this.announcements = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          }));

          // Check for new announcements
          const newAnnouncements = this.announcements.filter(a => !previousIds.has(a.id));
          
          if (newAnnouncements.length > 0 && previousIds.size > 0) {
            // Only trigger callback if this isn't the initial load
            newAnnouncements.forEach(announcement => {
              if (this.onNewAnnouncement && !this.readIds.has(announcement.id)) {
                this.onNewAnnouncement(announcement);
              }
            });
          }

          // Update unread count
          this.notifyUnreadCountChange();
          
          console.log(`📢 Loaded ${this.announcements.length} announcements`);
        },
        (error) => {
          console.error('Announcements listener error:', error);
        }
      );
    } catch (error) {
      console.error('Failed to start announcements listener:', error);
    }
  }

  /**
   * Stop listening for announcements
   */
  stopListening() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  /**
   * Get all announcements
   */
  getAll() {
    return this.announcements;
  }

  /**
   * Get unread announcements
   */
  getUnread() {
    return this.announcements.filter(a => !this.readIds.has(a.id));
  }

  /**
   * Get unread count
   */
  getUnreadCount() {
    return this.getUnread().length;
  }

  /**
   * Mark an announcement as read
   */
  markAsRead(announcementId) {
    if (!this.readIds.has(announcementId)) {
      this.readIds.add(announcementId);
      this.saveReadIds();
      this.notifyUnreadCountChange();
    }
  }

  /**
   * Mark all announcements as read
   */
  markAllAsRead() {
    this.announcements.forEach(a => this.readIds.add(a.id));
    this.saveReadIds();
    this.notifyUnreadCountChange();
  }

  /**
   * Check if an announcement is read
   */
  isRead(announcementId) {
    return this.readIds.has(announcementId);
  }

  /**
   * Notify about unread count change
   */
  notifyUnreadCountChange() {
    if (this.onUnreadCountChange) {
      this.onUnreadCountChange(this.getUnreadCount());
    }
  }

  /**
   * Format time ago
   */
  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  }
}

// Export singleton
export const announcementsService = new AnnouncementsService();
export default announcementsService;
