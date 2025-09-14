import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
from twilio.rest import Client
import httpx
import json
from app.core.config import settings
from app.models.sqlalchemy_models import Notification, Order, User
from app.schemas.notification import NotificationType, NotificationStatus, NotificationChannel
from jinja2 import Template
import logging

logger = logging.getLogger(__name__)


class NotificationService:
    def __init__(self):
        self.smtp_config = {
            "hostname": settings.SMTP_HOST,
            "port": settings.SMTP_PORT,
            "username": settings.SMTP_USERNAME,
            "password": settings.SMTP_PASSWORD,
            "use_tls": True
        }
        
        # Initialize Twilio client if credentials are provided
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            self.twilio_client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        else:
            self.twilio_client = None

    async def send_email(self, to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
        """Send email notification"""
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = settings.EMAIL_FROM
            message["To"] = to_email

            # Add text content if provided
            if text_content:
                text_part = MIMEText(text_content, "plain")
                message.attach(text_part)

            # Add HTML content
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)

            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.smtp_config["hostname"],
                port=self.smtp_config["port"],
                username=self.smtp_config["username"],
                password=self.smtp_config["password"],
                use_tls=self.smtp_config["use_tls"]
            )
            
            logger.info(f"Email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    async def send_whatsapp(self, to_phone: str, message: str) -> bool:
        """Send WhatsApp notification using Twilio or WhatsApp Business API"""
        # Try Twilio first if configured
        if self.twilio_client:
            return await self._send_whatsapp_twilio(to_phone, message)
        
        # Try WhatsApp Business API if configured
        if settings.WHATSAPP_BUSINESS_API_TOKEN and settings.WHATSAPP_BUSINESS_PHONE_NUMBER_ID:
            return await self._send_whatsapp_business_api(to_phone, message)
        
        logger.warning("No WhatsApp service configured (Twilio or WhatsApp Business API)")
        return False

    async def _send_whatsapp_twilio(self, to_phone: str, message: str) -> bool:
        """Send WhatsApp notification via Twilio"""
        try:
            # Format phone number for WhatsApp
            if not to_phone.startswith("whatsapp:"):
                to_phone = f"whatsapp:{to_phone}"
            
            self.twilio_client.messages.create(
                body=message,
                from_=settings.TWILIO_WHATSAPP_NUMBER,
                to=to_phone
            )
            
            logger.info(f"WhatsApp message sent successfully via Twilio to {to_phone}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send WhatsApp message via Twilio to {to_phone}: {str(e)}")
            return False

    async def _send_whatsapp_business_api(self, to_phone: str, message: str) -> bool:
        """Send WhatsApp notification via WhatsApp Business API"""
        try:
            # Format phone number (remove any prefixes)
            phone_number = to_phone.replace("whatsapp:", "").replace("+", "")
            
            url = f"https://graph.facebook.com/v18.0/{settings.WHATSAPP_BUSINESS_PHONE_NUMBER_ID}/messages"
            
            headers = {
                "Authorization": f"Bearer {settings.WHATSAPP_BUSINESS_API_TOKEN}",
                "Content-Type": "application/json"
            }
            
            data = {
                "messaging_product": "whatsapp",
                "to": phone_number,
                "type": "text",
                "text": {
                    "body": message
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=data)
                response.raise_for_status()
                
            logger.info(f"WhatsApp message sent successfully via Business API to {to_phone}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send WhatsApp message via Business API to {to_phone}: {str(e)}")
            return False

    async def create_notification(
        self,
        notification_type: NotificationType,
        channel: NotificationChannel,
        recipient_email: Optional[str] = None,
        recipient_phone: Optional[str] = None,
        subject: Optional[str] = None,
        message: str = "",
        order_id: Optional[str] = None,
        user_id: Optional[str] = None,
        metadata: Optional[dict] = None
    ) -> Notification:
        """Create and store notification record"""
        notification = Notification(
            type=notification_type,
            channel=channel,
            recipient_email=recipient_email,
            recipient_phone=recipient_phone,
            subject=subject,
            message=message,
            order_id=order_id,
            user_id=user_id,
            metadata=metadata or {}
        )
        
        # Note: This would need to be called with a database session
        # db.add(notification)
        # await db.commit()
        # await db.refresh(notification)
        return notification

    async def send_order_request_notification(self, order: Order):
        """Send notification to admin about new order request"""
        # Get user details
        user = await User.get(order.user_id)
        if not user:
            return

        # Email notification to admin
        subject = f"New Order Request - Order #{str(order.id)[:8]}"
        html_content = self._get_order_request_email_template(order, user)
        
        # Create notification record
        notification = await self.create_notification(
            notification_type=NotificationType.ORDER_REQUEST,
            channel=NotificationChannel.EMAIL,
            recipient_email=settings.ADMIN_EMAIL,
            subject=subject,
            message=html_content,
            order_id=str(order.id),
            user_id=str(user.id)
        )
        
        # Send email
        success = await self.send_email(
            settings.ADMIN_EMAIL,
            subject,
            html_content
        )
        
        # Update notification status
        notification.status = NotificationStatus.SENT if success else NotificationStatus.FAILED
        # Note: This would need to be called with a database session
        # await db.commit()
        # await db.refresh(notification)

        # Optional WhatsApp notification
        if self.twilio_client and user.phone:
            whatsapp_message = f"New order request from {user.name} - Order #{str(order.id)[:8]} - Total: ${order.total:.2f}"
            await self.send_whatsapp(user.phone, whatsapp_message)

    async def send_order_confirmation_notification(self, order: Order):
        """Send order confirmation with payment link to customer"""
        user = await User.get(order.user_id)
        if not user:
            return

        # Generate payment link (placeholder - integrate with Stripe)
        payment_link = f"{settings.CORS_ORIGINS[0]}/payment/{order.id}"
        
        subject = f"Order Confirmed - Payment Required - Order #{str(order.id)[:8]}"
        html_content = self._get_order_confirmation_email_template(order, user, payment_link)
        
        # Create notification record
        notification = await self.create_notification(
            notification_type=NotificationType.ORDER_CONFIRMATION,
            channel=NotificationChannel.EMAIL,
            recipient_email=user.email,
            subject=subject,
            message=html_content,
            order_id=str(order.id),
            user_id=str(user.id),
            metadata={"payment_link": payment_link}
        )
        
        # Send email
        success = await self.send_email(
            user.email,
            subject,
            html_content
        )
        
        # Update notification status
        notification.status = NotificationStatus.SENT if success else NotificationStatus.FAILED
        # Note: This would need to be called with a database session
        # await db.commit()
        # await db.refresh(notification)

    async def send_order_rejection_notification(self, order: Order, reason: str):
        """Send order rejection notification to customer"""
        user = await User.get(order.user_id)
        if not user:
            return

        subject = f"Order Update - Order #{str(order.id)[:8]}"
        html_content = self._get_order_rejection_email_template(order, user, reason)
        
        # Create notification record
        notification = await self.create_notification(
            notification_type=NotificationType.ORDER_REJECTION,
            channel=NotificationChannel.EMAIL,
            recipient_email=user.email,
            subject=subject,
            message=html_content,
            order_id=str(order.id),
            user_id=str(user.id),
            metadata={"reason": reason}
        )
        
        # Send email
        success = await self.send_email(
            user.email,
            subject,
            html_content
        )
        
        # Update notification status
        notification.status = NotificationStatus.SENT if success else NotificationStatus.FAILED
        # Note: This would need to be called with a database session
        # await db.commit()
        # await db.refresh(notification)

    async def send_order_shipped_notification(self, order: Order):
        """Send order shipped notification to customer"""
        user = await User.get(order.user_id)
        if not user:
            return

        subject = f"Order Shipped - Order #{str(order.id)[:8]}"
        html_content = self._get_order_shipped_email_template(order, user)
        
        # Create notification record
        notification = await self.create_notification(
            notification_type=NotificationType.ORDER_SHIPPED,
            channel=NotificationChannel.EMAIL,
            recipient_email=user.email,
            subject=subject,
            message=html_content,
            order_id=str(order.id),
            user_id=str(user.id),
            metadata={"tracking_number": order.tracking_number}
        )
        
        # Send email
        success = await self.send_email(
            user.email,
            subject,
            html_content
        )
        
        # Update notification status
        notification.status = NotificationStatus.SENT if success else NotificationStatus.FAILED
        # Note: This would need to be called with a database session
        # await db.commit()
        # await db.refresh(notification)

    def _get_order_request_email_template(self, order: Order, user: User) -> str:
        """Generate HTML email template for order request"""
        items_html = ""
        for item in order.items:
            items_html += f"""
            <tr>
                <td>{item.product_name}</td>
                <td>{item.quantity}</td>
                <td>${item.price:.2f}</td>
                <td>${item.price * item.quantity:.2f}</td>
            </tr>
            """
        
        return f"""
        <html>
        <body>
            <h2>New Order Request</h2>
            <p><strong>Customer:</strong> {user.name} ({user.email})</p>
            <p><strong>Order ID:</strong> {str(order.id)[:8]}</p>
            <p><strong>Date:</strong> {order.created_at.strftime('%Y-%m-%d %H:%M')}</p>
            
            <h3>Order Items:</h3>
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
                {items_html}
            </table>
            
            <h3>Shipping Address:</h3>
            <p>
                {order.shipping_address.name}<br>
                {order.shipping_address.street}<br>
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zip_code}<br>
                {order.shipping_address.country}
            </p>
            
            <h3>Order Summary:</h3>
            <p><strong>Subtotal:</strong> ${order.subtotal:.2f}</p>
            <p><strong>Shipping:</strong> ${order.shipping_cost:.2f}</p>
            <p><strong>Tax:</strong> ${order.tax:.2f}</p>
            <p><strong>Total:</strong> ${order.total:.2f}</p>
            
            <p>Please review this order and confirm availability with your supplier.</p>
        </body>
        </html>
        """

    def _get_order_confirmation_email_template(self, order: Order, user: User, payment_link: str) -> str:
        """Generate HTML email template for order confirmation"""
        return f"""
        <html>
        <body>
            <h2>Order Confirmed!</h2>
            <p>Dear {user.name},</p>
            
            <p>Great news! Your order #{str(order.id)[:8]} has been confirmed and is ready for payment.</p>
            
            <h3>Order Summary:</h3>
            <p><strong>Total Amount:</strong> ${order.total:.2f}</p>
            
            <p>Please complete your payment to proceed with shipping:</p>
            <a href="{payment_link}" style="background-color: #38e07b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Pay Now</a>
            
            <p>If you have any questions, please contact us at {settings.EMAIL_FROM}</p>
            
            <p>Thank you for choosing ZOREL LEATHER!</p>
        </body>
        </html>
        """

    def _get_order_rejection_email_template(self, order: Order, user: User, reason: str) -> str:
        """Generate HTML email template for order rejection"""
        return f"""
        <html>
        <body>
            <h2>Order Update</h2>
            <p>Dear {user.name},</p>
            
            <p>We regret to inform you that your order #{str(order.id)[:8]} could not be fulfilled.</p>
            
            <p><strong>Reason:</strong> {reason}</p>
            
            <p>We apologize for any inconvenience. Please feel free to browse our other products or contact us if you have any questions.</p>
            
            <p>Thank you for your understanding.</p>
            
            <p>Best regards,<br>ZOREL LEATHER Team</p>
        </body>
        </html>
        """

    def _get_order_shipped_email_template(self, order: Order, user: User) -> str:
        """Generate HTML email template for order shipped"""
        return f"""
        <html>
        <body>
            <h2>Your Order Has Shipped!</h2>
            <p>Dear {user.name},</p>
            
            <p>Great news! Your order #{str(order.id)[:8]} has been shipped and is on its way to you.</p>
            
            <h3>Tracking Information:</h3>
            <p><strong>Tracking Number:</strong> {order.tracking_number}</p>
            
            <p>You can track your package using the tracking number above.</p>
            
            <p>Thank you for your business!</p>
            
            <p>Best regards,<br>ZOREL LEATHER Team</p>
        </body>
        </html>
        """
