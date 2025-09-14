from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, products, orders, notifications, pages, admin, payments,
    coupons, reviews, wishlist, upload, search, analytics, admin_auth, whatsapp, admin_requests,
    admin_products, admin_orders, admin_customers, admin_invoices, admin_analytics,
    cart, customer_orders, customer_profile, google_oauth
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(google_oauth.router, prefix="", tags=["google-oauth"])
api_router.include_router(products.router, prefix="/products", tags=["products"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(pages.router, prefix="/pages", tags=["pages"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(payments.router, prefix="/payments", tags=["payments"])
api_router.include_router(coupons.router, prefix="/coupons", tags=["coupons"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
api_router.include_router(wishlist.router, prefix="/wishlist", tags=["wishlist"])
api_router.include_router(upload.router, prefix="/upload", tags=["upload"])
api_router.include_router(search.router, prefix="/search", tags=["search"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(admin_auth.router, prefix="/admin", tags=["admin-auth"])
api_router.include_router(whatsapp.router, prefix="/whatsapp", tags=["whatsapp"])
api_router.include_router(admin_requests.router, prefix="/admin-requests", tags=["admin-requests"])

# Admin Management APIs
api_router.include_router(admin_products.router, prefix="/admin/products", tags=["admin-products"])
api_router.include_router(admin_orders.router, prefix="/admin/orders", tags=["admin-orders"])
api_router.include_router(admin_customers.router, prefix="/admin/customers", tags=["admin-customers"])
api_router.include_router(admin_invoices.router, prefix="/admin/invoices", tags=["admin-invoices"])
api_router.include_router(admin_analytics.router, prefix="/admin/analytics", tags=["admin-analytics"])

# Customer APIs
api_router.include_router(cart.router, prefix="/cart", tags=["cart"])
api_router.include_router(customer_orders.router, prefix="/customer/orders", tags=["customer-orders"])
api_router.include_router(customer_profile.router, prefix="/customer/profile", tags=["customer-profile"])
