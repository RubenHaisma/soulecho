# SoulEcho API Routes Setup Guide

## Overview

This guide will help you set up and verify all API routes in SoulEcho, including the new contact functionality using Resend.

## 🔧 Environment Configuration

### Required Environment Variables

Update your `.env.local` file with the following:

```env
# OpenAI API Configuration
OPENAI_API_KEY="your-openai-api-key"

# ChromaDB Configuration
CHROMA_URL="http://localhost:8000"

# Server Configuration
PORT=3001

# Next.js Configuration
NEXT_PUBLIC_API_URL="http://localhost:3001"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Database Configuration
DATABASE_URL="your-postgresql-database-url"

# Stripe Configuration
STRIPE_SECRET_KEY="your-stripe-secret-key"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"

# JWT Secret
JWT_SECRET="your-jwt-secret"

# Anthropic
ANTHROPIC_API_KEY="your-anthropic-api-key"

# Resend (for contact form emails)
RESEND_API_KEY="your-resend-api-key"
```

## 📧 Setting Up Resend for Contact Forms

1. **Sign up for Resend**: Go to [resend.com](https://resend.com) and create an account
2. **Get your API key**: Copy your API key from the Resend dashboard
3. **Add domain (optional)**: For production, add and verify your domain
4. **Update environment**: Set `RESEND_API_KEY` in your `.env.local`
5. **Update email addresses**: In `app/api/contact/route.ts`, update:
   - `from: 'noreply@yourdomain.com'` (use your verified domain)
   - `to: ['support@yourdomain.com']` (your support email)

## 🛠 Available API Routes

### Core Routes

- `GET /api/health` - Health check for all services
- `POST /api/contact` - Contact form submission with email notifications

### Authentication

- `POST /api/auth/signup` - User registration
- `[...nextauth]` - NextAuth.js authentication

### Chat & Conversations

- `POST /api/chat` - Process chat messages
- `GET /api/conversations` - Get user conversations
- `GET /api/sessions` - Get chat sessions
- `GET /api/session/[sessionId]` - Get specific session

### Dashboard & Analytics

- `GET /api/dashboard` - Dashboard data
- `GET /api/dashboard/analytics` - Detailed analytics
- `GET /api/dashboard/billing` - Billing information
- `GET /api/dashboard/usage` - Usage statistics

### Memory & Milestones

- `GET/POST/PUT/DELETE /api/memory-cards` - Manage memory cards
- `GET/POST/PUT/DELETE /api/milestones` - Manage milestones

### Notifications

- `GET/POST /api/notifications/birthday` - Birthday notifications

### File Upload

- `POST /api/upload` - File upload handling

### Payments

- `POST /api/create-checkout-session` - Create Stripe checkout
- `POST /api/webhooks/stripe` - Stripe webhooks

### User Management

- `GET/POST /api/preferences` - User preferences
- `GET /api/welcome` - Welcome flow data

## 🧪 Testing API Routes

Run the test script to verify all routes:

```bash
node scripts/test-api-routes.js
```

This will test:

- Health check endpoint
- Contact form functionality
- Authentication signup

## 🚀 Quick Setup Commands

```bash
# Install dependencies (if not done)
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Start development server
npm run dev

# Start backend server (in another terminal)
npm run server
```

## 📝 Contact Form Usage

### Frontend Component

```jsx
import { ContactForm } from '@/components/contact-form';

// Use in any page
<ContactForm />
```

### API Usage

```javascript
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Question about SoulEcho',
    message: 'I have a question...'
  })
});
```

## 🔍 Health Monitoring

Check system health:

```bash
curl http://localhost:3000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "ok",
    "resend": "configured",
    "api": "ok"
  }
}
```

## ⚠️ Common Issues & Solutions

### Contact Form Not Working

- **Issue**: Email service not configured
- **Solution**: Add valid `RESEND_API_KEY` to `.env.local`

### Database Connection Errors

- **Issue**: Database not accessible
- **Solution**: Check `DATABASE_URL` and ensure PostgreSQL is running

### Authentication Issues

- **Issue**: NextAuth not working
- **Solution**: Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL` are set

### Chat Not Working

- **Issue**: Backend server not running
- **Solution**: Run `npm run server` in a separate terminal

## 📁 File Structure

```
app/api/
├── auth/
│   ├── signup/route.ts
│   └── [...nextauth]/route.ts
├── chat/route.ts
├── contact/route.ts          # New contact form
├── conversations/route.ts
├── dashboard/
│   ├── route.ts
│   ├── analytics/route.ts
│   ├── billing/route.ts
│   └── usage/route.ts
├── health/route.ts          # New health check
├── memory-cards/route.ts
├── milestones/route.ts
├── notifications/
│   └── birthday/route.ts
├── preferences/route.ts
├── sessions/route.ts
├── session/[sessionId]/route.ts
├── upload/route.ts
├── webhooks/stripe/route.ts
└── welcome/route.ts
```

## 🔐 Security Considerations

1. **API Keys**: Never expose API keys in client-side code
2. **Authentication**: All protected routes check user sessions
3. **Validation**: Input validation using Zod schemas
4. **Rate Limiting**: Consider implementing rate limiting for production
5. **CORS**: Configure CORS for production domains

## 📞 Support

If you encounter issues:

1. Check the health endpoint: `/api/health`
2. Review server logs for errors
3. Verify environment variables are set correctly
4. Test with the provided test script
5. Use the contact form at `/contact` once set up
