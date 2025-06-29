# EchoSoul - AI-Powered Memory Conversations

A Next.js application that allows you to have conversations with AI-powered versions of your loved ones based on their WhatsApp chat history.

## Features

- **Gentle Landing Page**: Soft, empathetic introduction with careful attention to emotional design
- **WhatsApp Integration**: Upload and parse WhatsApp chat exports (.txt files)
- **AI-Powered Conversations**: Real-time chat with responses in your loved one's authentic voice
- **Vector Database**: Qdrant integration for semantic message matching
- **Memory Timeline & Milestones**: Create and organize special moments, birthdays, and anniversaries
- **Birthday Notifications**: Receive special birthday messages from all your conversations
- **Memory Cards**: Beautiful, AI-generated memory cards for significant dates
- **Privacy First**: Automatic data deletion and secure processing
- **Responsive Design**: Beautiful, accessible interface across all devices

## Tech Stack

- **Frontend**: Next.js 15 with TypeScript
- **Backend**: Express.js server
- **Vector Database**: Qdrant
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS with shadcn/ui

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- OpenAI API key

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd soulecho
   ```
2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```
4. **Start the application (with Qdrant)**

   ```bash
   npm run start-all
   ```

This will:

- ✅ Check all prerequisites
- 🐳 Start Qdrant vector database and PostgreSQL
- 🔧 Start the backend server
- 🎨 Start the Next.js frontend
- 📊 Show all service URLs

## 🐳 Docker Services

The application uses Docker Compose to manage:

- **Qdrant**: Vector database for AI embeddings
- **PostgreSQL**: Main application database

### Docker Commands

```bash
# Start only Docker services
npm run docker:up

# Stop Docker services
npm run docker:down

# View Docker logs
npm run docker:logs
```

## 🔧 Available Scripts

- `npm run start-all` - Start everything (recommended)
- `npm run start-qdrant` - Alternative startup with Qdrant
- `npm run dev` - Start only Next.js frontend
- `npm run server` - Start only backend server
- `npm run docker:up` - Start Docker services only
- `npm run docker:down` - Stop Docker services
- `npm run docker:logs` - View Docker logs

## 🌐 Service URLs

When running locally:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Qdrant**: http://localhost:6333
- **PostgreSQL**: localhost:5432
- **Health Check**: http://localhost:3000/api/health

## 📋 Environment Variables

Required environment variables in `.env`:

```env
# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/soulecho

# Qdrant
QDRANT_URL=http://localhost:6333

# NextAuth
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000

# Email (optional)
RESEND_API_KEY=your_resend_key

# Stripe (optional)
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript
- **Backend**: Express.js server
- **Vector Database**: Qdrant
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI GPT-4 and embeddings
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS with shadcn/ui

## 🚀 Production Deployment

### Coolify Deployment

1. **Option 1: Docker Compose (Recommended)**

   - Upload `docker-compose.yml` to Coolify
   - Set environment variables in Coolify dashboard
   - Deploy the stack
2. **Option 2: Individual Services**

   - Deploy main app container
   - Add Qdrant as separate service
   - Add PostgreSQL as separate service
   - Configure networking

### Environment Variables for Production

```env
# Update URLs for production
QDRANT_URL=http://qdrant:6333
DATABASE_URL=postgresql://postgres:password@postgres:5432/soulecho
NEXTAUTH_URL=https://yourdomain.com
```

## 🔍 Health Check

Monitor service health at: `GET /api/health`

Returns:

```json
{
  "status": "healthy",
  "services": {
    "qdrant": "healthy",
    "database": "healthy", 
    "openai": "configured",
    "resend": "configured"
  }
}
```

## 🛠️ Development

### Adding New Features

1. Create feature branch
2. Make changes
3. Test with `npm run start-all`
4. Submit pull request

### Database Migrations

```bash
npx prisma migrate dev
npx prisma generate
```

### Vector Store Operations

The application uses Qdrant for vector storage. See `lib/vector-store.ts` for implementation details.

## 📚 Documentation

- [Qdrant Migration Guide](./QDRANT_MIGRATION.md) - Details about the ChromaDB to Qdrant migration
- [API Documentation](./README-API-SETUP.md) - Backend API setup and usage
- [Setup Guide](./SETUP.md) - Detailed setup instructions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🚀 Smart Trial System

### Intelligent Rate Limiting

Instead of hard cutoffs, EchoSoul uses a sophisticated rate limiting system that:

- **Day 1**: Full experience with rich, detailed responses (1800+ chars)
- **Day 2**: Good experience with moderate detail (1200+ chars)
- **Day 3**: Basic experience with concise responses (800+ chars)
- **Post-Trial**: Minimal experience encouraging upgrade (400 chars)

### Progressive Feature Degradation

- **Memory Depth**: Gradually reduces from 30 → 20 → 10 → 5 memories
- **Context Window**: Reduces from 8000 → 5000 → 3000 → 1500 characters
- **Response Quality**: Transitions from rich emotional depth to basic responses
- **Token Management**: Smart token tracking prevents excessive Claude API usage

## 💎 Subscription Plans

### Free Trial (3 Days)

- 1 complete conversation
- Full AI experience initially
- Gradual quality degradation
- All conversation features

### Premium ($12/month)

- Unlimited conversations
- Full response quality always
- Advanced memory timeline
- Priority support
- Memory cards & reflections

### Lifetime ($149 one-time)

- Everything in Premium
- No monthly fees
- Future feature updates
- Priority support for life

## 🎯 Key Features

### Smart Experience Management

- **Graceful Degradation**: Users naturally want to upgrade
- **Token Optimization**: Efficient Claude API usage
- **Quality Indicators**: Visual feedback on current experience level
- **Upgrade Messaging**: Context-aware prompts

### Technical Implementation

- **Rate Limiting Service**: Calculates user experience level
- **Token Tracking**: Monitors API usage per user
- **Database Migration**: Trial and token fields
- **Backend Integration**: Response quality control

## 🛠 Setup

1. **Database Migration**

```bash
npx prisma migrate dev --name add_trial_tracking
npx prisma migrate dev --name add_token_tracking
npx prisma generate
```

2. **Environment Variables**

```bash
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

3. **Stripe Configuration**

- Create products for Premium monthly and Lifetime plans
- Update price IDs in `/app/pricing/page.tsx`
- Set up webhook endpoints

## 📊 Rate Limiting Logic

### Trial Progress Calculation

```typescript
const trialProgress = (now - trialStart) / (trialEnd - trialStart);

if (trialProgress < 0.3) qualityLevel = 100;      // Full experience
else if (trialProgress < 0.6) qualityLevel = 85;  // Slight degradation  
else if (trialProgress < 0.8) qualityLevel = 65;  // Noticeable reduction
else qualityLevel = 40;                            // Significant limits
```

### Token-Based Adjustments

```typescript
if (totalTokensUsed > 10000) qualityLevel -= 15;
if (totalTokensUsed > 20000) qualityLevel -= 15;
if (tokensToday > 2000) qualityLevel -= 10;
```

### Quality Level Mapping

- **90-100%**: Full experience (1800 chars, 30 memories, 8000 context)
- **70-89%**: Good experience (1200 chars, 20 memories, 5000 context)
- **50-69%**: Basic experience (800 chars, 10 memories, 3000 context)
- **25-49%**: Minimal experience (400 chars, 5 memories, 1500 context)

## 🎨 User Experience

### Visual Indicators

- **Trial Status Component**: Shows days left and usage
- **Quality Indicators**: Response quality level display
- **Degradation Messages**: Contextual upgrade prompts
- **Experience Summary**: Detailed trial progress breakdown

### Gradual Messaging

- Day 1: No degradation messages
- Day 2: "Experiencing EchoSoul's powerful memory system..."
- Day 3: "Trial ending soon! Upgrade now..."
- Expired: "Trial expired. Upgrade to Premium..."

## 🔧 Technical Stack

- **Frontend**: Next.js 13, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, Anthropic Claude API
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: Stripe for subscriptions
- **Memory**: Qdrant for vector storage
- **Auth**: NextAuth.js

## 📈 Benefits

### For Users

- **Smooth Experience**: No jarring cutoffs
- **Full Trial Value**: Experience the complete product
- **Clear Value Prop**: Understand what Premium offers
- **Natural Upgrade Path**: Organic conversion funnel

### For Business

- **Higher Conversions**: Gradual degradation encourages upgrades
- **Cost Control**: Smart token management
- **User Retention**: Quality experience builds trust
- **Scalable**: Handles growth without API cost explosions

This smart rate limiting system creates a win-win: users get genuine value during their trial while naturally discovering the benefits of upgrading to Premium.
