/**
 * DTB Technologies Digital Museum - Authentication Service
 * Handles user authentication, registration, and profile management
 */

// Firebase configuration for authentication
// In a real app, these would be environment variables
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with actual Firebase API key in production
  authDomain: "dtb-technologies.firebaseapp.com",
  projectId: "dtb-technologies",
  storageBucket: "dtb-technologies.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// User profile defaults
const DEFAULT_USER_PROFILE = {
  displayName: '',
  photoURL: '../assets/avatars/default-avatar.png',
  role: 'visitor',
  joinDate: new Date().toISOString(),
  preferences: {
    theme: 'dark',
    notificationsEnabled: true,
    autoplayMedia: true
  },
  favorites: {
    projects: [],
    exhibits: []
  },
  recentlyViewed: [],
  visitCount: 1,
  lastVisit: new Date().toISOString()
};

/**
 * Authentication service class
 * Uses a facade pattern to abstract the underlying authentication provider
 */
class AuthService {
  constructor() {
    this.isInitialized = false;
    this.currentUser = null;
    this.authStateListeners = [];
    
    // For demo purposes, we're using localStorage
    // In production, this would use Firebase Authentication
    this.init();
  }
  
  /**
   * Initialize the authentication service
   */
  init() {
    if (this.isInitialized) return;
    
    // In a real app, this would initialize Firebase
    // firebase.initializeApp(firebaseConfig);
    
    // Check if user is already logged in (via localStorage for demo)
    const savedUser = localStorage.getItem('dtb_auth_user');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.notifyAuthStateListeners();
      } catch (e) {
        console.error('Error parsing saved user:', e);
        localStorage.removeItem('dtb_auth_user');
      }
    }
    
    this.isInitialized = true;
    console.log('Auth service initialized');
  }
  
  /**
   * Sign in with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User object
   */
  async signInWithEmailAndPassword(email, password) {
    // In a real app, this would call Firebase Authentication
    // return firebase.auth().signInWithEmailAndPassword(email, password);
    
    // For demo purposes, we'll simulate authentication
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Demo credentials check
        if (email === 'demo@dtbtech.com' && password === 'password123') {
          const user = {
            uid: 'demo-user-123',
            email: email,
            emailVerified: true,
            ...DEFAULT_USER_PROFILE,
            displayName: 'Demo User',
            role: 'member'
          };
          
          // Save to localStorage
          localStorage.setItem('dtb_auth_user', JSON.stringify(user));
          
          // Update current user
          this.currentUser = user;
          this.notifyAuthStateListeners();
          
          resolve(user);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 1000); // Simulate network delay
    });
  }
  
  /**
   * Sign in with Google
   * @returns {Promise<Object>} User object
   */
  async signInWithGoogle() {
    // In a real app, this would use Firebase Authentication with Google provider
    // const provider = new firebase.auth.GoogleAuthProvider();
    // return firebase.auth().signInWithPopup(provider);
    
    // For demo purposes, we'll simulate Google authentication
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = {
          uid: 'google-user-456',
          email: 'google-user@gmail.com',
          emailVerified: true,
          ...DEFAULT_USER_PROFILE,
          displayName: 'Google User',
          photoURL: '../assets/avatars/google-avatar.png',
          role: 'member'
        };
        
        // Save to localStorage
        localStorage.setItem('dtb_auth_user', JSON.stringify(user));
        
        // Update current user
        this.currentUser = user;
        this.notifyAuthStateListeners();
        
        resolve(user);
      }, 1500); // Simulate network delay
    });
  }
  
  /**
   * Sign in with GitHub
   * @returns {Promise<Object>} User object
   */
  async signInWithGitHub() {
    // In a real app, this would use Firebase Authentication with GitHub provider
    // const provider = new firebase.auth.GithubAuthProvider();
    // return firebase.auth().signInWithPopup(provider);
    
    // For demo purposes, we'll simulate GitHub authentication
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = {
          uid: 'github-user-789',
          email: 'github-user@example.com',
          emailVerified: true,
          ...DEFAULT_USER_PROFILE,
          displayName: 'GitHub User',
          photoURL: '../assets/avatars/github-avatar.png',
          role: 'member'
        };
        
        // Save to localStorage
        localStorage.setItem('dtb_auth_user', JSON.stringify(user));
        
        // Update current user
        this.currentUser = user;
        this.notifyAuthStateListeners();
        
        resolve(user);
      }, 1500); // Simulate network delay
    });
  }
  
  /**
   * Create a new user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} displayName - User display name
   * @returns {Promise<Object>} User object
   */
  async createUserWithEmailAndPassword(email, password, displayName) {
    // In a real app, this would call Firebase Authentication and then update profile
    // return firebase.auth().createUserWithEmailAndPassword(email, password)
    //   .then(userCredential => {
    //     return userCredential.user.updateProfile({ displayName });
    //   });
    
    // For demo purposes, we'll simulate user creation
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simple validation
        if (!email || !password || !displayName) {
          reject(new Error('Email, password, and display name are required'));
          return;
        }
        
        if (password.length < 6) {
          reject(new Error('Password must be at least 6 characters'));
          return;
        }
        
        // Create user
        const user = {
          uid: 'user-' + Date.now(),
          email: email,
          emailVerified: false,
          ...DEFAULT_USER_PROFILE,
          displayName: displayName,
          role: 'member',
          joinDate: new Date().toISOString()
        };
        
        // Save to localStorage
        localStorage.setItem('dtb_auth_user', JSON.stringify(user));
        
        // Update current user
        this.currentUser = user;
        this.notifyAuthStateListeners();
        
        resolve(user);
      }, 1500); // Simulate network delay
    });
  }
  
  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async signOut() {
    // In a real app, this would call Firebase Authentication
    // return firebase.auth().signOut();
    
    // For demo purposes, we'll clear localStorage
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('dtb_auth_user');
        
        // Update current user
        this.currentUser = null;
        this.notifyAuthStateListeners();
        
        resolve();
      }, 500);
    });
  }
  
  /**
   * Get the current user
   * @returns {Object|null} Current user object or null if not signed in
   */
  getCurrentUser() {
    return this.currentUser;
  }
  
  /**
   * Check if user is signed in
   * @returns {boolean} True if user is signed in
   */
  isSignedIn() {
    return !!this.currentUser;
  }
  
  /**
   * Add an auth state change listener
   * @param {Function} listener - Callback function that receives the user object
   * @returns {Function} Function to remove the listener
   */
  onAuthStateChanged(listener) {
    if (typeof listener !== 'function') return () => {};
    
    // Add listener
    this.authStateListeners.push(listener);
    
    // Call listener immediately with current state
    if (this.isInitialized) {
      listener(this.currentUser);
    }
    
    // Return function to remove listener
    return () => {
      this.authStateListeners = this.authStateListeners.filter(l => l !== listener);
    };
  }
  
  /**
   * Notify all auth state listeners of a change
   */
  notifyAuthStateListeners() {
    this.authStateListeners.forEach(listener => {
      try {
        listener(this.currentUser);
      } catch (e) {
        console.error('Error in auth state listener:', e);
      }
    });
  }
  
  /**
   * Update user profile
   * @param {Object} profileUpdates - Profile data to update
   * @returns {Promise<void>}
   */
  async updateProfile(profileUpdates) {
    // In a real app, this would update the Firebase user profile
    // return firebase.auth().currentUser.updateProfile(profileUpdates);
    
    // For demo purposes, we'll update localStorage
    return new Promise((resolve, reject) => {
      if (!this.currentUser) {
        reject(new Error('No user is signed in'));
        return;
      }
      
      setTimeout(() => {
        // Update user with new profile data
        this.currentUser = {
          ...this.currentUser,
          ...profileUpdates,
          // Don't allow overriding critical fields
          uid: this.currentUser.uid,
          email: this.currentUser.email,
          role: this.currentUser.role
        };
        
        // Save to localStorage
        localStorage.setItem('dtb_auth_user', JSON.stringify(this.currentUser));
        
        // Notify listeners
        this.notifyAuthStateListeners();
        
        resolve();
      }, 500);
    });
  }
  
  /**
   * Reset password
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    // In a real app, this would call Firebase Authentication
    // return firebase.auth().sendPasswordResetEmail(email);
    
    // For demo purposes, we'll simulate password reset
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!email) {
          reject(new Error('Email is required'));
          return;
        }
        
        // Just simulate success
        console.log(`Password reset email would be sent to ${email}`);
        resolve();
      }, 1000);
    });
  }
  
  /**
   * Add a project to user's favorites
   * @param {string} projectId - ID of the project to favorite
   * @returns {Promise<void>}
   */
  async addFavoriteProject(projectId) {
    if (!this.currentUser) {
      return Promise.reject(new Error('No user is signed in'));
    }
    
    // Check if already in favorites
    const favorites = this.currentUser.favorites.projects || [];
    if (favorites.includes(projectId)) {
      return Promise.resolve(); // Already favorited
    }
    
    // Add to favorites
    const updatedFavorites = [...favorites, projectId];
    
    // Update profile
    return this.updateProfile({
      favorites: {
        ...this.currentUser.favorites,
        projects: updatedFavorites
      }
    });
  }
  
  /**
   * Remove a project from user's favorites
   * @param {string} projectId - ID of the project to unfavorite
   * @returns {Promise<void>}
   */
  async removeFavoriteProject(projectId) {
    if (!this.currentUser) {
      return Promise.reject(new Error('No user is signed in'));
    }
    
    // Filter out the project
    const favorites = this.currentUser.favorites.projects || [];
    const updatedFavorites = favorites.filter(id => id !== projectId);
    
    // Update profile
    return this.updateProfile({
      favorites: {
        ...this.currentUser.favorites,
        projects: updatedFavorites
      }
    });
  }
  
  /**
   * Add to recently viewed
   * @param {Object} item - Item that was viewed
   * @returns {Promise<void>}
   */
  async addToRecentlyViewed(item) {
    if (!this.currentUser) {
      return Promise.reject(new Error('No user is signed in'));
    }
    
    // Get current items and remove duplicates
    const current = this.currentUser.recentlyViewed || [];
    const filtered = current.filter(i => i.id !== item.id);
    
    // Add new item at the beginning and limit to 10 items
    const updated = [{ ...item, viewedAt: new Date().toISOString() }, ...filtered].slice(0, 10);
    
    // Update profile
    return this.updateProfile({
      recentlyViewed: updated,
      lastVisit: new Date().toISOString(),
      visitCount: (this.currentUser.visitCount || 0) + 1
    });
  }
  
  /**
   * Update user preferences
   * @param {Object} preferences - User preferences to update
   * @returns {Promise<void>}
   */
  async updatePreferences(preferences) {
    if (!this.currentUser) {
      return Promise.reject(new Error('No user is signed in'));
    }
    
    // Update profile with merged preferences
    return this.updateProfile({
      preferences: {
        ...this.currentUser.preferences,
        ...preferences
      }
    });
  }
}

// Create singleton instance
const authService = new AuthService();

// Export the service
export default authService;
