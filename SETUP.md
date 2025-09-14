# IWP Project Setup Guide

This project has been configured to avoid hardcoded values. All configuration is done through environment variables.

## Backend Setup

1. **Create environment file:**
   ```bash
   cd server
   cp config.example.js .env
   ```

2. **Configure your environment variables in `.env`:**
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://username:password@localhost:5432/iwp_database
   PGSSL=false
   
   # Server Configuration
   PORT=4000
   
   # Admin Configuration
   ADMIN_EMAIL=admin@example.com
   
   # SMTP Configuration (for email notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   SMTP_FROM=your-email@gmail.com
   
   # Security
   BCRYPT_ROUNDS=10
   ```

3. **Install dependencies and start:**
   ```bash
   npm install
   npm start
   ```

## Frontend Setup

1. **Create environment file:**
   ```bash
   cp .env.template .env
   ```

2. **Configure your environment variables in `.env`:**
   ```env
   # Frontend Configuration
   VITE_API_URL=http://localhost:4000
   VITE_APP_NAME=IWP Project
   VITE_APP_VERSION=1.0.0
   VITE_DEFAULT_TEST_QUESTIONS=5
   VITE_MAX_TEST_QUESTIONS=20
   VITE_DEFAULT_QUESTIONS_PER_PAGE=10
   VITE_MAX_QUESTIONS_PER_PAGE=50
   VITE_PORT=5173
   VITE_HOST=localhost
   ```

3. **Install dependencies and start:**
   ```bash
   npm install
   npm run dev
   ```

## Database Setup

Make sure you have PostgreSQL running and create a database:

```sql
CREATE DATABASE iwp_database;
```

The application will automatically create the required tables on first run.

## Configuration Notes

- **Admin Email**: The email specified in `ADMIN_EMAIL` will automatically get admin privileges
- **API URL**: Frontend will connect to the backend using `VITE_API_URL`
- **SMTP**: Email notifications require proper SMTP configuration
- **Database**: All data is stored in PostgreSQL, no hardcoded data

## Environment Variables Reference

### Backend (.env)
- `DATABASE_URL`: PostgreSQL connection string
- `PGSSL`: SSL configuration for database (true/false)
- `PORT`: Server port (default: 4000)
- `ADMIN_EMAIL`: Email that gets admin privileges
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`: Email configuration
- `SMTP_FROM`: From email address
- `BCRYPT_ROUNDS`: Password hashing rounds (default: 10)

### Frontend (.env)
- `VITE_API_URL`: Backend API URL
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Application version
- `VITE_DEFAULT_TEST_QUESTIONS`: Default number of questions per test
- `VITE_MAX_TEST_QUESTIONS`: Maximum questions per test
- `VITE_DEFAULT_QUESTIONS_PER_PAGE`: Default pagination size
- `VITE_MAX_QUESTIONS_PER_PAGE`: Maximum pagination size
- `VITE_PORT`: Development server port
- `VITE_HOST`: Development server host
