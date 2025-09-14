# ZOREL LEATHER Backend API Documentation

## Overview

The ZOREL LEATHER Backend API is a comprehensive e-commerce backend built with FastAPI, MongoDB, and modern security practices. It implements a unique request-confirm-pay business model where customers request items, admins confirm availability with suppliers, and then customers pay.

## Base URL

- Development: `http://localhost:8000`
- Production: `https://api.zorelleather.com`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication (`/api/v1/auth`)

#### Register User
```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer",
  "phone": "+1234567890",
  "addresses": [],
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Login
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token_here",
  "token_type": "bearer"
}
```

#### Get Current User
```http
GET /api/v1/auth/me
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "customer",
  "phone": "+1234567890",
  "addresses": [],
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Products (`/api/v1/products`)

#### Get All Products
```http
GET /api/v1/products?category=jackets&min_price=100&max_price=500&page=1&limit=20
```

**Query Parameters:**
- `category`: Filter by category
- `min_price`, `max_price`: Price range filter
- `tags`: Comma-separated tags
- `is_new`: Boolean filter for new products
- `is_on_sale`: Boolean filter for sale products
- `search`: Text search query
- `sort_by`: Sort field (price, rating, newest, oldest)
- `sort_order`: Sort direction (asc, desc)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

#### Get Single Product
```http
GET /api/v1/products/{product_id}
```

#### Create Product (Admin Only)
```http
POST /api/v1/products
```

**Request Body:**
```json
{
  "name": "Premium Leather Jacket",
  "description": "High-quality leather jacket",
  "price": 299.99,
  "discount_price": 249.99,
  "images": ["/uploads/products/jacket1.jpg"],
  "category": "jackets",
  "tags": ["leather", "premium", "jacket"],
  "specifications": {
    "Material": "100% Leather",
    "Size": "M"
  },
  "variants": [
    {"size": "S", "available": true},
    {"size": "M", "available": true}
  ],
  "colors": [
    {"name": "Black", "value": "rgb(0,0,0)", "available": true}
  ],
  "inventory_quantity": 50,
  "is_new": true,
  "is_on_sale": true
}
```

### Orders (`/api/v1/orders`)

#### Create Order Request
```http
POST /api/v1/orders
```

**Request Body:**
```json
{
  "items": [
    {
      "product_id": "product_id",
      "product_name": "Leather Jacket",
      "product_image": "/uploads/products/jacket1.jpg",
      "quantity": 1,
      "price": 299.99,
      "size": "M",
      "color": "Black"
    }
  ],
  "shipping_address": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip_code": "10001",
    "country": "USA",
    "phone": "+1234567890"
  },
  "notes": "Please handle with care"
}
```

#### Get Order Details
```http
GET /api/v1/orders/{order_id}
```

#### Get User Orders
```http
GET /api/v1/orders?status=confirmed&page=1&limit=20
```

#### Confirm Order (Admin Only)
```http
PUT /api/v1/orders/{order_id}/confirm
```

#### Reject Order (Admin Only)
```http
PUT /api/v1/orders/{order_id}/reject?reason=Out of stock
```

#### Mark Order as Shipped (Admin Only)
```http
PUT /api/v1/orders/{order_id}/ship?tracking_number=TRK123456789
```

### Payments (`/api/v1/payments`)

#### Create Payment Intent
```http
POST /api/v1/payments/create-payment-intent/{order_id}
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
POST /api/v1/payments/confirm-payment/{order_id}
```

### Coupons (`/api/v1/coupons`)

#### Get Available Coupons
```http
GET /api/v1/coupons
```

#### Validate Coupon
```http
POST /api/v1/coupons/validate
```

**Request Body:**
```json
{
  "code": "SAVE20",
  "order_amount": 150.00,
  "user_id": "user_id"
}
```

#### Create Coupon (Admin Only)
```http
POST /api/v1/coupons
```

**Request Body:**
```json
{
  "code": "WELCOME10",
  "name": "Welcome Discount",
  "description": "10% off for new customers",
  "type": "percentage",
  "value": 10.0,
  "minimum_order_amount": 50.0,
  "usage_limit": 100,
  "valid_until": "2024-12-31T23:59:59Z"
}
```

### Reviews (`/api/v1/reviews`)

#### Get Product Reviews
```http
GET /api/v1/reviews/product/{product_id}?page=1&limit=10&rating=5
```

#### Create Review
```http
POST /api/v1/reviews
```

**Form Data:**
- `product_id`: Product ID
- `rating`: Rating (1-5)
- `title`: Review title (optional)
- `comment`: Review comment (optional)
- `images`: Review images (optional)

#### Get Review Statistics
```http
GET /api/v1/reviews/product/{product_id}/stats
```

### Wishlist (`/api/v1/wishlist`)

#### Get Wishlist
```http
GET /api/v1/wishlist
```

#### Add to Wishlist
```http
POST /api/v1/wishlist/add/{product_id}
```

#### Remove from Wishlist
```http
DELETE /api/v1/wishlist/remove/{product_id}
```

#### Get Wishlist Count
```http
GET /api/v1/wishlist/count
```

### Search (`/api/v1/search`)

#### Search Products
```http
GET /api/v1/search/products?q=leather jacket&category=jackets&min_price=100&sort_by=price
```

#### Get Search Suggestions
```http
GET /api/v1/search/suggestions?q=leath
```

#### Get Search Filters
```http
GET /api/v1/search/filters
```

#### Get Trending Products
```http
GET /api/v1/search/trending?limit=10&category=jackets
```

### File Upload (`/api/v1/upload`)

#### Upload Product Images (Admin Only)
```http
POST /api/v1/upload/product-images
```

**Form Data:**
- `files`: Multiple image files (max 10)

#### Upload Review Images
```http
POST /api/v1/upload/review-images
```

**Form Data:**
- `files`: Multiple image files (max 5)

#### Upload User Avatar
```http
POST /api/v1/upload/user-avatar
```

**Form Data:**
- `file`: Single image file

### Admin (`/api/v1/admin`)

#### Get Dashboard Statistics
```http
GET /api/v1/admin/dashboard/stats?period=30d
```

#### Get All Orders (Admin Only)
```http
GET /api/v1/admin/orders?status=confirmed&page=1&limit=20
```

#### Get All Users (Admin Only)
```http
GET /api/v1/admin/users?role=customer&page=1&limit=20
```

#### Get Sales Report
```http
GET /api/v1/admin/reports/sales?start_date=2024-01-01&end_date=2024-01-31&group_by=day
```

### Analytics (`/api/v1/analytics`)

#### Get Dashboard Analytics
```http
GET /api/v1/analytics/dashboard?period=30d
```

#### Get Sales Analytics
```http
GET /api/v1/analytics/sales?start_date=2024-01-01&end_date=2024-01-31&group_by=day
```

#### Get Product Analytics
```http
GET /api/v1/analytics/products?limit=10
```

#### Get User Analytics
```http
GET /api/v1/analytics/users?period=30d
```

### Notifications (`/api/v1/notifications`)

#### Send Email Notification (Admin Only)
```http
POST /api/v1/notifications/email
```

#### Send WhatsApp Notification (Admin Only)
```http
POST /api/v1/notifications/whatsapp
```

#### Get Notifications (Admin Only)
```http
GET /api/v1/notifications?type=order_request&status=sent&page=1&limit=20
```

### Pages (`/api/v1/pages`)

#### Get Page Content
```http
GET /api/v1/pages/{slug}
```

#### Create Page (Admin Only)
```http
POST /api/v1/pages
```

#### Update Page (Admin Only)
```http
PUT /api/v1/pages/{page_id}
```

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "status_code": 400
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `NOT_FOUND`: Resource not found
- `UNAUTHORIZED`: Authentication required
- `FORBIDDEN`: Insufficient permissions
- `CONFLICT`: Resource already exists
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_SERVER_ERROR`: Server error

## Rate Limiting

- Authentication endpoints: 5-10 requests per minute
- General API endpoints: 60 requests per minute
- File upload endpoints: 5-10 requests per minute

## Business Flow

1. **Customer browses products** (inventory quantities hidden)
2. **Customer places order request** (status: `pending_confirmation`)
3. **Admin receives notification** (email + optional WhatsApp)
4. **Admin checks with supplier** and confirms/rejects order
5. **If confirmed**: Customer receives payment link
6. **Customer pays**: Order status becomes `paid`
7. **Admin ships**: Order status becomes `shipped`
8. **Customer receives tracking info**

## Webhooks

### Stripe Webhook
```http
POST /api/v1/payments/webhook
```

**Headers:**
- `stripe-signature`: Stripe webhook signature

## Testing

Run the test suite:

```bash
pytest tests/
```

## Support

For API support, contact: support@zorelleather.com
