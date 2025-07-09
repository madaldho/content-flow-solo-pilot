# KontenFlow - Deployment Guide

## Backend Deployment ke Railway

### 1. Persiapan File
- Copy file `server-production.js` ke repository deployment
- Rename `package-production.json` menjadi `package.json`
- Buat file `.env` dengan content dari `.env.production`

### 2. Langkah Deployment ke Railway

1. **Buat akun Railway**: https://railway.app/
2. **Connect GitHub**: Login dengan GitHub account
3. **Deploy from GitHub**: 
   - Pilih repository
   - Pilih branch (biasanya `main`)
4. **Set Environment Variables**:
   - `NODE_ENV=production`
   - `DATABASE_URL=postgresql://neondb_owner:npg_HZN4Q0SdiUbM@ep-still-art-a134rndc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
   - `PORT` (Railway akan set otomatis)
5. **Deploy**: Railway akan otomatis build dan deploy

### 3. Setelah Deployment

1. **Dapatkan URL Railway**: Contoh `https://your-app-name.railway.app`
2. **Update Frontend**: Edit `src/lib/api-config.ts`
   ```typescript
   production: {
     baseURL: 'https://your-app-name.railway.app/api',
     timeout: 15000
   }
   ```
3. **Test API**: Buka `https://your-app-name.railway.app/api/health`

## Frontend Deployment ke Vercel

### 1. Update Config
- Pastikan `src/lib/api-config.ts` sudah di-update dengan Railway URL
- Test lokal dengan: `npm run build && npm run preview`

### 2. Deploy ke Vercel
- Commit dan push ke GitHub
- Vercel akan otomatis deploy jika sudah terkoneksi
- Atau manual deploy dari dashboard Vercel

### 3. Environment Variables di Vercel
- Tidak perlu set environment variables khusus
- API URL sudah hardcoded di `api-config.ts`

## Testing End-to-End

### 1. Test Backend
```bash
# Health check
curl https://your-app-name.railway.app/api/health

# Test create content
curl -X POST https://your-app-name.railway.app/api/content \
  -H "Content-Type: application/json" \
  -d '{"id":"test-123","title":"Test Content","platform":"youtube","status":"draft","tags":["test"]}'

# Test get content
curl https://your-app-name.railway.app/api/content
```

### 2. Test Frontend
1. Buka https://kontenflow.vercel.app/
2. Test create content baru
3. Verify data tersimpan di database Neon
4. Test edit/delete content

## Troubleshooting

### CORS Error
- Pastikan Railway URL sudah ditambahkan di `server-production.js`
- Check `corsOptions.origin` array

### Database Connection Error
- Verify DATABASE_URL di Railway environment variables
- Test koneksi database dari Railway logs

### API Timeout
- Increase timeout di `api-config.ts`
- Check Railway logs untuk error

### Frontend Error
- Check browser console untuk error
- Verify API URL di `api-config.ts`

## Monitoring

### Railway Logs
- Dashboard Railway > Your App > Logs
- Monitor API requests dan errors

### Vercel Logs
- Dashboard Vercel > Your App > Functions
- Monitor frontend deployment

### Database Monitoring
- Neon Console > Database > Monitoring
- Check connection dan query performance

## Backup & Recovery

### Database Backup
- Neon otomatis backup database
- Export manual via psql jika perlu

### Code Backup
- Semua code di GitHub
- Railway deployment dari GitHub

## Next Steps (Optional)

1. **Custom Domain**: Setup domain khusus untuk API
2. **Authentication**: Implement user authentication
3. **Rate Limiting**: Add rate limiting untuk API
4. **Caching**: Implement Redis caching
5. **Monitoring**: Setup monitoring dengan tools seperti Sentry
6. **CI/CD**: Setup GitHub Actions untuk automated testing
