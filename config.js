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

const env = process.env.NODE_ENV || 'development';
export const { apiUrl, baseUrl } = config[env];
