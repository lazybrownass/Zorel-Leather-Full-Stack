import stripe
from typing import Optional
from datetime import datetime
from app.core.config import settings
from app.models.sqlalchemy_models import Order, PaymentStatus, OrderStatus
from app.services.notification_service import NotificationService
import logging

logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY


class PaymentService:
    def __init__(self):
        self.notification_service = NotificationService()

    async def create_payment_intent(self, order: Order) -> dict:
        """Create a Stripe payment intent for an order"""
        try:
            # Create payment intent
            intent = stripe.PaymentIntent.create(
                amount=int(order.total * 100),  # Convert to cents
                currency='usd',
                metadata={
                    'order_id': str(order.id),
                    'user_id': order.user_id
                },
                description=f"ZOREL LEATHER Order #{str(order.id)[:8]}"
            )
            
            # Update order with payment intent ID
            order.payment_intent_id = intent.id
            # Note: This would need to be called with a database session
            # await db.commit()
            # await db.refresh(order)
            
            return {
                "client_secret": intent.client_secret,
                "payment_intent_id": intent.id
            }
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating payment intent: {str(e)}")
            raise Exception(f"Payment processing error: {str(e)}")

    async def confirm_payment(self, payment_intent_id: str) -> bool:
        """Confirm payment and update order status"""
        try:
            # Retrieve payment intent from Stripe
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            if intent.status == 'succeeded':
                # Find order by payment intent ID
                order = await Order.find_one(Order.payment_intent_id == payment_intent_id)
                if not order:
                    logger.error(f"Order not found for payment intent: {payment_intent_id}")
                    return False
                
                # Update order status
                order.payment_status = PaymentStatus.PAID
                order.status = OrderStatus.PAID
                order.updated_at = datetime.utcnow()
                # Note: This would need to be called with a database session
                # await db.commit()
                # await db.refresh(order)
                
                # Send payment confirmation notification
                await self.notification_service.send_payment_confirmation_notification(order)
                
                logger.info(f"Payment confirmed for order: {order.id}")
                return True
            else:
                logger.warning(f"Payment not succeeded for intent: {payment_intent_id}, status: {intent.status}")
                return False
                
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error confirming payment: {str(e)}")
            return False

    async def handle_webhook(self, payload: bytes, sig_header: str) -> bool:
        """Handle Stripe webhook events"""
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
            
            # Handle the event
            if event['type'] == 'payment_intent.succeeded':
                payment_intent = event['data']['object']
                await self.confirm_payment(payment_intent['id'])
            elif event['type'] == 'payment_intent.payment_failed':
                payment_intent = event['data']['object']
                await self.handle_payment_failure(payment_intent['id'])
            
            return True
            
        except ValueError as e:
            logger.error(f"Invalid payload: {str(e)}")
            return False
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid signature: {str(e)}")
            return False

    async def handle_payment_failure(self, payment_intent_id: str):
        """Handle failed payment"""
        try:
            # Note: This would need to be called with a database session
            # order = await db.execute(select(Order).where(Order.payment_intent_id == payment_intent_id)).scalar_one_or_none()
            # if order:
            #     order.payment_status = PaymentStatus.FAILED
            #     order.updated_at = datetime.utcnow()
            #     await db.commit()
            #     await db.refresh(order)
                
                logger.info(f"Payment failed for order: {order.id}")
                
        except Exception as e:
            logger.error(f"Error handling payment failure: {str(e)}")

    async def refund_payment(self, order: Order, amount: Optional[float] = None) -> bool:
        """Refund a payment"""
        try:
            if not order.payment_intent_id:
                logger.error(f"No payment intent ID for order: {order.id}")
                return False
            
            # Retrieve payment intent
            intent = stripe.PaymentIntent.retrieve(order.payment_intent_id)
            
            # Create refund
            refund_amount = int((amount or order.total) * 100)  # Convert to cents
            refund = stripe.Refund.create(
                payment_intent=order.payment_intent_id,
                amount=refund_amount
            )
            
            if refund.status == 'succeeded':
                order.payment_status = PaymentStatus.REFUNDED
                order.updated_at = datetime.utcnow()
                # Note: This would need to be called with a database session
                # await db.commit()
                # await db.refresh(order)
                
                logger.info(f"Refund successful for order: {order.id}")
                return True
            else:
                logger.error(f"Refund failed for order: {order.id}")
                return False
                
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error processing refund: {str(e)}")
            return False
