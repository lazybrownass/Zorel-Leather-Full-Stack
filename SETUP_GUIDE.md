# ZOREL LEATHER - Complete Setup Guide

This guide provides step-by-step instructions for setting up the ZOREL LEATHER e-commerce platform on your local development environment.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

### Required Software
- **Python 3.13+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **PostgreSQL 14+** - [Download PostgreSQL](https://www.postgresql.org/download/)
- **Git** - [Download Git](https://git-scm.com/downloads)

### Recommended Tools
- **VS Code** - [Download VS Code](https://code.visualstudio.com/)
- **Postman** - [Download Postman](https://www.postman.com/downloads/)
- **pgAdmin** - [Download pgAdmin](https://www.pgadmin.org/download/)

## 🚀 Quick Setup Options

### Option 1: Docker Deployment (Recommended - 2 Minutes)
```bash
# Clone repository
git clone <repository-url>
cd Zorel/deployment

# Configure environment
cp env.example .env
# Edit .env with your settings

# Deploy with Docker
./deploy.sh
```

### Option 2: Manual Setup (5 Minutes)

### 1. Clone Repository
```bash
git clone <repository-url>
cd Zorel
```

### 2. Backend Setup
```bash
cd Backend
python -m venv myenv
source myenv/bin/activate  # Windows: myenv\Scripts\activate
pip install -r requirements.txt
```

### 3. Database Setup
```bash
# Create PostgreSQL database
createdb zorel_leather

# Run migrations
alembic upgrade head
```

### 4. Frontend Setup
```bash
cd ../Frontend
npm install
```

### 5. Start Development Servers
```bash
# Terminal 1 - Backend
cd Backend
source myenv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd Frontend
npm run dev
```

### 6. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 🔧 Detailed Setup Instructions

### Backend Setup

#### 1. Python Environment
```bash
cd Backend

# Create virtual environment
python -m venv myenv

# Activate virtual environment
# On macOS/Linux:
source myenv/bin/activate
# On Windows:
myenv\Scripts\activate

# Verify Python version
python --version  # Should be 3.13+
```

#### 2. Install Dependencies
```bash
# Install all required packages
pip install -r requirements.txt

# Verify installation
pip list
```

#### 3. Environment Configuration
```bash
# Create environment file
cp .env.example .env

# Edit .env file with your configuration
nano .env  # or use your preferred editor
```

**Required Environment Variables:**
```env
# Database
DATABASE_URL=postgresql://username:password@localhost/zorel_leather

# Security
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Admin Credentials
ADMIN_EMAIL=admin@zorelleather.com
ADMIN_PASSWORD=your-admin-password
SUPER_ADMIN_EMAIL=superadmin@zorelleather.com
SUPER_ADMIN_PASSWORD=your-super-admin-password

# External Services
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Application Settings
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:3000"]
RATE_LIMIT_PER_MINUTE=60
```

#### 4. Database Setup
```bash
# Install PostgreSQL (if not already installed)
# macOS with Homebrew:
brew install postgresql
brew services start postgresql

# Ubuntu/Debian:
sudo apt update
sudo apt install postgresql postgresql-contrib

# Windows: Download from official website

# Create database
createdb zorel_leather

# Verify database creation
psql -d zorel_leather -c "SELECT version();"
```

#### 5. Run Database Migrations
```bash
# Initialize Alembic (if not already done)
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head

# Verify tables
psql -d zorel_leather -c "\dt"
```

#### 6. Seed Initial Data
```bash
# Run the quick setup script
python quick_setup.py

# This will create:
# - Admin users
# - Sample products
# - Categories
# - Initial configuration
```

#### 7. Start Backend Server
```bash
# Development server with auto-reload
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Production server
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend Setup

#### 1. Node.js Environment
```bash
cd Frontend

# Verify Node.js version
node --version  # Should be 18+
npm --version   # Should be 9+

# Alternative: Use pnpm
npm install -g pnpm
pnpm --version
```

#### 2. Install Dependencies
```bash
# Using npm
npm install

# Using pnpm (recommended)
pnpm install

# Using yarn
yarn install
```

#### 3. Environment Configuration
```bash
# Create environment file
cp .env.example .env.local

# Edit .env.local file
nano .env.local
```

**Required Environment Variables:**
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api/v1

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id

# Application Settings
NEXT_PUBLIC_APP_NAME=ZOREL LEATHER
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 4. Start Frontend Server
```bash
# Development server
npm run dev
# or
pnpm dev
# or
yarn dev

# Build for production
npm run build
npm start
```

## 🗄️ Database Configuration

### PostgreSQL Setup

#### 1. Create Database User
```sql
-- Connect to PostgreSQL as superuser
psql -U postgres

-- Create user
CREATE USER zorel_user WITH PASSWORD 'secure_password';

-- Create database
CREATE DATABASE zorel_leather OWNER zorel_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE zorel_leather TO zorel_user;

-- Exit
\q
```

#### 2. Update Database URL
```env
DATABASE_URL=postgresql://zorel_user:secure_password@localhost/zorel_leather
```

#### 3. Test Connection
```bash
# Test connection
python -c "
import asyncpg
import asyncio

async def test_connection():
    conn = await asyncpg.connect('postgresql://zorel_user:secure_password@localhost/zorel_leather')
    result = await conn.fetchval('SELECT version()')
    print(f'Connected to: {result}')
    await conn.close()

asyncio.run(test_connection())
"
```

## 🔐 Authentication Setup

### Google OAuth Configuration

#### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials

#### 2. Configure OAuth Credentials
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

#### 3. Update Frontend Configuration
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### JWT Configuration

#### 1. Generate Secret Key
```python
import secrets
print(secrets.token_urlsafe(32))
```

#### 2. Update Environment Variables
```env
SECRET_KEY=your-generated-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 💳 Payment Setup

### Stripe Configuration

#### 1. Create Stripe Account
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your API keys from the Developers section

#### 2. Configure Stripe Keys
```env
# Backend
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Frontend
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

#### 3. Test Payment Flow
```bash
# Test Stripe connection
python -c "
import stripe
stripe.api_key = 'sk_test_your_stripe_secret_key'
print('Stripe connection successful')
"
```

## 📱 WhatsApp Integration

### Twilio Configuration

#### 1. Create Twilio Account
1. Go to [Twilio Console](https://console.twilio.com/)
2. Get your Account SID and Auth Token
3. Set up WhatsApp Sandbox

#### 2. Configure Twilio
```env
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

#### 3. Test WhatsApp Integration
```bash
# Test Twilio connection
python -c "
from twilio.rest import Client
client = Client('your_account_sid', 'your_auth_token')
print('Twilio connection successful')
"
```

## 📧 Email Configuration

### SMTP Setup

#### 1. Gmail Configuration
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

#### 2. Generate App Password
1. Enable 2-factor authentication on Gmail
2. Generate app-specific password
3. Use app password in configuration

## 🧪 Testing Setup

### Backend Testing
```bash
cd Backend

# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest tests/

# Run specific test
pytest tests/test_auth.py -v
```

### Frontend Testing
```bash
cd Frontend

# Install test dependencies
npm install --save-dev jest @testing-library/react

# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## 🐳 Docker Deployment Setup

### Prerequisites for Docker Deployment
- **Docker Engine 20.10+** - [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose 2.0+** - Usually included with Docker Desktop
- **At least 4GB RAM** available for containers
- **At least 10GB free disk space** for images and volumes

### Quick Docker Deployment (Recommended)

#### 1. Navigate to Deployment Directory
```bash
cd deployment
```

#### 2. Configure Environment
```bash
# Copy environment template
cp env.example .env

# Edit environment variables
nano .env  # or use your preferred editor
```

#### 3. Deploy with Docker Compose
```bash
# Development deployment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Production deployment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile production up --build -d

# Or use the automated deployment script
chmod +x deploy.sh
./deploy.sh
```

#### 4. Verify Deployment
```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Test endpoints
curl http://localhost:3000  # Frontend
curl http://localhost:8000/health  # Backend health check
```

### Docker Compose Services

#### Development Mode
```bash
# Start development environment with hot reload
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up

# Services included:
# - PostgreSQL database (port 5432)
# - Redis cache (port 6379)
# - Backend API with auto-reload (port 8000)
# - Frontend with hot reload (port 3000)
```

#### Production Mode
```bash
# Start production environment
docker-compose -f docker-compose.yml -f docker-compose.prod.yml --profile production up -d

# Services included:
# - PostgreSQL database (internal only)
# - Redis cache (internal only)
# - Backend API with multiple workers
# - Frontend optimized build
# - Nginx reverse proxy (ports 80/443)
```

### Environment Configuration

#### Required Environment Variables
```env
# Database Configuration
DATABASE_URL=postgresql+asyncpg://postgres:spade@postgres:5432/zorel_leather
DB_PASSWORD=secure_production_password

# Security
SECRET_KEY=your-super-secret-jwt-key-change-in-production-must-be-32-chars-min
CORS_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]

# External Services
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token

# Admin Configuration
ADMIN_EMAIL=admin@zorelleather.com
ADMIN_PASSWORD=secure_admin_password
SUPER_ADMIN_EMAIL=superadmin@zorelleather.com
SUPER_ADMIN_PASSWORD=secure_super_admin_password

# Production Settings
ENVIRONMENT=production
FRONTEND_URL=https://yourdomain.com
REDIS_URL=redis://:secure_redis_password@redis:6379
```

### Database Migration with Docker

#### Run Migrations
```bash
# Apply database migrations
docker-compose exec backend alembic upgrade head

# Create initial admin user
docker-compose exec backend python create_admin.py

# Seed sample data (optional)
docker-compose exec backend python scripts/seed_data.py
```

#### Backup and Restore
```bash
# Backup database
docker-compose exec postgres pg_dump -U postgres zorel_leather > backup.sql

# Restore database
docker-compose exec -T postgres psql -U postgres zorel_leather < backup.sql
```

### Production Deployment

#### SSL/HTTPS Setup
1. **Obtain SSL certificates** (Let's Encrypt recommended)
2. **Place certificates** in `deployment/nginx/ssl/`
3. **Update nginx configuration** for HTTPS
4. **Use production profile** with SSL enabled

#### Scaling and Load Balancing
```bash
# Scale backend workers
docker-compose up --scale backend=3

# Use Nginx load balancer
docker-compose --profile production up -d
```

#### Monitoring and Logs
```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Monitor resource usage
docker stats

# Check service health
docker-compose exec backend curl -f http://localhost:8000/health
```

### Individual Docker Commands (Advanced)

#### Build Individual Images
```bash
# Build backend image
docker build -f deployment/backend/Dockerfile -t zorel-backend .

# Build frontend image
docker build -f deployment/frontend/Dockerfile -t zorel-frontend .
```

#### Run Individual Containers
```bash
# Run backend with database
docker run -d --name zorel-postgres -e POSTGRES_DB=zorel_leather -e POSTGRES_PASSWORD=spade postgres:15-alpine
docker run -d --name zorel-backend --link zorel-postgres -p 8000:8000 zorel-backend

# Run frontend
docker run -d --name zorel-frontend -p 3000:3000 zorel-frontend
```

### Docker Troubleshooting

#### Common Issues
```bash
# Port conflicts
docker-compose down
# Change ports in docker-compose.yml and restart

# Permission issues
sudo chown -R $USER:$USER .
docker-compose down && docker-compose up --build

# Memory issues
docker system prune -a
docker-compose up --build

# Network issues
docker network prune
docker-compose down && docker-compose up
```

#### Debug Commands
```bash
# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh
docker-compose exec postgres psql -U postgres -d zorel_leather

# Check container logs
docker logs zorel-backend
docker logs zorel-frontend

# Inspect container
docker inspect zorel-backend
```

## 🔍 Verification

### Backend Verification
```bash
cd Backend
python verify_backend.py
```

### API Testing
```bash
# Test API endpoints
python test_api_endpoints.py

# Test database connection
python test_simple_postgresql.py
```

### Frontend Verification
1. Open http://localhost:3000
2. Check if homepage loads
3. Test navigation
4. Verify theme switching
5. Test responsive design

## 🚨 Troubleshooting

### Common Issues

#### 1. Database Connection Error
```bash
# Check PostgreSQL status
brew services list | grep postgresql
# or
sudo systemctl status postgresql

# Restart PostgreSQL
brew services restart postgresql
# or
sudo systemctl restart postgresql
```

#### 2. Port Already in Use
```bash
# Find process using port
lsof -i :8000
lsof -i :3000

# Kill process
kill -9 <PID>
```

#### 3. Python Virtual Environment Issues
```bash
# Recreate virtual environment
rm -rf myenv
python -m venv myenv
source myenv/bin/activate
pip install -r requirements.txt
```

#### 4. Node.js Dependencies Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
# or
pnpm install
```

#### 5. Migration Issues
```bash
# Reset migrations
alembic downgrade base
alembic upgrade head

# Or recreate from scratch
rm -rf alembic/versions/*
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Logs and Debugging

#### Backend Logs
```bash
# View application logs
tail -f logs/app.log

# Debug mode
uvicorn main:app --reload --log-level debug
```

#### Frontend Logs
```bash
# View browser console
# Open Developer Tools (F12)

# View build logs
npm run build
```

## 📚 Additional Resources

### Documentation
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Stripe Documentation](https://stripe.com/docs)
- [Twilio Documentation](https://www.twilio.com/docs)

### Community
- [FastAPI GitHub](https://github.com/tiangolo/fastapi)
- [Next.js GitHub](https://github.com/vercel/next.js)
- [PostgreSQL Community](https://www.postgresql.org/community/)

## 🆘 Support

If you encounter issues:

1. **Check the logs** for error messages
2. **Verify environment variables** are correctly set
3. **Ensure all services** are running
4. **Check network connectivity**
5. **Review this guide** for missed steps

For additional support:
- **Email**: support@zorelleather.com
- **Documentation**: Check `/docs` directory
- **Issues**: Report via project repository

---

**ZOREL LEATHER** - Crafted for Excellence
