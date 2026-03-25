/**
 * UnifiedMapController - Centralized map management with layer control
 *
 * Features:
 * - Single source of truth for map state
 * - Layer switching (street, satellite, terrain, accessibility)
 * - Mode management (explore, navigate, report)
 * - Event-driven architecture for UI updates
 * - Marker cluster support
 * - Accessibility overlay integration
 *
 * @module core/UnifiedMapController
 */

import { toast } from '../utils/toast.js';
import { createMarkerClusterGroup, addClusterStylesToDocument, isValidClusterGroup } from '../utils/clusterConfig.js';

// Map modes
export const MapMode = {
  EXPLORE: 'explore',      // Default browsing mode
  NAVIGATE: 'navigate',    // Turn-by-turn navigation
  REPORT: 'report',        // Accessibility reporting mode
  TRACK: 'track'           // Route tracking/recording mode
};

// Base layer types
export const LayerType = {
  STREET: 'street',
  SATELLITE: 'satellite',
  TERRAIN: 'terrain'
};

// Overlay types
export const OverlayType = {
  ACCESSIBILITY: 'accessibility',
  TRAILS: 'trails',
  TRANSIT: 'transit',
  HAZARDS: 'hazards'
};

/**
 * UnifiedMapController class
 * Provides centralized map state and layer management
 */
export class UnifiedMapController extends EventTarget {
  constructor(options = {}) {
    super();

    // Map instance
    this.map = null;
    this.mapElement = null;

    // Configuration
    this.config = {
      defaultCenter: options.center || [32.0853, 34.7818],
      defaultZoom: options.zoom || 15,
      minZoom: options.minZoom || 3,
      maxZoom: options.maxZoom || 19,
      ...options
    };

    // Current state
    this.currentMode = MapMode.EXPLORE;
    this.currentLayer = LayerType.STREET;
    this.activeOverlays = new Set();

    // Layer instances
    this.baseLayers = {};
    this.overlayLayers = {};

    // Markers and features
    this.userMarker = null;
    this.markerClusterGroup = null;
    this.featureLayers = new Map(); // Named feature collections

    // Route tracking
    this.routePolylines = [];
    this.routeMarkers = [];

    // State flags
    this.isInitialized = false;
    this.isTracking = false;
  }

  /**
   * Initialize the map
   * @param {string|HTMLElement} container - Map container element or ID
   * @returns {Promise<void>}
   */
  async initialize(container = 'map') {
    if (this.isInitialized) {
      console.warn('[UnifiedMapController] Already initialized');
      return;
    }

    // Get map element
    this.mapElement = typeof container === 'string'
      ? document.getElementById(container)
      : container;

    if (!this.mapElement) {
      throw new Error(`[UnifiedMapController] Map container not found: ${container}`);
    }

    // Create Leaflet map
    this.map = L.map(this.mapElement, {
      center: this.config.defaultCenter,
      zoom: this.config.defaultZoom,
      minZoom: this.config.minZoom,
      maxZoom: this.config.maxZoom,
      zoomControl: true,
      attributionControl: true
    });

    // Initialize base layers
    this._initializeBaseLayers();

    // Set default layer
    this.baseLayers[this.currentLayer].addTo(this.map);

    // Initialize user location marker
    this._initializeUserMarker();

    // Initialize marker clustering
    this._initializeMarkerCluster();

    // Initialize overlay layers
    this._initializeOverlayLayers();

    // Get initial user location
    await this._getUserLocation();

    this.isInitialized = true;

    // Emit initialization event
    this._emit('initialized', { mode: this.currentMode, layer: this.currentLayer });

    console.log('[UnifiedMapController] Initialized successfully');
  }

  /**
   * Initialize base tile layers
   * @private
   */
  _initializeBaseLayers() {
    this.baseLayers = {
      [LayerType.STREET]: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }),

      [LayerType.SATELLITE]: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '&copy; Esri, Maxar, Earthstar Geographics'
      }),

      [LayerType.TERRAIN]: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (CC-BY-SA)'
      })
    };
  }

  /**
   * Initialize overlay layers
   * @private
   */
  _initializeOverlayLayers() {
    // Accessibility overlay (placeholder - can be connected to real data)
    this.overlayLayers[OverlayType.ACCESSIBILITY] = L.layerGroup();

    // Trails overlay
    this.overlayLayers[OverlayType.TRAILS] = L.layerGroup();

    // Transit overlay
    this.overlayLayers[OverlayType.TRANSIT] = L.layerGroup();

    // Hazards overlay
    this.overlayLayers[OverlayType.HAZARDS] = L.layerGroup();
  }

  /**
   * Initialize user location marker
   * @private
   */
  _initializeUserMarker() {
    const userIcon = L.divIcon({
      html: `
        <div class="user-location-marker">
          <div class="user-location-dot"></div>
          <div class="user-location-pulse"></div>
        </div>
      `,
      iconSize: [24, 24],
      className: 'user-location-icon'
    });

    this.userMarker = L.marker(this.config.defaultCenter, { icon: userIcon })
      .addTo(this.map)
      .bindPopup('Your Location');
  }

  /**
   * Initialize marker cluster group
   * @private
   */
  _initializeMarkerCluster() {
    if (isValidClusterGroup(this.markerClusterGroup)) {
      console.log('[UnifiedMapController] Marker cluster already initialized');
      return;
    }

    this.markerClusterGroup = createMarkerClusterGroup();

    if (!this.markerClusterGroup) {
      console.error('[UnifiedMapController] Failed to create marker cluster group');
      return;
    }

    this.map.addLayer(this.markerClusterGroup);
    addClusterStylesToDocument('unified-map-cluster-styles');

    console.log('[UnifiedMapController] Marker cluster initialized');
  }

  /**
   * Get user's current location
   * @private
   */
  async _getUserLocation() {
    if (!navigator.geolocation) {
      console.warn('[UnifiedMapController] Geolocation not supported');
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          };

          this.updateUserLocation(location);
          resolve(location);
        },
        (error) => {
          console.warn('[UnifiedMapController] Geolocation error:', error.message);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    });
  }

  // ==========================================
  // PUBLIC API - Layer Management
  // ==========================================

  /**
   * Switch base layer
   * @param {LayerType} layerType - The layer type to switch to
   * @returns {boolean} Success status
   */
  switchLayer(layerType) {
    if (!this.baseLayers[layerType]) {
      console.warn(`[UnifiedMapController] Unknown layer type: ${layerType}`);
      return false;
    }

    if (this.currentLayer === layerType) {
      return false; // Already on this layer
    }

    // Remove current layer
    this.map.removeLayer(this.baseLayers[this.currentLayer]);

    // Add new layer
    this.baseLayers[layerType].addTo(this.map);

    const previousLayer = this.currentLayer;
    this.currentLayer = layerType;

    this._emit('layerChanged', {
      previousLayer,
      currentLayer: layerType,
      layerName: this._getLayerDisplayName(layerType)
    });

    console.log(`[UnifiedMapController] Switched to ${layerType} layer`);
    return true;
  }

  /**
   * Cycle through available base layers
   * @returns {LayerType} The new layer type
   */
  cycleLayer() {
    const layerOrder = [LayerType.STREET, LayerType.SATELLITE, LayerType.TERRAIN];
    const currentIndex = layerOrder.indexOf(this.currentLayer);
    const nextIndex = (currentIndex + 1) % layerOrder.length;
    const nextLayer = layerOrder[nextIndex];

    this.switchLayer(nextLayer);
    return nextLayer;
  }

  /**
   * Get current layer type
   * @returns {LayerType}
   */
  getCurrentLayer() {
    return this.currentLayer;
  }

  /**
   * Get display name for a layer type
   * @private
   */
  _getLayerDisplayName(layerType) {
    const names = {
      [LayerType.STREET]: 'Street',
      [LayerType.SATELLITE]: 'Satellite',
      [LayerType.TERRAIN]: 'Terrain'
    };
    return names[layerType] || layerType;
  }

  // ==========================================
  // PUBLIC API - Overlay Management
  // ==========================================

  /**
   * Toggle an overlay layer
   * @param {OverlayType} overlayType - The overlay to toggle
   * @returns {boolean} New state (true = visible)
   */
  toggleOverlay(overlayType) {
    if (!this.overlayLayers[overlayType]) {
      console.warn(`[UnifiedMapController] Unknown overlay type: ${overlayType}`);
      return false;
    }

    const isActive = this.activeOverlays.has(overlayType);

    if (isActive) {
      this.map.removeLayer(this.overlayLayers[overlayType]);
      this.activeOverlays.delete(overlayType);
    } else {
      this.overlayLayers[overlayType].addTo(this.map);
      this.activeOverlays.add(overlayType);
    }

    this._emit('overlayToggled', {
      overlay: overlayType,
      active: !isActive
    });

    return !isActive;
  }

  /**
   * Check if an overlay is active
   * @param {OverlayType} overlayType
   * @returns {boolean}
   */
  isOverlayActive(overlayType) {
    return this.activeOverlays.has(overlayType);
  }

  // ==========================================
  // PUBLIC API - Mode Management
  // ==========================================

  /**
   * Set the current map mode
   * @param {MapMode} mode - The mode to set
   */
  setMode(mode) {
    if (!Object.values(MapMode).includes(mode)) {
      console.warn(`[UnifiedMapController] Unknown mode: ${mode}`);
      return;
    }

    const previousMode = this.currentMode;
    this.currentMode = mode;

    // Apply mode-specific settings
    this._applyModeSettings(mode);

    this._emit('modeChanged', { previousMode, currentMode: mode });

    console.log(`[UnifiedMapController] Mode changed to: ${mode}`);
  }

  /**
   * Get current mode
   * @returns {MapMode}
   */
  getMode() {
    return this.currentMode;
  }

  /**
   * Apply mode-specific map settings
   * @private
   */
  _applyModeSettings(mode) {
    switch (mode) {
      case MapMode.NAVIGATE:
        // Lock rotation, enable compass
        this.map.options.touchRotate = false;
        break;
      case MapMode.REPORT:
        // Enable click-to-report
        break;
      case MapMode.TRACK:
        // Enable continuous tracking
        break;
      default:
        // Default explore settings
        break;
    }
  }

  // ==========================================
  // PUBLIC API - User Location
  // ==========================================

  /**
   * Update user's location on the map
   * @param {{lat: number, lng: number}} coords
   * @param {boolean} panTo - Whether to pan map to location
   */
  updateUserLocation(coords, panTo = true) {
    if (!this.userMarker || !coords) return;

    this.userMarker.setLatLng([coords.lat, coords.lng]);

    if (panTo) {
      this.map.panTo([coords.lat, coords.lng]);
    }

    this._emit('locationUpdated', coords);
  }

  /**
   * Center map on user's current location
   */
  async centerOnUser() {
    const location = await this._getUserLocation();
    if (location) {
      this.map.setView([location.lat, location.lng], this.config.defaultZoom);
    }
    return location;
  }

  // ==========================================
  // PUBLIC API - Markers
  // ==========================================

  /**
   * Add a marker to the cluster group
   * @param {L.Marker} marker
   * @param {object} data - Optional data to attach to marker
   */
  addMarker(marker, data = null) {
    if (data) {
      marker.markerData = data;
    }

    if (this.markerClusterGroup) {
      this.markerClusterGroup.addLayer(marker);
    } else {
      marker.addTo(this.map);
    }

    return marker;
  }

  /**
   * Remove a marker
   * @param {L.Marker} marker
   */
  removeMarker(marker) {
    if (this.markerClusterGroup && this.markerClusterGroup.hasLayer(marker)) {
      this.markerClusterGroup.removeLayer(marker);
    } else if (this.map.hasLayer(marker)) {
      this.map.removeLayer(marker);
    }
  }

  /**
   * Clear all markers from cluster group
   */
  clearMarkers() {
    if (this.markerClusterGroup) {
      this.markerClusterGroup.clearLayers();
    }
  }

  // ==========================================
  // PUBLIC API - Route Display
  // ==========================================

  /**
   * Display route data on the map
   * @param {Array} routeData - Array of route data points
   */
  showRoute(routeData) {
    if (!routeData || routeData.length === 0) {
      console.warn('[UnifiedMapController] No route data to display');
      return;
    }

    this.clearRoute();

    const bounds = L.latLngBounds([]);
    const locationPoints = routeData.filter(p =>
      p.type === 'location' && p.coords?.lat && p.coords?.lng
    );

    // Draw route line
    if (locationPoints.length > 1) {
      const routeLine = locationPoints.map(p => [p.coords.lat, p.coords.lng]);
      const polyline = L.polyline(routeLine, {
        color: '#4CAF50',
        weight: 4,
        opacity: 0.8
      }).addTo(this.map);

      this.routePolylines.push(polyline);
      bounds.extend(polyline.getBounds());
    }

    // Add markers for data points
    routeData.forEach((entry, index) => {
      if (!entry.coords?.lat || !entry.coords?.lng) return;

      bounds.extend([entry.coords.lat, entry.coords.lng]);

      const marker = this._createRouteMarker(entry, index, locationPoints.length);
      if (marker) {
        this.routeMarkers.push(marker);
      }
    });

    // Fit map to route bounds
    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [20, 20] });
    }

    this._emit('routeDisplayed', {
      pointCount: locationPoints.length,
      markers: this.routeMarkers.length
    });
  }

  /**
   * Create a marker for a route data point
   * @private
   */
  _createRouteMarker(entry, index, totalPoints) {
    const { type, coords, content, timestamp } = entry;
    let icon, popup;

    switch (type) {
      case 'photo':
        icon = L.divIcon({ html: '📷', iconSize: [30, 30], className: 'route-marker photo-marker' });
        popup = `<div style="text-align:center"><img src="${content}" style="max-width:200px;border-radius:8px"><br><small>${new Date(timestamp).toLocaleString()}</small></div>`;
        break;
      case 'text':
        icon = L.divIcon({ html: '📝', iconSize: [30, 30], className: 'route-marker note-marker' });
        popup = `<div style="max-width:200px"><strong>Note:</strong><br>${content}<br><small>${new Date(timestamp).toLocaleString()}</small></div>`;
        break;
      case 'location':
        if (index === 0 || index === totalPoints - 1) {
          const isStart = index === 0;
          icon = L.divIcon({ html: isStart ? '🚩' : '🏁', iconSize: [30, 30], className: 'route-marker' });
          popup = `<div><strong>${isStart ? 'Start' : 'End'}</strong><br><small>${new Date(timestamp).toLocaleString()}</small></div>`;
        } else {
          return null; // Skip intermediate location points
        }
        break;
      default:
        return null;
    }

    const marker = L.marker([coords.lat, coords.lng], { icon }).bindPopup(popup);
    marker.markerData = entry;

    if (type === 'location') {
      marker.addTo(this.map); // Start/end always visible
    } else {
      this.addMarker(marker, entry);
    }

    return marker;
  }

  /**
   * Clear displayed route
   */
  clearRoute() {
    this.routePolylines.forEach(p => this.map.removeLayer(p));
    this.routePolylines = [];

    this.routeMarkers.forEach(m => this.removeMarker(m));
    this.routeMarkers = [];

    this._emit('routeCleared');
  }

  // ==========================================
  // PUBLIC API - Map Controls
  // ==========================================

  /**
   * Set map view
   * @param {[number, number]} center
   * @param {number} zoom
   */
  setView(center, zoom) {
    this.map.setView(center, zoom);
  }

  /**
   * Fit map bounds
   * @param {L.LatLngBounds} bounds
   * @param {object} options
   */
  fitBounds(bounds, options = { padding: [20, 20] }) {
    this.map.fitBounds(bounds, options);
  }

  /**
   * Get current map bounds
   * @returns {L.LatLngBounds}
   */
  getBounds() {
    return this.map.getBounds();
  }

  /**
   * Get map zoom level
   * @returns {number}
   */
  getZoom() {
    return this.map.getZoom();
  }

  /**
   * Get underlying Leaflet map instance
   * @returns {L.Map}
   */
  getLeafletMap() {
    return this.map;
  }

  // ==========================================
  // Event Helpers
  // ==========================================

  /**
   * Emit a custom event
   * @private
   */
  _emit(eventName, detail = {}) {
    this.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  /**
   * Subscribe to map events
   * @param {string} eventName
   * @param {Function} callback
   */
  on(eventName, callback) {
    this.addEventListener(eventName, (e) => callback(e.detail));
  }

  /**
   * Unsubscribe from map events
   * @param {string} eventName
   * @param {Function} callback
   */
  off(eventName, callback) {
    this.removeEventListener(eventName, callback);
  }

  // ==========================================
  // Cleanup
  // ==========================================

  /**
   * Destroy the map controller
   */
  destroy() {
    this.clearRoute();
    this.clearMarkers();

    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    this.isInitialized = false;
    this._emit('destroyed');
  }
}

// Export singleton factory
let instance = null;

export function getUnifiedMapController(options) {
  if (!instance) {
    instance = new UnifiedMapController(options);
  }
  return instance;
}

export function resetUnifiedMapController() {
  if (instance) {
    instance.destroy();
    instance = null;
  }
}
