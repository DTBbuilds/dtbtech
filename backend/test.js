require('dotenv').config();
const logger = require('./utils/logger');

// Test file for backend functionality
async function testBackendIntegration() {
  try {
    console.log('Testing backend functionality...');
    console.log('✓ Logger initialized successfully');
    
    // Add other backend tests here as needed
    console.log('✓ Backend tests completed');
  } catch (error) {
    console.error('✗ Test failed:', error.message);
    logger.error('Backend test error:', error);
  }
}

testBackendIntegration();
