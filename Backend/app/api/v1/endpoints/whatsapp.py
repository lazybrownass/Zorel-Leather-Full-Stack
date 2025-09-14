from fastapi import APIRouter, Request, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, Any
import logging
from app.core.config import settings
from app.services.notification_service import NotificationService
from app.models.sqlalchemy_models import User, Product
import re

logger = logging.getLogger(__name__)
router = APIRouter()


class WhatsAppWebhookRequest(BaseModel):
    object: str
    entry: list


class WhatsAppMessage(BaseModel):
    id: str
    from_: str = None
    timestamp: str
    text: Optional[Dict[str, str]] = None
    type: str = "text"
    
    class Config:
        fields = {"from_": "from"}


class WhatsAppEntry(BaseModel):
    id: str
    changes: list


class WhatsAppChange(BaseModel):
    value: Dict[str, Any]
    field: str


@router.get("/webhook")
async def verify_webhook(
    hub_mode: str,
    hub_challenge: str,
    hub_verify_token: str
):
    """Verify WhatsApp webhook"""
    if hub_mode == "subscribe" and hub_verify_token == settings.WHATSAPP_BUSINESS_VERIFY_TOKEN:
        logger.info("WhatsApp webhook verified successfully")
        return int(hub_challenge)
    else:
        logger.warning("WhatsApp webhook verification failed")
        raise HTTPException(status_code=403, detail="Forbidden")


@router.post("/webhook")
async def receive_webhook(request: Request):
    """Receive WhatsApp messages and handle inquiries"""
    try:
        body = await request.json()
        logger.info(f"Received WhatsApp webhook: {body}")
        
        # Verify webhook signature if needed
        if not _verify_webhook_signature(request, body):
            raise HTTPException(status_code=403, detail="Invalid signature")
        
        # Process webhook data
        for entry in body.get("entry", []):
            for change in entry.get("changes", []):
                if change.get("field") == "messages":
                    await _process_messages(change.get("value", {}))
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"Error processing WhatsApp webhook: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")


def _verify_webhook_signature(request: Request, body: dict) -> bool:
    """Verify webhook signature (implement based on your security requirements)"""
    # For now, return True. In production, implement proper signature verification
    return True


async def _process_messages(value: dict):
    """Process incoming WhatsApp messages"""
    messages = value.get("messages", [])
    contacts = value.get("contacts", [])
    
    for message in messages:
        await _handle_message(message, contacts)


async def _handle_message(message: dict, contacts: list):
    """Handle individual WhatsApp message"""
    try:
        message_id = message.get("id")
        from_number = message.get("from")
        timestamp = message.get("timestamp")
        message_type = message.get("type", "text")
        
        # Get contact info
        contact_info = next((c for c in contacts if c.get("wa_id") == from_number), {})
        contact_name = contact_info.get("profile", {}).get("name", "Unknown")
        
        # Extract message text
        message_text = ""
        if message_type == "text":
            message_text = message.get("text", {}).get("body", "")
        elif message_type == "interactive":
            # Handle interactive messages (buttons, lists)
            interactive = message.get("interactive", {})
            if interactive.get("type") == "button_reply":
                message_text = interactive.get("button_reply", {}).get("title", "")
            elif interactive.get("type") == "list_reply":
                message_text = interactive.get("list_reply", {}).get("title", "")
        
        logger.info(f"Processing WhatsApp message from {from_number}: {message_text}")
        
        # Process the message and generate response
        response = await _generate_response(from_number, message_text, contact_name)
        
        # Send response if available
        if response:
            notification_service = NotificationService()
            await notification_service.send_whatsapp(from_number, response)
        
    except Exception as e:
        logger.error(f"Error handling WhatsApp message: {str(e)}")


async def _generate_response(phone_number: str, message_text: str, contact_name: str) -> Optional[str]:
    """Generate appropriate response based on message content"""
    message_lower = message_text.lower().strip()
    
    # Greeting responses
    if any(greeting in message_lower for greeting in ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"]):
        return f"Hello {contact_name}! 👋\n\nWelcome to ZOREL LEATHER! We're here to help you with premium leather products.\n\nHow can we assist you today?\n\n• Browse products: Type 'products'\n• Check prices: Type 'prices'\n• Get support: Type 'help'\n• Contact us: Type 'contact'"
    
    # Product inquiry
    if any(keyword in message_lower for keyword in ["product", "products", "catalog", "items", "leather"]):
        return await _handle_product_inquiry()
    
    # Price inquiry
    if any(keyword in message_lower for keyword in ["price", "prices", "cost", "expensive", "cheap", "budget"]):
        return await _handle_price_inquiry()
    
    # Order inquiry
    if any(keyword in message_lower for keyword in ["order", "buy", "purchase", "shipping", "delivery"]):
        return await _handle_order_inquiry()
    
    # Help request
    if any(keyword in message_lower for keyword in ["help", "support", "assistance", "problem", "issue"]):
        return await _handle_help_request()
    
    # Contact information
    if any(keyword in message_lower for keyword in ["contact", "phone", "email", "address", "location"]):
        return await _handle_contact_request()
    
    # Specific product inquiry (look for product names or IDs)
    product_response = await _handle_specific_product_inquiry(message_text)
    if product_response:
        return product_response
    
    # Default response
    return f"Thank you for your message, {contact_name}! 😊\n\nI'm here to help you with ZOREL LEATHER products. Here are some things I can assist you with:\n\n• Product information and catalog\n• Pricing and availability\n• Order placement and shipping\n• Customer support\n\nPlease let me know what you'd like to know more about!"


async def _handle_product_inquiry() -> str:
    """Handle general product inquiry"""
    try:
        # Get some featured products
        from app.core.postgresql import get_db
        from sqlalchemy import select
        
        db = next(get_db())
        products_query = select(Product).where(Product.is_active == True).limit(5)
        products_result = await db.execute(products_query)
        products = products_result.scalars().all()
        
        if not products:
            return "We're currently updating our product catalog. Please check back soon or contact us directly for more information!"
        
        response = "🛍️ *Our Featured Products:*\n\n"
        
        for i, product in enumerate(products, 1):
            response += f"{i}. *{product.name}*\n"
            response += f"   💰 ${product.price:.2f}\n"
            response += f"   📝 {product.description[:100]}...\n\n"
        
        response += "For more details about any product, just type the product name or number!\n\n"
        response += "To place an order, type 'order' or visit our website."
        
        return response
        
    except Exception as e:
        logger.error(f"Error handling product inquiry: {str(e)}")
        return "I'm having trouble accessing our product catalog right now. Please try again later or contact us directly!"


async def _handle_price_inquiry() -> str:
    """Handle price inquiry"""
    return "💰 *Pricing Information:*\n\n" \
           "Our premium leather products are competitively priced:\n\n" \
           "• Handbags: $150 - $500\n" \
           "• Wallets: $50 - $150\n" \
           "• Belts: $80 - $200\n" \
           "• Shoes: $200 - $400\n" \
           "• Accessories: $30 - $100\n\n" \
           "For specific product prices, just type the product name!\n\n" \
           "💡 *Special Offers:*\n" \
           "• Free shipping on orders over $200\n" \
           "• 10% off for first-time customers\n" \
           "• Bulk discounts available"


async def _handle_order_inquiry() -> str:
    """Handle order inquiry"""
    return "🛒 *How to Place an Order:*\n\n" \
           "1. Browse our products (type 'products')\n" \
           "2. Choose your items\n" \
           "3. Contact us with your selection\n" \
           "4. We'll confirm availability and pricing\n" \
           "5. Complete payment\n" \
           "6. We'll ship your order!\n\n" \
           "📦 *Shipping Information:*\n" \
           "• Free shipping on orders over $200\n" \
           "• Standard shipping: 3-5 business days\n" \
           "• Express shipping available\n" \
           "• International shipping available\n\n" \
           "Need help with a specific order? Just let us know!"


async def _handle_help_request() -> str:
    """Handle help request"""
    return "🆘 *How Can We Help You?*\n\n" \
           "Here are the most common ways we can assist:\n\n" \
           "📱 *Quick Commands:*\n" \
           "• Type 'products' - Browse our catalog\n" \
           "• Type 'prices' - View pricing information\n" \
           "• Type 'order' - Learn how to place an order\n" \
           "• Type 'contact' - Get our contact details\n\n" \
           "💬 *Other Ways to Reach Us:*\n" \
           "• Email: support@zorelleather.com\n" \
           "• Phone: +1 (555) 123-4567\n" \
           "• Website: www.zorelleather.com\n\n" \
           "Is there something specific you need help with?"


async def _handle_contact_request() -> str:
    """Handle contact information request"""
    return "📞 *Contact Information:*\n\n" \
           "🕒 *Business Hours:*\n" \
           "Monday - Friday: 9:00 AM - 6:00 PM\n" \
           "Saturday: 10:00 AM - 4:00 PM\n" \
           "Sunday: Closed\n\n" \
           "📧 *Email:*\n" \
           "support@zorelleather.com\n\n" \
           "📱 *Phone:*\n" \
           "+1 (555) 123-4567\n\n" \
           "🌐 *Website:*\n" \
           "www.zorelleather.com\n\n" \
           "📍 *Address:*\n" \
           "123 Leather Street\n" \
           "Craft District, City 12345\n\n" \
           "We're here to help! 😊"


async def _handle_specific_product_inquiry(message_text: str) -> Optional[str]:
    """Handle specific product inquiry"""
    try:
        # Look for product names or IDs in the message
        # This is a simplified version - you could implement more sophisticated matching
        
        # Search for products by name
        from app.core.postgresql import get_db
        from sqlalchemy import select
        
        db = next(get_db())
        products_query = select(Product).where(Product.is_active == True)
        products_result = await db.execute(products_query)
        products = products_result.scalars().all()
        
        for product in products:
            if product.name.lower() in message_text.lower():
                return f"🛍️ *{product.name}*\n\n" \
                       f"💰 *Price:* ${product.price:.2f}\n" \
                       f"📝 *Description:* {product.description}\n" \
                       f"📦 *In Stock:* {'Yes' if product.in_stock else 'No'}\n" \
                       f"🏷️ *Category:* {product.category}\n\n" \
                       f"Would you like to place an order for this item? Just type 'order {product.name}'!"
        
        return None
        
    except Exception as e:
        logger.error(f"Error handling specific product inquiry: {str(e)}")
        return None


@router.post("/send-message")
async def send_whatsapp_message(
    phone_number: str,
    message: str
):
    """Send WhatsApp message to a specific number (Admin only)"""
    try:
        notification_service = NotificationService()
        success = await notification_service.send_whatsapp(phone_number, message)
        
        if success:
            return {"status": "success", "message": "WhatsApp message sent successfully"}
        else:
            return {"status": "error", "message": "Failed to send WhatsApp message"}
            
    except Exception as e:
        logger.error(f"Error sending WhatsApp message: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send message")
