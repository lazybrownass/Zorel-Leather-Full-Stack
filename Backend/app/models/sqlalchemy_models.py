from sqlalchemy import (
    Column, Integer, String, Boolean, DateTime, Text, 
    Float, ForeignKey, Enum, JSON, ARRAY, UUID
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy.sql import func
from app.core.postgresql import Base
from enum import Enum as PyEnum
import uuid

# Enums
class UserRole(PyEnum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    CUSTOMER = "customer"

class OrderStatus(PyEnum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PROCESSING = "processing"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"

class PaymentMethod(PyEnum):
    COD = "cod"
    ONLINE = "online"
    BANK_TRANSFER = "bank_transfer"
    CHEQUE = "cheque"

class PaymentStatus(PyEnum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class AdminRequestStatus(PyEnum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

# User Model
class User(Base):
    __tablename__ = "users"
    
    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=True)  # Made nullable for OAuth users
    name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    phone = Column(String(20), nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    employee_id = Column(String(50), nullable=True)
    profile_image = Column(String(500), nullable=True)
    google_id = Column(String(100), unique=True, nullable=True, index=True)  # Google OAuth ID
    addresses = Column(JSON, default=list)  # List of address objects
    preferences = Column(JSON, default=dict)  # User preferences
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    orders = relationship("Order", back_populates="user")
    reviews = relationship("Review", back_populates="user")
    wishlist_items = relationship("Wishlist", back_populates="user")
    cart_items = relationship("Cart", back_populates="user")

# Product Model
class Product(Base):
    __tablename__ = "products"
    
    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=True, index=True)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    original_price = Column(Float, nullable=True)
    category = Column(String(100), nullable=False, index=True)
    subcategory = Column(String(100), nullable=True)
    brand = Column(String(100), nullable=True)
    sku = Column(String(100), unique=True, nullable=True)
    images = Column(ARRAY(String), default=list)  # Array of image URLs
    specifications = Column(JSON, default=dict)  # Product specifications
    features = Column(ARRAY(String), default=list)  # Product features
    sizes = Column(ARRAY(String), default=list)  # Available sizes
    colors = Column(ARRAY(String), default=list)  # Available colors
    stock_quantity = Column(Integer, default=0)
    is_active = Column(Boolean, default=True, nullable=False)
    is_featured = Column(Boolean, default=False, nullable=False)
    tags = Column(ARRAY(String), default=list)  # Product tags
    seo_title = Column(String(255), nullable=True)
    seo_description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("Review", back_populates="product")
    wishlist_items = relationship("Wishlist", back_populates="product")
    cart_items = relationship("Cart", back_populates="product")

# Order Model
class Order(Base):
    __tablename__ = "orders"
    
    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PostgresUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=True)
    order_number = Column(String(50), unique=True, nullable=False, index=True)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, nullable=False)
    total_amount = Column(Float, nullable=False)
    gst_amount = Column(Float, default=0.0)
    payment_method = Column(Enum(PaymentMethod), nullable=False)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    payment_reference = Column(String(255), nullable=True)
    payment_date = Column(DateTime, nullable=True)
    shipping_address = Column(JSON, nullable=False)  # Shipping address object
    billing_address = Column(JSON, nullable=True)  # Billing address object
    shipping_company = Column(String(100), nullable=True)
    tracking_number = Column(String(100), nullable=True)
    estimated_delivery = Column(DateTime, nullable=True)
    actual_delivery = Column(DateTime, nullable=True)
    admin_notes = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)
    assigned_to = Column(String(100), nullable=True)
    customer_notes = Column(Text, nullable=True)
    communication_log = Column(JSON, default=list)  # Communication history
    confirmed_at = Column(DateTime, nullable=True)
    shipped_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="orders")
    order_items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="order")

# Order Item Model
class OrderItem(Base):
    __tablename__ = "order_items"
    
    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(PostgresUUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    product_id = Column(PostgresUUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)  # Price at time of order
    size = Column(String(50), nullable=True)
    color = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="order_items")
    product = relationship("Product", back_populates="order_items")

# Review Model
class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PostgresUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    product_id = Column(PostgresUUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5 stars
    title = Column(String(255), nullable=True)
    comment = Column(Text, nullable=True)
    images = Column(ARRAY(String), default=list)  # Review images
    is_verified_purchase = Column(Boolean, default=False, nullable=False)
    is_approved = Column(Boolean, default=True, nullable=False)
    helpful_count = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")

# Wishlist Model
class Wishlist(Base):
    __tablename__ = "wishlist"
    
    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PostgresUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    product_id = Column(PostgresUUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    personal_note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="wishlist_items")
    product = relationship("Product", back_populates="wishlist_items")

# Cart Model
class Cart(Base):
    __tablename__ = "cart"
    
    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PostgresUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    product_id = Column(PostgresUUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    size = Column(String(50), nullable=True)
    color = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product", back_populates="cart_items")

# Invoice Model
class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(PostgresUUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    user_id = Column(PostgresUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    invoice_number = Column(String(50), unique=True, nullable=False, index=True)
    issue_date = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=True)
    items = Column(JSON, nullable=False)  # Invoice items
    subtotal = Column(Float, nullable=False)
    gst_amount = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    payment_method = Column(Enum(PaymentMethod), nullable=True)
    billing_address = Column(JSON, nullable=False)
    shipping_address = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    order = relationship("Order", back_populates="invoices")

# Admin Request Model
class AdminRequest(Base):
    __tablename__ = "admin_requests"
    
    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    date_of_birth = Column(DateTime, nullable=True)
    employee_id = Column(String(50), nullable=True)
    status = Column(Enum(AdminRequestStatus), default=AdminRequestStatus.PENDING, nullable=False)
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    approved_by = Column(PostgresUUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    
    # Relationships
    approver = relationship("User", foreign_keys=[approved_by])

# Notification Model
class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PostgresUUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)  # email, sms, push, etc.
    is_read = Column(Boolean, default=False, nullable=False)
    notification_data = Column(JSON, default=dict)  # Additional notification data
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")

# Page Model (for CMS)
class Page(Base):
    __tablename__ = "pages"
    
    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    content = Column(Text, nullable=True)
    meta_title = Column(String(255), nullable=True)
    meta_description = Column(Text, nullable=True)
    is_published = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Coupon Model
class Coupon(Base):
    __tablename__ = "coupons"
    
    id = Column(PostgresUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    discount_type = Column(String(20), nullable=False)  # percentage, fixed
    discount_value = Column(Float, nullable=False)
    minimum_amount = Column(Float, nullable=True)
    maximum_discount = Column(Float, nullable=True)
    usage_limit = Column(Integer, nullable=True)
    used_count = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    valid_from = Column(DateTime, nullable=False)
    valid_until = Column(DateTime, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
