# ZOREL LEATHER - API Documentation

This document provides comprehensive documentation for the ZOREL LEATHER backend API, including all endpoints, request/response formats, authentication, and usage examples.

## 🔗 Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://api.zorelleather.com`

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Authentication Flow

1. **Register/Login** to get a JWT token
2. **Include token** in subsequent requests
3. **Refresh token** when it expires

## 📋 API Endpoints

### 🔑 Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "customer",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Login User
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "customer",
    "is_active": true
  }
}
```

#### Google OAuth
```http
POST /api/v1/auth/google
```

**Request Body:**
```json
{
  "token": "google-oauth-token"
}
```

#### Forgot Password
```http
POST /api/v1/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

#### Reset Password
```http
POST /api/v1/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token",
  "new_password": "newpassword"
}
```

### 👤 User Management

#### Get Current User
```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "role": "customer",
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Update User Profile
```http
PUT /api/v1/users/me
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "full_name": "John Smith",
  "phone": "+1234567891"
}
```

### 🛍️ Product Management

#### Get All Products
```http
GET /api/v1/products/
```

**Query Parameters:**
- `page` (int): Page number (default: 1)
- `limit` (int): Items per page (default: 20)
- `category` (str): Filter by category
- `is_featured` (bool): Filter featured products
- `search` (str): Search term

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Classic Oxford Shoes",
      "slug": "classic-oxford-shoes",
      "description": "Premium leather oxford shoes...",
      "price": 649.99,
      "category": "shoes",
      "is_featured": true,
      "images": ["image1.jpg", "image2.jpg"],
      "in_stock": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 20,
  "pages": 3
}
```

#### Get Product by ID
```http
GET /api/v1/products/{product_id}
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Classic Oxford Shoes",
  "slug": "classic-oxford-shoes",
  "description": "Premium leather oxford shoes...",
  "price": 649.99,
  "category": "shoes",
  "is_featured": true,
  "images": ["image1.jpg", "image2.jpg"],
  "in_stock": true,
  "variants": [
    {
      "size": "42",
      "color": "Brown",
      "stock": 10
    }
  ],
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Create Product (Admin Only)
```http
POST /api/v1/products/
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Product description",
  "price": 299.99,
  "category": "accessories",
  "is_featured": false,
  "images": ["image1.jpg"],
  "variants": [
    {
      "size": "M",
      "color": "Black",
      "stock": 5
    }
  ]
}
```

#### Update Product (Admin Only)
```http
PUT /api/v1/products/{product_id}
Authorization: Bearer <admin-token>
```

#### Delete Product (Admin Only)
```http
DELETE /api/v1/products/{product_id}
Authorization: Bearer <admin-token>
```

### 🛒 Order Management

#### Create Order
```http
POST /api/v1/orders/
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+1234567890",
  "shipping_address": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "country": "USA"
  },
  "items": [
    {
      "product_id": "uuid",
      "quantity": 1,
      "price": 649.99
    }
  ],
  "shipping_cost": 15.00,
  "notes": "Please handle with care"
}
```

**Response:**
```json
{
  "id": "uuid",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+1234567890",
  "shipping_address": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "country": "USA"
  },
  "items": [
    {
      "id": "uuid",
      "product_id": "uuid",
      "quantity": 1,
      "price": 649.99
    }
  ],
  "status": "pending",
  "payment_status": "pending",
  "payment_method": "online",
  "total_amount": 664.99,
  "tracking_number": null,
  "notes": "Please handle with care",
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Get User Orders
```http
GET /api/v1/orders/
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (int): Page number
- `limit` (int): Items per page
- `status` (str): Filter by status

#### Get Order by ID
```http
GET /api/v1/orders/{order_id}
Authorization: Bearer <token>
```

#### Update Order Status (Admin Only)
```http
PUT /api/v1/orders/{order_id}
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "status": "confirmed",
  "tracking_number": "TRK123456789",
  "notes": "Order confirmed and shipped"
}
```

### 🛒 Cart Management

#### Get Cart
```http
GET /api/v1/cart/
Authorization: Bearer <token>
```

#### Add Item to Cart
```http
POST /api/v1/cart/items/
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "product_id": "uuid",
  "quantity": 1
}
```

#### Update Cart Item
```http
PUT /api/v1/cart/items/{item_id}
Authorization: Bearer <token>
```

#### Remove Cart Item
```http
DELETE /api/v1/cart/items/{item_id}
Authorization: Bearer <token>
```

#### Clear Cart
```http
DELETE /api/v1/cart/
Authorization: Bearer <token>
```

### ❤️ Wishlist Management

#### Get Wishlist
```http
GET /api/v1/wishlist/
Authorization: Bearer <token>
```

#### Add to Wishlist
```http
POST /api/v1/wishlist/
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "product_id": "uuid"
}
```

#### Remove from Wishlist
```http
DELETE /api/v1/wishlist/{product_id}
Authorization: Bearer <token>
```

### 💳 Payment Processing

#### Create Payment Intent
```http
POST /api/v1/payment/create-intent
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "order_id": "uuid",
  "amount": 664.99,
  "currency": "usd"
}
```

**Response:**
```json
{
  "client_secret": "pi_xxx_secret_xxx",
  "payment_intent_id": "pi_xxx"
}
```

#### Confirm Payment
```http
POST /api/v1/payment/confirm
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "payment_intent_id": "pi_xxx",
  "order_id": "uuid"
}
```

### 🔍 Search and Categories

#### Search Products
```http
GET /api/v1/search/
```

**Query Parameters:**
- `q` (str): Search query
- `category` (str): Filter by category
- `min_price` (float): Minimum price
- `max_price` (float): Maximum price
- `page` (int): Page number
- `limit` (int): Items per page

#### Get Categories
```http
GET /api/v1/categories/
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Shoes",
      "slug": "shoes",
      "description": "Premium leather shoes",
      "product_count": 25
    }
  ]
}
```

### 👨‍💼 Admin Endpoints

#### Get Dashboard Statistics
```http
GET /api/v1/admin/dashboard/stats
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "total_orders": 150,
  "total_revenue": 45000.00,
  "total_customers": 75,
  "total_products": 50,
  "pending_orders": 12,
  "recent_orders": [
    {
      "id": "uuid",
      "customer_name": "John Doe",
      "total_amount": 649.99,
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "monthly_sales": [
    {
      "month": "2024-01",
      "sales": 15000.00,
      "orders": 45
    }
  ]
}
```

#### Get All Orders (Admin)
```http
GET /api/v1/admin/orders/
Authorization: Bearer <admin-token>
```

#### Get All Users (Admin)
```http
GET /api/v1/admin/users/
Authorization: Bearer <admin-token>
```

#### Get All Requests (Admin)
```http
GET /api/v1/admin/requests/
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "customer_phone": "+1234567890",
      "shipping_address": {
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zip_code": "10001",
        "country": "USA"
      },
      "items": [
        {
          "id": "uuid",
          "product_id": "uuid",
          "quantity": 1,
          "price": 649.99
        }
      ],
      "status": "pending",
      "payment_status": "pending",
      "payment_method": "online",
      "total_amount": 664.99,
      "tracking_number": null,
      "notes": "Please handle with care",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20,
  "pages": 2
}
```

#### Update Order Status (Admin)
```http
PUT /api/v1/admin/orders/{order_id}
Authorization: Bearer <admin-token>
```

#### Get Analytics (Admin)
```http
GET /api/v1/admin/analytics/
Authorization: Bearer <admin-token>
```

**Query Parameters:**
- `period` (str): Time period (daily, weekly, monthly, yearly)
- `start_date` (str): Start date (ISO format)
- `end_date` (str): End date (ISO format)

### 📧 Notifications

#### Get User Notifications
```http
GET /api/v1/notifications/
Authorization: Bearer <token>
```

#### Mark Notification as Read
```http
PUT /api/v1/notifications/{notification_id}/read
Authorization: Bearer <token>
```

#### Send Notification (Admin)
```http
POST /api/v1/admin/notifications/
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "title": "Order Update",
  "message": "Your order has been shipped",
  "user_id": "uuid",
  "type": "order_update"
}
```

### 📱 WhatsApp Integration

#### Send WhatsApp Message (Admin)
```http
POST /api/v1/admin/whatsapp/send
Authorization: Bearer <admin-token>
```

**Request Body:**
```json
{
  "to": "+1234567890",
  "message": "Your order has been confirmed"
}
```

### 📁 File Upload

#### Upload File
```http
POST /api/v1/files/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: File to upload
- `type`: File type (product_image, user_avatar, etc.)

**Response:**
```json
{
  "filename": "uploaded_file.jpg",
  "url": "/uploads/uploaded_file.jpg",
  "size": 1024000,
  "type": "image/jpeg"
}
```

## 📊 Response Formats

### Success Response
```json
{
  "data": { ... },
  "message": "Success message",
  "status": "success"
}
```

### Error Response
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "status_code": 400,
    "details": { ... }
  }
}
```

### Pagination Response
```json
{
  "data": [ ... ],
  "total": 100,
  "page": 1,
  "limit": 20,
  "pages": 5,
  "has_next": true,
  "has_prev": false
}
```

## 🔒 Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 422 | Request validation failed |
| `AUTHENTICATION_ERROR` | 401 | Authentication required |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource conflict |
| `RATE_LIMIT_EXCEEDED` | 429 | Rate limit exceeded |
| `INTERNAL_SERVER_ERROR` | 500 | Internal server error |

## 🚀 Rate Limiting

- **General API**: 60 requests per minute
- **Authentication**: 5 requests per minute
- **File Upload**: 10 requests per minute

## 📝 Examples

### Complete Order Flow

1. **Get Products**
```bash
curl -X GET "http://localhost:8000/api/v1/products/"
```

2. **Add to Cart**
```bash
curl -X POST "http://localhost:8000/api/v1/cart/items/" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"product_id": "uuid", "quantity": 1}'
```

3. **Create Order**
```bash
curl -X POST "http://localhost:8000/api/v1/orders/" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "+1234567890",
    "shipping_address": {
      "name": "John Doe",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip_code": "10001",
      "country": "USA"
    },
    "items": [{"product_id": "uuid", "quantity": 1, "price": 649.99}],
    "shipping_cost": 15.00
  }'
```

4. **Create Payment Intent**
```bash
curl -X POST "http://localhost:8000/api/v1/payment/create-intent" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"order_id": "uuid", "amount": 664.99, "currency": "usd"}'
```

## 🔧 Development

### Interactive API Documentation

Visit `http://localhost:8000/docs` for interactive Swagger UI documentation.

### Testing

Use the provided test scripts:
```bash
cd Backend
python test_api_endpoints.py
```

## 📞 Support

For API support and questions:
- **Email**: api-support@zorelleather.com
- **Documentation**: This file and `/docs` endpoint
- **Issues**: Report via project repository

---

**ZOREL LEATHER API** - Crafted for Excellence
