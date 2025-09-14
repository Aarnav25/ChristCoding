// Example configuration file - copy to .env for actual use
module.exports = {
  // Database Configuration
  DATABASE_URL: 'postgresql://username:password@localhost:5432/iwp_database',
  PGSSL: 'false',
  
  // Server Configuration
  PORT: '4000',
  
  // Admin Configuration
  ADMIN_EMAIL: 'admin@example.com',
  
  // SMTP Configuration (for email notifications)
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_USER: 'your-email@gmail.com',
  SMTP_PASS: 'your-app-password',
  SMTP_FROM: 'your-email@gmail.com',
  
  // Security
  BCRYPT_ROUNDS: '10'
};
