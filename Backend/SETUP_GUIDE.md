# ZOREL LEATHER - Backend Setup Guide

## 🚀 Quick Start

### 1. Environment Configuration

The `.env` file has been configured with your MongoDB credentials and all necessary environment variables for WhatsApp API and other integrations.

**MongoDB Connection:**
```
MONGODB_URL=mongodb+srv://aliahmadkryptomind_db_user:Ue1Mb8T7sYXqfMFP@zorel-leather.gzx3jwz.mongodb.net/?retryWrites=true&w=majority&appName=Zorel-Leather
DATABASE_NAME=zorel_leather
```

### 2. Required API Keys to Configure

#### WhatsApp Integration (Choose One)

**Option A: Twilio WhatsApp**
```env
TWILIO_ACCOUNT_SID=your-twilio-account-sid-here
TWILIO_AUTH_TOKEN=your-twilio-auth-token-here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

**Option B: WhatsApp Business API**
```env
WHATSAPP_BUSINESS_API_TOKEN=your-whatsapp-business-api-token-here
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=your-whatsapp-phone-number-id-here
WHATSAPP_BUSINESS_VERIFY_TOKEN=your-whatsapp-verify-token-here
```

#### Email Configuration
```env
SMTP_USERNAME=support@zorelleather.com
SMTP_PASSWORD=your-email-app-password-here
```

#### Payment Integration (Stripe)
```env
STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key-here
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret-here
```

### 3. Installation & Setup

```bash
# Install dependencies
pip install -r requirements.txt

# Run the application
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. WhatsApp Webhook Setup

#### For WhatsApp Business API:
1. Set up your webhook URL: `https://yourdomain.com/api/v1/whatsapp/webhook`
2. Configure the verify token in your `.env` file
3. The webhook will handle incoming messages and provide automated responses

#### For Twilio:
1. Configure your Twilio WhatsApp sandbox
2. Set up webhook URLs in Twilio console
3. Use the provided phone number for testing

### 5. Features Implemented

#### ✅ WhatsApp Integration
- **Automated Responses**: Handles greetings, product inquiries, pricing, orders, and help requests
- **Product Information**: Can provide details about specific products
- **Order Support**: Guides users through the ordering process
- **Contact Information**: Provides business details and contact methods

#### ✅ Notification System
- **Email Notifications**: Order confirmations, shipping updates, etc.
- **WhatsApp Notifications**: Real-time updates via WhatsApp
- **Admin Notifications**: Alerts for new orders and customer inquiries

#### ✅ Database Integration
- **MongoDB Atlas**: Connected with your provided credentials
- **Product Management**: Full CRUD operations for products
- **Order Management**: Complete order lifecycle management
- **User Management**: Customer and admin user systems

### 6. API Endpoints

#### WhatsApp Endpoints
- `GET /api/v1/whatsapp/webhook` - Webhook verification
- `POST /api/v1/whatsapp/webhook` - Receive WhatsApp messages
- `POST /api/v1/whatsapp/send-message` - Send WhatsApp messages (Admin)

#### Notification Endpoints
- `POST /api/v1/notifications/email` - Send email notifications
- `POST /api/v1/notifications/whatsapp` - Send WhatsApp notifications
- `GET /api/v1/notifications/` - Get notification history

### 7. WhatsApp Message Handling

The system automatically responds to:

- **Greetings**: "hello", "hi", "good morning", etc.
- **Product Inquiries**: "products", "catalog", "leather items"
- **Pricing**: "price", "cost", "expensive", "budget"
- **Orders**: "order", "buy", "purchase", "shipping"
- **Help**: "help", "support", "assistance"
- **Contact**: "contact", "phone", "email", "address"
- **Specific Products**: Product names or IDs

### 8. Testing the Integration

1. **Test Database Connection**:
   ```bash
   python -c "
   import asyncio
   from app.core.database import init_db
   async def test(): await init_db(); print('✅ Connected!')
   asyncio.run(test())
   "
   ```

2. **Test WhatsApp Webhook**:
   - Send a message to your WhatsApp Business number
   - Check the logs for incoming messages
   - Verify automated responses

3. **Test Email Notifications**:
   - Place a test order
   - Check email delivery
   - Verify notification records

### 9. Production Deployment

#### Environment Variables for Production:
```env
ENVIRONMENT=production
SECRET_KEY=your-super-secure-production-secret-key
CORS_ORIGINS=["https://yourdomain.com"]
FRONTEND_URL=https://yourdomain.com
```

#### Security Considerations:
- Change default admin password
- Use strong JWT secret key
- Enable HTTPS for webhooks
- Configure proper CORS origins
- Set up rate limiting

### 10. Monitoring & Logs

The system includes comprehensive logging for:
- WhatsApp message processing
- Email delivery status
- Database operations
- API requests and responses
- Error tracking

### 11. Support & Troubleshooting

#### Common Issues:

1. **MongoDB Connection Failed**:
   - Verify credentials in `.env`
   - Check network connectivity
   - Ensure IP whitelist includes your server

2. **WhatsApp Messages Not Sending**:
   - Verify API credentials
   - Check webhook configuration
   - Review rate limits

3. **Email Not Sending**:
   - Verify SMTP credentials
   - Check email provider settings
   - Review spam filters

#### Logs Location:
- Application logs: Console output
- Error logs: Check exception details
- WhatsApp logs: Webhook processing logs

---

## 🎯 Next Steps

1. **Configure API Keys**: Update the `.env` file with your actual API credentials
2. **Test Integration**: Run the application and test all features
3. **Deploy**: Set up production environment with proper security
4. **Monitor**: Set up monitoring and alerting for the system

The system is now ready for customer inquiries via WhatsApp with automated responses and seamless integration with your leather products business!
