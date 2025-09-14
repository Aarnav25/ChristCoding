# Deployment Guide

## Vercel Deployment

### Prerequisites
1. A Vercel account
2. Your backend API deployed (e.g., on Railway, Render, or Heroku)
3. Environment variables configured

### Frontend Deployment Steps

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the root directory as the project root

2. **Configure Environment Variables:**
   In your Vercel project settings, add these environment variables:
   
   ```
   VITE_API_URL=https://your-backend-api-url.com
   VITE_APP_NAME=Your App Name
   VITE_ADMIN_EMAIL=admin@yourdomain.com
   VITE_DEFAULT_STUDENT_EMAIL=student@yourdomain.com
   VITE_DAILY_CHALLENGE_NAME=Daily Challenge
   VITE_DEFAULT_TEST_TITLE=Arrays & Strings Basics
   VITE_DEFAULT_TEST_QUESTIONS=5
   VITE_MAX_TEST_QUESTIONS=20
   VITE_DEFAULT_QUESTIONS_PER_PAGE=10
   VITE_MAX_QUESTIONS_PER_PAGE=50
   ```

3. **Deploy:**
   - Vercel will automatically build and deploy your frontend
   - The `vercel.json` configuration will handle routing

### Backend Deployment

For the backend, you'll need to deploy it separately. Here are some options:

#### Option 1: Railway
1. Connect your GitHub repository
2. Select the `server` directory as the root
3. Add environment variables:
   ```
   DATABASE_URL=your-postgresql-connection-string
   PGSSL=false
   PORT=4000
   ADMIN_EMAIL=admin@yourdomain.com
   SMTP_HOST=your-smtp-host
   SMTP_PORT=587
   SMTP_USER=your-smtp-username
   SMTP_PASS=your-smtp-password
   SMTP_FROM=your-email@yourdomain.com
   ```

#### Option 2: Render
1. Create a new Web Service
2. Connect your GitHub repository
3. Set build command: `cd server && npm install`
4. Set start command: `cd server && npm start`
5. Add environment variables as above

### Important Notes

1. **CORS Configuration:** Make sure your backend allows requests from your Vercel domain
2. **Database:** Use a production PostgreSQL database (not localhost)
3. **SMTP:** Configure real SMTP credentials for email functionality
4. **Environment Variables:** Never commit `.env` files with real credentials

### Troubleshooting

- **"Load Failed" Error:** Usually means the frontend can't reach the backend API
  - Check that `VITE_API_URL` is correct
  - Verify the backend is running and accessible
  - Check CORS settings on the backend

- **Build Errors:** Check that all environment variables are set correctly
- **Database Connection:** Ensure your production database is accessible from your backend hosting provider

### Testing Deployment

1. Deploy the frontend to Vercel
2. Deploy the backend to your chosen platform
3. Update `VITE_API_URL` in Vercel to point to your deployed backend
4. Test all functionality:
   - User registration/login
   - Admin access
   - Question upload
   - Test taking
   - Progress tracking
