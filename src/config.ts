// Configuration file for the frontend application
// Safe configuration with error handling
function safeEnv(key: string, defaultValue: string): string {
  try {
    return import.meta.env[key] || defaultValue;
  } catch (error) {
    console.warn(`Environment variable ${key} not available, using default:`, defaultValue);
    return defaultValue;
  }
}

function safeParseInt(value: string, defaultValue: number): number {
  try {
    const parsed = parseInt(value);
    return isNaN(parsed) ? defaultValue : parsed;
  } catch (error) {
    return defaultValue;
  }
}

export const config = {
  // API Configuration
  API_URL: safeEnv('VITE_API_URL', 'http://localhost:4000'),
  
  // App Configuration
  APP_NAME: safeEnv('VITE_APP_NAME', 'IWP Project'),
  APP_VERSION: safeEnv('VITE_APP_VERSION', '1.0.0'),
  
  // Admin Configuration
  ADMIN_EMAIL: safeEnv('VITE_ADMIN_EMAIL', 'admin@example.com'),
  DEFAULT_STUDENT_EMAIL: safeEnv('VITE_DEFAULT_STUDENT_EMAIL', 'student@example.com'),
  
  // Test Configuration
  DEFAULT_TEST_QUESTIONS: safeParseInt(safeEnv('VITE_DEFAULT_TEST_QUESTIONS', '5'), 5),
  MAX_TEST_QUESTIONS: safeParseInt(safeEnv('VITE_MAX_TEST_QUESTIONS', '20'), 20),
  
  // UI Configuration
  DEFAULT_QUESTIONS_PER_PAGE: safeParseInt(safeEnv('VITE_DEFAULT_QUESTIONS_PER_PAGE', '10'), 10),
  MAX_QUESTIONS_PER_PAGE: safeParseInt(safeEnv('VITE_MAX_QUESTIONS_PER_PAGE', '50'), 50),
  
  // Text Configuration
  DAILY_CHALLENGE_NAME: safeEnv('VITE_DAILY_CHALLENGE_NAME', 'Daily Challenge'),
  DEFAULT_TEST_TITLE: safeEnv('VITE_DEFAULT_TEST_TITLE', 'Arrays & Strings Basics')
};
