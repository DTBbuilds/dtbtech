// Environment configuration
const config = {
    development: {
        apiUrl: 'http://localhost:3000/api',
        baseUrl: 'http://localhost:3000'
    },
    production: {
        apiUrl: '/api',  // relative path for production
        baseUrl: ''      // will use the current domain
    }
};

// Explicitly export development config for client-side use
export const apiUrl = config.development.apiUrl;
export const baseUrl = config.development.baseUrl;

// const env = process.env.NODE_ENV || 'development'; // Removed: process is not defined in browser
// export const { apiUrl, baseUrl } = config[env]; // Removed export and dependency on env

// If needed client-side, access directly, defaulting to development
const clientConfig = config.development;
// Example usage (if needed elsewhere): console.log(clientConfig.apiUrl);
