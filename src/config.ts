// Configuration file for the frontend application
export const config = {
  // API Configuration
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  
  // App Configuration
  APP_NAME: import.meta.env.VITE_APP_NAME || 'IWP Project',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Admin Configuration
  ADMIN_EMAIL: import.meta.env.VITE_ADMIN_EMAIL || 'admin@example.com',
  
  // Test Configuration
  DEFAULT_TEST_QUESTIONS: parseInt(import.meta.env.VITE_DEFAULT_TEST_QUESTIONS || '5'),
  MAX_TEST_QUESTIONS: parseInt(import.meta.env.VITE_MAX_TEST_QUESTIONS || '20'),
  
  // UI Configuration
  DEFAULT_QUESTIONS_PER_PAGE: parseInt(import.meta.env.VITE_DEFAULT_QUESTIONS_PER_PAGE || '10'),
  MAX_QUESTIONS_PER_PAGE: parseInt(import.meta.env.VITE_MAX_QUESTIONS_PER_PAGE || '50')
};
