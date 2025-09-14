# Google OAuth & WhatsApp Integration Setup Guide

This guide will help you set up Google OAuth authentication and WhatsApp Business API integration for the ZOREL LEATHER platform.

## 🔐 Google OAuth Setup

### 1. Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API and Google OAuth2 API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen:
   - Application name: "ZOREL LEATHER"
   - User support email: your email
   - Authorized domains: your domain
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized JavaScript origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/auth/callback`

### 2. Configure Environment Variables

Add these to your `.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
```

### 3. Database Migration

Run the database migration to add Google OAuth support:

```bash
cd Backend
alembic upgrade head
```

## 📱 WhatsApp Business API Setup

### 1. Create WhatsApp Business Account

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app and select "Business" type
3. Add WhatsApp Business API product
4. Set up a WhatsApp Business Account
5. Get your Phone Number ID and Access Token

### 2. Configure Webhook

1. In your WhatsApp Business API settings, set webhook URL:
   ```
   https://yourdomain.com/api/v1/whatsapp/webhook
   ```
2. Set verify token (use a secure random string)
3. Subscribe to `messages` webhook field

### 3. Environment Variables

Add these to your `.env` file:

```env
# WhatsApp Business API
WHATSAPP_BUSINESS_API_TOKEN=your_whatsapp_access_token
WHATSAPP_BUSINESS_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_VERIFY_TOKEN=your_webhook_verify_token
WHATSAPP_BUSINESS_API_URL=https://graph.facebook.com/v18.0
```

### 4. Alternative: Twilio WhatsApp (Simpler Setup)

If you prefer a simpler setup, you can use Twilio WhatsApp:

```env
# Twilio WhatsApp (Alternative)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
cd Backend
pip install -r requirements.txt
```

### 2. Run Database Migration

```bash
alembic upgrade head
```

### 3. Start the Backend

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Start the Frontend

```bash
cd Frontend
npm install
npm run dev
```

## 🔧 Features Overview

### Google OAuth Features

- **One-Click Login**: Users can sign in with their Google account
- **Automatic Account Creation**: New users are automatically created
- **Profile Sync**: Google profile picture and name are synced
- **Secure Authentication**: JWT tokens for session management

### WhatsApp Features

- **Automated Responses**: AI-powered responses to customer inquiries
- **Product Catalog**: Send product catalogs via WhatsApp
- **Order Updates**: Automatic order status notifications
- **Admin Interface**: Send messages and manage conversations
- **Template Messages**: Pre-approved message templates

## 📋 API Endpoints

### Google OAuth Endpoints

- `GET /api/v1/auth/google` - Initiate Google OAuth
- `GET /api/v1/auth/google/callback` - Handle OAuth callback
- `GET /api/v1/auth/google/user-info` - Get user's Google info

### WhatsApp Endpoints

- `GET /api/v1/whatsapp/webhook` - Webhook verification
- `POST /api/v1/whatsapp/webhook` - Receive messages
- `POST /api/v1/whatsapp/send-message` - Send text message
- `POST /api/v1/whatsapp/send-product-catalog` - Send product catalog
- `POST /api/v1/whatsapp/send-template` - Send template message

## 🎯 Usage Examples

### Frontend Google OAuth

```tsx
import { GoogleOAuthButton } from "@/components/auth/google-oauth-button"

<GoogleOAuthButton 
  onSuccess={(token) => {
    // Handle successful login
    router.push('/dashboard')
  }}
  onError={(error) => {
    // Handle login error
    toast.error(error)
  }}
/>
```

### Backend WhatsApp Service

```python
from app.services.whatsapp_service import whatsapp_service

# Send a message
await whatsapp_service.send_message("+1234567890", "Hello from ZOREL LEATHER!")

# Send product catalog
await whatsapp_service.send_product_catalog("+1234567890", products, "jackets")

# Send order confirmation
await whatsapp_service.send_order_confirmation("+1234567890", order)
```

## 🔒 Security Considerations

1. **Environment Variables**: Never commit sensitive keys to version control
2. **HTTPS**: Use HTTPS in production for OAuth callbacks
3. **Webhook Verification**: Implement proper webhook signature verification
4. **Rate Limiting**: WhatsApp has rate limits, implement proper queuing
5. **Data Privacy**: Comply with GDPR and data protection regulations

## 🐛 Troubleshooting

### Google OAuth Issues

- **Redirect URI Mismatch**: Ensure redirect URI matches exactly in Google Console
- **Invalid Client**: Check client ID and secret are correct
- **Scope Issues**: Ensure required scopes are requested

### WhatsApp Issues

- **Webhook Not Receiving**: Check webhook URL is accessible and verify token matches
- **Message Not Sending**: Verify access token and phone number ID
- **Rate Limits**: Implement exponential backoff for retries

## 📞 Support

For issues or questions:
- Check the logs in the backend console
- Verify environment variables are set correctly
- Test webhook endpoints with tools like ngrok for local development
- Review WhatsApp Business API documentation

## 🔄 Updates

To update the integrations:

1. Pull latest changes
2. Run database migrations: `alembic upgrade head`
3. Update environment variables if needed
4. Restart the backend server
5. Clear browser cache for frontend changes

---

**Note**: This setup guide assumes you're running the application locally. For production deployment, update the URLs and implement additional security measures.
