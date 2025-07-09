# KontenFlow - Migration Guide & Production Deployment

## ✅ Migration Status: COMPLETED

Aplikasi KontenFlow telah berhasil dimigrasikan dari Supabase ke Neon PostgreSQL dengan Stack Auth untuk autentikasi.

## 📋 What's Working

### ✅ Backend API
- ✅ Server Express.js running on port 3001
- ✅ Database connection to Neon PostgreSQL
- ✅ CRUD operations for content items
- ✅ Content statistics endpoint
- ✅ Health check endpoint
- ✅ CORS configured for frontend and production

### ✅ Frontend
- ✅ React app with Vite
- ✅ Stack Auth integration
- ✅ Login/logout functionality
- ✅ Content management interface
- ✅ API integration with backend

### ✅ Database
- ✅ Neon PostgreSQL database
- ✅ Schema migrated successfully
- ✅ Tables: content_items, sweet_spot_analysis
- ✅ User isolation ready

## 🚀 Local Development

### Prerequisites
- Node.js 18+ 
- npm
- Neon PostgreSQL database
- Stack Auth account

### Environment Variables
```env
# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_HZN4Q0SdiUbM@ep-still-art-a134rndc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
VITE_DATABASE_URL=postgresql://neondb_owner:npg_HZN4Q0SdiUbM@ep-still-art-a134rndc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Stack Auth Configuration
VITE_STACK_PROJECT_ID=a29a1ebd-96c0-4285-8e26-a6e37665e459
VITE_STACK_PUBLISHABLE_CLIENT_KEY=pck_zxjzpkd3cv55q2zg1kccary38g8shnfkb6emh3z8krr90
STACK_SECRET_SERVER_KEY=ssk_q5ge0jdh7gcfq22mwa789h4gx1qtjgvwhzkt87xa65wh8

# API Configuration
NODE_ENV=development
PORT=3001
```

### Running Locally
```bash
# Install dependencies
npm install

# Run database migration
node database/migrate.cjs

# Option 1: Run backend and frontend separately
npm run server  # Backend on port 3001
npm run dev     # Frontend on port 8080

# Option 2: Run both simultaneously
npm run dev:full

# Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:3001/api
# Health check: http://localhost:3001/api/health
```

## 🌐 Production Deployment

### Option 1: Railway (Recommended for Backend)

1. **Setup Railway**:
   ```bash
   npm install -g @railway/cli
   railway login
   railway init
   ```

2. **Deploy Backend**:
   ```bash
   railway up
   ```

3. **Environment Variables di Railway**:
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://neondb_owner:npg_HZN4Q0SdiUbM@ep-still-art-a134rndc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   VITE_STACK_PROJECT_ID=a29a1ebd-96c0-4285-8e26-a6e37665e459
   VITE_STACK_PUBLISHABLE_CLIENT_KEY=pck_zxjzpkd3cv55q2zg1kccary38g8shnfkb6emh3z8krr90
   STACK_SECRET_SERVER_KEY=ssk_q5ge0jdh7gcfq22mwa789h4gx1qtjgvwhzkt87xa65wh8
   ```

### Option 2: Vercel (Frontend sudah ada)

1. **Update API URL**:
   Edit `src/lib/api-config.ts`:
   ```typescript
   production: {
     baseURL: 'https://your-railway-app.railway.app/api',
     timeout: 15000
   }
   ```

2. **Deploy ke Vercel**:
   ```bash
   vercel --prod
   ```

### Option 3: Render

1. **Create New Web Service**
2. **Build Command**: `npm install`
3. **Start Command**: `node server.cjs`
4. **Environment Variables**: Same as Railway

## 🔧 API Endpoints

### Authentication
- Stack Auth handles authentication
- Frontend automatically redirects to login if not authenticated

### Content Management
- `GET /api/content` - Get all content items
- `POST /api/content` - Create new content item
- `GET /api/content/:id` - Get specific content item
- `PUT /api/content/:id` - Update content item
- `DELETE /api/content/:id` - Delete content item

### Statistics
- `GET /api/content/stats` - Get content statistics

### Health Check
- `GET /api/health` - Check database connection

## 📊 Database Schema

### content_items table
```sql
CREATE TABLE content_items (
  id TEXT PRIMARY KEY,
  user_id TEXT DEFAULT 'default-user',
  title TEXT NOT NULL,
  content TEXT,
  platform TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  tags TEXT[],
  content_link TEXT,
  platform_links JSONB,
  is_endorsement BOOLEAN DEFAULT FALSE,
  is_collaboration BOOLEAN DEFAULT FALSE,
  endorsement_name TEXT,
  collaboration_name TEXT,
  endorsement_price TEXT
);
```

## 🔐 Security Features

1. **Authentication**: Stack Auth
2. **CORS**: Configured for production domains
3. **Environment Variables**: Secure credential management
4. **User Isolation**: Each user only sees their own content

## 📝 Next Steps for Production

1. **Deploy Backend ke Railway/Render**
2. **Update Frontend API URL**
3. **Test Production Environment**
4. **Configure Custom Domain (optional)**
5. **Setup Monitoring & Logging**

## 🐛 Troubleshooting

### Common Issues:

1. **Database Connection Error**:
   - Check DATABASE_URL environment variable
   - Verify Neon database is active
   - Check firewall/network settings

2. **API Connection Error**:
   - Verify backend is running
   - Check API_BASE_URL in frontend
   - Verify CORS settings

3. **Authentication Issues**:
   - Check Stack Auth credentials
   - Verify environment variables
   - Check browser console for errors

### Health Check
Always check these endpoints:
- `GET /api/health` - Database connection
- `GET /api/content` - API functionality
- Frontend login page - Authentication

## 📞 Support

If you encounter any issues:
1. Check the console logs
2. Verify all environment variables
3. Test API endpoints manually
4. Check database connection

---

**Status**: ✅ Ready for Production
**Last Updated**: July 9, 2025
**Environment**: Neon PostgreSQL + Stack Auth + Express.js + React
