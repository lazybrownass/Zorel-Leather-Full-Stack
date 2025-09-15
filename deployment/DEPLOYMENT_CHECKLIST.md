# ZOREL LEATHER Deployment Checklist

## Pre-Deployment Checklist

### ✅ Environment Setup
- [ ] Copy `env.example` to `.env`
- [ ] Update `SECRET_KEY` with secure 32+ character string
- [ ] Set strong `DB_PASSWORD` for PostgreSQL
- [ ] Configure `ADMIN_PASSWORD` and `SUPER_ADMIN_PASSWORD`
- [ ] Add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` for OAuth
- [ ] Configure `STRIPE_SECRET_KEY` for payments
- [ ] Set `SMTP_PASSWORD` for email functionality
- [ ] Update `CORS_ORIGINS` with production domains
- [ ] Configure `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` for WhatsApp

### ✅ System Requirements
- [ ] Docker Engine 20.10+ installed
- [ ] Docker Compose 2.0+ installed
- [ ] At least 4GB RAM available
- [ ] At least 10GB free disk space
- [ ] Ports 3000, 8000, 5432, 6379 available (or configured differently)

### ✅ Security Configuration
- [ ] Change default passwords
- [ ] Generate secure JWT secret key
- [ ] Configure firewall rules
- [ ] Set up SSL certificates (for production)
- [ ] Update CORS origins for production domain

## Deployment Process

### ✅ Development Deployment
```bash
# 1. Clone repository and navigate to deployment folder
cd /path/to/Zorel/deployment

# 2. Copy and configure environment
cp env.example .env
# Edit .env with your configuration

# 3. Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# 4. Run database migrations
docker-compose exec backend alembic upgrade head

# 5. Create admin user (optional)
docker-compose exec backend python create_admin.py
```

### ✅ Production Deployment
```bash
# 1. Configure production environment
cp env.example .env
# Update .env with production values

# 2. Deploy with production profile
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile production up --build -d

# 3. Run database migrations
docker-compose exec backend alembic upgrade head

# 4. Verify all services are healthy
docker-compose ps
```

## Post-Deployment Verification

### ✅ Service Health Checks
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API accessible at http://localhost:8000
- [ ] API documentation accessible at http://localhost:8000/docs
- [ ] Health endpoint responds at http://localhost:8000/health
- [ ] Database connection working
- [ ] Redis connection working

### ✅ Functionality Tests
- [ ] User registration works
- [ ] User login works
- [ ] Admin login works
- [ ] Product creation (admin)
- [ ] Product listing (frontend)
- [ ] File upload works
- [ ] Email sending works (if configured)
- [ ] Payment processing works (if configured)
- [ ] WhatsApp integration works (if configured)

### ✅ Performance Checks
- [ ] Page load times acceptable (< 3 seconds)
- [ ] API response times acceptable (< 1 second)
- [ ] Database queries optimized
- [ ] No memory leaks detected
- [ ] Log files not growing excessively

## Monitoring Setup

### ✅ Log Monitoring
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### ✅ Resource Monitoring
```bash
# Check resource usage
docker stats

# Check disk usage
docker system df

# Check volume usage
docker volume ls
```

### ✅ Database Monitoring
```bash
# Connect to database
docker-compose exec postgres psql -U postgres -d zorel_leather

# Check database size
docker-compose exec postgres psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('zorel_leather'));"
```

## Backup Strategy

### ✅ Automated Backups
```bash
# Database backup
docker-compose exec postgres pg_dump -U postgres zorel_leather > backup_$(date +%Y%m%d_%H%M%S).sql

# File uploads backup
docker cp zorel-backend:/app/uploads ./backups/uploads_$(date +%Y%m%d_%H%M%S)/
```

### ✅ Backup Schedule
- [ ] Daily database backups
- [ ] Weekly full system backups
- [ ] Monthly backup verification tests
- [ ] Backup retention policy (30 days)

## Security Hardening

### ✅ Production Security
- [ ] Change all default passwords
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure proper firewall rules
- [ ] Enable Docker security features
- [ ] Regular security updates
- [ ] Monitor for security vulnerabilities
- [ ] Implement rate limiting
- [ ] Enable audit logging

### ✅ Access Control
- [ ] Limit admin access to specific IPs
- [ ] Use strong authentication for admin accounts
- [ ] Implement session timeout
- [ ] Enable two-factor authentication (if available)

## Maintenance Tasks

### ✅ Regular Maintenance
- [ ] Weekly log rotation
- [ ] Monthly security updates
- [ ] Quarterly dependency updates
- [ ] Annual security audit

### ✅ Performance Optimization
- [ ] Monitor database query performance
- [ ] Optimize image sizes and formats
- [ ] Implement caching strategies
- [ ] Monitor and optimize API response times

## Troubleshooting

### ✅ Common Issues
- [ ] Port conflicts: Check and update port mappings
- [ ] Permission errors: Verify file permissions
- [ ] Database connection: Check PostgreSQL status
- [ ] Memory issues: Monitor resource usage
- [ ] Build failures: Check Dockerfile syntax

### ✅ Emergency Procedures
- [ ] Service restart procedures
- [ ] Database recovery procedures
- [ ] Rollback procedures
- [ ] Emergency contact information

## Documentation

### ✅ Keep Updated
- [ ] API documentation
- [ ] Deployment procedures
- [ ] Configuration changes
- [ ] Incident reports
- [ ] Performance metrics

---

## Quick Commands Reference

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Execute commands in containers
docker-compose exec backend bash
docker-compose exec frontend sh

# Rebuild specific service
docker-compose build backend

# Scale services
docker-compose up --scale backend=3

# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile production up -d
```

**Last Updated**: $(date)
**Version**: 1.0.0
