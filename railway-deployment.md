# Railway deployment configuration
# This file tells Railway how to build and run the application

# Build command (if needed)
# Not required for Node.js apps, but can be used for custom builds

# Start command
# Railway will automatically run "npm start" or use the start script in package.json

# Environment variables to set in Railway dashboard:
# - NODE_ENV=production
# - DATABASE_URL=postgresql://neondb_owner:npg_HZN4Q0SdiUbM@ep-still-art-a134rndc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
# - PORT=3001 (Railway will set this automatically)

# Files to deploy:
# - server-production.js
# - package-production.json (rename to package.json)
# - .env.production (rename to .env)

# Deployment steps:
# 1. Go to https://railway.app/
# 2. Connect GitHub repository
# 3. Select this project
# 4. Set environment variables in Railway dashboard
# 5. Deploy

# Railway will automatically:
# - Install dependencies (npm install)
# - Run the start command (npm start)
# - Provide a public URL for the API
