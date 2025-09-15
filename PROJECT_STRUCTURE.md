# ZOREL LEATHER - Project Structure Documentation

This document provides a comprehensive overview of the project structure, explaining the purpose of every file and directory in the ZOREL LEATHER e-commerce platform.

## 📁 Root Directory Structure

```
Zorel/
├── Backend/                    # FastAPI backend application
├── Frontend/                   # Next.js frontend application
├── deployment/                 # Docker deployment configuration
├── myenv/                      # Python virtual environment
├── README.md                   # Main project documentation
├── PROJECT_STRUCTURE.md        # This file - detailed structure documentation
├── SETUP_GUIDE.md              # Complete setup and deployment guide
├── credentials.txt             # Project credentials and configuration
├── gui.py                      # GUI application for project management
├── test_crud_operations_fixed.py  # Database testing utilities
└── .gitignore                  # Git ignore rules
```

## 🖥️ Backend Directory (`/Backend/`)

The backend is built with FastAPI and provides the API layer, database management, authentication, and business logic.

### Core Application Files

```
Backend/
├── main.py                     # FastAPI application entry point
├── requirements.txt            # Python dependencies with versions
├── Dockerfile                  # Docker configuration for backend
├── docker-compose.yml          # Docker Compose configuration
├── nginx.conf                  # Nginx configuration for production
├── alembic.ini                 # Alembic database migration configuration
├── quick_setup.py              # Quick setup script for development
├── verify_backend.py           # Backend verification script
├── test_api_endpoints.py       # API endpoint testing script
├── test_simple_postgresql.py   # PostgreSQL connection testing
├── fix_database.py             # Database fixing utilities
├── fix_enum.py                 # Enum fixing utilities
├── add_slug_column.py          # Database migration utility
├── MIGRATION_PROGRESS.md       # Migration progress tracking
├── MIGRATION_STATUS.md         # Migration status documentation
├── POSTGRESQL_SETUP.md         # PostgreSQL setup instructions
├── API_DOCUMENTATION.md        # API documentation
└── PROJECT_STRUCTURE_EXPLANATION.md  # Backend structure explanation
```

### Application Code (`/Backend/app/`)

```
app/
├── __init__.py                 # Package initialization
├── core/                       # Core application configuration
│   ├── __init__.py
│   ├── config.py               # Application settings and configuration
│   ├── database.py             # Database connection and initialization
│   ├── postgresql.py           # PostgreSQL-specific database utilities
│   ├── security.py             # Authentication and security utilities
│   ├── exceptions.py           # Custom exception classes
│   └── init_data.py            # Initial data seeding functions
├── models/                     # SQLAlchemy database models
│   ├── __init__.py
│   └── sqlalchemy_models.py    # All database models (User, Product, Order, etc.)
├── schemas/                    # Pydantic schemas for data validation
│   ├── __init__.py
│   ├── base.py                 # Base schema classes
│   ├── user.py                 # User-related schemas
│   ├── product.py              # Product-related schemas
│   ├── order.py                # Order-related schemas
│   ├── cart.py                 # Cart-related schemas
│   ├── wishlist.py             # Wishlist-related schemas
│   ├── coupon.py               # Coupon-related schemas
│   ├── invoice.py              # Invoice-related schemas
│   ├── notification.py         # Notification schemas
│   ├── review.py               # Review schemas
│   ├── page.py                 # Page schemas
│   └── admin_request.py        # Admin request schemas
├── api/                        # API route definitions
│   ├── __init__.py
│   └── v1/                     # API version 1
│       ├── __init__.py
│       ├── api.py              # Main API router configuration
│       └── endpoints/          # Individual endpoint modules
│           ├── __init__.py
│           ├── auth.py         # Authentication endpoints
│           ├── users.py        # User management endpoints
│           ├── products.py     # Product management endpoints
│           ├── orders.py       # Order processing endpoints
│           ├── cart.py         # Shopping cart endpoints
│           ├── wishlist.py     # Wishlist endpoints
│           ├── coupons.py      # Coupon endpoints
│           ├── reviews.py      # Review endpoints
│           ├── notifications.py # Notification endpoints
│           ├── admin.py        # Admin panel endpoints
│           ├── admin_orders.py # Admin order management
│           ├── admin_products.py # Admin product management
│           ├── admin_users.py  # Admin user management
│           ├── admin_analytics.py # Admin analytics
│           ├── admin_notifications.py # Admin notifications
│           ├── admin_requests.py # Admin request management
│           ├── admin_settings.py # Admin settings
│           ├── admin_whatsapp.py # Admin WhatsApp integration
│           ├── pages.py        # Static page endpoints
│           ├── search.py       # Search functionality
│           ├── categories.py   # Category management
│           ├── inventory.py    # Inventory management
│           ├── payment.py      # Payment processing
│           ├── shipping.py     # Shipping management
│           ├── files.py        # File upload endpoints
│           └── whatsapp.py     # WhatsApp integration
└── services/                   # Business logic services
    ├── __init__.py
    ├── file_service.py         # File handling and upload services
    ├── inventory_service.py    # Inventory management services
    ├── notification_service.py # Notification services
    ├── oauth_service.py        # OAuth integration services
    ├── payment_service.py      # Payment processing services
    └── whatsapp_service.py     # WhatsApp messaging services
```

### Database Migrations (`/Backend/alembic/`)

```
alembic/
├── __init__.py
├── env.py                      # Alembic environment configuration
├── script.py.mako              # Migration script template
└── versions/                   # Migration version files
    ├── add_google_oauth.py     # Google OAuth migration
    └── [other migration files] # Additional database migrations
```

### Testing (`/Backend/tests/`)

```
tests/
├── test_api_endpoints.py       # API endpoint tests
├── test_auth.py                # Authentication tests
├── test_postgresql.py          # Database connection tests
├── test_role_debug.py          # Role-based access tests
└── test_simple_postgresql.py   # Simple database tests
```

### Static Files (`/Backend/uploads/`)

```
uploads/                        # File upload directory
└── [uploaded files]            # User-uploaded images and files
```

## 🎨 Frontend Directory (`/Frontend/`)

The frontend is built with Next.js 14, TypeScript, and Tailwind CSS, providing a modern, responsive user interface.

### Core Application Files

```
Frontend/
├── package.json                # Node.js dependencies and scripts
├── package-lock.json           # Dependency lock file
├── pnpm-lock.yaml              # PNPM lock file
├── next.config.mjs             # Next.js configuration
├── next-env.d.ts               # Next.js TypeScript declarations
├── tsconfig.json               # TypeScript configuration
├── postcss.config.mjs          # PostCSS configuration
├── components.json             # Shadcn/ui components configuration
├── tailwind.config.js          # Tailwind CSS configuration
└── .env.local                  # Frontend environment variables
```

### Application Pages (`/Frontend/app/`)

```
app/
├── layout.tsx                  # Root layout component
├── page.tsx                    # Homepage component
├── globals.css                 # Global CSS styles
├── loading.tsx                 # Global loading component
├── not-found.tsx               # 404 page component
├── error.tsx                   # Error page component
├── about-us/                   # About us page
│   └── page.tsx
├── contact-us/                 # Contact us page
│   └── page.tsx
├── faq/                        # FAQ page
│   └── page.tsx
├── privacy-policy/             # Privacy policy page
│   └── page.tsx
├── return-policy/              # Return policy page
│   └── page.tsx
├── shipping-policy/            # Shipping policy page
│   └── page.tsx
├── size-guide/                 # Size guide page
│   └── page.tsx
├── terms-of-service/           # Terms of service page
│   └── page.tsx
├── auth/                       # Authentication pages
│   ├── login/                  # User login page
│   │   └── page.tsx
│   ├── register/               # User registration page
│   │   └── page.tsx
│   ├── forgot-password/        # Password reset page
│   │   └── page.tsx
│   ├── admin-login/            # Admin login page
│   │   └── page.tsx
│   ├── admin-request/          # Admin request page
│   │   └── page.tsx
│   └── callback/               # OAuth callback page
│       └── page.tsx
├── shop/                       # Shopping pages
│   ├── page.tsx                # Main shop page
│   ├── loading.tsx             # Shop loading component
│   ├── men/                    # Men's collection
│   │   └── page.tsx
│   ├── women/                  # Women's collection
│   │   └── page.tsx
│   └── accessories/            # Accessories collection
│       └── page.tsx
├── product/                    # Product detail pages
│   └── [slug]/                 # Dynamic product pages
│       └── page.tsx
├── account/                    # User account pages
│   ├── page.tsx                # Account dashboard
│   ├── profile/                # Profile management
│   │   └── page.tsx
│   ├── orders/                 # Order history
│   │   └── page.tsx
│   └── requests/               # Request history
│       └── page.tsx
├── order/                      # Order processing pages
│   ├── confirmation/           # Order confirmation
│   │   ├── page.tsx
│   │   └── [orderId]/          # Specific order confirmation
│   │       └── page.tsx
│   └── payment/                # Payment processing
│       ├── page.tsx
│       └── [orderId]/          # Specific order payment
│           └── page.tsx
├── request/                    # Product request pages
│   ├── cart/                   # Request cart
│   │   └── page.tsx
│   ├── checkout/               # Request checkout
│   │   └── page.tsx
│   └── status/                 # Request status
│       └── page.tsx
├── admin/                      # Admin panel pages
│   ├── page.tsx                # Admin dashboard
│   ├── login/                  # Admin login
│   │   └── page.tsx
│   ├── profile/                # Admin profile
│   │   └── page.tsx
│   ├── products/               # Product management
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   ├── new/                # Add new product
│   │   │   └── page.tsx
│   │   └── [id]/               # Edit product
│   │       └── page.tsx
│   ├── orders/                 # Order management
│   │   └── page.tsx
│   ├── customers/              # Customer management
│   │   └── page.tsx
│   ├── requests/               # Request management
│   │   ├── page.tsx
│   │   └── loading.tsx
│   ├── approvals/              # Approval management
│   │   └── page.tsx
│   ├── notifications/          # Notification management
│   │   └── page.tsx
│   ├── settings/               # Admin settings
│   │   └── page.tsx
│   └── whatsapp/               # WhatsApp integration
│       └── page.tsx
└── test-api/                   # API testing page
    └── page.tsx
```

### Components (`/Frontend/components/`)

```
components/
├── ui/                         # Shadcn/ui base components
│   ├── index.ts                # Component exports
│   ├── accordion.tsx           # Accordion component
│   ├── alert.tsx               # Alert component
│   ├── alert-dialog.tsx        # Alert dialog component
│   ├── avatar.tsx              # Avatar component
│   ├── badge.tsx               # Badge component
│   ├── button.tsx              # Button component
│   ├── card.tsx                # Card component
│   ├── checkbox.tsx            # Checkbox component
│   ├── collapsible.tsx         # Collapsible component
│   ├── command.tsx             # Command component
│   ├── dialog.tsx              # Dialog component
│   ├── dropdown-menu.tsx       # Dropdown menu component
│   ├── form.tsx                # Form component
│   ├── input.tsx               # Input component
│   ├── label.tsx               # Label component
│   ├── menubar.tsx             # Menu bar component
│   ├── navigation-menu.tsx     # Navigation menu component
│   ├── popover.tsx             # Popover component
│   ├── progress.tsx            # Progress component
│   ├── radio-group.tsx         # Radio group component
│   ├── scroll-area.tsx         # Scroll area component
│   ├── select.tsx              # Select component
│   ├── separator.tsx           # Separator component
│   ├── sheet.tsx               # Sheet component
│   ├── skeleton.tsx            # Skeleton component
│   ├── slider.tsx              # Slider component
│   ├── switch.tsx              # Switch component
│   ├── table.tsx               # Table component
│   ├── tabs.tsx                # Tabs component
│   ├── textarea.tsx            # Textarea component
│   ├── toast.tsx               # Toast component
│   ├── toggle.tsx              # Toggle component
│   ├── tooltip.tsx             # Tooltip component
│   └── [other ui components]   # Additional UI components
├── admin/                      # Admin-specific components
│   ├── admin-header.tsx        # Admin header component
│   └── admin-sidebar.tsx       # Admin sidebar component
├── auth/                       # Authentication components
│   └── google-oauth-button.tsx # Google OAuth button
├── header.tsx                  # Main site header
├── footer.tsx                  # Main site footer
├── product-card.tsx            # Product card component
├── request-modal.tsx           # Product request modal
├── theme-provider.tsx          # Theme context provider
├── theme-toggle.tsx            # Dark/light mode toggle
└── whatsapp-contact.tsx        # WhatsApp contact component
```

### Utilities and Hooks (`/Frontend/lib/` and `/Frontend/hooks/`)

```
lib/
├── api.ts                      # API client and error handling
├── error-utils.ts              # Error handling utilities
├── images.ts                   # Image handling utilities
├── types.ts                    # TypeScript type definitions
└── utils.ts                    # General utility functions

hooks/
├── use-api.ts                  # API hooks and data fetching
├── use-mobile.ts               # Mobile detection hook
└── use-toast.ts                # Toast notification hook

contexts/
└── app-context.tsx             # Global application context
```

### Static Assets (`/Frontend/public/`)

```
public/
├── ElectricBlaze.mp4           # Hero section video background
├── ExplosiveParticles.mp4      # Particle effect video
├── luxury-mens-leather-goods-collection-hero-banner.jpg
├── luxury-brown-leather-briefcase.jpg
├── luxury-brown-leather-briefcase-detail-view.jpg
├── luxury-brown-leather-briefcase-front-view.jpg
├── luxury-brown-leather-briefcase-interior-view.jpg
├── luxury-brown-leather-briefcase-side-view.jpg
├── luxury-brown-leather-crossbody-bag-for-women.jpg
├── luxury-brown-leather-derby-dress-shoes.jpg
├── luxury-brown-leather-oxford-shoes.jpg
├── luxury-brown-leather-tote-bag-for-women.jpg
├── luxury-brown-leather-travel-duffle-bag.jpg
├── luxury-brown-leather-watch-strap.jpg
├── luxury-womens-leather-handbags-and-accessories-col.jpg
├── mens-leather-accessories-briefcase-and-shoes.jpg
├── womens-leather-handbags-and-accessories.jpg
├── leather-accessories-wallets-belts-and-small-goods.jpg
├── designer-brown-leather-tote-bag.jpg
├── elegant-brown-leather-evening-clutch-bag.jpg
├── elegant-brown-leather-handbag.jpg
├── elegant-brown-leather-keychain-with-brass-hardware.jpg
├── elegant-brown-leather-pumps-high-heels.jpg
├── handcrafted-brown-leather-belt-with-brass-buckle.jpg
├── handcrafted-brown-leather-belt.jpg
├── leather-travel-document-passport-holder.jpg
├── minimalist-brown-leather-card-holder.jpg
├── premium-brown-leather-wallet.png
├── premium-leather-belt-collection.jpg
├── stylish-brown-leather-ankle-boots-for-women.jpg
├── placeholder-logo.png
├── placeholder-logo.svg
├── placeholder-user.jpg
├── placeholder.jpg
├── placeholder.svg
├── image-1.png through image-18.jpg  # Additional product images
└── [other static assets]       # Additional images and files
```

### Styles (`/Frontend/styles/`)

```
styles/
└── globals.css                 # Global CSS styles and Tailwind configuration
```

## 🐍 Virtual Environment (`/myenv/`)

```
myenv/                          # Python virtual environment
├── bin/                        # Executable files
│   ├── activate                # Activation script
│   ├── python                  # Python interpreter
│   ├── pip                     # Package installer
│   └── [other executables]     # Additional Python tools
├── lib/                        # Python packages
│   └── python3.13/
│       └── site-packages/      # Installed packages
├── include/                    # Header files
└── pyvenv.cfg                  # Virtual environment configuration
```

## 📚 Documentation Files

```
├── README.md                   # Main project documentation
├── PROJECT_STRUCTURE.md        # This file - detailed structure documentation
├── GOOGLE_OAUTH_WHATSAPP_SETUP.md  # OAuth and WhatsApp setup guide
├── Backend/API_DOCUMENTATION.md    # Backend API documentation
├── Backend/POSTGRESQL_SETUP.md     # Database setup guide
├── Backend/MIGRATION_PROGRESS.md   # Migration tracking
├── Backend/MIGRATION_STATUS.md     # Migration status
└── Backend/PROJECT_STRUCTURE_EXPLANATION.md  # Backend structure details
```

## 🔧 Configuration Files

### Backend Configuration
- `requirements.txt` - Python dependencies
- `alembic.ini` - Database migration configuration
- `Dockerfile` - Docker container configuration
- `docker-compose.yml` - Multi-container setup
- `nginx.conf` - Web server configuration

### Frontend Configuration
- `package.json` - Node.js dependencies and scripts
- `next.config.mjs` - Next.js configuration
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration
- `components.json` - Shadcn/ui configuration

## 🧪 Testing Structure

### Backend Tests
- Unit tests for individual functions
- Integration tests for API endpoints
- Database connection tests
- Authentication and authorization tests

### Frontend Tests
- Component unit tests
- Integration tests for user flows
- API integration tests
- Accessibility tests

## 🚀 Deployment Directory (`/deployment/`)

The deployment directory contains all necessary files for containerized deployment using Docker.

```
deployment/
├── backend/
│   ├── Dockerfile              # Backend container configuration
│   └── .dockerignore           # Backend Docker ignore rules
├── frontend/
│   ├── Dockerfile              # Frontend container configuration
│   └── .dockerignore           # Frontend Docker ignore rules
├── nginx/
│   └── nginx.conf              # Production web server configuration
├── docker-compose.yml          # Main orchestration file
├── docker-compose.prod.yml     # Production override configuration
├── docker-compose.dev.yml      # Development override configuration
├── deploy.sh                   # Automated deployment script
├── env.example                 # Environment variables template
├── README.md                   # Deployment documentation
└── DEPLOYMENT_CHECKLIST.md     # Deployment verification checklist
```

### Deployment Features
- **Multi-stage Docker builds** for optimized images
- **Health checks** for all services
- **Production and development** configurations
- **Automated deployment** scripts
- **Comprehensive documentation** and checklists
- **Security hardening** for production
- **Resource limits** and scaling options

## 📝 Key Features by Directory

### Backend Features
- **Authentication**: JWT tokens, Google OAuth, role-based access
- **Database**: PostgreSQL with SQLAlchemy ORM
- **API**: RESTful API with FastAPI
- **Payments**: Stripe integration
- **Communication**: WhatsApp and email via Twilio
- **File Handling**: Image upload and processing
- **Admin Panel**: Comprehensive admin functionality

### Frontend Features
- **Modern UI**: Next.js 14 with TypeScript
- **Responsive Design**: Mobile-first with Tailwind CSS
- **Theme Support**: Dark/light mode switching
- **Video Backgrounds**: Dynamic MP4 backgrounds
- **Component Library**: Shadcn/ui components
- **State Management**: React hooks and context
- **Form Handling**: Comprehensive form validation

This structure provides a scalable, maintainable foundation for the ZOREL LEATHER e-commerce platform, with clear separation of concerns and modern development practices.
