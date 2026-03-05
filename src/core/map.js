// FIXED: Map controller with proper route restoration and visualization
import { toast } from '../utils/toast.js';

export class MapController {
  constructor() {
    this.map = null;
    this.marker = null;
    this.routePolylines = [];
    this.routeMarkers = []; // Add this to track all route markers
    this.markerClusterGroup = null; // Cluster group for route markers
    this.currentLayer = null;
    this.layers = {};
    this.currentLayerName = 'street';
  }

  async initialize() {
    const mapElement = document.getElementById('map');
    if (!mapElement) {
      throw new Error('Map element not found');
    }

    this.map = L.map('map').setView([32.0853, 34.7818], 15);

    // Define available tile layers
    this.layers = {
      street: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '© Esri, Maxar, Earthstar Geographics'
      }),
      terrain: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        maxZoom: 17,
        attribution: '© OpenTopoMap (CC-BY-SA)'
      })
    };

    // Set default layer
    this.currentLayer = this.layers.street;
    this.currentLayer.addTo(this.map);

    this.marker = L.marker([32.0853, 34.7818])
      .addTo(this.map)
      .bindPopup("Current Location");

    // Initialize marker cluster group for route markers (photos, notes, saved routes, trail guides)
    this.initializeMarkerCluster();

    await this.getCurrentLocation();
    console.log('✅ Map controller initialized with layer switching and clustering support');
  }

  /**
   * Initialize marker cluster group for route markers
   */
  initializeMarkerCluster() {
    // Check if L.markerClusterGroup is available
    if (typeof L.markerClusterGroup !== 'function') {
      console.warn('⚠️ MarkerCluster plugin not loaded, markers will not be clustered');
      return;
    }

    this.markerClusterGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false, // Handle custom click behavior
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        let sizeClass = 'cluster-small';
        if (count > 10) sizeClass = 'cluster-large';
        else if (count > 5) sizeClass = 'cluster-medium';

        return L.divIcon({
          html: `<div class="tracker-cluster ${sizeClass}">${count}</div>`,
          className: 'marker-cluster-custom',
          iconSize: L.point(40, 40)
        });
      }
    });

    // Handle cluster clicks - show list of items
    this.markerClusterGroup.on('clusterclick', (e) => {
      const cluster = e.layer;
      const markers = cluster.getAllChildMarkers();
      this.showClusteredMarkersPopup(markers, e.latlng);
    });

    this.map.addLayer(this.markerClusterGroup);

    // Add cluster styles
    this.addClusterStyles();
    console.log('✅ Marker cluster initialized');
  }

  /**
   * Add CSS styles for marker clusters
   */
  addClusterStyles() {
    if (document.getElementById('tracker-cluster-styles')) return;

    const style = document.createElement('style');
    style.id = 'tracker-cluster-styles';
    style.textContent = `
      .marker-cluster-custom {
        background: transparent;
      }
      .tracker-cluster {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 14px;
        color: white;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        background: #4CAF50;
      }
      .tracker-cluster.cluster-medium {
        width: 50px;
        height: 50px;
        font-size: 15px;
        background: #f59e0b;
      }
      .tracker-cluster.cluster-large {
        width: 60px;
        height: 60px;
        font-size: 16px;
        background: #ef4444;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Show popup with list of clustered markers
   */
  showClusteredMarkersPopup(markers, latlng) {
    const items = markers.map(m => m.markerData || { type: 'unknown', content: '' });

    const content = `
      <div style="max-width: 280px;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">
          📍 ${markers.length} items at this location
        </h3>
        <div style="max-height: 250px; overflow-y: auto;">
          ${items.map((item, idx) => {
            const icon = item.type === 'photo' ? '📷' : item.type === 'text' ? '📝' : '📍';
            const label = item.type === 'photo' ? 'Photo' : item.type === 'text' ? 'Note' : 'Location';
            const preview = item.type === 'text' ? item.content?.substring(0, 50) + (item.content?.length > 50 ? '...' : '') : '';
            const time = item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : '';

            return `
              <div style="padding: 8px; border-bottom: 1px solid #e5e7eb; cursor: pointer;"
                   onclick="this.closest('.leaflet-popup').querySelector('.leaflet-popup-close-button').click(); document.querySelectorAll('.leaflet-marker-icon')[${idx}]?.click();">
                <div style="font-weight: 600; font-size: 13px; margin-bottom: 2px;">
                  ${icon} ${label}
                </div>
                ${preview ? `<div style="font-size: 11px; color: #6b7280;">${preview}</div>` : ''}
                ${time ? `<div style="font-size: 10px; color: #9ca3af; margin-top: 2px;">${time}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    L.popup()
      .setLatLng(latlng)
      .setContent(content)
      .openOn(this.map);
  }

  /**
   * Switch to a different map layer
   * @param {string} layerName - 'street', 'satellite', or 'terrain'
   */
  switchLayer(layerName) {
    if (!this.layers[layerName]) {
      console.warn(`Unknown layer: ${layerName}`);
      return false;
    }

    if (this.currentLayerName === layerName) {
      return false; // Already on this layer
    }

    // Remove current layer
    if (this.currentLayer) {
      this.map.removeLayer(this.currentLayer);
    }

    // Add new layer
    this.currentLayer = this.layers[layerName];
    this.currentLayer.addTo(this.map);
    this.currentLayerName = layerName;

    console.log(`🗺️ Switched to ${layerName} layer`);
    return true;
  }

  /**
   * Cycle through available layers
   * @returns {string} The new layer name
   */
  cycleLayer() {
    const layerOrder = ['street', 'satellite', 'terrain'];
    const currentIndex = layerOrder.indexOf(this.currentLayerName);
    const nextIndex = (currentIndex + 1) % layerOrder.length;
    const nextLayer = layerOrder[nextIndex];
    this.switchLayer(nextLayer);
    return nextLayer;
  }

  /**
   * Get current layer name
   */
  getCurrentLayerName() {
    return this.currentLayerName;
  }

  async getCurrentLocation() {
    if (!navigator.geolocation) {
      toast.errorKey('locationError');
      return null;
    }

    // Check permission status first (if Permissions API available)
    if (navigator.permissions) {
      try {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        console.log('📍 Geolocation permission status:', status.state);
        
        if (status.state === 'denied') {
          toast.errorKey('locationDenied');
          console.warn('📍 Location permission denied - user needs to enable in browser settings');
          return null;
        }
        
        // Listen for permission changes
        status.onchange = () => {
          console.log('📍 Geolocation permission changed to:', status.state);
          if (status.state === 'granted') {
            toast.successKey('saved');
            this.getCurrentLocation(); // Retry
          }
        };
      } catch (e) {
        // Permissions API not fully supported, continue with regular request
        console.log('📍 Permissions API not available, requesting directly');
      }
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          this.map.setView([userLocation.lat, userLocation.lng], 17);
          this.marker.setLatLng([userLocation.lat, userLocation.lng]);
          console.log('📍 Got user location:', userLocation);
          resolve(userLocation);
        },
        (error) => {
          console.warn('📍 Geolocation failed:', error.message, '(code:', error.code, ')');
          
          // Provide user-friendly error messages
          switch (error.code) {
            case 1: // PERMISSION_DENIED
              toast.errorKey('locationDenied');
              break;
            case 2: // POSITION_UNAVAILABLE
              toast.warningKey('locationUnavailable');
              break;
            case 3: // TIMEOUT
              toast.warningKey('locationTimeout');
              break;
            default:
              toast.warningKey('locationError');
          }
          
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
      );
    });
  }

  updateMarkerPosition(coords) {
    if (!this.marker || !coords) return;
    this.marker.setLatLng([coords.lat, coords.lng]);
    this.map.panTo([coords.lat, coords.lng]);
  }

  addRouteSegment(startCoords, endCoords) {
    if (!startCoords || !endCoords) return;

    const polyline = L.polyline([
      [startCoords.lat, startCoords.lng], 
      [endCoords.lat, endCoords.lng]
    ], {
      color: '#4CAF50',
      weight: 4,
      opacity: 0.8
    }).addTo(this.map);

    this.routePolylines.push(polyline);
    return polyline;
  }

  // FIXED: Enhanced route data visualization with proper data handling
  showRouteData(routeData) {
    if (!routeData || routeData.length === 0) {
      toast.warningKey('noRouteData');
      return;
    }

    console.log(`🗺️ Displaying route with ${routeData.length} data points`);
    
    this.clearRouteDisplay();
    const bounds = L.latLngBounds([]);

    // Extract location points for route line
    const locationPoints = routeData.filter(entry => 
      entry.type === 'location' && 
      entry.coords && 
      entry.coords.lat && 
      entry.coords.lng
    );

    console.log(`📍 Found ${locationPoints.length} GPS location points`);

    if (locationPoints.length === 0) {
      toast.warningKey('noGpsPoints');
      return;
    }

    // Draw route line
    if (locationPoints.length > 1) {
  const routeLine = locationPoints.map(point => [point.coords.lat, point.coords.lng]);
  
  const polyline = L.polyline(routeLine, {
    color: '#4CAF50',
    weight: 4,
    opacity: 0.8
  }).addTo(this.map);
  
  // CRITICAL: Add this line to track the polyline
  this.routePolylines.push(polyline);
  
  bounds.extend(polyline.getBounds());
}

    // Add markers for all data points (using cluster if available)
    routeData.forEach((entry, index) => {
      if (!entry.coords || !entry.coords.lat || !entry.coords.lng) return;

      bounds.extend([entry.coords.lat, entry.coords.lng]);

      if (entry.type === 'photo') {
        const icon = L.divIcon({
          html: '📷',
          iconSize: [30, 30],
          className: 'custom-div-icon photo-marker'
        });

        const photoMarker = L.marker([entry.coords.lat, entry.coords.lng], { icon })
          .bindPopup(`
            <div style="text-align: center;">
              <img src="${entry.content}" style="width:200px; max-height:150px; object-fit:cover; border-radius:8px;">
              <br><small>${new Date(entry.timestamp).toLocaleString()}</small>
            </div>
          `);

        // Store data for cluster popup
        photoMarker.markerData = { type: 'photo', content: entry.content, timestamp: entry.timestamp };
        this.addMarkerToClusterOrMap(photoMarker);
        this.routeMarkers.push(photoMarker);

      } else if (entry.type === 'text') {
        const icon = L.divIcon({
          html: '📝',
          iconSize: [30, 30],
          className: 'custom-div-icon note-marker'
        });

        const noteMarker = L.marker([entry.coords.lat, entry.coords.lng], { icon })
          .bindPopup(`
            <div style="max-width: 200px;">
              <strong>Note:</strong><br>
              ${entry.content}<br>
              <small>${new Date(entry.timestamp).toLocaleString()}</small>
            </div>
          `);

        // Store data for cluster popup
        noteMarker.markerData = { type: 'text', content: entry.content, timestamp: entry.timestamp };
        this.addMarkerToClusterOrMap(noteMarker);
        this.routeMarkers.push(noteMarker);

      } else if (entry.type === 'location' && (index === 0 || index === locationPoints.length - 1)) {
        // Add start/end markers (NOT clustered - always visible)
        const isStart = index === 0;
        const icon = L.divIcon({
          html: isStart ? '🚩' : '🏁',
          iconSize: [30, 30],
          className: 'custom-div-icon location-marker'
        });

        const locationMarker = L.marker([entry.coords.lat, entry.coords.lng], { icon })
          .addTo(this.map) // Start/end markers always on map directly
          .bindPopup(`
            <div>
              <strong>${isStart ? 'Start' : 'End'} Point</strong><br>
              <small>${new Date(entry.timestamp).toLocaleString()}</small>
            </div>
          `);

        this.routeMarkers.push(locationMarker);
      }
    });

    // Fit map to show all route data
    if (bounds.isValid()) {
      this.map.fitBounds(bounds, { padding: [20, 20] });
      console.log('🎯 Map fitted to route bounds');
    } else {
      console.warn('⚠️ No valid bounds found for route data');
    }

    // Show summary info
    const photos = routeData.filter(p => p.type === 'photo').length;
    const notes = routeData.filter(p => p.type === 'text').length;
    
    console.log(`✅ Route displayed: ${locationPoints.length} GPS points, ${photos} photos, ${notes} notes`);
  }

  /**
   * Add marker to cluster group or directly to map if clustering not available
   */
  addMarkerToClusterOrMap(marker) {
    if (this.markerClusterGroup) {
      this.markerClusterGroup.addLayer(marker);
    } else {
      marker.addTo(this.map);
    }
  }

  /**
   * Remove marker from cluster group or map
   */
  removeMarkerFromClusterOrMap(marker) {
    if (this.markerClusterGroup && this.markerClusterGroup.hasLayer(marker)) {
      this.markerClusterGroup.removeLayer(marker);
    } else if (this.map.hasLayer(marker)) {
      this.map.removeLayer(marker);
    }
  }

  // FIXED: Complete route clearing including all markers and cluster
  clearRouteDisplay() {
    // Clear route lines
    this.routePolylines.forEach(polyline => {
      this.map.removeLayer(polyline);
    });
    this.routePolylines = [];

    // Clear route markers (from both cluster and map)
    this.routeMarkers.forEach(marker => {
      this.removeMarkerFromClusterOrMap(marker);
    });
    this.routeMarkers = [];

    // Also clear the cluster group if it exists
    if (this.markerClusterGroup) {
      this.markerClusterGroup.clearLayers();
    }

    console.log('🧹 Route display cleared (including cluster)');
  }

  // Add a single photo marker to the map (real-time during tracking) - with clustering
  addPhotoMarker(entry) {
    if (!this.map || !entry.coords) return null;

    const icon = L.divIcon({
      html: '📷',
      iconSize: [30, 30],
      className: 'custom-div-icon photo-marker'
    });

    const photoMarker = L.marker([entry.coords.lat, entry.coords.lng], { icon })
      .bindPopup(`
        <div style="text-align: center;">
          <img src="${entry.content}" onclick="window.openFullscreenPhoto && window.openFullscreenPhoto(this.src)" style="width:200px; max-height:150px; object-fit:cover; border-radius:8px; cursor:pointer;">
          <br><small>${new Date(entry.timestamp).toLocaleString()}</small>
        </div>
      `);

    // Store data for cluster popup
    photoMarker.markerData = { type: 'photo', content: entry.content, timestamp: entry.timestamp };
    this.addMarkerToClusterOrMap(photoMarker);
    this.routeMarkers.push(photoMarker);
    console.log('📷 Photo marker added to cluster/map');
    return photoMarker;
  }

  // Add a single note marker to the map (real-time during tracking) - with clustering
  addNoteMarker(entry) {
    if (!this.map || !entry.coords) return null;

    const icon = L.divIcon({
      html: '📝',
      iconSize: [30, 30],
      className: 'custom-div-icon note-marker'
    });

    const noteMarker = L.marker([entry.coords.lat, entry.coords.lng], { icon })
      .bindPopup(`
        <div style="max-width: 200px;">
          <strong>Note:</strong><br>
          ${entry.content}<br>
          <small>${new Date(entry.timestamp).toLocaleString()}</small>
        </div>
      `);

    // Store data for cluster popup
    noteMarker.markerData = { type: 'text', content: entry.content, timestamp: entry.timestamp };
    this.addMarkerToClusterOrMap(noteMarker);
    this.routeMarkers.push(noteMarker);
    console.log('📝 Note marker added to cluster/map');
    return noteMarker;
  }

  // NEW: Clear just the route line (keep markers)
  clearRoute() {
    this.routePolylines.forEach(polyline => {
      this.map.removeLayer(polyline);
    });
    this.routePolylines = [];
  }

  // NEW: Add route segment with bounds tracking
  addRouteSegmentWithBounds(startCoords, endCoords) {
    const segment = this.addRouteSegment(startCoords, endCoords);
    
    if (segment) {
      // Optionally adjust view to include new segment
      const bounds = L.latLngBounds([]);
      this.routePolylines.forEach(polyline => {
        bounds.extend(polyline.getBounds());
      });
      
      if (bounds.isValid()) {
        this.map.fitBounds(bounds, { padding: [10, 10] });
      }
    }
    
    return segment;
  }

  // NEW: Load and display Firebase route data
  displayFirebaseRoute(routeDoc) {
    try {
      console.log(`🔥 Displaying Firebase route: ${routeDoc.routeName}`);
      
      if (!routeDoc.routeData || !Array.isArray(routeDoc.routeData)) {
        console.error('❌ Invalid Firebase route data structure');
        toast.error('Invalid route data structure from Firebase');
        return;
      }

      // Use the enhanced showRouteData method
      this.showRouteData(routeDoc.routeData);

      // Add route info popup
      const locationPoints = routeDoc.routeData.filter(p => 
        p.type === 'location' && p.coords
      );

      if (locationPoints.length > 0) {
        const firstPoint = locationPoints[0];
        const routeInfoMarker = L.marker([firstPoint.coords.lat, firstPoint.coords.lng], {
          icon: L.divIcon({
            html: '🌐',
            iconSize: [40, 40],
            className: 'custom-div-icon firebase-route-marker'
          })
        }).addTo(this.map);

        routeInfoMarker.bindPopup(`
          <div style="text-align: center; max-width: 250px;">
            <h3>${routeDoc.routeName}</h3>
            <p><strong>Distance:</strong> ${routeDoc.totalDistance?.toFixed(2) || 0} km</p>
            <p><strong>Created:</strong> ${new Date(routeDoc.createdAt).toLocaleDateString()}</p>
            <p><strong>By:</strong> ${routeDoc.userEmail}</p>
            ${routeDoc.stats ? `
              <hr>
              <small>
                📍 ${routeDoc.stats.locationPoints} GPS points<br>
                📷 ${routeDoc.stats.photos} photos<br>
                📝 ${routeDoc.stats.notes} notes
              </small>
            ` : ''}
          </div>
        `).openPopup();

        this.routeMarkers.push(routeInfoMarker);
      }

      console.log(`✅ Firebase route "${routeDoc.routeName}" displayed successfully`);
      
    } catch (error) {
      console.error('❌ Failed to display Firebase route:', error);
      toast.error('Failed to display Firebase route: ' + error.message);
    }
  }

  // NEW: Get route statistics for current display
  getRouteStats() {
    return {
      polylines: this.routePolylines.length,
      markers: this.routeMarkers.length,
      hasRoute: this.routePolylines.length > 0
    };
  }

  setRotation(angle) {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
      mapContainer.style.transform = `rotate(${-angle}deg)`;
    }
  }

  resetRotation() {
    const mapContainer = document.getElementById('map-container');
    if (mapContainer) {
      mapContainer.style.transform = 'rotate(0deg)';
    }
  }
}