# ZOREL LEATHER - Full Stack E-commerce Platform

A premium leather goods e-commerce platform built with Next.js frontend and FastAPI backend, featuring admin panel, customer management, and comprehensive order processing.

## 🚀 Features

### Frontend (Next.js 14)
- **Modern UI/UX**: Beautiful, responsive design with dark/light mode
- **Product Catalog**: Browse men's, women's, and accessories collections
- **Shopping Cart**: Add to cart, wishlist, and checkout functionality
- **User Authentication**: Secure login/register with JWT tokens
- **Admin Panel**: Complete admin dashboard with CRUD operations
- **Search & Filters**: Advanced product search and filtering
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend (FastAPI)
- **RESTful API**: Comprehensive API endpoints for all operations
- **Authentication**: JWT-based authentication with role-based access control
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Admin Management**: Super admin and admin role management
- **Order Processing**: Complete order lifecycle management
- **Payment Integration**: Stripe payment gateway integration
- **Notifications**: Email, SMS, and WhatsApp notifications
- **File Upload**: Secure file upload and management
- **Analytics**: Dashboard analytics and reporting

### Key Functionality
- **Product Management**: CRUD operations with categories, pricing, and inventory
- **Order Management**: Order tracking, status updates, and fulfillment
- **Customer Management**: User profiles, addresses, and order history
- **Admin Dashboard**: Real-time analytics and management tools
- **Request System**: Custom product requests and admin approvals
- **Review System**: Product reviews and ratings
- **Coupon System**: Discount codes and promotional offers
- **Inventory Management**: Stock tracking and low-stock alerts

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context + useState/useEffect
- **Authentication**: JWT tokens with localStorage
- **HTTP Client**: Custom API client with error handling
- **Icons**: Lucide React
- **Notifications**: Sonner toast notifications

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with bcrypt password hashing
- **API Documentation**: Auto-generated OpenAPI/Swagger docs
- **Rate Limiting**: SlowAPI for request rate limiting
- **File Upload**: Secure file handling with validation
- **Email**: aiosmtplib for email notifications
- **SMS/WhatsApp**: Twilio integration
- **Payments**: Stripe payment processing

### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL with connection pooling
- **Reverse Proxy**: Nginx configuration
- **Environment**: Environment-based configuration
- **Migrations**: Alembic database migrations

## 📁 Project Structure

```
Zorel-Leather-Full-Stack/
├── Frontend/                 # Next.js frontend application
│   ├── app/                 # App Router pages and layouts
│   │   ├── admin/           # Admin panel pages
│   │   ├── auth/            # Authentication pages
│   │   ├── shop/            # Product catalog pages
│   │   └── ...
│   ├── components/          # Reusable React components
│   │   ├── admin/           # Admin-specific components
│   │   ├── ui/              # shadcn/ui components
│   │   └── ...
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utility functions and API client
│   └── public/              # Static assets
├── Backend/                 # FastAPI backend application
│   ├── app/                 # Main application code
│   │   ├── api/             # API routes and endpoints
│   │   │   └── v1/          # API version 1
│   │   │       └── endpoints/ # Individual endpoint modules
│   │   ├── core/            # Core functionality
│   │   │   ├── config.py    # Application configuration
│   │   │   ├── database.py  # Database connection
│   │   │   ├── security.py  # Authentication & security
│   │   │   └── exceptions.py # Custom exceptions
│   │   ├── models/          # SQLAlchemy database models
│   │   ├── schemas/         # Pydantic schemas
│   │   └── services/        # Business logic services
│   ├── alembic/             # Database migrations
│   ├── scripts/             # Utility scripts
│   └── tests/               # Test files
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Python 3.11+
- PostgreSQL 14+
- Docker & Docker Compose (optional)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd Backend
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your database and API keys
   ```

5. **Set up PostgreSQL database**:
   ```bash
   # Create database
   createdb zorel_leather
   
   # Run migrations
   alembic upgrade head
   ```

6. **Initialize admin users**:
   ```bash
   python quick_setup.py
   ```

7. **Start the backend server**:
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd Frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API URL
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

### Docker Setup (Alternative)

1. **Start all services with Docker Compose**:
   ```bash
   docker-compose up -d
   ```

2. **Run database migrations**:
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

3. **Initialize admin users**:
   ```bash
   docker-compose exec backend python quick_setup.py
   ```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/zorel_leather
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=zorel_leather

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Admin Credentials
ADMIN_EMAIL=admin@zorelleather.com
ADMIN_PASSWORD=Admin123!
SUPER_ADMIN_EMAIL=superadmin@zorelleather.com
SUPER_ADMIN_PASSWORD=SuperAdmin123!

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Twilio (SMS/WhatsApp)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=your-twilio-number

# Stripe
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_API_VERSION=v1
```

## 👥 Default Admin Accounts

After running the setup, you'll have these admin accounts:

- **Super Admin**: `superadmin@zorelleather.com` / `SuperAdmin123!`
- **Admin**: `admin@zorelleather.com` / `Admin123!`

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key API Endpoints

#### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/admin/login` - Admin login
- `GET /api/v1/auth/me` - Get current user

#### Products
- `GET /api/v1/products` - List products
- `GET /api/v1/products/{id}` - Get product details
- `POST /api/v1/admin/products` - Create product (admin)
- `PUT /api/v1/admin/products/{id}` - Update product (admin)
- `DELETE /api/v1/admin/products/{id}` - Delete product (admin)

#### Orders
- `GET /api/v1/orders` - List user orders
- `POST /api/v1/orders` - Create order
- `GET /api/v1/admin/orders` - List all orders (admin)
- `PUT /api/v1/admin/orders/{id}` - Update order status (admin)

#### Admin Panel
- `GET /api/v1/admin/analytics/dashboard-stats` - Dashboard statistics
- `GET /api/v1/admin/customers` - List customers
- `GET /api/v1/admin/notifications` - List notifications
- `POST /api/v1/admin/notifications` - Send notification

## 🎨 Frontend Pages

### Public Pages
- `/` - Homepage with featured products
- `/shop` - Product catalog with filters
- `/shop/men` - Men's collection
- `/shop/women` - Women's collection
- `/shop/accessories` - Accessories collection
- `/product/[slug]` - Product details
- `/auth/login` - User login
- `/auth/register` - User registration

### User Account Pages
- `/account` - User dashboard
- `/account/profile` - Profile management
- `/account/orders` - Order history
- `/account/requests` - Custom requests

### Admin Panel
- `/admin` - Admin dashboard
- `/admin/login` - Admin login
- `/admin/products` - Product management
- `/admin/orders` - Order management
- `/admin/customers` - Customer management
- `/admin/notifications` - Notification management
- `/admin/requests` - Request management
- `/admin/analytics` - Analytics dashboard

## 🧪 Testing

### Backend Tests
```bash
cd Backend
pytest tests/
```

### Frontend Tests
```bash
cd Frontend
npm test
```

## 🚀 Deployment

### Production Deployment

1. **Backend Deployment**:
   ```bash
   # Build Docker image
   docker build -t zorel-backend .
   
   # Run with production settings
   docker run -d -p 8000:8000 --env-file .env.production zorel-backend
   ```

2. **Frontend Deployment**:
   ```bash
   # Build for production
   npm run build
   
   # Deploy to Vercel/Netlify
   vercel --prod
   ```

### Environment-Specific Configuration

- **Development**: Uses local PostgreSQL and development settings
- **Staging**: Uses staging database with test data
- **Production**: Uses production database with optimized settings

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin, Super Admin, and Customer roles
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation with Pydantic
- **CORS Configuration**: Proper CORS setup for cross-origin requests
- **Environment Variables**: Sensitive data stored in environment variables

## 📊 Database Schema

### Key Tables
- **users**: User accounts and authentication
- **products**: Product catalog with categories
- **orders**: Order management and tracking
- **order_items**: Individual order line items
- **cart**: Shopping cart functionality
- **wishlist**: User wishlists
- **reviews**: Product reviews and ratings
- **notifications**: System notifications
- **admin_requests**: Admin access requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🎯 Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Advanced search with Elasticsearch
- [ ] Real-time notifications with WebSockets
- [ ] Advanced inventory management
- [ ] Multi-vendor support
- [ ] Advanced reporting system

### Performance Improvements
- [ ] Redis caching layer
- [ ] CDN integration
- [ ] Database query optimization
- [ ] Image optimization and compression
- [ ] Lazy loading implementation

---

**Built with ❤️ for ZOREL LEATHER**

*Premium leather goods for the discerning customer*
