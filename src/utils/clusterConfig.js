/**
 * Shared Marker Cluster Configuration
 *
 * This module provides consistent cluster configuration across all pages
 * to ensure uniform behavior and styling.
 */

/**
 * Default cluster configuration options
 * @type {Object}
 */
export const CLUSTER_CONFIG = {
  maxClusterRadius: 50,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  spiderfyDistanceMultiplier: 1.5,
  spiderLegPolylineOptions: {
    weight: 1.5,
    color: '#4a7c59',
    opacity: 0.5
  }
};

/**
 * Create icon function for clusters with consistent styling
 * @param {Object} cluster - Leaflet cluster object
 * @returns {L.DivIcon} Leaflet div icon
 */
export function createClusterIcon(cluster) {
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

/**
 * Get cluster CSS styles string
 * @returns {string} CSS styles for clusters
 */
export function getClusterStyles() {
  return `
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
}

/**
 * Initialize marker cluster group with consistent configuration
 * @param {Object} options - Optional override options
 * @returns {L.MarkerClusterGroup|null} Cluster group or null if not available
 */
export function createMarkerClusterGroup(options = {}) {
  if (typeof L === 'undefined' || typeof L.markerClusterGroup !== 'function') {
    console.warn('[ClusterConfig] MarkerCluster plugin not available');
    return null;
  }

  const config = {
    ...CLUSTER_CONFIG,
    iconCreateFunction: createClusterIcon,
    ...options
  };

  return L.markerClusterGroup(config);
}

/**
 * Add cluster styles to document if not already present
 * @param {string} styleId - ID for the style element
 */
export function addClusterStylesToDocument(styleId = 'shared-cluster-styles') {
  if (document.getElementById(styleId)) return;

  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = getClusterStyles();
  document.head.appendChild(style);
}

/**
 * Validate cluster group is properly initialized
 * @param {Object} clusterGroup - The cluster group to validate
 * @returns {boolean} True if valid
 */
export function isValidClusterGroup(clusterGroup) {
  return clusterGroup &&
         typeof clusterGroup.addLayer === 'function' &&
         typeof clusterGroup.removeLayer === 'function' &&
         typeof clusterGroup.clearLayers === 'function';
}
