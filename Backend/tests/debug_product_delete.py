#!/usr/bin/env python3
"""
Debug script to test product deletion
"""

import asyncio
import uuid
from app.core.postgresql import get_db
from app.models.sqlalchemy_models import Product, OrderItem, Cart
from sqlalchemy import select

async def debug_product_delete():
    """Debug product deletion"""
    print("🔍 Debugging product deletion...")
    
    async for db in get_db():
        try:
            # Get a test product
            result = await db.execute(select(Product).limit(1))
            product = result.scalar_one_or_none()
            
            if not product:
                print("❌ No products found in database")
                return
            
            print(f"📦 Found product: {product.id} - {product.name}")
            
            # Check for order items referencing this product
            order_items_result = await db.execute(
                select(OrderItem).where(OrderItem.product_id == product.id)
            )
            order_items = order_items_result.scalars().all()
            print(f"📋 Order items referencing this product: {len(order_items)}")
            
            # Check for cart items referencing this product
            cart_items_result = await db.execute(
                select(Cart).where(Cart.product_id == product.id)
            )
            cart_items = cart_items_result.scalars().all()
            print(f"🛒 Cart items referencing this product: {len(cart_items)}")
            
            if order_items:
                print("⚠️  Cannot delete product - it has associated order items")
                for item in order_items:
                    print(f"   Order Item: {item.id} in Order: {item.order_id}")
            elif cart_items:
                print("⚠️  Cannot delete product - it has associated cart items")
                for item in cart_items:
                    print(f"   Cart Item: {item.id} for User: {item.user_id}")
            else:
                print("✅ Product can be safely deleted")
                
                # Try to delete the product
                try:
                    await db.delete(product)
                    await db.commit()
                    print("✅ Product deleted successfully")
                except Exception as e:
                    await db.rollback()
                    print(f"❌ Failed to delete product: {str(e)}")
        
        except Exception as e:
            print(f"❌ Database error: {str(e)}")
        
        break

if __name__ == "__main__":
    asyncio.run(debug_product_delete())
