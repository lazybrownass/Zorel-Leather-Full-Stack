# ZOREL LEATHER Deployment Guide

This directory contains all the necessary files for deploying the ZOREL LEATHER e-commerce platform using Docker.

## 📁 Directory Structure

```
deployment/
├── backend/
│   └── Dockerfile              # Backend FastAPI Docker configuration
├── frontend/
│   └── Dockerfile              # Frontend Next.js Docker configuration
├── nginx/
│   └── nginx.conf              # Nginx reverse proxy configuration
├── docker-compose.yml          # Main orchestration file
├── env.example                 # Environment variables template
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- At least 4GB RAM
- At least 10GB free disk space

### 1. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Edit environment variables
nano .env
```

**Important:** Update the following variables in `.env`:
- `SECRET_KEY`: Generate a secure 32+ character secret key
- `DB_PASSWORD`: Set a strong database password
- `ADMIN_PASSWORD`: Set secure admin password
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: For OAuth
- `STRIPE_SECRET_KEY`: For payment processing
- `SMTP_PASSWORD`: For email functionality

### 2. Build and Deploy

```bash
# Build and start all services
docker-compose up --build -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Database Migration

```bash
# Run database migrations
docker-compose exec backend alembic upgrade head

# Create admin user (optional)
docker-compose exec backend python create_admin.py
```

### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🏗️ Architecture

### Services

1. **Frontend (Next.js)**
   - Port: 3000
   - Framework: Next.js 14 with TypeScript
   - UI: Tailwind CSS + Radix UI

2. **Backend (FastAPI)**
   - Port: 8000
   - Framework: FastAPI with Python 3.13
   - Database: PostgreSQL with SQLAlchemy
   - Cache: Redis

3. **PostgreSQL Database**
   - Port: 5432
   - Version: PostgreSQL 15
   - Persistent data storage

4. **Redis Cache**
   - Port: 6379
   - Session storage and caching

5. **Nginx (Optional)**
   - Port: 80/443
   - Reverse proxy and load balancer
   - SSL termination

### Network

All services communicate through a custom Docker network (`zorel-network`) with subnet `172.20.0.0/16`.

## 🔧 Configuration

### Environment Variables

Key environment variables (see `env.example` for complete list):

#### Database
- `DATABASE_URL`: PostgreSQL connection string
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`: Database credentials

#### Security
- `SECRET_KEY`: JWT signing key (32+ characters)
- `CORS_ORIGINS`: Allowed frontend origins

#### External Services
- `GOOGLE_CLIENT_ID/SECRET`: Google OAuth
- `STRIPE_SECRET_KEY`: Payment processing
- `TWILIO_ACCOUNT_SID/TOKEN`: WhatsApp integration

### Docker Compose Profiles

```bash
# Development (default)
docker-compose up

# Production with Nginx
docker-compose --profile production up
```

## 📊 Monitoring & Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Health Checks

All services include health checks:
- **Backend**: `GET /health`
- **Frontend**: `GET /` (200 response)
- **PostgreSQL**: `pg_isready`
- **Redis**: `redis-cli ping`

### Monitoring

```bash
# Check service health
docker-compose ps

# View resource usage
docker stats

# Inspect containers
docker-compose exec backend bash
docker-compose exec frontend sh
```

## 🗄️ Data Persistence

### Volumes

- `postgres_data`: Database files
- `redis_data`: Redis cache
- `backend_uploads`: File uploads
- `backend_logs`: Application logs

### Backup

```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres zorel_leather > backup.sql

# Backup uploads
docker cp zorel-backend:/app/uploads ./backup-uploads/
```

## 🔒 Security

### Production Checklist

- [ ] Change default passwords
- [ ] Generate secure SECRET_KEY
- [ ] Configure HTTPS with SSL certificates
- [ ] Update CORS_ORIGINS for production domain
- [ ] Set up firewall rules
- [ ] Enable Docker security features
- [ ] Regular security updates

### SSL/HTTPS Setup

1. Place SSL certificates in `nginx/ssl/`
2. Uncomment HTTPS server block in `nginx.conf`
3. Update domain names
4. Use production profile: `docker-compose --profile production up`

## 🚀 Scaling

### Horizontal Scaling

```bash
# Scale backend workers
docker-compose up --scale backend=3

# Use load balancer (Nginx)
docker-compose --profile production up
```

### Resource Limits

Add resource limits to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1.0'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 512M
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts**: Change ports in `docker-compose.yml`
2. **Permission errors**: Check file permissions and ownership
3. **Database connection**: Verify PostgreSQL is running and accessible
4. **Build failures**: Check Dockerfile syntax and dependencies

### Debug Commands

```bash
# Check container logs
docker-compose logs backend

# Access container shell
docker-compose exec backend bash

# Rebuild specific service
docker-compose build backend

# Reset everything
docker-compose down -v
docker-compose up --build
```

### Performance Optimization

1. **Enable Docker BuildKit**: `DOCKER_BUILDKIT=1`
2. **Use multi-stage builds**: Already implemented
3. **Optimize images**: Use Alpine Linux variants
4. **Cache layers**: Order Dockerfile commands efficiently

## 📝 Maintenance

### Updates

```bash
# Pull latest images
docker-compose pull

# Rebuild with latest code
docker-compose up --build -d

# Update dependencies
docker-compose exec backend pip install -r requirements.txt
docker-compose exec frontend npm update
```

### Cleanup

```bash
# Remove unused images
docker image prune -f

# Remove unused volumes
docker volume prune -f

# Full cleanup
docker system prune -a
```

## 📞 Support

For deployment issues:
1. Check service logs
2. Verify environment variables
3. Test service connectivity
4. Review Docker and Docker Compose versions

---

**ZOREL LEATHER** - Premium Leather E-commerce Platform
