# KontenFlow Backend Deployment Guide

## Deploy ke Vercel

### 1. **Prepare Backend**
```bash
cd backend
npm install
```

### 2. **Deploy Backend ke Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy backend
vercel --prod
```

### 3. **Environment Variables di Vercel**
Setelah deploy, set environment variables di Vercel dashboard:
- `DATABASE_URL`: URL database Neon PostgreSQL Anda
- `VITE_DATABASE_URL`: URL database Neon PostgreSQL Anda (sama dengan DATABASE_URL)

### 4. **Update Frontend Config**
Update `src/lib/api-config.ts` dengan URL backend yang sudah di-deploy:
```typescript
production: {
  baseURL: 'https://your-backend-deployment.vercel.app/api',
  timeout: 15000
}
```

### 5. **Deploy Frontend**
```bash
# Build dan deploy frontend
npm run build
vercel --prod
```

## Struktur Deployment

```
Frontend (Vercel) → Backend (Vercel) → Database (Neon)
```

## Testing

Test backend endpoint:
```bash
curl https://your-backend-deployment.vercel.app/api/health
```

## Troubleshooting

1. **Database Connection**: Pastikan DATABASE_URL sudah benar di environment variables
2. **CORS**: Backend sudah dikonfigurasi untuk menerima requests dari frontend
3. **SSL**: Neon PostgreSQL sudah dikonfigurasi dengan SSL
