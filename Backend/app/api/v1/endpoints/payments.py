from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from app.models.sqlalchemy_models import User, Order
from app.core.security import get_current_active_user, require_roles, UserRole
from app.services.payment_service import PaymentService
from app.core.exceptions import NotFoundException, ForbiddenException
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/create-payment-intent/{order_id}")
async def create_payment_intent(
    order_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Create a payment intent for an order"""
    # Get order
    order = await Order.get(order_id)
    if not order:
        raise NotFoundException("Order not found")
    
    # Check if user owns this order
    if order.user_id != str(current_user.id):
        raise ForbiddenException("Access denied")
    
    # Check if order is confirmed
    if order.status != "confirmed":
        raise HTTPException(
            status_code=400, 
            detail="Order must be confirmed before payment"
        )
    
    # Create payment intent
    payment_service = PaymentService()
    try:
        result = await payment_service.create_payment_intent(order)
        return result
    except Exception as e:
        logger.error(f"Error creating payment intent: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create payment intent"
        )


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    
    if not sig_header:
        raise HTTPException(
            status_code=400,
            detail="Missing stripe-signature header"
        )
    
    payment_service = PaymentService()
    success = await payment_service.handle_webhook(payload, sig_header)
    
    if success:
        return {"status": "success"}
    else:
        raise HTTPException(
            status_code=400,
            detail="Webhook processing failed"
        )


@router.post("/confirm-payment/{order_id}")
async def confirm_payment(
    order_id: str,
    current_user: User = Depends(get_current_active_user)
):
    """Confirm payment for an order"""
    # Get order
    order = await Order.get(order_id)
    if not order:
        raise NotFoundException("Order not found")
    
    # Check if user owns this order
    if order.user_id != str(current_user.id):
        raise ForbiddenException("Access denied")
    
    if not order.payment_intent_id:
        raise HTTPException(
            status_code=400,
            detail="No payment intent found for this order"
        )
    
    # Confirm payment
    payment_service = PaymentService()
    success = await payment_service.confirm_payment(order.payment_intent_id)
    
    if success:
        return {"message": "Payment confirmed successfully"}
    else:
        raise HTTPException(
            status_code=400,
            detail="Payment confirmation failed"
        )


@router.post("/refund/{order_id}")
async def refund_order(
    order_id: str,
    amount: float = None,
    current_user: User = Depends(require_roles(UserRole.ADMIN))
):
    """Refund an order (Admin only)"""
    # Get order
    order = await Order.get(order_id)
    if not order:
        raise NotFoundException("Order not found")
    
    if order.payment_status != "paid":
        raise HTTPException(
            status_code=400,
            detail="Order must be paid before refund"
        )
    
    # Process refund
    payment_service = PaymentService()
    success = await payment_service.refund_payment(order, amount)
    
    if success:
        return {"message": "Refund processed successfully"}
    else:
        raise HTTPException(
            status_code=500,
            detail="Refund processing failed"
        )
