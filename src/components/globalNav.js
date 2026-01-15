/**
 * Global Bottom Navigation Component
 * Persistent bottom nav: Home | Add | Search | Profile
 * 
 * Features:
 * - Dark theme with white SVG icons
 * - Auth-aware profile (green when signed in, shows name)
 * - Fullscreen toggle support (for tracker page)
 * - Add button opens action sheet (Record Trail / Report Issue)
 * - Search button opens action sheet (Find Trails / Find Reports)
 * 
 * @file src/components/globalNav.js
 * @version 2.0
 */

// Translations for GlobalNav
const navTranslations = {
  en: {
    // Navigation labels
    home: "Home",
    add: "Add",
    search: "Search",
    profile: "Profile",
    signIn: "Sign In",
    
    // Action sheet titles
    contribute: "Contribute",
    discover: "Discover",
    
    // Contribute options
    recordTrail: "Record Trail",
    recordTrailDesc: "Track and document an accessible route",
    reportIssue: "Report Issue",
    reportIssueDesc: "Report an accessibility barrier",
    
    // Discover options
    findTrails: "Find Trails",
    findTrailsDesc: "Search accessible trail guides",
    findReports: "Find Reports",
    findReportsDesc: "Browse accessibility reports near you"
  },
  he: {
    // Navigation labels
    home: "בית",
    add: "הוסף",
    search: "חיפוש",
    profile: "פרופיל",
    signIn: "התחבר",
    
    // Action sheet titles
    contribute: "תרומה",
    discover: "גילוי",
    
    // Contribute options
    recordTrail: "הקלט שביל",
    recordTrailDesc: "עקוב ותעד מסלול נגיש",
    reportIssue: "דווח על בעיה",
    reportIssueDesc: "דווח על מכשול נגישות",
    
    // Discover options
    findTrails: "מצא שבילים",
    findTrailsDesc: "חפש מדריכי שבילים נגישים",
    findReports: "מצא דיווחים",
    findReportsDesc: "עיין בדיווחי נגישות בקרבתך"
  }
};

// SVG Icons (white, 24x24)
const ICONS = {
  home: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>`,
  add: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
  search: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>`,
  profile: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
  trail: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
  report: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
  map: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/></svg>`,
  close: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`
};

export class GlobalNav {
  constructor(options = {}) {
    this.navElement = null;
    this.actionSheetOverlay = null;
    this.currentPage = options.currentPage || this.detectCurrentPage();
    this.onNavigate = options.onNavigate || null;
    this.isHidden = false;
    
    // Auth state
    this.isSignedIn = false;
    this.userName = null;
    
    // Action sheet state
    this.activeSheet = null;
    
    // Language
    this.lang = localStorage.getItem('accessNature_language') || 'en';
  }
  
  /**
   * Get translation for key
   */
  t(key) {
    return navTranslations[this.lang]?.[key] || navTranslations['en']?.[key] || key;
  }

  /**
   * Detect current page from URL
   */
  detectCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('tracker')) return 'tracker';
    if (path.includes('reports')) return 'reports';
    if (path.includes('profile')) return 'profile';
    return 'home';
  }

  /**
   * Initialize and mount the navigation
   */
  init() {
    // Add body class for proper page offset
    document.body.classList.add('has-bottom-nav');
    
    // Add tracker-specific class
    if (this.currentPage === 'tracker') {
      document.body.classList.add('tracker-page');
    }
    
    // Create and mount nav
    this.render();
    
    // Handle hardware back button (for action sheets)
    window.addEventListener('popstate', () => this.closeActionSheet());
    
    // Listen for fullscreen toggle events
    window.addEventListener('fullscreenToggle', (e) => {
      if (e.detail?.fullscreen) {
        this.hide();
      } else {
        this.show();
      }
    });
    
    // Listen for language changes to update labels
    window.addEventListener('languageChanged', () => {
      this.refreshLabels();
    });
    
    console.log('[GlobalNav] Initialized on page:', this.currentPage);
  }
  
  /**
   * Refresh nav labels after language change
   */
  refreshLabels() {
    this.lang = localStorage.getItem('accessNature_language') || 'en';
    
    // Update nav item labels
    const homeLabel = this.navElement?.querySelector('[data-page="home"] .nav-label');
    const addLabel = this.navElement?.querySelector('[data-page="add"] .nav-label');
    const searchLabel = this.navElement?.querySelector('[data-page="search"] .nav-label');
    const profileLabel = this.navElement?.querySelector('#profileLabel');
    const profileItem = this.navElement?.querySelector('#globalNavProfile');
    
    if (homeLabel) homeLabel.textContent = this.t('home');
    if (addLabel) addLabel.textContent = this.t('add');
    if (searchLabel) searchLabel.textContent = this.t('search');
    
    // Profile label - check DOM state directly for signed-in status
    if (profileLabel && profileItem) {
      const isSignedInByDOM = profileItem.classList.contains('signed-in');
      const currentLabel = profileLabel.textContent?.trim();
      
      // Try to get userName from multiple sources
      const storedUserName = localStorage.getItem('accessNature_userName');
      const firebaseUser = window.auth?.currentUser;
      const firebaseUserName = firebaseUser?.email?.split('@')[0] || firebaseUser?.displayName;
      
      // Update our cached userName if we found one
      if (!this.userName && (storedUserName || firebaseUserName)) {
        this.userName = storedUserName || firebaseUserName;
      }
      
      // Check if current label looks like a user name (not a translation key result)
      const looksLikeUserName = currentLabel && 
        currentLabel !== 'Sign In' && 
        currentLabel !== 'התחבר' && 
        currentLabel !== 'Profile' && 
        currentLabel !== 'פרופיל' &&
        currentLabel !== 'User' &&
        !currentLabel.toLowerCase().includes('sign');
      
      if (isSignedInByDOM) {
        // User is signed in - preserve their name
        if (looksLikeUserName) {
          // Current label already shows a name, keep it
          // Also save it to our cache and localStorage for future use
          if (!this.userName) {
            this.userName = currentLabel;
            localStorage.setItem('accessNature_userName', currentLabel);
          }
        } else if (this.userName) {
          // Current label is generic but we have a cached name
          const displayName = this.userName.length > 10 
            ? this.userName.substring(0, 10) + '…' 
            : this.userName;
          profileLabel.textContent = displayName;
        } else if (storedUserName) {
          // Get from localStorage
          const displayName = storedUserName.length > 10 
            ? storedUserName.substring(0, 10) + '…' 
            : storedUserName;
          profileLabel.textContent = displayName;
          this.userName = storedUserName;
        }
        // If we can't find a name, leave the label as is
      } else {
        // Not signed in - show translated "Sign In"
        profileLabel.textContent = this.t('signIn');
      }
    }
    
    console.log('[GlobalNav] Labels refreshed for language:', this.lang, 'isSignedIn:', this.isSignedIn, 'userName:', this.userName);
  }
  
  /**
   * Set auth state from external source (e.g., page's auth handler)
   * This ensures refreshLabels() knows the correct auth state
   */
  setAuthState(isSignedIn, userName = null) {
    this.isSignedIn = isSignedIn;
    if (userName) {
      this.userName = userName;
    }
    console.log('[GlobalNav] Auth state set:', { isSignedIn, userName });
  }

  /**
   * Render the navigation bar
   */
  render() {
    // Refresh language
    this.lang = localStorage.getItem('accessNature_language') || 'en';
    
    // Create nav container
    const nav = document.createElement('nav');
    nav.className = 'global-bottom-nav';
    nav.id = 'globalBottomNav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');
    // Force LTR regardless of page language
    nav.setAttribute('dir', 'ltr');
    nav.style.direction = 'ltr';

    nav.innerHTML = `
      <!-- Home -->
      <a href="index.html" class="global-nav-item ${this.currentPage === 'home' ? 'active' : ''}" aria-label="${this.t('home')}" data-page="home">
        <span class="nav-icon">${ICONS.home}</span>
        <span class="nav-label">${this.t('home')}</span>
      </a>

      <!-- Add (now normal nav item) -->
      <button class="global-nav-item" id="globalNavAdd" aria-label="${this.t('add')}" aria-haspopup="true" data-page="add">
        <span class="nav-icon">${ICONS.add}</span>
        <span class="nav-label">${this.t('add')}</span>
      </button>

      <!-- Search (now normal nav item) -->
      <button class="global-nav-item" id="globalNavSearch" aria-label="${this.t('search')}" aria-haspopup="true" data-page="search">
        <span class="nav-icon">${ICONS.search}</span>
        <span class="nav-label">${this.t('search')}</span>
      </button>

      <!-- Profile (button for dynamic behavior) -->
      <button class="global-nav-item ${this.currentPage === 'profile' ? 'active' : ''}" aria-label="${this.t('profile')}" id="globalNavProfile" data-page="profile">
        <span class="nav-icon">${ICONS.profile}</span>
        <span class="nav-label" id="profileLabel">${this.t('profile')}</span>
      </button>
    `;

    this.navElement = nav;
    document.body.appendChild(nav);

    // Create action sheet overlay
    this.createActionSheetOverlay();

    // Bind events
    this.bindEvents();

    // Check auth state
    this.checkAuthState();
  }

  /**
   * Create the action sheet overlay (shared between Add and Search)
   */
  createActionSheetOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'action-sheet-overlay';
    overlay.id = 'actionSheetOverlay';
    // Force LTR regardless of page language
    overlay.setAttribute('dir', 'ltr');
    overlay.style.direction = 'ltr';
    overlay.innerHTML = `
      <div class="action-sheet" role="dialog" aria-modal="true">
        <div class="action-sheet-header">
          <h2 class="action-sheet-title" id="actionSheetTitle">Choose an option</h2>
          <button class="action-sheet-close" aria-label="Close">${ICONS.close}</button>
        </div>
        <div class="action-sheet-options" id="actionSheetOptions">
          <!-- Options populated dynamically -->
        </div>
      </div>
    `;

    this.actionSheetOverlay = overlay;
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeActionSheet();
      }
    });

    // Close button
    overlay.querySelector('.action-sheet-close').addEventListener('click', () => {
      this.closeActionSheet();
    });
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Add button
    document.getElementById('globalNavAdd')?.addEventListener('click', () => {
      this.showAddSheet();
    });

    // Search button
    document.getElementById('globalNavSearch')?.addEventListener('click', () => {
      this.showSearchSheet();
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeSheet) {
        this.closeActionSheet();
      }
    });
  }

  /**
   * Check and update auth state
   */
  checkAuthState() {
    const profileItem = document.getElementById('globalNavProfile');
    const profileLabel = document.getElementById('profileLabel');
    if (!profileItem || !profileLabel) return;

    const updateAuthUI = (event) => {
      // Check various auth indicators
      const firebaseUser = window.auth?.currentUser;
      const authIndicator = document.querySelector('.auth-status.signed-in');
      const localToken = localStorage.getItem('accessNature_authToken');
      
      // Also check event detail if available
      const eventUser = event?.detail?.user;
      const user = eventUser || firebaseUser;
      
      // Check if profile is already showing signed-in state (set by page's own auth handler)
      const alreadySignedIn = profileItem.classList.contains('signed-in');
      
      // Determine if user is signed in
      const isNowSignedIn = !!(user || authIndicator || localToken);
      
      // Don't downgrade from signed-in to signed-out unless we have explicit sign-out event
      // This prevents the periodic check from resetting state when window.auth isn't available
      if (alreadySignedIn && !isNowSignedIn && !event?.detail?.forceUpdate) {
        // Already signed in but can't verify - trust the DOM state
        this.isSignedIn = true;
        return;
      }
      
      this.isSignedIn = isNowSignedIn || alreadySignedIn;
      
      if (this.isSignedIn) {
        // Get user name - prefer email username, never use "You"
        const userName = user?.email?.split('@')[0] ||
                        firebaseUser?.email?.split('@')[0] ||
                        user?.displayName ||
                        firebaseUser?.displayName ||
                        localStorage.getItem('accessNature_userName');
        
        if (userName) {
          this.userName = userName;
          // Save to localStorage for persistence across language toggles
          localStorage.setItem('accessNature_userName', userName);
          
          // Truncate long names
          const displayName = userName.length > 10 
            ? userName.substring(0, 10) + '…' 
            : userName;
          
          profileItem.classList.add('signed-in');
          profileLabel.textContent = displayName;
        } else {
          // No name available yet, just show signed-in state
          profileItem.classList.add('signed-in');
          // Don't change the label if we don't have a name
        }
      } else {
        profileItem.classList.remove('signed-in');
        profileLabel.textContent = this.t('signIn');
        // Clear stored userName on sign out
        localStorage.removeItem('accessNature_userName');
        this.userName = null;
      }
    };
    
    // Expose updateAuthUI globally so auth.js can call it directly
    window.updateGlobalNavAuth = updateAuthUI;

    // Profile button click handler
    profileItem.addEventListener('click', () => {
      // Check DOM state directly (more reliable than this.isSignedIn when pages update DOM directly)
      const isSignedInByDOM = profileItem.classList.contains('signed-in');
      
      if (this.isSignedIn || isSignedInByDOM) {
        // Navigate to profile page
        window.location.href = 'profile.html';
      } else {
        // Open auth modal
        this.openAuthModal();
      }
    });

    // Initial check
    updateAuthUI();

    // Listen for custom auth changes event (from auth.js)
    window.addEventListener('authStateChanged', (e) => {
      console.log('[GlobalNav] Received authStateChanged event');
      updateAuthUI(e);
    });
    
    // Firebase auth state listener
    const setupFirebaseListener = () => {
      if (window.auth?.onAuthStateChanged) {
        window.auth.onAuthStateChanged((user) => {
          console.log('[GlobalNav] Firebase auth state changed:', !!user);
          updateAuthUI({ detail: { user } });
        });
        return true;
      }
      return false;
    };
    
    // Try immediately
    if (!setupFirebaseListener()) {
      // If not available, wait for Firebase to initialize
      const waitForAuth = setInterval(() => {
        if (setupFirebaseListener()) {
          clearInterval(waitForAuth);
          updateAuthUI(); // Check again now that we have auth
        }
      }, 200);
      
      // Clear after 5 seconds
      setTimeout(() => clearInterval(waitForAuth), 5000);
    }
    
    // Note: Removed aggressive periodic check - pages now handle their own auth state updates
    // and push them to global nav via updateGlobalNavProfile functions
  }

  /**
   * Open the auth modal
   */
  openAuthModal() {
    // Try different ways to open auth modal
    const authModal = document.getElementById('authModal');
    if (authModal) {
      authModal.classList.remove('hidden');
      authModal.style.display = 'flex';
      console.log('[GlobalNav] Auth modal opened');
      return;
    }
    
    // Try calling global function
    if (window.openAuthModal) {
      window.openAuthModal();
      return;
    }
    
    // Try clicking auth status indicator
    const authIndicator = document.querySelector('.auth-status:not(.signed-in)');
    if (authIndicator) {
      authIndicator.click();
      return;
    }
    
    // Fallback: redirect to home with signin param
    console.log('[GlobalNav] No auth modal found, redirecting');
    window.location.href = 'index.html?signin=true';
  }

  /**
   * Show the "Add" action sheet
   */
  showAddSheet() {
    // Refresh language
    this.lang = localStorage.getItem('accessNature_language') || 'en';
    
    const options = `
      <button class="action-sheet-option trail" data-action="record-trail">
        <div class="option-icon">${ICONS.trail}</div>
        <div class="option-content">
          <div class="option-title">${this.t('recordTrail')}</div>
          <div class="option-desc">${this.t('recordTrailDesc')}</div>
        </div>
      </button>
      <button class="action-sheet-option report" data-action="report-issue">
        <div class="option-icon">${ICONS.report}</div>
        <div class="option-content">
          <div class="option-title">${this.t('reportIssue')}</div>
          <div class="option-desc">${this.t('reportIssueDesc')}</div>
        </div>
      </button>
    `;

    this.showActionSheet(this.t('contribute'), options);
    this.activeSheet = 'add';
    
    // Bind option clicks
    this.bindOptionClicks();
  }

  /**
   * Show the "Search" action sheet
   */
  showSearchSheet() {
    // Refresh language
    this.lang = localStorage.getItem('accessNature_language') || 'en';
    
    const options = `
      <button class="action-sheet-option search-trails" data-action="find-trails">
        <div class="option-icon">${ICONS.map}</div>
        <div class="option-content">
          <div class="option-title">${this.t('findTrails')}</div>
          <div class="option-desc">${this.t('findTrailsDesc')}</div>
        </div>
      </button>
      <button class="action-sheet-option search-reports" data-action="find-reports">
        <div class="option-icon">${ICONS.report}</div>
        <div class="option-content">
          <div class="option-title">${this.t('findReports')}</div>
          <div class="option-desc">${this.t('findReportsDesc')}</div>
        </div>
      </button>
    `;

    this.showActionSheet(this.t('discover'), options);
    this.activeSheet = 'search';
    
    // Bind option clicks
    this.bindOptionClicks();
  }

  /**
   * Bind action sheet option click handlers
   */
  bindOptionClicks() {
    const options = document.querySelectorAll('.action-sheet-option');
    options.forEach(option => {
      option.addEventListener('click', () => {
        const action = option.getAttribute('data-action');
        this.handleAction(action);
      });
    });
  }

  /**
   * Handle action sheet option selection
   */
  handleAction(action) {
    this.closeActionSheet();

    switch (action) {
      case 'record-trail':
        window.location.href = 'tracker.html';
        break;
        
      case 'report-issue':
        // Navigate to reports page with modal trigger
        if (window.location.pathname.includes('reports')) {
          // Already on reports page, open modal directly
          window.openReportModal?.();
        } else {
          window.location.href = 'reports.html?action=create';
        }
        break;
        
      case 'find-trails':
        if (window.location.pathname.includes('index') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
          // Already on home, open trail browser
          window.openTrailBrowser?.();
        } else {
          window.location.href = 'index.html?action=search-trails';
        }
        break;
        
      case 'find-reports':
        if (window.location.pathname.includes('reports')) {
          // Already on reports, trigger search
          window.focusReportSearch?.();
        } else {
          window.location.href = 'reports.html?action=search';
        }
        break;
    }

    // Callback if provided
    if (this.onNavigate) {
      this.onNavigate(action);
    }
  }

  /**
   * Show an action sheet with given title and options
   */
  showActionSheet(title, optionsHTML) {
    const titleEl = document.getElementById('actionSheetTitle');
    const optionsEl = document.getElementById('actionSheetOptions');
    
    if (titleEl) titleEl.textContent = title;
    if (optionsEl) optionsEl.innerHTML = optionsHTML;

    // Add history state for back button handling
    history.pushState({ actionSheet: true }, '');
    
    // Show overlay
    this.actionSheetOverlay?.classList.add('active');
    
    // Focus first option for accessibility
    setTimeout(() => {
      const firstOption = optionsEl?.querySelector('.action-sheet-option');
      if (firstOption) firstOption.focus();
    }, 300);
  }

  /**
   * Close the action sheet
   */
  closeActionSheet() {
    this.actionSheetOverlay?.classList.remove('active');
    this.activeSheet = null;
  }

  /**
   * Set the active nav item
   */
  setActive(page) {
    const items = this.navElement?.querySelectorAll('.global-nav-item');
    items?.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-page') === page) {
        item.classList.add('active');
      }
    });
    this.currentPage = page;
  }

  /**
   * Show the navigation (exit fullscreen)
   */
  show() {
    if (this.navElement) {
      this.navElement.classList.remove('hidden');
      this.isHidden = false;
    }
  }

  /**
   * Hide the navigation (enter fullscreen)
   */
  hide() {
    if (this.navElement) {
      this.navElement.classList.add('hidden');
      this.isHidden = true;
    }
  }

  /**
   * Toggle navigation visibility
   */
  toggle() {
    if (this.isHidden) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * Destroy the component
   */
  destroy() {
    this.navElement?.remove();
    this.actionSheetOverlay?.remove();
    document.body.classList.remove('has-bottom-nav');
    document.body.classList.remove('tracker-page');
  }
}

// Create and export singleton instance
let globalNavInstance = null;

export function initGlobalNav(options = {}) {
  if (!globalNavInstance) {
    globalNavInstance = new GlobalNav(options);
    globalNavInstance.init();
    
    // Make available globally
    window.globalNav = globalNavInstance;
  }
  return globalNavInstance;
}

export function getGlobalNav() {
  return globalNavInstance;
}

export default GlobalNav;