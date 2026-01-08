// ==============================================
// ACCESSIBLE - INTERNATIONALIZATION (i18n) SYSTEM
// Multi-language support with RTL handling
// 
// File: src/i18n/i18n.js
// Version: 2.0 - Enhanced with dynamic content refresh
// ==============================================

class I18nManager {
  constructor() {
    this.currentLang = 'en';
    this.translations = {};
    this.loadedLanguages = new Set();
    this.listeners = new Set();
    this.refreshCallbacks = new Map(); // For dynamic components that need re-rendering
    this.initialized = false;
    
    // Supported languages
    this.supportedLanguages = {
      en: { name: 'English', dir: 'ltr', flag: '🇬🇧' },
      he: { name: 'עברית', dir: 'rtl', flag: '🇮🇱' }
    };
  }

  /**
   * Initialize i18n system
   */
  async init() {
    if (this.initialized) return;
    
    console.log('🌐 Initializing i18n system...');
    
    try {
      // Get saved language or detect from browser
      const savedLang = localStorage.getItem('accessNature_language');
      const browserLang = navigator.language?.split('-')[0];
      
      // Priority: saved > browser > default (en)
      let targetLang = savedLang || (this.supportedLanguages[browserLang] ? browserLang : 'en');
      
      // Try to load the target language
      const loaded = await this.loadLanguage(targetLang);
      
      if (!loaded && targetLang !== 'en') {
        // Try English as fallback
        console.log('🌐 Target language failed, trying English...');
        await this.loadLanguage('en');
        targetLang = 'en';
      }
      
      // Set language (this also applies direction)
      await this.setLanguage(targetLang, false);
      
    } catch (error) {
      console.error('🌐 i18n initialization error:', error);
      // Apply direction based on saved preference even if loading failed
      const savedLang = localStorage.getItem('accessNature_language') || 'en';
      this.currentLang = savedLang;
      const dir = this.supportedLanguages[savedLang]?.dir || 'ltr';
      document.documentElement.setAttribute('dir', dir);
      document.documentElement.setAttribute('lang', savedLang);
      document.body.setAttribute('dir', dir);
      if (dir === 'rtl') {
        document.documentElement.classList.add('rtl');
        document.body.classList.add('rtl');
      }
    }
    
    this.initialized = true;
    console.log(`🌐 i18n initialized with language: ${this.currentLang}`);
  }

  /**
   * Load a language file
   */
  async loadLanguage(lang) {
    if (this.loadedLanguages.has(lang)) {
      return this.translations[lang];
    }

    try {
      console.log(`🌐 Loading language: ${lang}`);
      
      // Try multiple paths (for different page locations)
      const possiblePaths = [
        `./src/i18n/${lang}.json`,
        `../src/i18n/${lang}.json`,
        `/src/i18n/${lang}.json`,
        `src/i18n/${lang}.json`
      ];
      
      let response = null;
      let successPath = null;
      
      for (const path of possiblePaths) {
        try {
          console.log(`🌐 Trying path: ${path}`);
          response = await fetch(path);
          if (response.ok) {
            successPath = path;
            break;
          }
        } catch (e) {
          // Try next path
        }
      }
      
      if (!response || !response.ok) {
        throw new Error(`Failed to load ${lang}.json from any path`);
      }
      
      const data = await response.json();
      this.translations[lang] = data;
      this.loadedLanguages.add(lang);
      
      console.log(`🌐 Loaded language: ${lang} from ${successPath}`);
      return data;
      
    } catch (error) {
      console.error(`🌐 Failed to load language ${lang}:`, error);
      
      // Fallback to English if available
      if (lang !== 'en' && this.translations['en']) {
        return this.translations['en'];
      }
      
      return null;
    }
  }

  /**
   * Set the current language
   */
  async setLanguage(lang, save = true) {
    if (!this.supportedLanguages[lang]) {
      console.warn(`🌐 Unsupported language: ${lang}`);
      return false;
    }

    // Load if not already loaded
    if (!this.loadedLanguages.has(lang)) {
      await this.loadLanguage(lang);
    }

    const prevLang = this.currentLang;
    this.currentLang = lang;
    
    // Apply direction to document
    const dir = this.getDirection();
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    document.body.setAttribute('dir', dir);
    
    // Add/remove RTL class for CSS targeting
    if (dir === 'rtl') {
      document.documentElement.classList.add('rtl');
      document.body.classList.add('rtl');
    } else {
      document.documentElement.classList.remove('rtl');
      document.body.classList.remove('rtl');
    }

    // Save preference
    if (save) {
      localStorage.setItem('accessNature_language', lang);
    }

    // Notify listeners
    if (prevLang !== lang) {
      this.notifyListeners(lang, prevLang);
      // Refresh all dynamic content
      this.refreshAllDynamicContent();
    }

    console.log(`🌐 Language set to: ${lang} (dir: ${dir})`);
    return true;
  }

  /**
   * Register a component for refresh on language change
   * @param {string} id - Unique identifier for the component
   * @param {Function} refreshCallback - Function to call to refresh the component
   */
  registerForRefresh(id, refreshCallback) {
    this.refreshCallbacks.set(id, refreshCallback);
    console.log(`🌐 Registered component for i18n refresh: ${id}`);
  }

  /**
   * Unregister a component from refresh
   */
  unregisterForRefresh(id) {
    this.refreshCallbacks.delete(id);
  }

  /**
   * Refresh all registered dynamic content
   */
  refreshAllDynamicContent() {
    console.log(`🌐 Refreshing ${this.refreshCallbacks.size} dynamic components...`);
    this.refreshCallbacks.forEach((callback, id) => {
      try {
        callback(this.currentLang, this.isRTL());
        console.log(`🌐 Refreshed: ${id}`);
      } catch (e) {
        console.error(`🌐 Failed to refresh ${id}:`, e);
      }
    });
  }

  /**
   * Get translation by key path (e.g., 'nav.home')
   */
  t(key, params = {}) {
    const keys = key.split('.');
    let value = this.translations[this.currentLang];
    
    // Navigate to the value
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Key not found - try English fallback
        value = this.getFallback(key);
        break;
      }
    }

    // If still not found, return the key
    if (value === undefined || value === null) {
      console.warn(`🌐 Missing translation: ${key}`);
      return key;
    }

    // Replace parameters like {n}, {name}, etc.
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      for (const [param, val] of Object.entries(params)) {
        value = value.replace(new RegExp(`\\{${param}\\}`, 'g'), val);
      }
    }

    return value;
  }

  /**
   * Get fallback from English
   */
  getFallback(key) {
    const keys = key.split('.');
    let value = this.translations['en'];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  /**
   * Get current text direction
   */
  getDirection() {
    return this.supportedLanguages[this.currentLang]?.dir || 'ltr';
  }

  /**
   * Check if current language is RTL
   */
  isRTL() {
    return this.getDirection() === 'rtl';
  }

  /**
   * Get current language code
   */
  getLanguage() {
    return this.currentLang;
  }

  /**
   * Get language info
   */
  getLanguageInfo(lang = this.currentLang) {
    return this.supportedLanguages[lang];
  }

  /**
   * Get all supported languages
   */
  getSupportedLanguages() {
    return Object.entries(this.supportedLanguages).map(([code, info]) => ({
      code,
      ...info
    }));
  }

  /**
   * Toggle between languages (for 2-language setup)
   */
  async toggleLanguage() {
    const newLang = this.currentLang === 'en' ? 'he' : 'en';
    await this.setLanguage(newLang);
    return newLang;
  }

  /**
   * Add a listener for language changes
   */
  onLanguageChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of language change
   */
  notifyListeners(newLang, prevLang) {
    this.listeners.forEach(callback => {
      try {
        callback(newLang, prevLang);
      } catch (e) {
        console.error('🌐 Language change listener error:', e);
      }
    });

    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('languageChanged', {
      detail: { newLang, prevLang, dir: this.getDirection() }
    }));
  }

  /**
   * Translate all elements with data-i18n attribute
   */
  translatePage() {
    // Translate text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = this.t(key);
      }
    });

    // Translate innerHTML (for elements with embedded HTML)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      if (key) {
        el.innerHTML = this.t(key);
      }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.placeholder = this.t(key);
      }
    });

    // Translate aria-labels
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.getAttribute('data-i18n-aria');
      if (key) {
        el.setAttribute('aria-label', this.t(key));
      }
    });

    // Translate titles
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', this.t(key));
      }
    });

    // Translate value attributes (for buttons)
    document.querySelectorAll('[data-i18n-value]').forEach(el => {
      const key = el.getAttribute('data-i18n-value');
      if (key) {
        el.value = this.t(key);
      }
    });

    // Translate select options
    document.querySelectorAll('[data-i18n-options]').forEach(select => {
      select.querySelectorAll('option[data-i18n]').forEach(opt => {
        const key = opt.getAttribute('data-i18n');
        if (key) {
          opt.textContent = this.t(key);
        }
      });
    });

    console.log('🌐 Page translated');
  }

  /**
   * Create language selector HTML
   */
  createLanguageSelector(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const languages = this.getSupportedLanguages();
    
    const html = `
      <div class="language-selector">
        <button class="lang-toggle" aria-label="${this.t('nav.language')}" title="${this.t('nav.language')}">
          <span class="lang-flag">${this.getLanguageInfo().flag}</span>
          <span class="lang-code">${this.currentLang.toUpperCase()}</span>
          <svg class="lang-chevron" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 10l5 5 5-5z"/>
          </svg>
        </button>
        <div class="lang-dropdown">
          ${languages.map(lang => `
            <button class="lang-option ${lang.code === this.currentLang ? 'active' : ''}" data-lang="${lang.code}">
              <span class="lang-flag">${lang.flag}</span>
              <span class="lang-name">${lang.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    container.innerHTML = html;

    // Add event listeners
    const toggle = container.querySelector('.lang-toggle');
    const dropdown = container.querySelector('.lang-dropdown');
    const options = container.querySelectorAll('.lang-option');

    toggle?.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    options.forEach(opt => {
      opt.addEventListener('click', async () => {
        const lang = opt.getAttribute('data-lang');
        await this.setLanguage(lang);
        dropdown.classList.remove('open');
        this.translatePage();
        // Update selector UI
        this.createLanguageSelector(containerId);
      });
    });

    // Close dropdown on outside click
    document.addEventListener('click', () => {
      dropdown?.classList.remove('open');
    });
  }

  /**
   * Create a simple toggle button for 2-language setup
   */
  createLanguageToggle(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const otherLang = this.currentLang === 'en' ? 'he' : 'en';
    const otherInfo = this.getLanguageInfo(otherLang);

    const html = `
      <button class="lang-toggle-btn" aria-label="Switch to ${otherInfo.name}" title="Switch to ${otherInfo.name}">
        <span class="lang-flag">${otherInfo.flag}</span>
        <span class="lang-label">${otherInfo.name}</span>
      </button>
    `;

    container.innerHTML = html;

    container.querySelector('.lang-toggle-btn')?.addEventListener('click', async () => {
      await this.toggleLanguage();
      this.translatePage();
      this.createLanguageToggle(containerId);
    });
  }
}

// Create singleton instance
const i18n = new I18nManager();

// Helper function for easy access
const t = (key, params) => i18n.t(key, params);

// Export
export { i18n, t };
export default i18n;

// Make globally available
if (typeof window !== 'undefined') {
  window.i18n = i18n;
  window.t = t;
}
