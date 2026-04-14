// Navigation and UI panel management
import { toast } from '../utils/toast.js';
import { modal } from '../utils/modal.js';

export class NavigationController {
  constructor() {
    this.currentPanel = null;
  }

  initialize() {
    this.setupPanelToggles();
    console.log('Navigation controller initialized');
  }

  setupPanelToggles() {
    window.togglePanel = (panelId) => this.togglePanel(panelId);
    window.showStorageMonitor = () => this.showStorageMonitor();
    window.clearAllSessions = () => this.clearAllSessions();
    window.clearAllAppData = () => this.clearAllAppData();

    // Dev tools helpers
    window.openMobileDebugger = async () => {
      try {
        const { mobileDebugger } = await import('../features/mobileDebugger.js');
        mobileDebugger.toggle();
      } catch (e) {
        console.error('Failed to load mobile debugger:', e);
        toast.error('Failed to load debugger: ' + e.message);
      }
    };

    window.openRouteRecovery = async () => {
      try {
        const { routeRecovery } = await import('../features/routeRecovery.js');
        routeRecovery.showPanel();
      } catch (e) {
        console.error('Failed to load route recovery:', e);
        toast.error('Failed to load recovery: ' + e.message);
      }
    };

    // Setup tap-outside and Escape key handlers for panels
    this.setupPanelCloseHandlers();
  }

  setupPanelCloseHandlers() {
    // Close panel on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.currentPanel) {
        this.hideAllPanels();
      }
    });

    // Close panel on tap outside
    document.addEventListener('click', (e) => {
      if (!this.currentPanel) return;

      const panel = document.getElementById(this.currentPanel);
      if (!panel) return;

      // Check if click is outside the panel and its trigger button
      const isClickInsidePanel = panel.contains(e.target);
      const isClickOnTrigger = e.target.closest('[onclick*="togglePanel"]') ||
                               e.target.closest('#moreOptionsBtn') ||
                               e.target.closest('#safetyPanelBtn');

      if (!isClickInsidePanel && !isClickOnTrigger) {
        this.hideAllPanels();
      }
    });
  }

  togglePanel(panelId) {
    // Hide all panels first
    const panels = document.querySelectorAll('.bottom-popup');
    panels.forEach(panel => {
      if (panel.id !== panelId) {
        panel.classList.add('hidden');
      }
    });

    // Toggle the requested panel
    const targetPanel = document.getElementById(panelId);
    if (targetPanel) {
      targetPanel.classList.toggle('hidden');
      this.currentPanel = targetPanel.classList.contains('hidden') ? null : panelId;
    }
  }

  async showStorageMonitor() {
  try {
    const app = window.AccessNatureApp;
    const storageInfo = await app?.getController('state')?.getStorageInfo();
    
    if (!storageInfo) {
      toast.error('Could not retrieve storage information');
      return;
    }

    const message = `💾 Storage Information:

🗄️ Storage Type: ${storageInfo.storageType}
📊 Usage: ${storageInfo.usageFormatted} / ${storageInfo.quotaFormatted}
📈 Used: ${storageInfo.usagePercent}%
${storageInfo.indexedDBSupported ? '✅ Large Storage Available' : '⚠️ Limited Storage (localStorage)'}
${storageInfo.migrationCompleted ? '✅ Migration Completed' : '🔄 Migration Pending'}

💡 Benefits of IndexedDB:
- Much larger storage capacity (GBs vs MBs)
- Better performance for route data
- Supports photos and large files
- Offline-first design

${storageInfo.usagePercent > 80 ? '⚠️ Storage nearly full! Consider exporting old routes.' : ''}`;
    
    toast.info(message, { duration: 10000 });
    
  } catch (error) {
    console.error('❌ Failed to show storage monitor:', error);
    toast.error('Failed to retrieve storage information');
  }
}

  getStorageInfo() {
    let totalSize = 0;
    let photoCount = 0;
    let photoSize = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      if (value) {
        totalSize += new Blob([value]).size;
        
        // Count photos in sessions
        if (key === 'sessions') {
          try {
            const sessions = JSON.parse(value);
            sessions.forEach(session => {
              if (session.data) {
                session.data.forEach(entry => {
                  if (entry.type === 'photo' && entry.content) {
                    photoCount++;
                    photoSize += new Blob([entry.content]).size;
                  }
                });
              }
            });
          } catch (error) {
            console.warn('Error parsing sessions for storage info:', error);
          }
        }
      }
    }

    const maxSize = 5 * 1024 * 1024; // 5MB typical localStorage limit
    const usagePercent = (totalSize / maxSize) * 100;

    return {
      totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(1),
      photoCount,
      photoSizeKB: (photoSize / 1024).toFixed(1),
      usagePercent: usagePercent.toFixed(1),
      isNearLimit: usagePercent > 80
    };
  }

  async clearAllSessions() {
    const confirmed = await modal.confirm('This will permanently clear all saved routes. This cannot be undone!', '⚠️ Clear All Routes?');
    if (confirmed) {
      localStorage.removeItem('sessions');
      localStorage.removeItem('route_backup');
      toast.success('All saved routes have been cleared!');
    }
  }

  async clearAllAppData() {
    const confirmed = await modal.confirm('This will permanently delete all routes, photos, and settings.', '⚠️ Delete All Data?');
    if (confirmed) {
      const keysToKeep = ['darkMode']; // Keep user preferences
      const allKeys = Object.keys(localStorage);
      
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          localStorage.removeItem(key);
        }
      });

      toast.success('All app data has been cleared!');
      location.reload();
    }
  }

  hideAllPanels() {
    const panels = document.querySelectorAll('.bottom-popup');
    panels.forEach(panel => panel.classList.add('hidden'));
    this.currentPanel = null;
  }

  cleanup() {
    // Remove global functions
    delete window.togglePanel;
    delete window.showStorageMonitor;
    delete window.clearAllSessions;
    delete window.clearAllAppData;
    delete window.openMobileDebugger;
    delete window.openRouteRecovery;
  }

  // Enhanced route management
async showRouteManager() {
  try {
    const app = window.AccessNatureApp;
    const state = app?.getController('state');
    const routes = await state?.getSessions();
    
    if (!routes || routes.length === 0) {
      toast.info('No saved routes found. Start tracking to create your first route!');
      return;
    }

    let message = `📂 Route Manager (${routes.length} routes):\n\n`;
    
    routes.slice(0, 10).forEach((route, index) => {
      const date = new Date(route.date).toLocaleDateString();
      const size = route.dataSize ? ` (${this.formatBytes(route.dataSize)})` : '';
      message += `${index + 1}. ${route.name}\n`;
      message += `   📅 ${date} | 📏 ${route.totalDistance?.toFixed(2) || 0} km${size}\n\n`;
    });

    if (routes.length > 10) {
      message += `... and ${routes.length - 10} more routes\n\n`;
    }

    // Build choices for modal
    const choices = [
      { label: '📂 View All Routes', value: 'all' },
      { label: '📤 Export All', value: 'export' },
      { label: '❌ Cancel', value: 'cancel' }
    ];

    const choice = await modal.choice(message, `📂 Route Manager (${routes.length} routes)`, choices);
    
    if (!choice || choice === 'cancel') return;
    
    if (choice === 'all') {
      this.showAllRoutes(routes);
    } else if (choice === 'export') {
      this.exportAllRoutes(routes);
    }
    
  } catch (error) {
    console.error('❌ Failed to show route manager:', error);
    toast.error('Failed to load routes');
  }
}

async manageRoute(route) {
  const date = new Date(route.date).toLocaleDateString();
  const message = `📅 Created: ${date}
📏 Distance: ${route.totalDistance?.toFixed(2) || 0} km
📊 Data Points: ${route.data?.length || 0}
${route.dataSize ? `💾 Size: ${this.formatBytes(route.dataSize)}` : ''}`;

  const choices = [
    { label: '👁️ View on map', value: 'view' },
    { label: '📤 Export route', value: 'export' },
    { label: '📋 Copy details', value: 'copy' },
    { label: '🗑️ Delete route', value: 'delete' },
    { label: '❌ Cancel', value: 'cancel' }
  ];

  const choice = await modal.choice(message, `🗂️ ${route.name}`, choices);
  
  switch (choice) {
    case 'view':
      this.viewRouteOnMap(route);
      break;
    case 'export':
      this.exportSingleRoute(route);
      break;
    case 'copy':
      this.copyRouteDetails(route);
      break;
    case 'delete':
      this.deleteRoute(route);
      break;
  }
}

formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * View a saved route on the map with its POI elements
 */
async viewRouteOnMap(route) {
  try {
    const app = window.AccessNatureApp;
    const mapController = app?.getController('map');
    const poiController = app?.controllers?.poiElements;

    if (!mapController) {
      toast.error('Map not available');
      return;
    }

    // Clear existing route display
    if (mapController.clearRoute) {
      mapController.clearRoute();
    }

    // Display the route on the map
    if (route.data && route.data.length > 0) {
      // Draw route polyline
      const coords = route.data
        .filter(p => p.coords)
        .map(p => [p.coords.lat, p.coords.lng]);

      if (coords.length > 0 && mapController.map) {
        // Remove existing route layer if any
        if (this._viewedRouteLayer) {
          mapController.map.removeLayer(this._viewedRouteLayer);
        }

        // Draw route polyline
        this._viewedRouteLayer = L.polyline(coords, {
          color: '#4a7c59',
          weight: 4,
          opacity: 0.8
        }).addTo(mapController.map);

        // Fit map to route bounds
        mapController.map.fitBounds(this._viewedRouteLayer.getBounds(), { padding: [50, 50] });

        // Add start/end markers
        if (coords.length >= 2) {
          L.marker(coords[0], {
            icon: L.divIcon({
              className: 'custom-marker',
              html: '<div style="background:#22c55e;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;">S</div>',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })
          }).addTo(mapController.map).bindPopup('<strong>🟢 Start</strong>');

          L.marker(coords[coords.length - 1], {
            icon: L.divIcon({
              className: 'custom-marker',
              html: '<div style="background:#ef4444;width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;color:white;font-size:12px;">E</div>',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })
          }).addTo(mapController.map).bindPopup('<strong>🔴 End</strong>');
        }
      }
    }

    // Load POI elements if available
    if (poiController && route.poiElements && route.poiElements.length > 0) {
      // Clear existing POI elements
      poiController.clearElements();

      // Add each POI element
      route.poiElements.forEach(element => {
        poiController.elements.push(element);
        poiController.addMarker(element);
      });

      console.log(`✅ Loaded ${route.poiElements.length} POI elements for route`);
    }

    toast.success(`Viewing: ${route.name}`);
  } catch (error) {
    console.error('❌ Failed to view route:', error);
    toast.error('Failed to display route');
  }
}

/**
 * Show all routes in a list view
 */
showAllRoutes(routes) {
  // Sort by date, newest first
  const sortedRoutes = [...routes].sort((a, b) => new Date(b.date) - new Date(a.date));

  sortedRoutes.forEach(route => {
    this.manageRoute(route);
  });
}
}