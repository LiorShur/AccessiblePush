/**
 * Top Toolbar UI Component
 * Unified toolbar for action buttons in top-right corner
 * Contains: Announcements bell, Beta feedback, High contrast toggle
 * Auto-initializes on DOM ready
 */

class TopToolbarUI {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize the toolbar
   */
  initialize() {
    if (this.initialized) return;
    if (document.getElementById('topToolbar')) return;
    
    this.createToolbar();
    this.hideOldElements();
    this.initialized = true;
    console.log('🔧 Top toolbar initialized');
  }

  /**
   * Hide old FAB elements
   */
  hideOldElements() {
    // Hide old high contrast toggle FAB
    const oldContrastFab = document.getElementById('highContrastToggle');
    if (oldContrastFab) oldContrastFab.style.display = 'none';
    
    // Hide old feedback FAB
    const oldFeedbackFab = document.getElementById('feedbackFab');
    if (oldFeedbackFab) oldFeedbackFab.style.display = 'none';
    
    // Hide any other high contrast toggles
    document.querySelectorAll('.high-contrast-toggle').forEach(el => {
      if (el.id !== 'toolbarContrastBtn') {
        el.style.display = 'none';
      }
    });
    
    // Also hide after a delay (for dynamically created elements)
    setTimeout(() => {
      const fab1 = document.getElementById('highContrastToggle');
      const fab2 = document.getElementById('feedbackFab');
      if (fab1) fab1.style.display = 'none';
      if (fab2) fab2.style.display = 'none';
      document.querySelectorAll('.high-contrast-toggle, .feedback-fab').forEach(el => {
        el.style.display = 'none';
      });
    }, 500);
  }

  /**
   * Create the toolbar container
   */
  createToolbar() {
    const toolbar = document.createElement('div');
    toolbar.id = 'topToolbar';
    toolbar.innerHTML = `
      <style>
        #topToolbar {
          position: fixed;
          top: 8px;
          right: 10px;
          z-index: 10000;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        #topToolbar .toolbar-btn {
          background: rgba(0, 0, 0, 0.85);
          border: none;
          border-radius: 8px;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 20px;
          position: relative;
          transition: background 0.2s, transform 0.15s;
          color: white;
        }
        
        #topToolbar .toolbar-btn:hover {
          background: rgba(0, 0, 0, 0.95);
          transform: scale(1.05);
        }
        
        #topToolbar .toolbar-btn:active {
          transform: scale(0.95);
        }
        
        /* Bell button specific styles */
        #topToolbar .bell-btn .bell-icon {
          width: 22px;
          height: 22px;
          fill: none;
          stroke: white;
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        
        #topToolbar .bell-btn.wiggle .bell-icon {
          animation: bellWiggle 2s ease-in-out infinite;
          transform-origin: top center;
        }
        
        @keyframes bellWiggle {
          0%, 40%, 100% { transform: rotate(0deg); }
          5% { transform: rotate(25deg); }
          10% { transform: rotate(-20deg); }
          15% { transform: rotate(15deg); }
          20% { transform: rotate(-10deg); }
          25% { transform: rotate(5deg); }
          30% { transform: rotate(0deg); }
        }
        
        #topToolbar .badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #ef4444;
          color: white;
          font-size: 10px;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 1px solid white;
        }
        
        #topToolbar .badge.hidden {
          display: none;
        }
        
        /* Feedback button - speech bubble with BETA text */
        #topToolbar .feedback-btn {
          position: relative;
        }
        
        #topToolbar .feedback-btn .bubble-icon {
          width: 28px;
          height: 28px;
        }
        
        #topToolbar .feedback-btn .bubble-icon .bubble-outline {
          fill: none;
          stroke: white;
          stroke-width: 1.5;
        }
        
        #topToolbar .feedback-btn .bubble-icon .beta-text {
          fill: white;
          font-size: 5px;
          font-weight: 700;
          font-family: system-ui, -apple-system, sans-serif;
        }
        
        /* High contrast button styles */
        #topToolbar .contrast-btn {
          padding: 0;
        }
        
        #topToolbar .contrast-btn svg {
          width: 26px;
          height: 26px;
          fill: white;
        }
        
        #topToolbar .contrast-btn.active {
          background: white;
        }
        
        #topToolbar .contrast-btn.active svg {
          fill: black;
        }
        
        /* High contrast mode support */
        .high-contrast #topToolbar .toolbar-btn {
          background: #000;
          border: 2px solid #fff;
        }
        
        .high-contrast #topToolbar .bell-btn .bell-icon {
          stroke: white;
        }
        
        .high-contrast #topToolbar .feedback-btn .bubble-outline {
          stroke: white;
        }
        
        .high-contrast #topToolbar .feedback-btn .beta-text {
          fill: white;
        }
        
        /* Mobile adjustments */
        @media (max-width: 480px) {
          #topToolbar {
            top: 6px;
            right: 6px;
            gap: 4px;
          }
          
          #topToolbar .toolbar-btn {
            width: 38px;
            height: 38px;
            border-radius: 6px;
          }
          
          #topToolbar .contrast-btn svg {
            width: 22px;
            height: 22px;
          }
          
          #topToolbar .bell-btn .bell-icon {
            width: 20px;
            height: 20px;
          }
          
          #topToolbar .feedback-btn .bubble-icon {
            width: 24px;
            height: 24px;
          }
        }
        
        /* Hide old FABs when toolbar exists */
        body:has(#topToolbar) .high-contrast-toggle:not(#topToolbar .toolbar-btn),
        body:has(#topToolbar) #highContrastToggle,
        body:has(#topToolbar) #feedbackFab,
        body:has(#topToolbar) .feedback-fab {
          display: none !important;
        }
        
        /* Screen reader only class */
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
      </style>
      
      <!-- High Contrast Toggle (leftmost) -->
      <button class="toolbar-btn contrast-btn" id="toolbarContrastBtn" aria-label="Toggle high contrast" title="High Contrast" aria-pressed="false">
        <svg viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V4c4.41 0 8 3.59 8 8s-3.59 8-8 8z"/>
        </svg>
      </button>
      
      <!-- Beta Feedback (middle) - Speech bubble with BETA -->
      <button class="toolbar-btn feedback-btn" id="toolbarFeedbackBtn" aria-label="Send feedback" title="Beta Feedback">
        <svg class="bubble-icon" viewBox="0 0 28 28">
          <path class="bubble-outline" d="M4 4h20c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-6l-4 4-4-4H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <text class="beta-text" x="14" y="14" text-anchor="middle" dominant-baseline="middle">BETA</text>
        </svg>
      </button>
      
      <!-- Announcements Bell (rightmost) -->
      <button class="toolbar-btn bell-btn" id="toolbarBellBtn" aria-label="View announcements" title="Announcements">
        <svg class="bell-icon" viewBox="0 0 24 24">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span class="badge hidden" id="toolbarBadge">0</span>
      </button>
    `;
    
    document.body.appendChild(toolbar);
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Check initial high contrast state
    this.updateContrastButton();
  }

  /**
   * Set up button event listeners
   */
  setupEventListeners() {
    // Bell button - handled by announcementsUI
    const bellBtn = document.getElementById('toolbarBellBtn');
    bellBtn?.addEventListener('click', () => {
      if (window.announcementsUI) {
        window.announcementsUI.openModal();
      }
    });
    
    // Feedback button
    const feedbackBtn = document.getElementById('toolbarFeedbackBtn');
    feedbackBtn?.addEventListener('click', () => {
      if (window.betaFeedback) {
        window.betaFeedback.openFeedbackModal();
      }
    });
    
    // High contrast button
    const contrastBtn = document.getElementById('toolbarContrastBtn');
    contrastBtn?.addEventListener('click', () => {
      this.toggleHighContrast();
    });
  }

  /**
   * Toggle high contrast mode
   */
  toggleHighContrast() {
    const html = document.documentElement;
    const isEnabled = html.classList.toggle('high-contrast');
    
    // Save preference
    localStorage.setItem('accessNature_highContrast', isEnabled ? 'true' : 'false');
    
    // Update button state
    this.updateContrastButton();
    
    // Announce change for screen readers
    const message = isEnabled ? 'High contrast mode enabled' : 'High contrast mode disabled';
    this.announceToScreenReader(message);
  }

  /**
   * Update contrast button visual state
   */
  updateContrastButton() {
    const btn = document.getElementById('toolbarContrastBtn');
    if (!btn) return;
    
    const isEnabled = document.documentElement.classList.contains('high-contrast');
    btn.classList.toggle('active', isEnabled);
    btn.setAttribute('aria-pressed', isEnabled.toString());
  }

  /**
   * Update the badge count (called by announcementsUI)
   */
  updateBadge(count) {
    const badge = document.getElementById('toolbarBadge');
    if (!badge) return;
    
    if (count > 0) {
      badge.textContent = count > 9 ? '9+' : count;
      badge.classList.remove('hidden');
    } else {
      badge.classList.add('hidden');
      this.stopWiggle();
    }
  }

  /**
   * Start wiggle animation
   */
  startWiggle() {
    const bellBtn = document.getElementById('toolbarBellBtn');
    if (bellBtn) {
      bellBtn.classList.add('wiggle');
    }
  }

  /**
   * Stop wiggle animation
   */
  stopWiggle() {
    const bellBtn = document.getElementById('toolbarBellBtn');
    if (bellBtn) {
      bellBtn.classList.remove('wiggle');
    }
  }

  /**
   * Announce message to screen readers
   */
  announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }
}

// Export singleton
export const topToolbarUI = new TopToolbarUI();
window.topToolbarUI = topToolbarUI;

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => topToolbarUI.initialize());
} else {
  topToolbarUI.initialize();
}

export default topToolbarUI;
