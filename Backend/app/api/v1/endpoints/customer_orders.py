from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime, date
from app.models.sqlalchemy_models import Order, OrderStatus, PaymentStatus, User, Cart
from app.schemas.order import OrderCreate, OrderResponse
from app.core.security import get_current_active_user
from app.services.notification_service import NotificationService
from app.core.postgresql import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, desc, asc, func
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/", response_model=List[OrderResponse])
async def get_my_orders(
    status: Optional[OrderStatus] = Query(None),
    payment_status: Optional[PaymentStatus] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get current user's orders"""
    try:
        # Build query
        query = select(Order).where(Order.user_id == current_user.id)
        if status:
            query = query.where(Order.status == status)
        if payment_status:
            query = query.where(Order.payment_status == payment_status)
        
        # Pagination
        offset = (page - 1) * limit
        
        query = query.order_by(desc(Order.created_at)).offset(offset).limit(limit)
        result = await db.execute(query)
        orders = result.scalars().all()
        
        # Convert to response format
        order_responses = []
        for order in orders:
            # Get order items
            items_result = await db.execute(
                select(OrderItem).where(OrderItem.order_id == order.id)
            )
            items = items_result.scalars().all()
            
            items_response = [
                OrderItemResponse(
                    id=str(item.id),
                    product_id=str(item.product_id),
                    quantity=item.quantity,
                    price=item.price
                )
                for item in items
            ]
            
            order_responses.append(OrderResponse(
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
            ))
        
        return order_responses
        
    except Exception as e:
        logger.error(f"Error fetching user orders: {str(e)}")
        logger.error(f"Error type: {type(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch orders"
        )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order_details(
    order_id: str,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get details of a specific order"""
    try:
        import uuid
        
        # Validate UUID format
        try:
            order_uuid = uuid.UUID(order_id)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        query = select(Order).where(Order.id == order_uuid)
        result = await db.execute(query)
        order = result.scalar_one_or_none()
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        # Check if user owns this order
        if order.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        # Get order items
        items_result = await db.execute(
            select(OrderItem).where(OrderItem.order_id == order.id)
        )
        items = items_result.scalars().all()
        
        items_response = [
            OrderItemResponse(
                id=str(item.id),
                product_id=str(item.product_id),
                quantity=item.quantity,
                price=item.price
            )
            for item in items
        ]
        
        return OrderResponse(
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
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching order details: {str(e)}")
        logger.error(f"Error type: {type(e)}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch order details"
        )


@router.post("/create", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new order from cart or direct purchase"""
    try:
        from app.models.sqlalchemy_models import OrderStatus, PaymentStatus, PaymentMethod
        import uuid
        
        # Calculate totals
        subtotal = sum(item.price * item.quantity for item in order_data.items)
        shipping_cost = 9.99 if subtotal < 200 else 0  # Free shipping over $200
        tax = subtotal * 0.08  # 8% tax
        total = subtotal + shipping_cost + tax
        
        # Create order
        order = Order(
            id=uuid.uuid4(),
            user_id=current_user.id,
            order_number=f"ORD-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:8].upper()}",
            status=OrderStatus.PENDING,
            total_amount=total,
            gst_amount=tax,
            payment_method=PaymentMethod.CREDIT_CARD,
            payment_status=PaymentStatus.PENDING,
            shipping_address=order_data.shipping_address,
            customer_notes=order_data.notes,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(order)
        await db.commit()
        await db.refresh(order)
        
        # Send notification to admin
        notification_service = NotificationService()
        await notification_service.send_order_request_notification(order)
        
        logger.info(f"Order created: {str(order.id)} by user {current_user.email}")
        
        return OrderResponse(
            id=str(order.id),
            user_id=str(order.user_id),
            order_number=order.order_number,
            status=order.status.value,
            total_amount=order.total_amount,
            gst_amount=order.gst_amount,
            payment_method=order.payment_method.value,
            payment_status=order.payment_status.value,
            payment_reference=order.payment_reference,
            payment_date=order.payment_date,
            shipping_address=order.shipping_address,
            billing_address=order.billing_address,
            shipping_company=order.shipping_company,
            tracking_number=order.tracking_number,
            estimated_delivery=order.estimated_delivery,
            actual_delivery=order.actual_delivery,
            admin_notes=order.admin_notes,
            internal_notes=order.internal_notes,
            assigned_to=order.assigned_to,
            customer_notes=order.customer_notes,
            communication_log=order.communication_log,
            confirmed_at=order.confirmed_at,
            shipped_at=order.shipped_at,
            delivered_at=order.delivered_at,
            created_at=order.created_at,
            updated_at=order.updated_at
        )
        
    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order"
        )


@router.post("/create-from-cart", response_model=OrderResponse)
async def create_order_from_cart(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Create an order from the user's cart"""
    try:
        # Get user's cart
        cart_query = select(Cart).where(Cart.user_id == current_user.id)
        cart_result = await db.execute(cart_query)
        cart = cart_result.scalar_one_or_none()
        
        if not cart or not cart.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cart is empty"
            )
        
        # Convert cart items to order items
        order_items = []
        for cart_item in cart.items:
            order_items.append({
                "product_id": cart_item.product_id,
                "product_name": "",  # Will be filled from product data
                "product_image": "",  # Will be filled from product data
                "quantity": cart_item.quantity,
                "price": 0.0,  # Will be filled from product data
                "size": cart_item.size,
                "color": cart_item.color
            })
        
        # Get product details and calculate totals
        subtotal = 0.0
        for item in order_items:
            # Note: In a real implementation, you'd fetch product details here
            # For now, we'll use placeholder values
            item["product_name"] = "Product Name"  # Fetch from Product model
            item["product_image"] = "/placeholder.svg"  # Fetch from Product model
            item["price"] = 100.0  # Fetch from Product model
            subtotal += item["price"] * item["quantity"]
        
        shipping_cost = 9.99 if subtotal < 200 else 0
        tax = subtotal * 0.08
        total = subtotal + shipping_cost + tax
        
        # Create order
        from app.models.sqlalchemy_models import OrderStatus, PaymentStatus, PaymentMethod
        import uuid
        
        order = Order(
            id=uuid.uuid4(),
            user_id=current_user.id,
            order_number=f"ORD-{datetime.now().strftime('%Y%m%d%H%M%S')}-{str(uuid.uuid4())[:8].upper()}",
            status=OrderStatus.PENDING,
            total_amount=total,
            gst_amount=tax,
            payment_method=PaymentMethod.CREDIT_CARD,
            payment_status=PaymentStatus.PENDING,
            shipping_address=current_user.addresses[0] if current_user.addresses else None,  # Use default address
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.add(order)
        await db.commit()
        await db.refresh(order)
        
        # Clear cart after successful order creation
        cart.items = []
        await db.commit()
        await db.refresh(cart)
        
        # Send notification to admin
        notification_service = NotificationService()
        await notification_service.send_order_request_notification(order)
        
        logger.info(f"Order created from cart: {str(order.id)} by user {current_user.email}")
        
        return OrderResponse(
            id=str(order.id),
            user_id=str(order.user_id),
            order_number=order.order_number,
            status=order.status.value,
            total_amount=order.total_amount,
            gst_amount=order.gst_amount,
            payment_method=order.payment_method.value,
            payment_status=order.payment_status.value,
            payment_reference=order.payment_reference,
            payment_date=order.payment_date,
            shipping_address=order.shipping_address,
            billing_address=order.billing_address,
            shipping_company=order.shipping_company,
            tracking_number=order.tracking_number,
            estimated_delivery=order.estimated_delivery,
            actual_delivery=order.actual_delivery,
            admin_notes=order.admin_notes,
            internal_notes=order.internal_notes,
            assigned_to=order.assigned_to,
            customer_notes=order.customer_notes,
            communication_log=order.communication_log,
            confirmed_at=order.confirmed_at,
            shipped_at=order.shipped_at,
            delivered_at=order.delivered_at,
            created_at=order.created_at,
            updated_at=order.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating order from cart: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create order from cart"
        )


@router.get("/stats/summary")
async def get_order_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """Get order statistics for current user"""
    try:
        # Get all user orders
        orders_query = select(Order).where(Order.user_id == current_user.id)
        orders_result = await db.execute(orders_query)
        orders = orders_result.scalars().all()
        
        # Calculate statistics
        total_orders = len(orders)
        total_spent = sum(order.total_amount for order in orders if order.payment_status == PaymentStatus.COMPLETED)
        average_order_value = total_spent / total_orders if total_orders > 0 else 0
        
        # Status breakdown
        status_breakdown = {}
        for status in OrderStatus:
            count = len([order for order in orders if order.status == status])
            status_breakdown[status.value] = count
        
        # Recent orders
        recent_orders = sorted(orders, key=lambda x: x.created_at, reverse=True)[:5]
        recent_orders_data = [
            {
                "id": str(order.id),
                "status": order.status.value,
                "total": order.total_amount,
                "created_at": order.created_at
            }
            for order in recent_orders
        ]
        
        return {
            "total_orders": total_orders,
            "total_spent": total_spent,
            "average_order_value": average_order_value,
            "status_breakdown": status_breakdown,
            "recent_orders": recent_orders_data
        }
        
    except Exception as e:
        logger.error(f"Error fetching order stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch order statistics"
        )
