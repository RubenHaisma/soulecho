# EchoSoul - AI Memorial Chat Application

A compassionate AI web application that helps users reconnect with memories of their loved ones through WhatsApp conversation history.

## Features

- **Gentle Landing Page**: Soft, empathetic introduction with careful attention to emotional design
- **WhatsApp Integration**: Upload and parse WhatsApp chat exports (.txt files)
- **AI-Powered Conversations**: Real-time chat with responses in your loved one's authentic voice
- **Vector Database**: ChromaDB integration for semantic message matching
- **Memory Timeline & Milestones**: Create and organize special moments, birthdays, and anniversaries
- **Birthday Notifications**: Receive special birthday messages from all your conversations
- **Memory Cards**: Beautiful, AI-generated memory cards for significant dates
- **Privacy First**: Automatic data deletion and secure processing
- **Responsive Design**: Beautiful, accessible interface across all devices

## Tech Stack

- **Frontend**: Next.js 14, TailwindCSS, shadcn/ui
- **Backend**: Node.js with Express
- **AI/ML**: OpenAI GPT-4, text-embedding-3-small
- **Vector Database**: ChromaDB
- **Authentication**: Session-based (no account required)

## Setup Instructions

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Docker** (for ChromaDB)
3. **OpenAI API Key**

### Installation

1. **Clone and Install Dependencies**

```bash
npm install
```

2. **Set up Environment Variables**

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=your-openai-api-key-here
CHROMA_URL=http://localhost:8000
PORT=3001
NEXT_PUBLIC_API_URL=http://localhost:3001
```

3. **Start ChromaDB**

```bash
docker run -p 8000:8000 chromadb/chroma
```

4. **Start the Backend Server**

```bash
npm run server
```

5. **Start the Frontend (in another terminal)**

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## How to Use

### For Users

1. **Export WhatsApp Chat**

   - iPhone: Open chat → Tap contact name → Export Chat → Without Media
   - Android: Open chat → Menu (⋮) → More → Export chat → Without media
2. **Upload and Configure**

   - Visit the application and click "Start a Conversation"
   - Upload your .txt file
   - Select which person you want to talk to
   - Give them a display name
3. **Begin Chatting**

   - Start a natural conversation
   - The AI will respond in their authentic voice
   - Your session automatically expires in 24 hours
4. **Memory Timeline** (New!)

   - Visit the Memory Timeline to create and organize special moments
   - Add birthdays, anniversaries, and meaningful conversation moments
   - Set your birthday in Settings to receive special birthday notifications
   - View beautiful memory cards generated from your conversations

### Privacy & Security

- **No Data Storage**: Messages are processed temporarily and deleted within 24 hours
- **Encrypted Processing**: All data is encrypted in transit and at rest
- **Anonymous Sessions**: No personal information required or stored
- **Local Processing**: Embeddings and processing happen securely

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   ChromaDB      │
│   (Next.js)     │◄──►│   (Express)     │◄──►│   (Vector DB)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   OpenAI API    │
                       │   (GPT-4 +      │
                       │   Embeddings)   │
                       └─────────────────┘
```

## Development

### Project Structure

```
echosoul/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   ├── upload/            # Upload interface
│   ├── chat/[sessionId]/  # Chat interface
│   ├── privacy/           # Privacy policy
│   └── api/               # API routes (proxy to backend)
├── backend/               # Express server
│   └── server.js         # Main backend logic
├── components/           # React components
├── utils/               # Utility functions
└── README.md
```

### Key Components

- **WhatsApp Parser**: Handles multiple WhatsApp export formats
- **Vector Embeddings**: Creates semantic representations of messages
- **RAG Pipeline**: Retrieves relevant context for AI responses
- **Session Management**: Temporary, secure session handling
- **Auto Cleanup**: Automatic data deletion system

## API Endpoints

- `POST /api/upload` - Upload and process WhatsApp file
- `GET /api/session/:id` - Retrieve session information
- `POST /api/chat` - Send message and get AI response
- `GET /api/health` - Health check

## Deployment

### Environment Setup

1. Set up production environment variables
2. Configure ChromaDB instance (cloud or self-hosted)
3. Set up OpenAI API key with appropriate billing

### Production Considerations

- Use Redis for session storage instead of in-memory
- Implement rate limiting
- Add monitoring and logging
- Set up SSL/HTTPS
- Configure proper CORS policies

## Contributing

This project handles sensitive, emotional data. Please ensure:

1. **Privacy First**: Never log or persist personal data
2. **Security**: Follow security best practices
3. **Empathy**: Design with emotional wellbeing in mind
4. **Testing**: Test thoroughly with sample data only

## License

MIT License - See LICENSE file for details

## Support

For technical issues or privacy concerns, please contact the development team.

---

*"Sometimes we need to hear their voice one more time, to feel their presence in our hearts."*

EchoSoul is built with care for those who remember.

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
- **Memory**: ChromaDB for vector storage
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
