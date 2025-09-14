# ZOREL LEATHER - Premium E-commerce Platform

A sophisticated e-commerce platform for luxury leather goods, built with modern web technologies and featuring a unique request-confirm-pay business model.

## 🏗️ Architecture Overview

- **Frontend**: Next.js 14 with TypeScript, Tailwind CSS, and Shadcn/ui
- **Backend**: FastAPI with Python 3.13, PostgreSQL, and SQLAlchemy
- **Authentication**: JWT-based with Google OAuth integration
- **Payments**: Stripe integration for secure transactions
- **Communication**: WhatsApp and email notifications via Twilio
- **Deployment**: Docker-ready with comprehensive configuration

## ✨ Key Features

### 🛍️ E-commerce Functionality
- **Request-Based Model**: Customers request products, admins confirm availability
- **Multi-Category Shop**: Men's, Women's, and Accessories collections
- **Product Management**: Comprehensive admin panel for inventory control
- **Order Processing**: Complete order lifecycle management
- **Payment Integration**: Secure Stripe payment processing

### 👥 User Management
- **Customer Accounts**: Registration, authentication, and profile management
- **Admin Panel**: Comprehensive admin dashboard with analytics
- **Role-Based Access**: Customer, Admin, and Super Admin roles
- **Google OAuth**: Social login integration

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Theme switching with system preference detection
- **Video Backgrounds**: Dynamic MP4 backgrounds for enhanced visual appeal
- **Luxury Aesthetic**: Premium design with warm brown and gold color scheme

### 🔧 Technical Features
- **Real-time Updates**: Live order status and inventory updates
- **File Upload**: Image handling with optimization
- **Rate Limiting**: API protection with SlowAPI
- **Database Migrations**: Alembic for schema management
- **Comprehensive Testing**: Unit and integration tests

## 🚀 Quick Start

### Prerequisites
- Python 3.13+
- Node.js 18+
- PostgreSQL 14+
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Zorel/Backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv myenv
   source myenv/bin/activate  # On Windows: myenv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your database and API credentials
   ```

5. **Database Setup**
   ```bash
   # Create PostgreSQL database
   createdb zorel_leather
   
   # Run migrations
   alembic upgrade head
   ```

6. **Start the server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🔐 Default Admin Credentials

- **Super Admin**: `superadmin@zorelleather.com` / `SuperAdmin123!`
- **Admin**: `admin@zorelleather.com` / `kryptozorelleather`

## 📁 Project Structure

```
Zorel/
├── Backend/                 # FastAPI backend application
│   ├── app/                # Main application code
│   ├── alembic/            # Database migrations
│   ├── tests/              # Test files
│   └── requirements.txt    # Python dependencies
├── Frontend/               # Next.js frontend application
│   ├── app/                # Next.js app directory
│   ├── components/         # React components
│   ├── lib/                # Utility functions
│   └── package.json        # Node.js dependencies
└── README.md               # This file
```

## 🛠️ Development

### Backend Development
- **API Documentation**: Available at `/docs` when server is running
- **Database Migrations**: Use Alembic for schema changes
- **Testing**: Run tests with `pytest`
- **Code Style**: Follow PEP 8 guidelines

### Frontend Development
- **Component Library**: Built with Shadcn/ui components
- **Styling**: Tailwind CSS with custom luxury theme
- **State Management**: React hooks and context
- **Type Safety**: Full TypeScript implementation

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment
1. **Backend**: Deploy FastAPI app to your preferred hosting service
2. **Frontend**: Build and deploy Next.js app to Vercel, Netlify, or similar
3. **Database**: Set up PostgreSQL instance
4. **Environment**: Configure production environment variables

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/google` - Google OAuth

### Products
- `GET /api/v1/products/` - List products
- `GET /api/v1/products/{id}` - Get product details
- `POST /api/v1/products/` - Create product (Admin)

### Orders
- `POST /api/v1/orders/` - Create order
- `GET /api/v1/orders/` - Get user orders
- `GET /api/v1/admin/orders/` - Get all orders (Admin)

### Admin
- `GET /api/v1/admin/requests/` - Get all requests
- `GET /api/v1/admin/dashboard/stats` - Dashboard statistics

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost/zorel_leather
SECRET_KEY=your-secret-key
ADMIN_EMAIL=admin@zorelleather.com
ADMIN_PASSWORD=your-admin-password
STRIPE_SECRET_KEY=your-stripe-secret
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key
```

## 🧪 Testing

### Backend Tests
```bash
cd Backend
pytest tests/
```

### Frontend Tests
```bash
cd Frontend
npm run test
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support and questions:
- Email: support@zorelleather.com
- Documentation: Check the `/docs` directory for detailed guides

## 🔄 Version History

- **v1.0.0** - Initial release with core e-commerce functionality
- **v1.1.0** - Added video backgrounds and improved UI
- **v1.2.0** - Enhanced admin panel and order management
- **v1.3.0** - Improved text visibility and accessibility

---

**ZOREL LEATHER** - Crafted for Excellence