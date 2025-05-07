/**
 * DTB Technologies Digital Museum - 3D Project Viewer
 * Implements an interactive 3D model viewer using Three.js
 */

// Import Three.js from CDN (in production, you might want to use npm/yarn)
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/jsm/loaders/GLTFLoader.js';

// Main viewer class
class ProjectViewer {
  constructor(containerId, options = {}) {
    // Store references
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`Container with ID ${containerId} not found`);
      return;
    }
    
    // Default options
    this.options = {
      backgroundColor: 0x1e293b, // slate-800
      ambientLightColor: 0xffffff,
      ambientLightIntensity: 0.5,
      directionalLightColor: 0xffffff,
      directionalLightIntensity: 0.8,
      cameraPosition: [5, 2, 5],
      autoRotate: true,
      autoRotateSpeed: 1.0,
      ...options
    };
    
    // Three.js components
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.mixer = null; // For animations
    this.clock = new THREE.Clock();
    this.models = {};
    this.currentModel = null;
    
    // UI elements
    this.loadingElement = null;
    this.modelSelectElement = null;
    
    // Initialize the viewer
    this.init();
  }
  
  /**
   * Initialize the 3D viewer
   */
  init() {
    // Create the scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(this.options.backgroundColor);
    
    // Add a subtle fog effect
    this.scene.fog = new THREE.FogExp2(this.options.backgroundColor, 0.05);
    
    // Create camera
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    this.camera.position.set(...this.options.cameraPosition);
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);
    
    // Add lights
    this.addLights();
    
    // Add controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.autoRotate = this.options.autoRotate;
    this.controls.autoRotateSpeed = this.options.autoRotateSpeed;
    
    // Add a grid helper for reference (optional)
    const gridHelper = new THREE.GridHelper(10, 10, 0xaaaaaa, 0x444444);
    this.scene.add(gridHelper);
    
    // Create UI elements
    this.createUI();
    
    // Handle window resize
    window.addEventListener('resize', () => this.onWindowResize());
    
    // Start animation loop
    this.animate();
    
    console.log('3D Project Viewer initialized');
  }
  
  /**
   * Add lights to the scene
   */
  addLights() {
    // Ambient light for general illumination
    const ambientLight = new THREE.AmbientLight(
      this.options.ambientLightColor, 
      this.options.ambientLightIntensity
    );
    this.scene.add(ambientLight);
    
    // Directional light for shadows and highlights
    const directionalLight = new THREE.DirectionalLight(
      this.options.directionalLightColor, 
      this.options.directionalLightIntensity
    );
    directionalLight.position.set(5, 10, 7.5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    this.scene.add(directionalLight);
    
    // Add a soft fill light from the opposite direction
    const fillLight = new THREE.DirectionalLight(0x9ca3af, 0.4);
    fillLight.position.set(-5, 2, -7.5);
    this.scene.add(fillLight);
    
    // Add a subtle rim light
    const rimLight = new THREE.DirectionalLight(0x818cf8, 0.3);
    rimLight.position.set(0, -5, -5);
    this.scene.add(rimLight);
  }
  
  /**
   * Create UI elements for the viewer
   */
  createUI() {
    // Loading indicator
    this.loadingElement = document.createElement('div');
    this.loadingElement.className = 'loading-indicator';
    this.loadingElement.innerHTML = `
      <div class="loading-spinner"></div>
      <div class="loading-text">Loading Model...</div>
    `;
    this.loadingElement.style.display = 'none';
    this.container.appendChild(this.loadingElement);
    
    // Model selector (initially hidden until models are loaded)
    this.modelSelectElement = document.createElement('div');
    this.modelSelectElement.className = 'model-selector';
    this.modelSelectElement.style.display = 'none';
    this.container.appendChild(this.modelSelectElement);
  }
  
  /**
   * Handle window resize event
   */
  onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  /**
   * Load a 3D model from a URL
   * @param {string} modelId - Unique identifier for the model
   * @param {string} modelUrl - URL to the GLTF/GLB model file
   * @param {Object} options - Additional options for this model
   */
  loadModel(modelId, modelUrl, options = {}) {
    // Show loading indicator
    this.loadingElement.style.display = 'flex';
    
    // Default options
    const modelOptions = {
      scale: 1.0,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      animations: true,
      ...options
    };
    
    // Load the model
    const loader = new GLTFLoader();
    
    loader.load(
      modelUrl,
      (gltf) => {
        // Store the loaded model with its options
        this.models[modelId] = {
          object: gltf.scene,
          animations: gltf.animations,
          options: modelOptions
        };
        
        // Apply transformations
        gltf.scene.scale.set(
          modelOptions.scale, 
          modelOptions.scale, 
          modelOptions.scale
        );
        gltf.scene.position.set(...modelOptions.position);
        gltf.scene.rotation.set(...modelOptions.rotation);
        
        // Setup animations if available and enabled
        if (modelOptions.animations && gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(gltf.scene);
          gltf.animations.forEach((clip) => {
            this.mixer.clipAction(clip).play();
          });
        }
        
        // Update UI when model is loaded
        this.updateModelSelector();
        
        // If this is the first model, display it
        if (!this.currentModel) {
          this.displayModel(modelId);
        }
        
        // Hide loading indicator
        this.loadingElement.style.display = 'none';
        
        console.log(`Model ${modelId} loaded successfully`);
      },
      (progress) => {
        // Update loading progress
        const percent = (progress.loaded / progress.total) * 100;
        console.log(`Loading model ${modelId}: ${percent.toFixed(1)}%`);
      },
      (error) => {
        console.error(`Error loading model ${modelId}:`, error);
        this.loadingElement.style.display = 'none';
      }
    );
  }
  
  /**
   * Display a loaded model
   * @param {string} modelId - ID of the model to display
   */
  displayModel(modelId) {
    // Remove current model if exists
    if (this.currentModel) {
      this.scene.remove(this.models[this.currentModel].object);
    }
    
    // Show new model if it exists
    if (this.models[modelId]) {
      this.scene.add(this.models[modelId].object);
      this.currentModel = modelId;
      
      // Reset the camera to model-specific position if specified
      if (this.models[modelId].options.cameraPosition) {
        this.camera.position.set(...this.models[modelId].options.cameraPosition);
        this.controls.update();
      }
      
      // Reset mixer for animations
      if (this.models[modelId].animations && this.models[modelId].animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.models[modelId].object);
        this.models[modelId].animations.forEach((clip) => {
          this.mixer.clipAction(clip).play();
        });
      } else {
        this.mixer = null;
      }
      
      console.log(`Model ${modelId} is now displayed`);
    } else {
      console.error(`Model ${modelId} not found`);
    }
  }
  
  /**
   * Update the model selector UI
   */
  updateModelSelector() {
    // Only display selector if we have multiple models
    const modelIds = Object.keys(this.models);
    if (modelIds.length <= 1) {
      this.modelSelectElement.style.display = 'none';
      return;
    }
    
    // Create buttons for each model
    this.modelSelectElement.innerHTML = '';
    modelIds.forEach(modelId => {
      const button = document.createElement('button');
      button.className = 'model-select-btn';
      button.textContent = modelId;
      button.addEventListener('click', () => this.displayModel(modelId));
      
      // Highlight current model
      if (this.currentModel === modelId) {
        button.classList.add('active');
      }
      
      this.modelSelectElement.appendChild(button);
    });
    
    this.modelSelectElement.style.display = 'flex';
  }
  
  /**
   * Animation loop
   */
  animate() {
    requestAnimationFrame(() => this.animate());
    
    // Update controls
    this.controls.update();
    
    // Update mixer for animations
    if (this.mixer) {
      this.mixer.update(this.clock.getDelta());
    }
    
    // Render the scene
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * Load a set of project models with museum exhibit info
   * @param {Array} projects - Array of project configuration objects
   */
  loadProjects(projects) {
    projects.forEach(project => {
      this.loadModel(
        project.id,
        project.modelUrl,
        {
          scale: project.scale || 1.0,
          position: project.position || [0, 0, 0],
          rotation: project.rotation || [0, 0, 0],
          cameraPosition: project.cameraPosition || this.options.cameraPosition
        }
      );
    });
  }
  
  /**
   * Add hotspots to highlight features of the current model
   * @param {Array} hotspots - Array of hotspot configuration objects
   */
  addHotspots(hotspots) {
    if (!this.currentModel) return;
    
    const currentModelObject = this.models[this.currentModel].object;
    
    // Remove existing hotspots
    currentModelObject.children.forEach(child => {
      if (child.userData && child.userData.isHotspot) {
        currentModelObject.remove(child);
      }
    });
    
    // Add new hotspots
    hotspots.forEach(hotspot => {
      // Create a sprite for the hotspot
      const spriteMap = new THREE.TextureLoader().load('../assets/hotspot-icon.png');
      const spriteMaterial = new THREE.SpriteMaterial({ 
        map: spriteMap,
        color: hotspot.color || 0x7dd3fc,
        transparent: true,
        opacity: 0.8
      });
      
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.position.set(...hotspot.position);
      sprite.scale.set(0.5, 0.5, 0.5);
      sprite.userData = { 
        isHotspot: true,
        title: hotspot.title,
        description: hotspot.description
      };
      
      currentModelObject.add(sprite);
    });
  }
  
  /**
   * Take a screenshot of the current view
   * @returns {string} Data URL of the screenshot
   */
  takeScreenshot() {
    this.renderer.render(this.scene, this.camera);
    return this.renderer.domElement.toDataURL('image/png');
  }
  
  /**
   * Dispose of Three.js resources
   */
  dispose() {
    // Stop animation loop
    cancelAnimationFrame(this.animationId);
    
    // Dispose of geometries and materials
    this.scene.traverse(object => {
      if (object.geometry) object.geometry.dispose();
      
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => this.disposeMaterial(material));
        } else {
          this.disposeMaterial(object.material);
        }
      }
    });
    
    // Dispose of renderer
    this.renderer.dispose();
    
    // Remove event listeners
    window.removeEventListener('resize', this.onWindowResize);
    
    // Remove DOM elements
    this.container.removeChild(this.renderer.domElement);
    this.container.removeChild(this.loadingElement);
    this.container.removeChild(this.modelSelectElement);
    
    console.log('3D Project Viewer disposed');
  }
  
  /**
   * Dispose of a material's resources
   * @param {THREE.Material} material - Material to dispose
   */
  disposeMaterial(material) {
    material.dispose();
    
    // Dispose of material textures
    for (const key of Object.keys(material)) {
      const value = material[key];
      if (value && typeof value === 'object' && 'minFilter' in value) {
        value.dispose();
      }
    }
  }
}

// Export the viewer class
export { ProjectViewer };
