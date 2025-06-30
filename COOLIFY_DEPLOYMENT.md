# SoulEcho Coolify Deployment Guide

This guide will help you deploy SoulEcho on Coolify with external PostgreSQL and Weaviate databases.

## Prerequisites

- Coolify instance running
- External PostgreSQL database
- External Weaviate instance
- Your SoulEcho repository

## Deployment Steps

### 1. Prepare Your Repository

Ensure your repository has:

- ✅ `Dockerfile` (already configured)
- ✅ `docker-compose.yml` (simplified for app-only)
- ✅ `.env.example` (updated for external databases)

### 2. Set Up Environment Variables in Coolify

In your Coolify project, add these environment variables:

#### Required API Keys

```bash
OPENAI_API_KEY=your-openai-api-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key-here
```

#### Database Configuration

```bash
DATABASE_URL=postgresql://username:password@your-postgres-host:5432/echosoul
WEAVIATE_HOST=http://your-weaviate-host:8080
```

#### Application URLs (Update with your domain)

```bash
NEXTAUTH_URL=https://your-domain.com
NEXT_PUBLIC_API_URL=https://your-domain.com
```

#### Authentication Secrets

```bash
NEXTAUTH_SECRET=your-very-long-random-secret-at-least-32-characters
JWT_SECRET=your-jwt-secret-here
```

#### Stripe Configuration

```bash
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-publishable-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret
```

#### Email Configuration

```bash
RESEND_API_KEY=re_your-resend-api-key
```

### 3. Configure Coolify Service

1. **Create New Service**: Choose "Docker Compose" option
2. **Repository**: Connect your SoulEcho GitHub repository
3. **Branch**: Select your main/production branch
4. **Domain**: Set your custom domain
5. **Environment Variables**: Add all variables from step 2

### 4. Port Configuration

The application exposes two ports:

- **Port 3000**: Next.js frontend
- **Port 3001**: Express.js backend

Make sure Coolify is configured to route traffic to port 3000 (frontend).

### 5. Health Check Configuration

The application includes a health check endpoint at `/api/health` that verifies:

- Database connectivity
- Weaviate connectivity
- API key configuration

### 6. Database Setup

#### PostgreSQL Database

Ensure your external PostgreSQL has:

```sql
CREATE DATABASE echosoul;
-- The Prisma migrations will handle table creation
```

#### Weaviate Setup

Your external Weaviate should be configured with:

- Anonymous access enabled (or API key if preferred)
- Default vectorizer module: 'none' (we use OpenAI embeddings)

### 7. Deployment Process

1. **Push Changes**: Ensure all files are committed and pushed
2. **Deploy**: Trigger deployment in Coolify
3. **Monitor**: Check deployment logs
4. **Verify**: Visit your domain and check `/api/health`

### 8. Post-Deployment

#### Database Migration

The Docker container automatically runs:

```bash
npx prisma migrate deploy
```

This ensures your database schema is up to date.

#### Test Your Deployment

1. Visit your domain
2. Check `/api/health` endpoint
3. Test user registration/login
4. Upload a WhatsApp chat file
5. Test the chat functionality

## Troubleshooting

### Common Issues

#### Database Connection Failed

- Check `DATABASE_URL` format
- Ensure PostgreSQL is accessible from Coolify
- Verify credentials

#### Weaviate Connection Failed

- Check `WEAVIATE_HOST` URL
- Ensure Weaviate is accessible from Coolify
- Verify Weaviate configuration

#### API Keys Not Working

- Verify OpenAI API key has sufficient credits
- Check Anthropic API key is valid
- Ensure all keys are properly quoted in environment variables

#### Health Check Failing

```bash
# Check the health endpoint
curl https://your-domain.com/api/health
```

### Logs

Monitor deployment logs in Coolify:

- Build logs for Docker build issues
- Runtime logs for application errors
- Health check logs for connectivity issues

## Security Notes

- Always use strong, randomly generated secrets
- Use production Stripe keys for live deployments
- Regularly rotate API keys
- Keep your external databases secure
- Use HTTPS in production

## Scaling Considerations

- The current setup runs frontend and backend in one container
- For high traffic, consider separating frontend and backend services
- Monitor your external database and Weaviate performance
- Consider implementing rate limiting based on usage

## Support

If you encounter issues:

1. Check Coolify deployment logs
2. Verify all environment variables
3. Test external database connectivity
4. Check the `/api/health` endpoint response
