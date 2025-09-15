#!/bin/bash

# ZOREL LEATHER Deployment Script
# Automated deployment script for Docker containers

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if .env exists
    if [ ! -f "$ENV_FILE" ]; then
        log_warning "Environment file not found. Creating from template..."
        if [ -f "env.example" ]; then
            cp env.example "$ENV_FILE"
            log_warning "Please update $ENV_FILE with your configuration before continuing."
            exit 1
        else
            log_error "No environment template found. Please create $ENV_FILE manually."
            exit 1
        fi
    fi
    
    log_success "Prerequisites check passed."
}

backup_data() {
    log_info "Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup database if running
    if docker-compose ps postgres | grep -q "Up"; then
        log_info "Backing up database..."
        docker-compose exec -T postgres pg_dump -U postgres zorel_leather > "$BACKUP_DIR/database.sql"
    fi
    
    # Backup uploads if backend is running
    if docker-compose ps backend | grep -q "Up"; then
        log_info "Backing up uploads..."
        docker cp zorel-backend:/app/uploads "$BACKUP_DIR/" 2>/dev/null || true
    fi
    
    log_success "Backup created in $BACKUP_DIR"
}

stop_services() {
    log_info "Stopping services..."
    docker-compose down
    log_success "Services stopped."
}

build_images() {
    log_info "Building Docker images..."
    docker-compose build --no-cache
    log_success "Images built successfully."
}

start_services() {
    log_info "Starting services..."
    docker-compose up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    check_health
}

check_health() {
    log_info "Checking service health..."
    
    # Check PostgreSQL
    if docker-compose exec -T postgres pg_isready -U postgres &> /dev/null; then
        log_success "PostgreSQL is healthy"
    else
        log_error "PostgreSQL health check failed"
        return 1
    fi
    
    # Check Redis
    if docker-compose exec -T redis redis-cli ping &> /dev/null; then
        log_success "Redis is healthy"
    else
        log_error "Redis health check failed"
        return 1
    fi
    
    # Check Backend
    if curl -f http://localhost:8000/health &> /dev/null; then
        log_success "Backend API is healthy"
    else
        log_error "Backend API health check failed"
        return 1
    fi
    
    # Check Frontend
    if curl -f http://localhost:3000 &> /dev/null; then
        log_success "Frontend is healthy"
    else
        log_error "Frontend health check failed"
        return 1
    fi
}

run_migrations() {
    log_info "Running database migrations..."
    docker-compose exec backend alembic upgrade head
    log_success "Database migrations completed."
}

show_status() {
    log_info "Service Status:"
    docker-compose ps
    
    echo ""
    log_info "Service URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:8000"
    echo "  API Documentation: http://localhost:8000/docs"
    echo "  Health Check: http://localhost:8000/health"
}

cleanup() {
    log_info "Cleaning up unused Docker resources..."
    docker system prune -f
    log_success "Cleanup completed."
}

# Main deployment function
deploy() {
    log_info "Starting ZOREL LEATHER deployment..."
    
    check_prerequisites
    backup_data
    stop_services
    build_images
    start_services
    run_migrations
    show_status
    
    log_success "Deployment completed successfully!"
    log_info "You can now access the application at http://localhost:3000"
}

# Script options
case "${1:-deploy}" in
    "deploy")
        deploy
        ;;
    "stop")
        log_info "Stopping services..."
        docker-compose down
        log_success "Services stopped."
        ;;
    "start")
        log_info "Starting services..."
        docker-compose up -d
        show_status
        ;;
    "restart")
        log_info "Restarting services..."
        docker-compose restart
        show_status
        ;;
    "logs")
        docker-compose logs -f "${2:-}"
        ;;
    "status")
        show_status
        ;;
    "health")
        check_health
        ;;
    "backup")
        backup_data
        ;;
    "cleanup")
        cleanup
        ;;
    "help"|"-h"|"--help")
        echo "ZOREL LEATHER Deployment Script"
        echo ""
        echo "Usage: $0 [COMMAND]"
        echo ""
        echo "Commands:"
        echo "  deploy     Full deployment (default)"
        echo "  start      Start services"
        echo "  stop       Stop services"
        echo "  restart    Restart services"
        echo "  status     Show service status"
        echo "  health     Check service health"
        echo "  logs       Show logs [service]"
        echo "  backup     Create backup"
        echo "  cleanup    Clean up Docker resources"
        echo "  help       Show this help"
        ;;
    *)
        log_error "Unknown command: $1"
        echo "Use '$0 help' for available commands."
        exit 1
        ;;
esac
