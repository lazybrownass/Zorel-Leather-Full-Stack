#!/usr/bin/env python3

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.models.sqlalchemy_models import Product
from app.core.postgresql import get_db
from sqlalchemy import select

async def check_products():
    print("=== CHECKING PRODUCTS IN DATABASE ===")
    
    async for db in get_db():
        try:
            # Count total products
            result = await db.execute(select(func.count(Product.id)))
            total_products = result.scalar()
            print(f"Total products in database: {total_products}")
            
            if total_products > 0:
                # Get first 5 products
                result = await db.execute(select(Product).limit(5))
                products = result.scalars().all()
                
                print(f"\nFirst {len(products)} products:")
                for product in products:
                    print(f"- ID: {product.id}, Name: {product.name}, Category: {product.category}, Active: {product.is_active}")
            else:
                print("No products found in database!")
                
        except Exception as e:
            print(f"Database error: {e}")
        finally:
            await db.close()
        break

if __name__ == "__main__":
    from sqlalchemy import func
    asyncio.run(check_products())
