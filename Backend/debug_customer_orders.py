#!/usr/bin/env python3
"""
Debug script to test customer orders endpoint
"""

import asyncio
import uuid
from app.core.postgresql import get_db
from app.models.sqlalchemy_models import Order, OrderItem, User
from sqlalchemy import select
from app.schemas.order import OrderResponse, OrderItemResponse

async def debug_customer_orders():
    """Debug customer orders endpoint"""
    print("🔍 Debugging customer orders endpoint...")
    
    async for db in get_db():
        try:
            # Get a test user
            result = await db.execute(select(User).limit(1))
            user = result.scalar_one_or_none()
            
            if not user:
                print("❌ No users found in database")
                return
            
            print(f"👤 Found user: {user.id} - {user.email}")
            
            # Get orders for this user
            orders_result = await db.execute(
                select(Order).where(Order.user_id == user.id)
            )
            orders = orders_result.scalars().all()
            
            print(f"📦 Found {len(orders)} orders for user")
            
            for i, order in enumerate(orders):
                print(f"\n📦 Order {i+1}:")
                print(f"   ID: {order.id}")
                print(f"   Customer Name: {order.customer_name}")
                print(f"   Status: {order.status}")
                print(f"   Total Amount: {order.total_amount}")
                
                # Get order items
                items_result = await db.execute(
                    select(OrderItem).where(OrderItem.order_id == order.id)
                )
                items = items_result.scalars().all()
                
                print(f"   Items: {len(items)}")
                for j, item in enumerate(items):
                    print(f"     Item {j+1}: {item.product_id} - Qty: {item.quantity} - Price: {item.price}")
                
                # Try to create OrderResponse
                try:
                    items_response = [
                        OrderItemResponse(
                            id=str(item.id),
                            product_id=str(item.product_id),
                            quantity=item.quantity,
                            price=item.price
                        )
                        for item in items
                    ]
                    
                    order_response = OrderResponse(
                        id=str(order.id),
                        customer_name=order.customer_name,
                        customer_email=order.customer_email,
                        customer_phone=order.customer_phone,
                        shipping_address=order.shipping_address,
                        items=items_response,
                        status=order.status,
                        payment_status=order.payment_status,
                        payment_method=order.payment_method,
                        total_amount=order.total_amount,
                        tracking_number=order.tracking_number,
                        notes=order.customer_notes,
                        created_at=order.created_at,
                        updated_at=order.updated_at
                    )
                    print("   ✅ OrderResponse created successfully")
                except Exception as e:
                    print(f"   ❌ OrderResponse creation failed: {str(e)}")
                    print(f"   Error type: {type(e)}")
        
        except Exception as e:
            print(f"❌ Database error: {str(e)}")
        
        break

if __name__ == "__main__":
    asyncio.run(debug_customer_orders())
