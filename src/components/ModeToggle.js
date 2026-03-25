/**
 * ModeToggle - UI Component for switching map layers and modes
 *
 * Features:
 * - Segmented control for base layers (Street/Satellite/Terrain)
 * - Mode selector for app modes (Explore/Navigate/Report/Track)
 * - Accessibility-first design with ARIA support
 * - Responsive layout for mobile/desktop
 * - Event-driven updates synchronized with UnifiedMapController
 *
 * @module components/ModeToggle
 */

import { LayerType, MapMode, OverlayType } from '../core/UnifiedMapController.js';

/**
 * ModeToggle Component
 */
export class ModeToggle {
  constructor(mapController, options = {}) {
    this.mapController = mapController;
    this.container = null;

    // Configuration
    this.config = {
      position: options.position || 'top-right', // top-left, top-right, bottom-left, bottom-right
      showLayerToggle: options.showLayerToggle !== false,
      showModeToggle: options.showModeToggle !== false,
      showOverlayToggles: options.showOverlayToggles || false,
      compact: options.compact || false, // Compact mode for mobile
      theme: options.theme || 'light', // light, dark, auto
      ...options
    };

    // State
    this.isExpanded = false;

    // Bind methods
    this._onLayerChange = this._onLayerChange.bind(this);
    this._onModeChange = this._onModeChange.bind(this);
  }

  /**
   * Create and mount the component
   * @param {HTMLElement|string} parent - Parent element or selector
   * @returns {HTMLElement} The created container
   */
  mount(parent) {
    const parentEl = typeof parent === 'string'
      ? document.querySelector(parent)
      : parent;

    if (!parentEl) {
      console.error('[ModeToggle] Parent element not found');
      return null;
    }

    this.container = this._createContainer();
    parentEl.appendChild(this.container);

    // Subscribe to map controller events
    this._subscribeToMapEvents();

    console.log('[ModeToggle] Mounted successfully');
    return this.container;
  }

  /**
   * Create the main container element
   * @private
   */
  _createContainer() {
    const container = document.createElement('div');
    container.className = `mode-toggle mode-toggle--${this.config.position} mode-toggle--${this.config.theme}`;
    if (this.config.compact) {
      container.classList.add('mode-toggle--compact');
    }
    container.setAttribute('role', 'toolbar');
    container.setAttribute('aria-label', 'Map controls');

    // Build sections
    const sections = [];

    if (this.config.showLayerToggle) {
      sections.push(this._createLayerToggle());
    }

    if (this.config.showModeToggle) {
      sections.push(this._createModeToggle());
    }

    if (this.config.showOverlayToggles) {
      sections.push(this._createOverlayToggles());
    }

    sections.forEach(section => container.appendChild(section));

    // Add styles if not already present
    this._injectStyles();

    return container;
  }

  /**
   * Create the layer toggle (segmented control)
   * @private
   */
  _createLayerToggle() {
    const section = document.createElement('div');
    section.className = 'mode-toggle__section mode-toggle__layers';

    const label = document.createElement('span');
    label.className = 'mode-toggle__label visually-hidden';
    label.id = 'layer-toggle-label';
    label.textContent = 'Map Layer';
    section.appendChild(label);

    const segmentedControl = document.createElement('div');
    segmentedControl.className = 'segmented-control';
    segmentedControl.setAttribute('role', 'radiogroup');
    segmentedControl.setAttribute('aria-labelledby', 'layer-toggle-label');

    const layers = [
      { type: LayerType.STREET, label: 'Street', icon: '🗺️', shortLabel: 'St' },
      { type: LayerType.SATELLITE, label: 'Satellite', icon: '🛰️', shortLabel: 'Sat' },
      { type: LayerType.TERRAIN, label: 'Terrain', icon: '⛰️', shortLabel: 'Ter' }
    ];

    layers.forEach((layer, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'segmented-control__button';
      button.setAttribute('role', 'radio');
      button.setAttribute('aria-checked', layer.type === this.mapController.getCurrentLayer());
      button.setAttribute('data-layer', layer.type);
      button.setAttribute('aria-label', `${layer.label} view`);

      if (layer.type === this.mapController.getCurrentLayer()) {
        button.classList.add('segmented-control__button--active');
      }

      button.innerHTML = this.config.compact
        ? `<span class="segmented-control__icon" aria-hidden="true">${layer.icon}</span>`
        : `<span class="segmented-control__icon" aria-hidden="true">${layer.icon}</span><span class="segmented-control__text">${layer.label}</span>`;

      button.addEventListener('click', () => this._handleLayerClick(layer.type));

      segmentedControl.appendChild(button);
    });

    section.appendChild(segmentedControl);
    return section;
  }

  /**
   * Create the mode toggle
   * @private
   */
  _createModeToggle() {
    const section = document.createElement('div');
    section.className = 'mode-toggle__section mode-toggle__modes';

    const label = document.createElement('span');
    label.className = 'mode-toggle__label visually-hidden';
    label.id = 'mode-toggle-label';
    label.textContent = 'App Mode';
    section.appendChild(label);

    const modeGroup = document.createElement('div');
    modeGroup.className = 'mode-button-group';
    modeGroup.setAttribute('role', 'radiogroup');
    modeGroup.setAttribute('aria-labelledby', 'mode-toggle-label');

    const modes = [
      { type: MapMode.EXPLORE, label: 'Explore', icon: '🔍', description: 'Browse the map' },
      { type: MapMode.NAVIGATE, label: 'Navigate', icon: '🧭', description: 'Turn-by-turn directions' },
      { type: MapMode.REPORT, label: 'Report', icon: '📍', description: 'Report accessibility issues' },
      { type: MapMode.TRACK, label: 'Track', icon: '📡', description: 'Record your route' }
    ];

    modes.forEach(mode => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mode-button';
      button.setAttribute('role', 'radio');
      button.setAttribute('aria-checked', mode.type === this.mapController.getMode());
      button.setAttribute('data-mode', mode.type);
      button.setAttribute('aria-label', mode.description);
      button.setAttribute('title', mode.description);

      if (mode.type === this.mapController.getMode()) {
        button.classList.add('mode-button--active');
      }

      button.innerHTML = `
        <span class="mode-button__icon" aria-hidden="true">${mode.icon}</span>
        <span class="mode-button__label">${mode.label}</span>
      `;

      button.addEventListener('click', () => this._handleModeClick(mode.type));

      modeGroup.appendChild(button);
    });

    section.appendChild(modeGroup);
    return section;
  }

  /**
   * Create overlay toggle buttons
   * @private
   */
  _createOverlayToggles() {
    const section = document.createElement('div');
    section.className = 'mode-toggle__section mode-toggle__overlays';

    const label = document.createElement('span');
    label.className = 'mode-toggle__label';
    label.textContent = 'Overlays';
    section.appendChild(label);

    const overlayGroup = document.createElement('div');
    overlayGroup.className = 'overlay-toggle-group';

    const overlays = [
      { type: OverlayType.ACCESSIBILITY, label: 'Accessibility', icon: '♿' },
      { type: OverlayType.TRAILS, label: 'Trails', icon: '🥾' },
      { type: OverlayType.HAZARDS, label: 'Hazards', icon: '⚠️' }
    ];

    overlays.forEach(overlay => {
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'overlay-toggle';
      toggle.setAttribute('role', 'switch');
      toggle.setAttribute('aria-checked', this.mapController.isOverlayActive(overlay.type));
      toggle.setAttribute('data-overlay', overlay.type);
      toggle.setAttribute('aria-label', `Toggle ${overlay.label} overlay`);

      if (this.mapController.isOverlayActive(overlay.type)) {
        toggle.classList.add('overlay-toggle--active');
      }

      toggle.innerHTML = `
        <span class="overlay-toggle__icon" aria-hidden="true">${overlay.icon}</span>
        <span class="overlay-toggle__label">${overlay.label}</span>
      `;

      toggle.addEventListener('click', () => this._handleOverlayClick(overlay.type));

      overlayGroup.appendChild(toggle);
    });

    section.appendChild(overlayGroup);
    return section;
  }

  /**
   * Handle layer button click
   * @private
   */
  _handleLayerClick(layerType) {
    if (this.mapController.switchLayer(layerType)) {
      this._updateLayerButtons(layerType);
    }
  }

  /**
   * Handle mode button click
   * @private
   */
  _handleModeClick(modeType) {
    this.mapController.setMode(modeType);
    this._updateModeButtons(modeType);
  }

  /**
   * Handle overlay toggle click
   * @private
   */
  _handleOverlayClick(overlayType) {
    const isActive = this.mapController.toggleOverlay(overlayType);
    this._updateOverlayButton(overlayType, isActive);
  }

  /**
   * Update layer button states
   * @private
   */
  _updateLayerButtons(activeLayer) {
    if (!this.container) return;

    const buttons = this.container.querySelectorAll('[data-layer]');
    buttons.forEach(btn => {
      const isActive = btn.getAttribute('data-layer') === activeLayer;
      btn.classList.toggle('segmented-control__button--active', isActive);
      btn.setAttribute('aria-checked', isActive);
    });
  }

  /**
   * Update mode button states
   * @private
   */
  _updateModeButtons(activeMode) {
    if (!this.container) return;

    const buttons = this.container.querySelectorAll('[data-mode]');
    buttons.forEach(btn => {
      const isActive = btn.getAttribute('data-mode') === activeMode;
      btn.classList.toggle('mode-button--active', isActive);
      btn.setAttribute('aria-checked', isActive);
    });
  }

  /**
   * Update overlay button state
   * @private
   */
  _updateOverlayButton(overlayType, isActive) {
    if (!this.container) return;

    const button = this.container.querySelector(`[data-overlay="${overlayType}"]`);
    if (button) {
      button.classList.toggle('overlay-toggle--active', isActive);
      button.setAttribute('aria-checked', isActive);
    }
  }

  /**
   * Subscribe to map controller events
   * @private
   */
  _subscribeToMapEvents() {
    this.mapController.on('layerChanged', this._onLayerChange);
    this.mapController.on('modeChanged', this._onModeChange);
  }

  /**
   * Handle layer change from map controller
   * @private
   */
  _onLayerChange(detail) {
    this._updateLayerButtons(detail.currentLayer);
  }

  /**
   * Handle mode change from map controller
   * @private
   */
  _onModeChange(detail) {
    this._updateModeButtons(detail.currentMode);
  }

  /**
   * Inject component styles
   * @private
   */
  _injectStyles() {
    if (document.getElementById('mode-toggle-styles')) return;

    const styles = document.createElement('style');
    styles.id = 'mode-toggle-styles';
    styles.textContent = `
      /* ModeToggle Component Styles */
      .mode-toggle {
        position: absolute;
        z-index: var(--z-map-controls, 100);
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 8px;
        background: var(--color-surface, #ffffff);
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      .mode-toggle--top-right { top: 70px; right: 10px; }
      .mode-toggle--top-left { top: 70px; left: 10px; }
      .mode-toggle--bottom-right { bottom: 80px; right: 10px; }
      .mode-toggle--bottom-left { bottom: 80px; left: 10px; }

      .mode-toggle--dark {
        background: rgba(30, 30, 30, 0.95);
        color: #fff;
      }

      .mode-toggle--compact {
        padding: 4px;
        gap: 4px;
      }

      .mode-toggle__section {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .mode-toggle__label {
        font-size: 11px;
        font-weight: 600;
        color: var(--color-text-secondary, #666);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 0 4px;
      }

      /* Segmented Control */
      .segmented-control {
        display: flex;
        background: var(--color-background, #f5f5f5);
        border-radius: 8px;
        padding: 2px;
      }

      .segmented-control__button {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 4px;
        padding: 8px 12px;
        border: none;
        background: transparent;
        border-radius: 6px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        color: var(--color-text-secondary, #666);
        transition: all 0.2s ease;
      }

      .segmented-control__button:hover {
        background: rgba(0, 0, 0, 0.05);
      }

      .segmented-control__button--active {
        background: var(--color-surface, #fff);
        color: var(--color-primary, #4a7c59);
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .segmented-control__button:focus-visible {
        outline: 2px solid var(--color-primary, #4a7c59);
        outline-offset: 2px;
      }

      .segmented-control__icon {
        font-size: 16px;
        line-height: 1;
      }

      /* Mode Buttons */
      .mode-button-group {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 4px;
      }

      .mode-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        padding: 10px 8px;
        border: 2px solid transparent;
        background: var(--color-background, #f5f5f5);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .mode-button:hover {
        background: var(--color-surface-hover, #fafafa);
        border-color: var(--color-border, #e0e0e0);
      }

      .mode-button--active {
        background: var(--color-primary-light, #6b9975);
        color: white;
        border-color: var(--color-primary, #4a7c59);
      }

      .mode-button--active:hover {
        background: var(--color-primary, #4a7c59);
      }

      .mode-button:focus-visible {
        outline: 2px solid var(--color-primary, #4a7c59);
        outline-offset: 2px;
      }

      .mode-button__icon {
        font-size: 20px;
        line-height: 1;
      }

      .mode-button__label {
        font-size: 11px;
        font-weight: 600;
      }

      /* Overlay Toggles */
      .overlay-toggle-group {
        display: flex;
        gap: 4px;
      }

      .overlay-toggle {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 6px 10px;
        border: 1px solid var(--color-border, #e0e0e0);
        background: var(--color-surface, #fff);
        border-radius: 20px;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
      }

      .overlay-toggle:hover {
        background: var(--color-surface-hover, #fafafa);
      }

      .overlay-toggle--active {
        background: var(--color-primary, #4a7c59);
        border-color: var(--color-primary, #4a7c59);
        color: white;
      }

      .overlay-toggle:focus-visible {
        outline: 2px solid var(--color-primary, #4a7c59);
        outline-offset: 2px;
      }

      .overlay-toggle__icon {
        font-size: 14px;
      }

      .overlay-toggle__label {
        font-weight: 500;
      }

      /* Dark theme adjustments */
      .mode-toggle--dark .segmented-control {
        background: rgba(255, 255, 255, 0.1);
      }

      .mode-toggle--dark .segmented-control__button {
        color: rgba(255, 255, 255, 0.7);
      }

      .mode-toggle--dark .segmented-control__button--active {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
      }

      .mode-toggle--dark .mode-button {
        background: rgba(255, 255, 255, 0.1);
        color: rgba(255, 255, 255, 0.8);
      }

      /* Mobile responsive */
      @media (max-width: 480px) {
        .mode-toggle {
          left: 10px;
          right: 10px;
          width: auto;
        }

        .mode-toggle--top-right,
        .mode-toggle--top-left {
          top: 70px;
          left: 10px;
          right: 10px;
        }

        .segmented-control__text {
          display: none;
        }

        .mode-button-group {
          grid-template-columns: repeat(4, 1fr);
        }

        .mode-button__label {
          font-size: 10px;
        }
      }

      /* User location marker styles */
      .user-location-icon {
        background: transparent !important;
        border: none !important;
      }

      .user-location-marker {
        position: relative;
        width: 24px;
        height: 24px;
      }

      .user-location-dot {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 12px;
        height: 12px;
        background: var(--color-primary, #4a7c59);
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
      }

      .user-location-pulse {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 24px;
        height: 24px;
        background: var(--color-primary-light, #6b9975);
        border-radius: 50%;
        opacity: 0.4;
        animation: pulse-ring 2s ease-out infinite;
      }

      @keyframes pulse-ring {
        0% {
          transform: translate(-50%, -50%) scale(0.5);
          opacity: 0.4;
        }
        100% {
          transform: translate(-50%, -50%) scale(1.5);
          opacity: 0;
        }
      }

      /* Route marker styles */
      .route-marker {
        background: transparent !important;
        border: none !important;
        font-size: 24px;
        text-align: center;
        line-height: 30px;
      }

      /* Visually hidden (for screen readers) */
      .visually-hidden {
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
    `;

    document.head.appendChild(styles);
  }

  /**
   * Unmount and cleanup the component
   */
  unmount() {
    if (this.mapController) {
      this.mapController.off('layerChanged', this._onLayerChange);
      this.mapController.off('modeChanged', this._onModeChange);
    }

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    this.container = null;
    console.log('[ModeToggle] Unmounted');
  }

  /**
   * Update component configuration
   * @param {object} newOptions
   */
  updateConfig(newOptions) {
    this.config = { ...this.config, ...newOptions };

    // Re-render if mounted
    if (this.container && this.container.parentNode) {
      const parent = this.container.parentNode;
      this.unmount();
      this.mount(parent);
    }
  }
}

// Factory function for quick initialization
export function createModeToggle(mapController, options = {}) {
  return new ModeToggle(mapController, options);
}
