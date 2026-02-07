# Docker Deployment

This directory contains Docker configuration for containerized deployment.

## Quick Start

### 1. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and set:
- `JWT_SECRET` - A strong random secret key
- `OPENAI_API_KEY` - Your OpenAI API key

### 2. Start All Services
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- Redis on port 6379
- Backend API on port 3000
- Frontend on port 80

### 3. Access Application
- Frontend: http://localhost
- Backend API: http://localhost:3000
- Database: localhost:5432

## Services

### Database (PostgreSQL)
- Image: `postgres:15-alpine`
- Port: 5432
- Automatically initializes schema and seed data

### Redis
- Image: `redis:7-alpine`
- Port: 6379
- Used for job queue (background AI processing)

### Backend
- Built from `Dockerfile.backend`
- Port: 3000
- Node.js API with Express

### Frontend
- Built from `Dockerfile.frontend`
- Port: 80
- React SPA served by nginx

## Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Restart a service
```bash
docker-compose restart backend
```

### Rebuild after code changes
```bash
docker-compose up -d --build
```

### Stop and remove volumes (WARNING: deletes data)
```bash
docker-compose down -v
```

## Production Deployment

For production:

1. **Use proper secrets**
   - Generate strong JWT_SECRET
   - Use environment-specific API keys

2. **Configure HTTPS**
   - Use a reverse proxy (nginx, Caddy)
   - Add SSL certificates

3. **Update CORS settings**
   - Restrict CORS to your domain

4. **Set resource limits**
   - Add CPU/memory limits in docker-compose.yml

5. **Enable monitoring**
   - Add logging service
   - Set up health checks

## Volumes

Persistent data is stored in Docker volumes:
- `postgres_data` - Database data
- `redis_data` - Redis data
- `storage_data` - Uploaded files (PDFs, CSVs)

## Troubleshooting

### Database connection issues
```bash
docker-compose logs database
docker-compose exec database psql -U crm_user -d crm_ai_db
```

### Backend not starting
```bash
docker-compose logs backend
```

### Reset everything
```bash
docker-compose down -v
docker-compose up -d --build
```
