import httpx
import json
import logging
from typing import Dict, List, Optional, Any
from app.core.config import settings
from app.models.sqlalchemy_models import User, Product, Order
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.postgresql import get_db

logger = logging.getLogger(__name__)

class WhatsAppService:
    def __init__(self):
        self.api_url = settings.WHATSAPP_BUSINESS_API_URL
        self.phone_number_id = settings.WHATSAPP_BUSINESS_PHONE_NUMBER_ID
        self.access_token = settings.WHATSAPP_BUSINESS_API_TOKEN
        self.verify_token = settings.WHATSAPP_BUSINESS_VERIFY_TOKEN
        
    async def send_message(self, to: str, message: str, message_type: str = "text") -> bool:
        """Send a WhatsApp message"""
        try:
            url = f"{self.api_url}/{self.phone_number_id}/messages"
            
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "messaging_product": "whatsapp",
                "to": to,
                "type": message_type,
                "text": {"body": message} if message_type == "text" else message
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload)
                
            if response.status_code == 200:
                logger.info(f"WhatsApp message sent successfully to {to}")
                return True
            else:
                logger.error(f"Failed to send WhatsApp message: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending WhatsApp message: {e}")
            return False
    
    async def send_template_message(self, to: str, template_name: str, language_code: str = "en", components: List[Dict] = None) -> bool:
        """Send a WhatsApp template message"""
        try:
            url = f"{self.api_url}/{self.phone_number_id}/messages"
            
            headers = {
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "messaging_product": "whatsapp",
                "to": to,
                "type": "template",
                "template": {
                    "name": template_name,
                    "language": {"code": language_code},
                    "components": components or []
                }
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=payload)
                
            if response.status_code == 200:
                logger.info(f"WhatsApp template message sent successfully to {to}")
                return True
            else:
                logger.error(f"Failed to send WhatsApp template message: {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Error sending WhatsApp template message: {e}")
            return False
    
    async def send_product_catalog(self, to: str, products: List[Product], category: str = None) -> bool:
        """Send product catalog via WhatsApp"""
        try:
            if not products:
                await self.send_message(to, "Sorry, no products found in this category.")
                return False
            
            message = f"🛍️ *ZOREL LEATHER PRODUCTS*"
            if category:
                message += f"\n📂 *Category: {category.title()}*"
            
            message += f"\n\nHere are our available products:\n"
            
            for i, product in enumerate(products[:10], 1):  # Limit to 10 products
                message += f"\n{i}. *{product.name}*"
                message += f"\n   💰 Price: ${product.price}"
                message += f"\n   📦 Stock: {product.stock_quantity} units"
                if product.description:
                    message += f"\n   📝 {product.description[:100]}..."
                message += f"\n   🔗 View: http://localhost:3000/product/{product.id}\n"
            
            if len(products) > 10:
                message += f"\n... and {len(products) - 10} more products!"
            
            message += f"\n\n🛒 *Shop now:* http://localhost:3000/shop"
            message += f"\n📞 *Need help?* Reply with 'HELP'"
            
            return await self.send_message(to, message)
            
        except Exception as e:
            logger.error(f"Error sending product catalog: {e}")
            return False
    
    async def send_order_confirmation(self, to: str, order: Order) -> bool:
        """Send order confirmation via WhatsApp"""
        try:
            message = f"🎉 *Order Confirmed!*\n\n"
            message += f"📋 *Order #:* {order.order_number}\n"
            message += f"💰 *Total:* ${order.total_amount}\n"
            message += f"📦 *Items:* {len(order.order_items)} item(s)\n"
            message += f"🚚 *Status:* {order.status.value.title()}\n"
            
            if order.payment_method:
                message += f"💳 *Payment:* {order.payment_method.value.title()}\n"
            
            message += f"\n📱 *Track your order:* http://localhost:3000/order/{order.id}"
            message += f"\n\nThank you for choosing ZOREL LEATHER! 🏆"
            
            return await self.send_message(to, message)
            
        except Exception as e:
            logger.error(f"Error sending order confirmation: {e}")
            return False
    
    async def send_order_status_update(self, to: str, order: Order) -> bool:
        """Send order status update via WhatsApp"""
        try:
            status_emojis = {
                "pending": "⏳",
                "confirmed": "✅",
                "processing": "🔄",
                "shipped": "🚚",
                "delivered": "🎉",
                "cancelled": "❌",
                "returned": "↩️"
            }
            
            emoji = status_emojis.get(order.status.value, "📦")
            
            message = f"{emoji} *Order Status Update*\n\n"
            message += f"📋 *Order #:* {order.order_number}\n"
            message += f"📊 *New Status:* {order.status.value.title()}\n"
            
            if order.tracking_number:
                message += f"📦 *Tracking #:* {order.tracking_number}\n"
            
            if order.estimated_delivery:
                message += f"📅 *Estimated Delivery:* {order.estimated_delivery.strftime('%Y-%m-%d')}\n"
            
            message += f"\n📱 *View Details:* http://localhost:3000/order/{order.id}"
            
            return await self.send_message(to, message)
            
        except Exception as e:
            logger.error(f"Error sending order status update: {e}")
            return False
    
    async def handle_incoming_message(self, message_data: Dict[str, Any], db: AsyncSession) -> str:
        """Handle incoming WhatsApp messages and provide automated responses"""
        try:
            message = message_data.get("text", {}).get("body", "").lower().strip()
            from_number = message_data.get("from", "")
            
            # Extract phone number (remove whatsapp: prefix)
            phone_number = from_number.replace("whatsapp:", "")
            
            # Check if user exists by phone number
            result = await db.execute(select(User).where(User.phone == phone_number))
            user = result.scalar_one_or_none()
            
            # Common responses
            if any(word in message for word in ["hello", "hi", "hey", "start"]):
                response = "👋 Hello! Welcome to ZOREL LEATHER!\n\n"
                response += "I can help you with:\n"
                response += "• 🛍️ Browse products\n"
                response += "• 📦 Check order status\n"
                response += "• 💬 Get support\n"
                response += "• 📞 Contact information\n\n"
                response += "Just type what you need help with!"
                
            elif any(word in message for word in ["products", "catalog", "shop", "items"]):
                # Get some featured products
                result = await db.execute(select(Product).where(Product.is_featured == True).limit(5))
                products = result.scalars().all()
                await self.send_product_catalog(from_number, products)
                return "Product catalog sent"
                
            elif any(word in message for word in ["order", "status", "tracking"]):
                if user:
                    # Get user's recent orders
                    result = await db.execute(select(Order).where(Order.user_id == user.id).order_by(Order.created_at.desc()).limit(3))
                    orders = result.scalars().all()
                    
                    if orders:
                        response = "📦 *Your Recent Orders:*\n\n"
                        for order in orders:
                            response += f"• Order #{order.order_number}\n"
                            response += f"  Status: {order.status.value.title()}\n"
                            response += f"  Total: ${order.total_amount}\n\n"
                        response += "📱 View all orders: http://localhost:3000/account/orders"
                    else:
                        response = "You don't have any orders yet.\n\n🛍️ Start shopping: http://localhost:3000/shop"
                else:
                    response = "I couldn't find your account. Please visit our website to create an account and link your phone number."
                    
            elif any(word in message for word in ["help", "support", "contact"]):
                response = "🆘 *How can I help you?*\n\n"
                response += "• 🛍️ Type 'products' to see our catalog\n"
                response += "• 📦 Type 'order' to check order status\n"
                response += "• 📞 Call us: +1-800-ZOREL-01\n"
                response += "• 📧 Email: support@zorelleather.com\n"
                response += "• 🌐 Website: http://localhost:3000\n\n"
                response += "Our support team is available 24/7!"
                
            elif any(word in message for word in ["price", "cost", "expensive"]):
                response = "💰 *Our Pricing:*\n\n"
                response += "• Premium leather products\n"
                response += "• Competitive prices\n"
                response += "• Free shipping on orders over $100\n"
                response += "• 30-day return policy\n\n"
                response += "🛍️ Browse our catalog: http://localhost:3000/shop"
                
            else:
                response = "I'm not sure how to help with that. 😅\n\n"
                response += "Try typing:\n"
                response += "• 'products' - See our catalog\n"
                response += "• 'order' - Check order status\n"
                response += "• 'help' - Get support\n\n"
                response += "Or visit our website: http://localhost:3000"
            
            await self.send_message(from_number, response)
            return response
            
        except Exception as e:
            logger.error(f"Error handling incoming message: {e}")
            error_response = "Sorry, I'm having trouble processing your request. Please try again later or contact our support team."
            await self.send_message(from_number, error_response)
            return error_response

# Global instance
whatsapp_service = WhatsAppService()
