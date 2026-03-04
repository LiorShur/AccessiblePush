/**
 * POI Elements Manager
 * Handles trail point-of-interest elements for accessibility mapping
 *
 * Features:
 * - 19 POI element types with SVG icons
 * - Geolocation-based placement
 * - Route attachment
 * - Map markers with info popups
 * - Full i18n support (EN/HE)
 *
 * @file src/features/poiElements.js
 * @version 1.0
 */

import { toast } from '../utils/toast.js';

// SVG Icons (white fill, works on dark backgrounds)
export const POI_ICONS = {
  photo: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>',
  note: '<svg viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z"/></svg>',
  voice: '<svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15c-.08-.49-.49-.85-.98-.85-.61 0-1.09.54-1 1.14.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78.1-.6-.39-1.14-1-1.14z"/></svg>',
  bench: '<svg viewBox="0 0 24 24"><path d="M4 18v3h3v-3h10v3h3v-3h1v-2H3v2h1zm15-8h-2V8c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v3h18v-3c0-1.1-.9-2-2-2z"/></svg>',
  water: '<svg viewBox="0 0 24 24"><path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8zm0 18c-3.35 0-6-2.57-6-6.2 0-2.34 1.95-5.44 6-9.14 4.05 3.7 6 6.79 6 9.14 0 3.63-2.65 6.2-6 6.2z"/><path d="M12 18c1.93 0 3.5-1.57 3.5-3.5 0-.87-.7-2.32-2.07-4.06L12 8.66l-1.43 1.78C9.2 12.18 8.5 13.63 8.5 14.5c0 1.93 1.57 3.5 3.5 3.5z"/></svg>',
  restroom: '<svg viewBox="0 0 24 24"><path d="M5.5 22v-7.5H4V9c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2v5.5H9.5V22h-4zM18 22v-6h3l-2.54-7.63C18.18 7.55 17.42 7 16.56 7h-.12c-.86 0-1.63.55-1.9 1.37L12 16h3v6h3zM7.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm9 0c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2z"/></svg>',
  viewpoint: '<svg viewBox="0 0 24 24"><path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/></svg>',
  picnic: '<svg viewBox="0 0 24 24"><path d="M2.53 19.65l1.34.56v-9.03l-2.43 5.86c-.41 1.02.08 2.19 1.09 2.61zm19.5-3.7L17.07 3.98c-.31-.75-1.04-1.21-1.81-1.23-.26 0-.53.04-.79.15L7.1 5.95c-.75.31-1.21 1.03-1.23 1.8-.01.27.04.54.15.8l4.96 11.97c.31.76 1.05 1.22 1.83 1.23.26 0 .52-.05.77-.15l7.36-3.05c1.02-.42 1.51-1.59 1.09-2.6zM7.88 8.75c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-2 11v-4.5H4v4.5c0 .83.67 1.5 1.5 1.5S7 20.33 7 19.5v-4.5H5.12v4.5c0 .28-.22.5-.5.5s-.5-.22-.5-.5z"/></svg>',
  steep: '<svg viewBox="0 0 24 24"><path d="M14 6l-4.22 5.63 1.25 1.67L14 9.33 19 16h-8.46l-4.01-5.37L1 18h22L14 6zM5 16l1.52-2.03L8.04 16H5z"/></svg>',
  accessibility: '<svg viewBox="0 0 24 24"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>',
  hazard: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
  info: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
  shade: '<svg viewBox="0 0 24 24"><path d="M22 9.74l-2 1V3H4v8.26l-2-1v1.98l2 1.02v.74l-2 1v1.98l2 1.02V21h16v-4.02l2-1v-1.98l-2-1v-.74l2-1V9.74zM6 19V5h4v14H6zm10 0h-4V5h4v14z"/></svg>',
  parking: '<svg viewBox="0 0 24 24"><path d="M13 3H6v18h4v-6h3c3.31 0 6-2.69 6-6s-2.69-6-6-6zm.2 8H10V7h3.2c1.1 0 2 .9 2 2s-.9 2-2 2z"/></svg>',
  junction: '<svg viewBox="0 0 24 24"><path d="M14 7l5 5-5 5V7zm-4 0v10l-5-5 5-5z"/></svg>',
  steps: '<svg viewBox="0 0 24 24"><path d="M21 5H3v14h18V5zM5 7h4v2H5V7zm0 4h4v2H5v-2zm0 4h4v2H5v-2zm14 2h-4v-2h4v2zm0-4h-4v-2h4v2zm0-4h-4V7h4v2z"/></svg>',
  gate: '<svg viewBox="0 0 24 24"><path d="M21 10H3V8h18v2zm0 4H3v-2h18v2zM5 22H3V2h2v20zm16 0h-2V2h2v20z"/></svg>',
  bridge: '<svg viewBox="0 0 24 24"><path d="M7 21H3v-8c0-2.21 1.79-4 4-4h3v-3l4 4-4 4v-3H7c-1.1 0-2 .9-2 2v6h2v2zm10 0h4v-8c0-2.21-1.79-4-4-4h-3v-3l-4 4 4 4v-3h3c1.1 0 2 .9 2 2v6h-2v2z"/></svg>',
  crossing: '<svg viewBox="0 0 24 24"><path d="M6 6h12v2H6V6zm0 4h12v2H6v-2zm0 4h12v2H6v-2zm0 4h12v2H6v-2z"/><path d="M4 4v16h2V4H4zm14 0v16h2V4h-2z"/></svg>',
  // Additional UI icons
  camera: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.2"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z"/></svg>',
  gallery: '<svg viewBox="0 0 24 24"><path d="M22 16V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2zm-11-4l2.03 2.71L16 11l4 5H8l3-4zM2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/></svg>',
  mic: '<svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>',
  location: '<svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>',
  plus: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>'
};

// Element definitions with categories
export const POI_ELEMENTS = [
  // Capture (3)
  { id: 'photo', icon: 'photo', type: 'capture', category: 'capture' },
  { id: 'note', icon: 'note', type: 'capture', category: 'capture' },
  { id: 'voice', icon: 'voice', type: 'capture', category: 'capture' },
  // Rest & Comfort (4)
  { id: 'bench', icon: 'bench', category: 'comfort' },
  { id: 'picnic', icon: 'picnic', category: 'comfort' },
  { id: 'shade', icon: 'shade', category: 'comfort' },
  { id: 'viewpoint', icon: 'viewpoint', category: 'comfort' },
  // Water & Facilities (3)
  { id: 'water', icon: 'water', category: 'facilities' },
  { id: 'restroom', icon: 'restroom', category: 'facilities' },
  { id: 'parking', icon: 'parking', category: 'facilities' },
  // Terrain & Accessibility (6)
  { id: 'steep', icon: 'steep', type: 'terrain', category: 'terrain' },
  { id: 'steps', icon: 'steps', type: 'terrain', category: 'terrain' },
  { id: 'gate', icon: 'gate', type: 'terrain', category: 'terrain' },
  { id: 'bridge', icon: 'bridge', type: 'terrain', category: 'terrain' },
  { id: 'crossing', icon: 'crossing', type: 'terrain', category: 'terrain' },
  { id: 'accessibility', icon: 'accessibility', type: 'accessibility', category: 'terrain' },
  // Safety (3)
  { id: 'hazard', icon: 'hazard', type: 'hazard', category: 'safety' },
  { id: 'info', icon: 'info', category: 'safety' },
  { id: 'junction', icon: 'junction', category: 'safety' }
];

// Color coding for element types
export const TYPE_COLORS = {
  capture: '#9c27b0',
  hazard: '#f44336',
  accessibility: '#2196F3',
  terrain: '#ff9800',
  default: '#4CAF50'
};

/**
 * POI Elements Manager Class
 */
export class POIElementsManager {
  constructor(options = {}) {
    this.map = options.map || null;
    this.routeId = options.routeId || null;
    this.elements = [];
    this.markers = [];
    this.markerLayer = null;
    this.isOpen = false;
    this.currentLocation = null;

    // DOM references
    this.fabButton = null;
    this.overlay = null;
    this.bottomSheet = null;
    this.sheetBackdrop = null;

    // Callbacks
    this.onElementAdded = options.onElementAdded || null;

    // i18n
    this.lang = localStorage.getItem('accessNature_language') || 'en';
  }

  /**
   * Get translation
   */
  t(key) {
    if (window.i18n?.t) {
      // Try poi namespace first, then common namespace
      const poiTranslation = window.i18n.t(`poi.${key}`);
      if (poiTranslation && poiTranslation !== `poi.${key}`) {
        return poiTranslation;
      }
      const commonTranslation = window.i18n.t(`common.${key}`);
      if (commonTranslation && commonTranslation !== `common.${key}`) {
        return commonTranslation;
      }
      return key;
    }
    return key;
  }

  /**
   * Initialize the POI system
   */
  init(mapInstance) {
    this.map = mapInstance;
    this.markerLayer = L.layerGroup().addTo(this.map);

    this.createUI();
    this.bindEvents();
    this.loadStoredElements();

    // Listen for language changes
    window.addEventListener('languageChanged', () => {
      this.lang = localStorage.getItem('accessNature_language') || 'en';
      this.refreshUI();
    });

    console.log('[POIElements] Initialized');
  }

  /**
   * Create the FAB and overlay UI
   */
  createUI() {
    // Create FAB button
    this.fabButton = document.createElement('button');
    this.fabButton.id = 'poiFab';
    this.fabButton.className = 'poi-fab';
    this.fabButton.setAttribute('aria-label', this.t('addElement'));
    this.fabButton.innerHTML = POI_ICONS.plus;

    // Create element picker overlay
    this.overlay = document.createElement('div');
    this.overlay.id = 'poiOverlay';
    this.overlay.className = 'poi-overlay';
    this.overlay.innerHTML = this.buildOverlayHTML();

    // Create bottom sheet backdrop
    this.sheetBackdrop = document.createElement('div');
    this.sheetBackdrop.id = 'poiSheetBackdrop';
    this.sheetBackdrop.className = 'poi-sheet-backdrop';

    // Create bottom sheet
    this.bottomSheet = document.createElement('div');
    this.bottomSheet.id = 'poiBottomSheet';
    this.bottomSheet.className = 'poi-bottom-sheet';

    // Append to body
    document.body.appendChild(this.fabButton);
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.sheetBackdrop);
    document.body.appendChild(this.bottomSheet);
  }

  /**
   * Build overlay HTML with element grid
   */
  buildOverlayHTML() {
    const elementsHTML = POI_ELEMENTS.map(el => {
      const typeAttr = el.type ? ` data-type="${el.type}"` : '';
      return `
        <button class="poi-element-btn" data-element="${el.id}"${typeAttr}>
          ${POI_ICONS[el.icon]}
          <span class="poi-element-label" data-i18n="poi.el_${el.id}">${this.t(`el_${el.id}`)}</span>
        </button>
      `;
    }).join('');

    return `
      <div class="poi-overlay-backdrop" id="poiOverlayBackdrop"></div>
      <div class="poi-overlay-content">
        <div class="poi-overlay-header">
          <span class="poi-overlay-title" data-i18n="poi.addElement">${this.t('addElement')}</span>
          <button class="poi-overlay-close" id="poiOverlayClose" aria-label="${this.t('cancel')}">
            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="white" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          </button>
        </div>
        <div class="poi-element-grid">
          ${elementsHTML}
        </div>
        <div class="poi-overlay-footer">
          <button class="poi-cancel-btn" id="poiCancelBtn" data-i18n="poi.cancel">${this.t('cancel')}</button>
        </div>
      </div>
    `;
  }

  /**
   * Build bottom sheet HTML for a specific element
   */
  buildSheetHTML(elementId) {
    const el = POI_ELEMENTS.find(e => e.id === elementId);
    if (!el) return '';

    const gpsSection = `
      <div class="poi-form-section">
        <label class="poi-form-label" data-i18n="poi.location">${this.t('location')}</label>
        <div class="poi-gps-display">
          <span class="poi-gps-icon">${POI_ICONS.location}</span>
          <div class="poi-gps-coords">
            <div class="poi-gps-lat">${this.currentLocation ? this.currentLocation.lat.toFixed(6) + '° N' : '---'}</div>
            <div class="poi-gps-lng">${this.currentLocation ? this.currentLocation.lng.toFixed(6) + '° E' : '---'}</div>
          </div>
          <span class="poi-gps-accuracy">±${this.currentLocation?.accuracy?.toFixed(0) || '--'}m</span>
        </div>
      </div>
    `;

    const photoSection = `
      <div class="poi-form-section">
        <label class="poi-form-label" data-i18n="poi.photoOptional">${this.t('photoOptional')}</label>
        <div class="poi-photo-capture">
          <button class="poi-photo-btn" data-action="camera">
            ${POI_ICONS.camera}
            <span class="poi-photo-btn-text" data-i18n="poi.takePhoto">${this.t('takePhoto')}</span>
          </button>
          <button class="poi-photo-btn" data-action="gallery">
            ${POI_ICONS.gallery}
            <span class="poi-photo-btn-text" data-i18n="poi.gallery">${this.t('gallery')}</span>
          </button>
        </div>
      </div>
    `;

    const notesSection = `
      <div class="poi-form-section">
        <label class="poi-form-label" data-i18n="poi.notesOptional">${this.t('notesOptional')}</label>
        <textarea class="poi-notes-textarea" id="poiNotes" placeholder="${this.t('notesPlaceholder')}" data-i18n-placeholder="poi.notesPlaceholder"></textarea>
      </div>
    `;

    // Build element-specific fields
    const specificFields = this.getElementSpecificFields(elementId);

    return `
      <div class="poi-sheet-handle"></div>
      <div class="poi-sheet-header">
        <span class="poi-sheet-icon">${POI_ICONS[el.icon]}</span>
        <span class="poi-sheet-title" data-i18n="poi.el_${el.id}">${this.t(`el_${el.id}`)}</span>
        <button class="poi-sheet-close" id="poiSheetClose">
          ${POI_ICONS.close}
        </button>
      </div>
      <div class="poi-sheet-content">
        ${gpsSection}
        ${photoSection}
        ${specificFields}
        ${notesSection}
      </div>
      <div class="poi-sheet-footer">
        <button class="poi-submit-btn" id="poiSubmitBtn" data-element="${elementId}">
          <span data-i18n="poi.saveElement">${this.t('saveElement')}</span>
          ${POI_ICONS.check}
        </button>
      </div>
    `;
  }

  /**
   * Get element-specific form fields
   */
  getElementSpecificFields(elementId) {
    const fields = {
      bench: this.buildChips('condition', ['good', 'fair', 'poor']) +
             this.buildChips('features', ['backrest', 'armrests', 'shaded', 'wheelchairSpace'], true),
      water: this.buildChips('waterStatus', ['working', 'notWorking', 'seasonal']),
      restroom: this.buildChips('accessibility', ['accessible', 'notAccessible', 'unknown']) +
                this.buildChips('facilities', ['grabBars', 'changingTable', 'sink'], true),
      viewpoint: this.buildChips('viewDirection', ['north', 'east', 'south', 'west'], true),
      picnic: this.buildChips('amenities', ['shaded', 'bbqGrill', 'trashBins', 'wheelchairAccess'], true),
      steep: this.buildChips('direction', ['uphill', 'downhill', 'both']) +
             this.buildChips('difficulty', ['moderate', 'steep', 'verySteep']),
      accessibility: this.buildChips('issueType', ['surface', 'obstacle', 'width', 'slope'], true) +
                     this.buildChips('surfaceType', ['paved', 'gravel', 'dirt', 'uneven']),
      hazard: this.buildChips('hazardType', ['fallenTree', 'erosion', 'flooding', 'wildlife']) +
              this.buildChips('severity', ['low', 'medium', 'high', 'trailClosed']),
      info: this.buildChips('infoType', ['trailSign', 'infoBoard', 'mileMarker', 'other']),
      shade: this.buildChips('shadeCoverage', ['partial', 'full']) +
             this.buildChips('seatingAvailable', ['yes', 'no']),
      parking: this.buildChips('parkingType', ['lot', 'street', 'trailhead']) +
               this.buildChips('fee', ['free', 'paid', 'permitRequired']),
      junction: this.buildChips('numPaths', ['way2', 'way3', 'way4plus']) +
                this.buildChips('signage', ['clearSigns', 'partialSigns', 'noSigns']),
      steps: this.buildChips('handrail', ['handrailBoth', 'handrailOne', 'handrailNone']) +
             this.buildChips('altRamp', ['available', 'notAvailable']),
      gate: this.buildChips('gateType', ['gate', 'barrier', 'bollards', 'turnstile']) +
            this.buildChips('wheelchairPassable', ['yes', 'no', 'unknown']),
      bridge: this.buildChips('bridgeWidth', ['wideBridge', 'standardBridge', 'narrowBridge']) +
              this.buildChips('railings', ['railingsBoth', 'railingsOne', 'railingsNone']),
      crossing: this.buildChips('crossingType', ['crosswalk', 'signal', 'unmarked', 'underpass']) +
                this.buildChips('trafficLevel', ['light', 'medium', 'heavy'])
    };

    return fields[elementId] || '';
  }

  /**
   * Build toggle chips HTML
   */
  buildChips(labelKey, options, multi = false) {
    const chips = options.map((opt, i) =>
      `<button class="poi-toggle-chip${i === 0 ? ' selected' : ''}" data-value="${opt}" data-i18n="poi.${opt}">${this.t(opt)}</button>`
    ).join('');

    return `
      <div class="poi-form-section">
        <label class="poi-form-label" data-i18n="poi.${labelKey}">${this.t(labelKey)}</label>
        <div class="poi-toggle-chips${multi ? ' multi' : ''}" data-field="${labelKey}">
          ${chips}
        </div>
      </div>
    `;
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // FAB click - open overlay
    this.fabButton.addEventListener('click', () => this.openOverlay());

    // Overlay close - X button
    this.overlay.querySelector('#poiOverlayClose').addEventListener('click', () => this.closeOverlay());

    // Overlay close - backdrop click
    this.overlay.querySelector('#poiOverlayBackdrop').addEventListener('click', () => this.closeOverlay());

    // Overlay close - cancel button
    this.overlay.querySelector('#poiCancelBtn').addEventListener('click', () => this.closeOverlay());

    // Element buttons
    this.overlay.querySelectorAll('.poi-element-btn').forEach(btn => {
      btn.addEventListener('click', () => this.openSheet(btn.dataset.element));
    });

    // Sheet backdrop click - close sheet
    this.sheetBackdrop.addEventListener('click', () => this.closeSheet());
  }

  /**
   * Open element picker overlay
   */
  async openOverlay() {
    // Get current location first
    await this.getCurrentLocation();

    this.fabButton.classList.add('open');
    this.overlay.classList.add('visible');
    this.isOpen = true;
  }

  /**
   * Close element picker overlay
   */
  closeOverlay() {
    this.fabButton.classList.remove('open');
    this.overlay.classList.remove('visible');
    this.isOpen = false;
  }

  /**
   * Open bottom sheet for specific element
   */
  openSheet(elementId) {
    this.closeOverlay();

    this.bottomSheet.innerHTML = this.buildSheetHTML(elementId);

    // Bind sheet events
    this.bottomSheet.querySelector('#poiSheetClose').addEventListener('click', () => this.closeSheet());
    this.bottomSheet.querySelector('#poiSubmitBtn').addEventListener('click', () => this.saveElement(elementId));

    // Bind chip toggle events
    this.bottomSheet.querySelectorAll('.poi-toggle-chips').forEach(group => {
      const isMulti = group.classList.contains('multi');
      group.querySelectorAll('.poi-toggle-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          if (!isMulti) {
            group.querySelectorAll('.poi-toggle-chip').forEach(c => c.classList.remove('selected'));
          }
          chip.classList.toggle('selected');
        });
      });
    });

    // Bind photo buttons
    this.bottomSheet.querySelectorAll('.poi-photo-btn').forEach(btn => {
      btn.addEventListener('click', () => this.handlePhotoCapture(btn.dataset.action));
    });

    this.sheetBackdrop.classList.add('visible');
    this.bottomSheet.classList.add('visible');
  }

  /**
   * Close bottom sheet
   */
  closeSheet() {
    this.sheetBackdrop.classList.remove('visible');
    this.bottomSheet.classList.remove('visible');
  }

  /**
   * Get current GPS location
   */
  async getCurrentLocation() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        toast.error(this.t('locationError'));
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            timestamp: position.timestamp
          };
          resolve(this.currentLocation);
        },
        (error) => {
          console.warn('[POIElements] Geolocation error:', error);
          toast.error(this.t('locationError'));
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
      );
    });
  }

  /**
   * Handle photo capture
   */
  async handlePhotoCapture(action) {
    // Create hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = action === 'camera' ? 'environment' : undefined;

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        // Store for later use when saving
        this.pendingPhoto = file;
        toast.success(this.t('photoAdded'));
      }
    };

    input.click();
  }

  /**
   * Convert file to compressed base64 data URL
   * Resizes and compresses images to reduce storage size
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          // Max dimensions for compressed image
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          const QUALITY = 0.7;

          let { width, height } = img;

          // Calculate new dimensions maintaining aspect ratio
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          // Create canvas and draw resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to compressed JPEG
          const compressedDataUrl = canvas.toDataURL('image/jpeg', QUALITY);
          resolve(compressedDataUrl);
        };

        img.onerror = reject;
        img.src = e.target.result;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Save element to storage and add marker
   */
  async saveElement(elementId) {
    if (!this.currentLocation) {
      toast.error(this.t('locationRequired'));
      return;
    }

    // Collect form data
    const formData = {
      type: elementId,
      location: this.currentLocation,
      routeId: this.routeId,
      timestamp: Date.now(),
      notes: this.bottomSheet.querySelector('#poiNotes')?.value || '',
      fields: {}
    };

    // Collect chip selections
    this.bottomSheet.querySelectorAll('.poi-toggle-chips').forEach(group => {
      const fieldName = group.dataset.field;
      const isMulti = group.classList.contains('multi');
      const selected = group.querySelectorAll('.poi-toggle-chip.selected');

      if (isMulti) {
        formData.fields[fieldName] = Array.from(selected).map(c => c.dataset.value);
      } else {
        formData.fields[fieldName] = selected[0]?.dataset.value || null;
      }
    });

    // Handle photo if present - convert to base64 for storage
    if (this.pendingPhoto) {
      try {
        formData.photoDataUrl = await this.fileToBase64(this.pendingPhoto);
        this.pendingPhoto = null;
      } catch (e) {
        console.warn('[POIElements] Failed to convert photo:', e);
      }
    }

    // Generate ID
    formData.id = `poi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Add to local storage
    this.elements.push(formData);
    this.saveToStorage();

    // Add marker to map
    this.addMarker(formData);

    // Close sheet
    this.closeSheet();

    // Callback
    if (this.onElementAdded) {
      this.onElementAdded(formData);
    }

    toast.success(this.t('elementSaved'));
    console.log('[POIElements] Saved:', formData);
  }

  /**
   * Add marker to map
   */
  addMarker(element) {
    const el = POI_ELEMENTS.find(e => e.id === element.type);
    if (!el) return;

    const color = TYPE_COLORS[el.type] || TYPE_COLORS.default;

    // Create custom icon
    const iconHtml = `
      <div class="poi-marker" style="background-color: ${color}">
        ${POI_ICONS[el.icon]}
      </div>
    `;

    const icon = L.divIcon({
      html: iconHtml,
      className: 'poi-marker-container',
      iconSize: [36, 36],
      iconAnchor: [18, 36],
      popupAnchor: [0, -36]
    });

    const marker = L.marker([element.location.lat, element.location.lng], { icon })
      .addTo(this.markerLayer);

    // Build popup content
    const popupContent = this.buildPopupContent(element);
    marker.bindPopup(popupContent, {
      maxWidth: 280,
      className: 'poi-popup'
    });

    // Store reference
    marker._poiId = element.id;
    this.markers.push(marker);

    return marker;
  }

  /**
   * Build popup content for marker
   */
  buildPopupContent(element) {
    const el = POI_ELEMENTS.find(e => e.id === element.type);
    const title = this.t(`el_${element.type}`);
    const time = new Date(element.timestamp).toLocaleString();

    let fieldsHtml = '';
    if (element.fields) {
      Object.entries(element.fields).forEach(([key, value]) => {
        if (value && (Array.isArray(value) ? value.length > 0 : true)) {
          const label = this.t(key);
          const displayValue = Array.isArray(value)
            ? value.map(v => this.t(v)).join(', ')
            : this.t(value);
          fieldsHtml += `<div class="poi-popup-field"><strong>${label}:</strong> ${displayValue}</div>`;
        }
      });
    }

    // Photo section
    const photoHtml = element.photoDataUrl
      ? `<div class="poi-popup-photo"><img src="${element.photoDataUrl}" alt="${title}" /></div>`
      : '';

    return `
      <div class="poi-popup-content">
        <div class="poi-popup-header">
          <span class="poi-popup-icon">${POI_ICONS[el.icon]}</span>
          <span class="poi-popup-title">${title}</span>
        </div>
        <div class="poi-popup-time">${time}</div>
        ${photoHtml}
        ${fieldsHtml}
        ${element.notes ? `<div class="poi-popup-notes">${element.notes}</div>` : ''}
      </div>
    `;
  }

  /**
   * Save elements to localStorage
   */
  saveToStorage() {
    const key = this.routeId ? `poi_elements_${this.routeId}` : 'poi_elements_temp';
    // photoDataUrl (base64) is stored, photoBlob (File object) is not
    const data = this.elements.map(el => {
      const { photoBlob, ...rest } = el;
      return rest;
    });
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      // localStorage might be full with large images
      console.warn('[POIElements] Storage error, trying without photos:', e);
      const dataNoPhotos = data.map(({ photoDataUrl, ...rest }) => rest);
      localStorage.setItem(key, JSON.stringify(dataNoPhotos));
      toast.error(this.t('storageFullPhotosNotSaved') || 'Storage full - photos not saved');
    }
  }

  /**
   * Load elements from localStorage
   */
  loadStoredElements() {
    const key = this.routeId ? `poi_elements_${this.routeId}` : 'poi_elements_temp';
    try {
      const data = localStorage.getItem(key);
      if (data) {
        this.elements = JSON.parse(data);
        this.elements.forEach(el => this.addMarker(el));
        console.log(`[POIElements] Loaded ${this.elements.length} elements`);
      }
    } catch (e) {
      console.error('[POIElements] Failed to load stored elements:', e);
    }
  }

  /**
   * Get all elements for export
   */
  getElements() {
    return this.elements;
  }

  /**
   * Set route ID (for attaching elements to a specific route)
   */
  setRouteId(routeId) {
    this.routeId = routeId;
  }

  /**
   * Clear all elements
   */
  clearElements() {
    this.elements = [];
    this.markers.forEach(m => this.markerLayer.removeLayer(m));
    this.markers = [];
    this.saveToStorage();
  }

  /**
   * Refresh UI (for language changes)
   */
  refreshUI() {
    this.overlay.innerHTML = this.buildOverlayHTML();

    // Rebind overlay events
    this.overlay.querySelector('#poiOverlayClose').addEventListener('click', () => this.closeOverlay());
    this.overlay.querySelector('#poiOverlayBackdrop').addEventListener('click', () => this.closeOverlay());
    this.overlay.querySelector('#poiCancelBtn').addEventListener('click', () => this.closeOverlay());
    this.overlay.querySelectorAll('.poi-element-btn').forEach(btn => {
      btn.addEventListener('click', () => this.openSheet(btn.dataset.element));
    });

    // Update FAB aria-label
    this.fabButton.setAttribute('aria-label', this.t('addElement'));
  }

  /**
   * Show/Hide FAB
   */
  show() {
    this.fabButton.classList.remove('hidden');
  }

  hide() {
    this.fabButton.classList.add('hidden');
  }
}

// Export singleton instance
export const poiElements = new POIElementsManager();
