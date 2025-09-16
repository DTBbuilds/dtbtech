/**
 * DTB Technologies Digital Museum - Virtual Office Tour
 * Manages a 360° panoramic tour of the office using Pannellum
 */

// Tour locations configuration with panoramas and hotspots
const TourLocations = [
  {
    id: 'reception',
    title: 'Reception Area',
    description:
      'The welcoming entrance to our office where visitors are greeted.',
    panoramaUrl: '../assets/panoramas/reception.jpg',
    initialViewPosition: {
      pitch: 0,
      yaw: 180,
      hfov: 110,
    },
    hotspots: [
      {
        type: 'info',
        pitch: -5,
        yaw: 170,
        title: 'Welcome Desk',
        text: 'Our reception desk where visitors check in and are assisted.',
        cssClass: 'info-hotspot',
      },
      {
        type: 'scene',
        pitch: -10,
        yaw: 120,
        text: 'Main Hallway',
        sceneId: 'hallway',
        cssClass: 'scene-hotspot',
      },
      {
        type: 'info',
        pitch: 20,
        yaw: -160,
        title: 'Digital Display',
        text: 'Interactive screen showing company information and current projects.',
        cssClass: 'info-hotspot',
      },
    ],
  },
  {
    id: 'hallway',
    title: 'Main Hallway',
    description: 'Central corridor connecting different areas of our office.',
    panoramaUrl: '../assets/panoramas/hallway.jpg',
    initialViewPosition: {
      pitch: 0,
      yaw: 0,
      hfov: 110,
    },
    hotspots: [
      {
        type: 'scene',
        pitch: -5,
        yaw: -90,
        text: 'Reception',
        sceneId: 'reception',
        cssClass: 'scene-hotspot',
      },
      {
        type: 'scene',
        pitch: -10,
        yaw: 90,
        text: 'Development Area',
        sceneId: 'dev-area',
        cssClass: 'scene-hotspot',
      },
      {
        type: 'scene',
        pitch: 0,
        yaw: 180,
        text: 'Meeting Room',
        sceneId: 'meeting-room',
        cssClass: 'scene-hotspot',
      },
      {
        type: 'info',
        pitch: 15,
        yaw: 45,
        title: 'Project Timeline',
        text: 'Visual display of our ongoing and completed projects.',
        cssClass: 'info-hotspot',
      },
    ],
  },
  {
    id: 'dev-area',
    title: 'Development Area',
    description:
      'Open workspace where our development team collaborates on projects.',
    panoramaUrl: '../assets/panoramas/dev-area.jpg',
    initialViewPosition: {
      pitch: 0,
      yaw: 0,
      hfov: 110,
    },
    hotspots: [
      {
        type: 'scene',
        pitch: -10,
        yaw: -90,
        text: 'Main Hallway',
        sceneId: 'hallway',
        cssClass: 'scene-hotspot',
      },
      {
        type: 'info',
        pitch: -5,
        yaw: 45,
        title: 'Development Team',
        text: 'Our talented developers working on cutting-edge solutions.',
        cssClass: 'info-hotspot',
      },
      {
        type: 'info',
        pitch: 20,
        yaw: 120,
        title: 'Project Boards',
        text: 'Agile boards tracking our project progress and sprint goals.',
        cssClass: 'info-hotspot',
      },
    ],
  },
  {
    id: 'meeting-room',
    title: 'Meeting Room',
    description:
      'Collaborative space for team meetings and client presentations.',
    panoramaUrl: '../assets/panoramas/meeting-room.jpg',
    initialViewPosition: {
      pitch: 0,
      yaw: 0,
      hfov: 110,
    },
    hotspots: [
      {
        type: 'scene',
        pitch: -5,
        yaw: 0,
        text: 'Main Hallway',
        sceneId: 'hallway',
        cssClass: 'scene-hotspot',
      },
      {
        type: 'info',
        pitch: 0,
        yaw: 110,
        title: 'Presentation Screen',
        text: 'Interactive display for sharing project demos and presentations.',
        cssClass: 'info-hotspot',
      },
      {
        type: 'info',
        pitch: -10,
        yaw: -110,
        title: 'Conference Table',
        text: 'Where team discussions and client meetings take place.',
        cssClass: 'info-hotspot',
      },
    ],
  },
  {
    id: 'server-room',
    title: 'Server Room',
    description:
      'Our secure facility housing servers and network infrastructure.',
    panoramaUrl: '../assets/panoramas/server-room.jpg',
    initialViewPosition: {
      pitch: 0,
      yaw: 90,
      hfov: 110,
    },
    hotspots: [
      {
        type: 'scene',
        pitch: -5,
        yaw: 180,
        text: 'Main Hallway',
        sceneId: 'hallway',
        cssClass: 'scene-hotspot',
      },
      {
        type: 'info',
        pitch: 0,
        yaw: 45,
        title: 'Server Racks',
        text: 'Our high-performance server infrastructure powering client solutions.',
        cssClass: 'info-hotspot',
      },
      {
        type: 'info',
        pitch: 15,
        yaw: -45,
        title: 'Network Equipment',
        text: 'Switches, routers, and firewalls managing our secure network.',
        cssClass: 'info-hotspot',
      },
    ],
  },
];

// Placeholder panoramas for development (when actual panoramas aren't available)
const PlaceholderPanoramas = {
  reception: 'https://pannellum.org/images/cerro-toco-0.jpg',
  hallway: 'https://pannellum.org/images/alma.jpg',
  'dev-area': 'https://pannellum.org/images/bma-1.jpg',
  'meeting-room': 'https://pannellum.org/images/bma-2.jpg',
  'server-room': 'https://pannellum.org/images/riverside.jpg',
};

/**
 * Virtual Tour Manager class
 */
class VirtualTourManager {
  constructor(viewerId, infoContainerId, mapContainerId, options = {}) {
    // Store references
    this.viewerId = viewerId;
    this.infoContainer = document.getElementById(infoContainerId);
    this.mapContainer = document.getElementById(mapContainerId);

    // Default options
    this.options = {
      startLocationId: 'reception',
      usePlaceholders: true, // Set to false when real panoramas are available
      showControls: true,
      autoRotate: 0.5, // Speed of auto-rotation (0 to disable)
      ...options,
    };

    // State
    this.viewer = null;
    this.currentLocation = null;
    this.locations = TourLocations;

    // Initialize the tour
    this.init();
  }

  /**
   * Initialize the virtual tour
   */
  init() {
    console.log('Initializing Virtual Tour Manager');

    // Check if the viewing element exists
    if (!document.getElementById(this.viewerId)) {
      console.error(`Virtual tour viewer element #${this.viewerId} not found`);
      this.showError('Virtual tour viewer not found');
      return;
    }

    try {
      // Show loading state
      this.showLoading();

      // Create the tour configuration
      const tourConfig = this.createTourConfig();

      // Initialize Pannellum viewer
      this.viewer = pannellum.viewer(this.viewerId, tourConfig);

      // Set up event listeners
      this.setupEventListeners();

      // Initialize map if container exists
      if (this.mapContainer) {
        this.initializeMap();
      }

      console.log('Virtual Tour Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize virtual tour:', error);
      this.showError('Failed to load virtual tour. Please refresh the page.');
    }
  }

  /**
   * Create the Pannellum tour configuration
   * @returns {Object} Tour configuration
   */
  createTourConfig() {
    // Find the starting location
    const startLocation =
      this.locations.find(loc => loc.id === this.options.startLocationId) ||
      this.locations[0];
    this.currentLocation = startLocation;

    // Create scenes configuration for Pannellum
    const scenes = {};

    this.locations.forEach(location => {
      // Get the panorama URL (using placeholder if needed)
      const panoramaUrl = this.options.usePlaceholders
        ? PlaceholderPanoramas[location.id] || PlaceholderPanoramas.reception
        : location.panoramaUrl;

      // Create scene configuration
      scenes[location.id] = {
        title: location.title,
        panorama: panoramaUrl,
        hotSpots: location.hotspots,
        pitch: location.initialViewPosition.pitch,
        yaw: location.initialViewPosition.yaw,
        hfov: location.initialViewPosition.hfov,
        type: 'equirectangular',
      };
    });

    // Complete configuration
    return {
      default: {
        firstScene: startLocation.id,
        sceneFadeDuration: 1000,
        autoLoad: true,
      },
      scenes: scenes,
      showControls: this.options.showControls,
      autoRotate: this.options.autoRotate,
    };
  }

  /**
   * Set up event listeners for the tour
   */
  setupEventListeners() {
    // Listen for scene changes
    this.viewer.on('scenechange', sceneId => {
      // Update current location
      const newLocation = this.locations.find(loc => loc.id === sceneId);
      if (newLocation) {
        this.currentLocation = newLocation;
        this.updateLocationInfo(newLocation);
        this.updateMapHighlight(newLocation.id);
      }
    });

    // Listen for hotspot clicks
    this.viewer.on('click', hotSpotData => {
      console.log('Hotspot clicked:', hotSpotData);
    });

    // Listen for tour load completion
    this.viewer.on('load', () => {
      // Hide loading state
      this.hideLoading();
      // Update location info for the initial location
      this.updateLocationInfo(this.currentLocation);
    });

    // Listen for errors
    this.viewer.on('error', error => {
      console.error('Pannellum error:', error);
      this.showError('Error loading panorama. Using fallback content.');
    });

    // Add keyboard navigation
    document.addEventListener('keydown', e => {
      if (e.target.tagName.toLowerCase() === 'input') return; // Don't interfere with form inputs

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.navigateToPrevious();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.navigateToNext();
          break;
        case ' ':
          e.preventDefault();
          this.toggleAutoTour();
          break;
      }
    });
  }

  /**
   * Navigate to a specific location
   * @param {string} locationId - ID of the location to navigate to
   */
  navigateToLocation(locationId) {
    if (this.viewer && locationId) {
      this.viewer.loadScene(locationId);
    }
  }

  /**
   * Update the location information display
   * @param {Object} location - Location data object
   */
  updateLocationInfo(location) {
    if (!this.infoContainer || !location) return;

    // Update location information
    this.infoContainer.innerHTML = `
      <h2 class="text-xl font-bold mb-2">${location.title}</h2>
      <p class="text-gray-300 mb-4">${location.description}</p>
      <div class="text-sm text-gray-400">
        <p class="mb-1"><i class="fas fa-map-marker-alt text-blue-400 mr-2"></i>${this.getLocationPosition(location.id)}</p>
        <p><i class="fas fa-info-circle text-blue-400 mr-2"></i>${this.getPointsOfInterestCount(location)} points of interest</p>
      </div>
    `;
  }

  /**
   * Get human-readable location position
   * @param {string} locationId - Location ID
   * @returns {string} Human-readable position description
   */
  getLocationPosition(locationId) {
    const positions = {
      reception: 'Ground Floor, Main Entrance',
      hallway: 'Ground Floor, Central Area',
      'dev-area': 'First Floor, East Wing',
      'meeting-room': 'Ground Floor, West Wing',
      'server-room': 'Basement Level',
    };

    return positions[locationId] || 'Office Location';
  }

  /**
   * Count the points of interest (info hotspots) for a location
   * @param {Object} location - Location data object
   * @returns {number} Number of info hotspots
   */
  getPointsOfInterestCount(location) {
    if (!location || !location.hotspots) return 0;
    return location.hotspots.filter(hotspot => hotspot.type === 'info').length;
  }

  /**
   * Initialize the office map
   */
  initializeMap() {
    if (!this.mapContainer) return;

    // Create the map HTML with SVG placeholder
    let mapHtml = `
      <div class="office-map-container relative">
        <div class="office-map bg-slate-800 rounded-xl overflow-hidden">
          <svg viewBox="0 0 400 300" class="w-full h-48 opacity-60">
            <!-- Office layout -->
            <rect x="0" y="0" width="400" height="300" fill="#334155" stroke="#475569" stroke-width="2"/>
            
            <!-- Reception Area -->
            <rect x="150" y="200" width="100" height="80" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
            <text x="200" y="245" text-anchor="middle" fill="#94a3b8" font-size="12">Reception</text>
            
            <!-- Main Hallway -->
            <rect x="150" y="120" width="100" height="80" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
            <text x="200" y="165" text-anchor="middle" fill="#94a3b8" font-size="12">Hallway</text>
            
            <!-- Development Area -->
            <rect x="280" y="60" width="100" height="80" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
            <text x="330" y="105" text-anchor="middle" fill="#94a3b8" font-size="12">Dev Area</text>
            
            <!-- Meeting Room -->
            <rect x="20" y="80" width="100" height="80" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
            <text x="70" y="125" text-anchor="middle" fill="#94a3b8" font-size="12">Meeting</text>
            
            <!-- Server Room -->
            <rect x="300" y="220" width="80" height="60" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
            <text x="340" y="255" text-anchor="middle" fill="#94a3b8" font-size="12">Server</text>
            
            <!-- Connecting paths -->
            <line x1="200" y1="200" x2="200" y2="200" stroke="#475569" stroke-width="2"/>
            <line x1="250" y1="160" x2="280" y2="120" stroke="#475569" stroke-width="2"/>
            <line x1="150" y1="160" x2="120" y2="140" stroke="#475569" stroke-width="2"/>
          </svg>
          <div class="absolute inset-0">
    `;

    // Add location markers
    const markerPositions = {
      reception: { top: '70%', left: '50%' },
      hallway: { top: '50%', left: '50%' },
      'dev-area': { top: '30%', left: '75%' },
      'meeting-room': { top: '35%', left: '25%' },
      'server-room': { top: '85%', left: '80%' },
    };

    this.locations.forEach(location => {
      const position = markerPositions[location.id] || {
        top: '50%',
        left: '50%',
      };
      const isActive = location.id === this.currentLocation.id;

      mapHtml += `
        <div class="location-marker ${isActive ? 'active' : ''}" 
             id="map-marker-${location.id}"
             style="top: ${position.top}; left: ${position.left};"
             data-location-id="${location.id}"
             title="${location.title}">
          <div class="marker-dot"></div>
          <div class="marker-pulse"></div>
          <div class="marker-label">${location.title}</div>
        </div>
      `;
    });

    mapHtml += `
          </div>
        </div>
        <div class="text-xs text-gray-400 mt-2 text-center">Click on a location to navigate</div>
      </div>
    `;

    // Set the map HTML
    this.mapContainer.innerHTML = mapHtml;

    // Add click event listeners to markers
    document.querySelectorAll('.location-marker').forEach(marker => {
      marker.addEventListener('click', () => {
        const locationId = marker.dataset.locationId;
        if (locationId) {
          this.navigateToLocation(locationId);
        }
      });
    });
  }

  /**
   * Update the map to highlight the current location
   * @param {string} locationId - ID of the current location
   */
  updateMapHighlight(locationId) {
    if (!this.mapContainer) return;

    // Remove active class from all markers
    document.querySelectorAll('.location-marker').forEach(marker => {
      marker.classList.remove('active');
    });

    // Add active class to current location marker
    const currentMarker = document.getElementById(`map-marker-${locationId}`);
    if (currentMarker) {
      currentMarker.classList.add('active');
    }
  }

  /**
   * Start automated tour
   * @param {number} interval - Time between location changes (ms)
   */
  startAutomatedTour(interval = 10000) {
    // Clear any existing interval
    if (this.tourInterval) {
      clearInterval(this.tourInterval);
    }

    // Store current location index
    let currentIndex = this.locations.findIndex(
      loc => loc.id === this.currentLocation.id
    );
    if (currentIndex === -1) currentIndex = 0;

    // Start interval to change scenes
    this.tourInterval = setInterval(() => {
      // Move to next location
      currentIndex = (currentIndex + 1) % this.locations.length;
      this.navigateToLocation(this.locations[currentIndex].id);
    }, interval);

    console.log('Automated tour started');
  }

  /**
   * Stop automated tour
   */
  stopAutomatedTour() {
    if (this.tourInterval) {
      clearInterval(this.tourInterval);
      this.tourInterval = null;
      console.log('Automated tour stopped');
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    if (this.infoContainer) {
      this.infoContainer.innerHTML = `
        <div class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mr-3"></div>
          <span class="text-gray-300">Loading virtual tour...</span>
        </div>
      `;
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    // Loading will be replaced by location info
  }

  /**
   * Show error message
   */
  showError(message) {
    if (this.infoContainer) {
      this.infoContainer.innerHTML = `
        <div class="bg-red-900/30 border border-red-500/50 rounded-lg p-4">
          <div class="flex items-center">
            <i class="fas fa-exclamation-triangle text-red-400 mr-3"></i>
            <div>
              <h3 class="text-red-300 font-medium">Error</h3>
              <p class="text-red-200 text-sm mt-1">${message}</p>
            </div>
          </div>
        </div>
      `;
    }
  }

  /**
   * Navigate to previous location
   */
  navigateToPrevious() {
    const currentIndex = this.locations.findIndex(
      loc => loc.id === this.currentLocation.id
    );
    const prevIndex =
      (currentIndex - 1 + this.locations.length) % this.locations.length;
    this.navigateToLocation(this.locations[prevIndex].id);
  }

  /**
   * Navigate to next location
   */
  navigateToNext() {
    const currentIndex = this.locations.findIndex(
      loc => loc.id === this.currentLocation.id
    );
    const nextIndex = (currentIndex + 1) % this.locations.length;
    this.navigateToLocation(this.locations[nextIndex].id);
  }

  /**
   * Toggle automated tour
   */
  toggleAutoTour() {
    if (this.tourInterval) {
      this.stopAutomatedTour();
    } else {
      this.startAutomatedTour(8000);
    }
  }

  /**
   * Destroy the viewer and clean up resources
   */
  destroy() {
    // Stop automated tour if running
    this.stopAutomatedTour();

    // Remove keyboard listeners
    document.removeEventListener('keydown', this.keydownHandler);

    // Destroy the viewer
    if (this.viewer) {
      this.viewer.destroy();
      this.viewer = null;
    }

    console.log('Virtual Tour Manager destroyed');
  }
}

// Export the tour manager and location data
export { VirtualTourManager, TourLocations, PlaceholderPanoramas };
