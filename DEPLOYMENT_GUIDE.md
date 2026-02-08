# Deployment Guide
## Legal CRM AI Platform - Production Deployment

**Last Updated:** 2026-02-08
**System Version:** 1.0.0
**Target Environment:** Production

---

## Quick Start Deployment

### Option 1: Deploy Immediately (Fastest)

```bash
# Backend - with TypeScript build workaround
cd backend
npm install
npm run build -- --skipLibCheck
npm start

# Frontend - with TypeScript build workaround
cd frontend
npm install
npm run build -- --skipLibCheck
npm run preview
```

### Option 2: Clean Deployment (Recommended - 3 hours prep)

Fix TypeScript errors first, then deploy cleanly.

---

## Prerequisites

### Required Software
- Node.js 18+ (tested on v24.8.0)
- PostgreSQL 15+
- npm 9+

### Required Services
- OpenAI API account (for AI features)
- Email service (optional - for notifications)
- Cloud storage (optional - for document uploads)

### Environment Variables

Create `.env` files in both backend and frontend directories:

**Backend `.env`:**
```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/crm_ai_db
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crm_ai_db
DB_USER=crm_user
DB_PASSWORD=your_secure_password

# Application
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.com

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=24h

# AI Integration
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview

# CORS
ALLOWED_ORIGINS=https://your-frontend-domain.com,https://www.your-frontend-domain.com

# File Uploads (optional)
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/path/to/uploads
```

**Frontend `.env`:**
```env
VITE_API_URL=https://your-backend-domain.com/api/v1
VITE_APP_NAME=Legal CRM Platform
```

---

## Database Setup

### 1. Create Database

```bash
# On production PostgreSQL server
createdb -U postgres crm_ai_db
createuser -U postgres crm_user
psql -U postgres -c "ALTER USER crm_user WITH PASSWORD 'your_secure_password';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE crm_ai_db TO crm_user;"
```

### 2. Run Migrations

```bash
cd database
npm install
node run-migration.js 001_multi_tenancy_foundation.sql
node run-migration.js 002_invoicing_system.sql
node run-migration.js 003_time_tracking_and_billing.sql
node run-migration.js 004_lightning_path_and_matters.sql
node run-migration.js 005_ai_integration.sql
node run-migration.js 006_enhanced_documents_routing.sql
```

### 3. Seed Initial Data

```bash
psql -U crm_user -d crm_ai_db -f seeds/001_initial_firm_data.sql
```

### 4. Verify Database

```bash
# Count tables (should be 36)
psql -U crm_user -d crm_ai_db -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';"

# Check firm exists
psql -U crm_user -d crm_ai_db -c "SELECT * FROM firms;"

# Check user exists
psql -U crm_user -d crm_ai_db -c "SELECT email FROM users;"
```

---

## Backend Deployment

### Development/Staging

```bash
cd backend
npm install
npm run dev
```

### Production

#### Option A: Direct Node.js

```bash
cd backend
npm install --production
npm run build
npm start

# Or with PM2 for process management
npm install -g pm2
pm2 start dist/index.js --name crm-backend
pm2 save
pm2 startup
```

#### Option B: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t legal-crm-backend .
docker run -p 3000:3000 --env-file .env legal-crm-backend
```

#### Option C: Cloud Platform (Heroku)

```bash
# Install Heroku CLI
heroku create your-app-name
heroku addons:create heroku-postgresql:standard-0
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-secret
heroku config:set OPENAI_API_KEY=your-key
git push heroku master
```

---

## Frontend Deployment

### Build Frontend

```bash
cd frontend
npm install
npm run build
# Output: dist/ directory
```

### Deployment Options

#### Option A: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd frontend
netlify deploy --prod --dir=dist

# Configure environment variables in Netlify dashboard
# VITE_API_URL=https://your-backend.com/api/v1
```

#### Option B: Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod

# Configure environment variables in Vercel dashboard
```

#### Option C: AWS S3 + CloudFront

```bash
# Build
cd frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

#### Option D: Nginx (VPS)

```nginx
# /etc/nginx/sites-available/legal-crm
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/legal-crm/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Copy files
sudo mkdir -p /var/www/legal-crm
sudo cp -r dist/* /var/www/legal-crm/

# Enable site
sudo ln -s /etc/nginx/sites-available/legal-crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## SSL/HTTPS Setup

### Using Certbot (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (already configured)
sudo certbot renew --dry-run
```

---

## Post-Deployment Checklist

### Immediate Verification

- [ ] Backend health check: `curl https://your-backend.com/api/v1/auth/login`
- [ ] Frontend loads: Visit https://your-domain.com
- [ ] Database connection working
- [ ] Login page accessible
- [ ] Can create new user
- [ ] Can log in
- [ ] Dashboard loads
- [ ] Companies page works
- [ ] AI features respond

### Security Verification

- [ ] HTTPS enabled and working
- [ ] HTTP redirects to HTTPS
- [ ] CORS configured correctly
- [ ] JWT secret is strong (32+ chars)
- [ ] Database password is strong
- [ ] No .env files committed to git
- [ ] No API keys in frontend code
- [ ] Rate limiting enabled (optional)
- [ ] Security headers configured (optional)

### Performance Verification

- [ ] Page load < 3 seconds
- [ ] API response < 500ms (non-AI endpoints)
- [ ] Database queries < 100ms
- [ ] No console errors
- [ ] No network errors
- [ ] Images/assets loading correctly

### Feature Verification

- [ ] Authentication working
- [ ] Company CRUD working
- [ ] Contact CRUD working
- [ ] Deal creation working
- [ ] Invoice creation working
- [ ] Time tracking working
- [ ] Matter management working
- [ ] AI assistant responding
- [ ] Financial insights loading
- [ ] Document management working

---

## Monitoring Setup

### Application Monitoring (Sentry)

```bash
# Install Sentry
npm install @sentry/node @sentry/react

# Backend
import * as Sentry from "@sentry/node";
Sentry.init({ dsn: "your-sentry-dsn" });

# Frontend
import * as Sentry from "@sentry/react";
Sentry.init({ dsn: "your-sentry-dsn" });
```

### Uptime Monitoring

Use services like:
- UptimeRobot (free)
- Pingdom
- StatusCake
- AWS CloudWatch

### Database Monitoring

```sql
-- Enable slow query logging
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log queries > 1s
SELECT pg_reload_conf();

-- Monitor connections
SELECT count(*) FROM pg_stat_activity;
```

---

## Backup Strategy

### Database Backups

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
FILENAME="crm_ai_db_$DATE.sql"

pg_dump -U crm_user crm_ai_db > $BACKUP_DIR/$FILENAME
gzip $BACKUP_DIR/$FILENAME

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

# Add to crontab: 0 2 * * * /path/to/backup-script.sh
```

### File Backups (Document Uploads)

```bash
# Sync to S3 or backup storage
aws s3 sync /path/to/uploads s3://your-backup-bucket/uploads
```

---

## Scaling Recommendations

### Immediate (< 1000 users)
- Single backend server (2-4 cores, 4-8GB RAM)
- Single PostgreSQL server (4 cores, 8GB RAM)
- CDN for frontend assets
- Managed database backups

### Medium (1000-10000 users)
- Load balanced backend (2-3 instances)
- PostgreSQL with read replicas
- Redis for session storage
- Dedicated AI processing server
- S3 for file storage

### Large (10000+ users)
- Auto-scaling backend (5-10+ instances)
- PostgreSQL cluster with multiple read replicas
- Redis cluster
- Microservices architecture (split AI services)
- CDN with edge caching
- Elasticsearch for search
- Message queue for async processing

---

## Troubleshooting

### Common Issues

**Backend won't start:**
```bash
# Check logs
pm2 logs crm-backend

# Check port availability
lsof -i :3000

# Check environment variables
printenv | grep DB_
```

**Database connection fails:**
```bash
# Test connection
psql -U crm_user -d crm_ai_db -h localhost

# Check PostgreSQL status
sudo systemctl status postgresql

# Check firewall
sudo ufw status
```

**Frontend can't connect to API:**
- Check VITE_API_URL in frontend .env
- Check CORS settings in backend
- Check browser console for errors
- Verify API is running: `curl https://api-url/api/v1/auth/login`

**AI features not working:**
- Verify OPENAI_API_KEY is set
- Check OpenAI API quota/billing
- Check backend logs for API errors
- Test with: `curl https://api.openai.com/v1/models -H "Authorization: Bearer $OPENAI_API_KEY"`

---

## Rollback Plan

### Database Rollback

```bash
# Restore from backup
psql -U crm_user -d crm_ai_db < /backups/postgres/crm_ai_db_YYYYMMDD.sql
```

### Application Rollback

```bash
# PM2
pm2 stop crm-backend
pm2 start previous-version/dist/index.js

# Docker
docker stop current-container
docker start previous-container

# Heroku
heroku rollback
```

---

## Support & Maintenance

### Weekly Tasks
- Check error logs
- Review slow queries
- Monitor disk space
- Check backup success

### Monthly Tasks
- Update dependencies (security patches)
- Review performance metrics
- Database optimization (VACUUM, ANALYZE)
- SSL certificate renewal check

### Quarterly Tasks
- Security audit
- Performance optimization
- Capacity planning
- User feedback review

---

## Contact & Documentation

**System Documentation:**
- API Documentation: (Swagger - to be added)
- Database Schema: `database/migrations/*.sql`
- Test Report: `FINAL_SYSTEM_TEST_REPORT.md`
- Implementation Progress: `LEGAL_NEXUS_IMPLEMENTATION_PROGRESS.md`

**Support Channels:**
- Technical Issues: Create GitHub issue
- Security Issues: Email security team
- User Support: help@your-domain.com

---

**Deployment Guide Version:** 1.0
**Last Updated:** 2026-02-08
**Next Review:** 2026-03-08
