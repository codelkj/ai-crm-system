# 🚀 LegalNexus Enterprise - Deployment Guide

Complete guide for deploying LegalNexus to production environments.

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Redis 7+ (optional, for caching)
- SMTP server (optional, for email alerts)
- OpenAI API key (for AI features)

## 🔧 Environment Configuration

See `.env.example` files in backend and frontend directories.

## 📦 Quick Deploy

### Backend
```bash
cd backend
npm ci
npm run build
pm2 start dist/server.js --name legalnexus
```

### Frontend
```bash
cd frontend
npm ci
npm run build
# Deploy dist/ to your static hosting
```

## 📊 Features

- ✅ PDF Export for all reports
- ✅ Custom date range filters
- ✅ Email alerts for billing inertia (daily at 9 AM)
- ✅ Redis caching (5-minute TTL for executive summary)
- ✅ CI/CD pipelines (GitHub Actions)
- ✅ Vicktoria AI assistant
- ✅ Soul Logic scoring

## 🔒 Security

- Change JWT secrets in production
- Use HTTPS/SSL
- Configure CORS properly
- Set up firewall rules

For detailed instructions, see full documentation in `/docs`.
