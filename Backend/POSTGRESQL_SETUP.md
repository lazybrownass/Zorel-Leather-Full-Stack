# PostgreSQL Setup Guide for Zorel Leather Backend

This guide will help you set up PostgreSQL for the Zorel Leather backend application.

## Prerequisites

- Python 3.8+
- PostgreSQL 12+ (recommended: PostgreSQL 15)

## Installation

### 1. Install PostgreSQL

#### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create a database user (optional, postgres user is created by default)
createuser -s postgres
```

#### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Switch to postgres user and create database
sudo -u postgres psql
```

#### CentOS/RHEL
```bash
# Install PostgreSQL
sudo yum install postgresql-server postgresql-contrib

# Initialize the database
sudo postgresql-setup initdb

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database and User

```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create database
CREATE DATABASE zorel_leather;

# Create user (if not exists)
CREATE USER postgres WITH PASSWORD 'password' SUPERUSER;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE zorel_leather TO postgres;

# Exit psql
\q
```

### 3. Install Python Dependencies

```bash
# Install required packages
pip install -r requirements.txt
```

### 4. Configure Environment

The `.env` file is already configured with PostgreSQL settings:

```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/zorel_leather
DATABASE_NAME=zorel_leather
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password
```

### 5. Test the Setup

```bash
# Run the test script
python test_postgresql.py
```

### 6. Run the Application

```bash
# Start the FastAPI application
python main.py
```

## Database Schema

The application uses SQLAlchemy models with the following main entities:

- **Users**: Customer and admin accounts
- **Products**: Leather goods catalog
- **Orders**: Customer orders and order items
- **Reviews**: Product reviews and ratings
- **Wishlist**: Customer wishlist items
- **Cart**: Shopping cart items
- **Invoices**: Order invoices
- **Admin Requests**: Admin registration requests
- **Notifications**: System notifications
- **Pages**: CMS pages
- **Coupons**: Discount coupons

## Database Migrations

The application uses Alembic for database migrations:

```bash
# Initialize Alembic (already done)
alembic init alembic

# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Downgrade to previous version
alembic downgrade -1
```

## Troubleshooting

### Connection Issues

1. **PostgreSQL not running**:
   ```bash
   # macOS
   brew services start postgresql@15
   
   # Linux
   sudo systemctl start postgresql
   ```

2. **Authentication failed**:
   - Check username and password in `.env` file
   - Ensure user has proper privileges

3. **Database doesn't exist**:
   ```bash
   createdb zorel_leather
   ```

### Common Errors

1. **"relation does not exist"**: Run migrations with `alembic upgrade head`
2. **"connection refused"**: Ensure PostgreSQL is running
3. **"permission denied"**: Check user privileges

## Development vs Production

### Development
- Uses local PostgreSQL instance
- Auto-creates tables on startup
- Includes sample data initialization

### Production
- Use managed PostgreSQL service (AWS RDS, Google Cloud SQL, etc.)
- Set secure passwords
- Configure SSL connections
- Use connection pooling
- Set up regular backups

## Security Considerations

1. **Change default passwords** in production
2. **Use SSL connections** for production
3. **Limit database user privileges** to minimum required
4. **Regular security updates** for PostgreSQL
5. **Backup strategy** implementation

## Performance Optimization

1. **Indexes**: Already configured on frequently queried columns
2. **Connection pooling**: Configured in SQLAlchemy settings
3. **Query optimization**: Use proper joins and filters
4. **Database monitoring**: Set up monitoring for production

## Backup and Recovery

```bash
# Create backup
pg_dump -U postgres zorel_leather > backup.sql

# Restore backup
psql -U postgres zorel_leather < backup.sql
```

## Support

If you encounter issues:

1. Check PostgreSQL logs
2. Verify connection settings
3. Ensure all dependencies are installed
4. Check database permissions
5. Review application logs

For additional help, refer to:
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
