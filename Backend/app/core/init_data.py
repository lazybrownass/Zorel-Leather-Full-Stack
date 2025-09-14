from datetime import datetime, timedelta
from sqlalchemy import select
from app.models.sqlalchemy_models import User, Product, Coupon, Page, UserRole
from app.core.security import get_password_hash
from app.core.config import settings
from app.core.postgresql import get_db
import logging

logger = logging.getLogger(__name__)


async def create_admin_user():
    """Create default admin user if it doesn't exist"""
    async for session in get_db():
        try:
            # Check if admin user exists
            result = await session.execute(select(User).where(User.email == settings.ADMIN_EMAIL))
            admin_user = result.scalar_one_or_none()
            
            if not admin_user:
                admin_user = User(
                    name="Admin User",
                    email=settings.ADMIN_EMAIL,
                    username="admin",
                    password_hash=get_password_hash(settings.ADMIN_PASSWORD),
                    role=UserRole.ADMIN,
                    is_active=True,
                    is_verified=True
                )
                session.add(admin_user)
                await session.commit()
                logger.info("Admin user created successfully")
            else:
                logger.info("Admin user already exists")
        except Exception as e:
            await session.rollback()
            logger.error(f"Error creating admin user: {e}")
            raise
        finally:
            await session.close()
        break


async def create_super_admin_user():
    """Create default super admin user if it doesn't exist"""
    async for session in get_db():
        try:
            # Check if super admin user exists by email OR username
            result = await session.execute(
                select(User).where(
                    (User.email == settings.SUPER_ADMIN_EMAIL) | 
                    (User.username == "superadmin")
                )
            )
            super_admin_user = result.scalar_one_or_none()
            
            if not super_admin_user:
                super_admin_user = User(
                    name="Super Admin",
                    email=settings.SUPER_ADMIN_EMAIL,
                    username="superadmin",
                    password_hash=get_password_hash(settings.SUPER_ADMIN_PASSWORD),
                    role=UserRole.SUPER_ADMIN,
                    is_active=True,
                    is_verified=True
                )
                session.add(super_admin_user)
                await session.commit()
                logger.info("Super Admin user created successfully")
            else:
                logger.info("Super Admin user already exists")
        except Exception as e:
            await session.rollback()
            logger.error(f"Error creating super admin user: {e}")
            raise
        finally:
            await session.close()
        break


async def create_sample_products():
    """Create sample products for testing"""
    async for session in get_db():
        try:
            # Check if products already exist
            result = await session.execute(select(Product))
            existing_products = result.scalars().all()
            
            if len(existing_products) > 0:
                logger.info("Products already exist, skipping sample creation")
                return
            
            sample_products = [
                {
                    "name": "Premium Leather Jacket",
                    "description": "Handcrafted premium leather jacket with superior quality and timeless design. Perfect for any occasion.",
                    "price": 299.99,
                    "original_price": 249.99,
                    "images": ["/uploads/products/leather-jacket-1.jpg"],
                    "category": "jackets",
                    "tags": ["leather", "premium", "jacket", "men"],
                    "specifications": {
                        "Material": "100% Genuine Leather",
                        "Lining": "Polyester",
                        "Closure": "Zipper",
                        "Pockets": "4 Pockets"
                    },
                    "sizes": ["S", "M", "L", "XL"],
                    "colors": ["Black", "Brown"],
                    "stock_quantity": 50,
                    "is_featured": True
                },
                {
                    "name": "Classic Leather Boots",
                    "description": "Durable and stylish leather boots designed for comfort and longevity. Ideal for everyday wear.",
                    "price": 199.99,
                    "images": ["/uploads/products/leather-boots-1.jpg"],
                    "category": "shoes",
                    "tags": ["leather", "boots", "shoes", "men", "women"],
                    "specifications": {
                        "Material": "Genuine Leather",
                        "Sole": "Rubber",
                        "Heel": "Flat",
                        "Style": "Ankle Boot"
                    },
                    "sizes": ["7", "8", "9", "10", "11"],
                    "colors": ["Black", "Tan"],
                    "stock_quantity": 30,
                    "is_featured": False
                },
                {
                    "name": "Elegant Leather Handbag",
                    "description": "Sophisticated leather handbag with multiple compartments and elegant design. Perfect for professional and casual use.",
                    "price": 159.99,
                    "original_price": 129.99,
                    "images": ["/uploads/products/leather-handbag-1.jpg"],
                    "category": "accessories",
                    "tags": ["leather", "handbag", "women", "accessories"],
                    "specifications": {
                        "Material": "Premium Leather",
                        "Dimensions": "12 x 8 x 4 inches",
                        "Closure": "Magnetic Snap",
                        "Compartments": "3 Main + 2 Side"
                    },
                    "sizes": ["One Size"],
                    "colors": ["Black", "Brown", "Navy"],
                    "stock_quantity": 25,
                    "is_featured": True
                }
            ]
            
            for product_data in sample_products:
                product = Product(**product_data)
                session.add(product)
            
            await session.commit()
            logger.info(f"Created {len(sample_products)} sample products")
            
        except Exception as e:
            await session.rollback()
            logger.error(f"Error creating sample products: {e}")
            raise
        finally:
            await session.close()
        break


async def create_sample_coupons():
    """Create sample coupons"""
    async for session in get_db():
        try:
            # Check if coupons already exist
            result = await session.execute(select(Coupon))
            existing_coupons = result.scalars().all()
            
            if len(existing_coupons) > 0:
                logger.info("Coupons already exist, skipping sample creation")
                return
            
            sample_coupons = [
                {
                    "code": "WELCOME10",
                    "description": "10% off for new customers",
                    "discount_type": "percentage",
                    "discount_value": 10.0,
                    "minimum_amount": 50.0,
                    "usage_limit": 100,
                    "valid_from": datetime.utcnow(),
                    "valid_until": datetime.utcnow() + timedelta(days=30)
                },
                {
                    "code": "SAVE20",
                    "description": "$20 off orders over $100",
                    "discount_type": "fixed",
                    "discount_value": 20.0,
                    "minimum_amount": 100.0,
                    "usage_limit": 50,
                    "valid_from": datetime.utcnow(),
                    "valid_until": datetime.utcnow() + timedelta(days=60)
                },
                {
                    "code": "FREESHIP",
                    "description": "Free shipping on all orders",
                    "discount_type": "fixed",
                    "discount_value": 0.0,
                    "usage_limit": 200,
                    "valid_from": datetime.utcnow(),
                    "valid_until": datetime.utcnow() + timedelta(days=90)
                }
            ]
            
            for coupon_data in sample_coupons:
                coupon = Coupon(**coupon_data)
                session.add(coupon)
            
            await session.commit()
            logger.info(f"Created {len(sample_coupons)} sample coupons")
            
        except Exception as e:
            await session.rollback()
            logger.error(f"Error creating sample coupons: {e}")
            raise
        finally:
            await session.close()
        break


async def create_sample_pages():
    """Create sample CMS pages"""
    async for session in get_db():
        try:
            # Check if pages already exist
            result = await session.execute(select(Page))
            existing_pages = result.scalars().all()
            
            if len(existing_pages) > 0:
                logger.info("Pages already exist, skipping sample creation")
                return
            
            sample_pages = [
                {
                    "slug": "about",
                    "title": "About ZOREL LEATHER",
                    "content": """
                    <h1>About ZOREL LEATHER</h1>
                    <p>Welcome to ZOREL LEATHER, your premier destination for high-quality leather products. 
                    We specialize in crafting exceptional leather goods that combine traditional craftsmanship 
                    with modern design.</p>
                    
                    <h2>Our Story</h2>
                    <p>Founded with a passion for quality and authenticity, ZOREL LEATHER has been providing 
                    customers with premium leather products for years. Our commitment to excellence and 
                    attention to detail sets us apart in the industry.</p>
                    
                    <h2>Our Mission</h2>
                    <p>To deliver the finest leather products while maintaining the highest standards of 
                    quality, craftsmanship, and customer service.</p>
                    """,
                    "meta_title": "About ZOREL LEATHER - Premium Leather Products",
                    "meta_description": "Learn about ZOREL LEATHER's commitment to quality leather products and craftsmanship.",
                    "is_published": True
                },
                {
                    "slug": "privacy-policy",
                    "title": "Privacy Policy",
                    "content": """
                    <h1>Privacy Policy</h1>
                    <p>This Privacy Policy describes how ZOREL LEATHER collects, uses, and protects your 
                    personal information when you use our website and services.</p>
                    
                    <h2>Information We Collect</h2>
                    <ul>
                        <li>Personal information (name, email, address)</li>
                        <li>Payment information (processed securely)</li>
                        <li>Usage data and analytics</li>
                    </ul>
                    
                    <h2>How We Use Your Information</h2>
                    <p>We use your information to process orders, provide customer service, and improve 
                    our products and services.</p>
                    """,
                    "meta_title": "Privacy Policy - ZOREL LEATHER",
                    "meta_description": "ZOREL LEATHER's privacy policy and data protection practices.",
                    "is_published": True
                },
                {
                    "slug": "return-policy",
                    "title": "Return Policy",
                    "content": """
                    <h1>Return Policy</h1>
                    <p>We want you to be completely satisfied with your purchase. If you're not happy 
                    with your order, we offer a hassle-free return policy.</p>
                    
                    <h2>Return Conditions</h2>
                    <ul>
                        <li>Items must be returned within 30 days of purchase</li>
                        <li>Items must be in original condition</li>
                        <li>Original packaging and tags required</li>
                    </ul>
                    
                    <h2>How to Return</h2>
                    <p>Contact our customer service team to initiate a return. We'll provide you with 
                    a return authorization and shipping instructions.</p>
                    """,
                    "meta_title": "Return Policy - ZOREL LEATHER",
                    "meta_description": "ZOREL LEATHER's return and exchange policy for leather products.",
                    "is_published": True
                }
            ]
            
            for page_data in sample_pages:
                page = Page(**page_data)
                session.add(page)
            
            await session.commit()
            logger.info(f"Created {len(sample_pages)} sample pages")
            
        except Exception as e:
            await session.rollback()
            logger.error(f"Error creating sample pages: {e}")
            raise
        finally:
            await session.close()
        break


async def initialize_data():
    """Initialize all sample data"""
    try:
        await create_super_admin_user()
        await create_admin_user()
        await create_sample_products()
        await create_sample_coupons()
        await create_sample_pages()
        logger.info("Data initialization completed successfully")
    except Exception as e:
        logger.error(f"Error during data initialization: {str(e)}")
        raise
