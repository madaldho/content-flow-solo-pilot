# Production Deployment Commands

## 📋 Step-by-Step Deployment to Production

### Step 1: Update API Configuration untuk Production

1. **Update URL backend di `src/lib/api-config.ts`**:
   ```typescript
   production: {
     baseURL: 'https://kontenflow-backend.railway.app/api',
     timeout: 15000
   }
   ```

### Step 2: Deploy Backend ke Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login ke Railway
railway login

# Deploy backend
cd backend-folder
railway up

# Set environment variables di Railway dashboard:
# - DATABASE_URL
# - VITE_STACK_PROJECT_ID
# - VITE_STACK_PUBLISHABLE_CLIENT_KEY
# - STACK_SECRET_SERVER_KEY
# - NODE_ENV=production
```

### Step 3: Update Frontend untuk Production

```bash
# Build frontend
npm run build

# Deploy ke Vercel (if using Vercel)
vercel --prod

# Or deploy ke Netlify
netlify deploy --prod
```

### Step 4: Update CORS di Backend

Update `server.cjs` untuk production:
```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:8080',
    'https://kontenflow.vercel.app',
    'https://your-frontend-domain.com'
  ],
  credentials: true
};
```

### Step 5: Test Production

1. **Test API Health**: `https://your-backend.railway.app/api/health`
2. **Test Frontend**: `https://kontenflow.vercel.app`
3. **Test Authentication**: Login/logout functionality
4. **Test CRUD**: Create, read, update, delete content

## 🔧 Environment Variables for Production

### Backend (.env for Railway)
```env
NODE_ENV=production
DATABASE_URL=postgresql://neondb_owner:npg_HZN4Q0SdiUbM@ep-still-art-a134rndc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
VITE_STACK_PROJECT_ID=a29a1ebd-96c0-4285-8e26-a6e37665e459
VITE_STACK_PUBLISHABLE_CLIENT_KEY=pck_zxjzpkd3cv55q2zg1kccary38g8shnfkb6emh3z8krr90
STACK_SECRET_SERVER_KEY=ssk_q5ge0jdh7gcfq22mwa789h4gx1qtjgvwhzkt87xa65wh8
PORT=3001
```

### Frontend (.env for Vercel)
```env
VITE_STACK_PROJECT_ID=a29a1ebd-96c0-4285-8e26-a6e37665e459
VITE_STACK_PUBLISHABLE_CLIENT_KEY=pck_zxjzpkd3cv55q2zg1kccary38g8shnfkb6emh3z8krr90
```

## 📊 Current Status

✅ **Local Development**: Working
✅ **Database**: Neon PostgreSQL Connected
✅ **Authentication**: Stack Auth Integrated
✅ **API**: All endpoints working
✅ **Frontend**: React app with auth
✅ **CRUD Operations**: Data saving to database

## 🚀 Ready for Production!

Your application is now ready for production deployment. The data is being saved to Neon PostgreSQL database, and the authentication is handled by Stack Auth.

### Quick Test Commands:
```bash
# Test API
curl http://localhost:3001/api/health

# Test create content
curl -X POST http://localhost:3001/api/content \
  -H "Content-Type: application/json" \
  -d '{"id":"test-123","title":"Test","platform":"youtube","status":"draft"}'

# Test get content
curl http://localhost:3001/api/content
```

Your website at https://kontenflow.vercel.app will work perfectly once you deploy the backend to Railway and update the API URL!
