# EchoSoul Setup Guide 💫

EchoSoul is a compassionate AI platform that lets you reconnect with loved ones through their WhatsApp messages. This guide will help you set up the platform for development.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key
- ChromaDB running locally

### 1. Clone and Install Dependencies

```bash
git clone <your-repo>
cd echosoul
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in your `.env` file with:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/echosoul"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-here"

# OpenAI API (Required for AI features)
OPENAI_API_KEY="sk-your-openai-api-key-here"

# ChromaDB
CHROMA_URL="http://localhost:8000"

# Backend API
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Create and run migrations
npx prisma migrate dev --name init

# (Optional) Seed with test data
npx prisma db seed
```

### 4. Start ChromaDB

ChromaDB is required for vector storage. Install and run:

```bash
# Install ChromaDB
pip install chromadb

# Start ChromaDB server
chroma run --host localhost --port 8000
```

Or using Docker:

```bash
docker run -p 8000:8000 ghcr.io/chroma-core/chroma:latest
```

### 5. Start the Application

Open 2 terminals:

**Terminal 1 - Frontend:**

```bash
npm run dev
```

**Terminal 2 - Backend:**

```bash
npm run server
```

The app will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- ChromaDB: http://localhost:8000

## 🔧 Configuration

### Getting OpenAI API Key

1. Visit https://platform.openai.com/api-keys
2. Create a new secret key
3. Add it to your `.env` file

### WhatsApp Export Format

The platform supports multiple WhatsApp export formats:

- `[DD/MM/YYYY, HH:MM:SS] Name: Message`
- `DD/MM/YYYY, HH:MM - Name: Message`
- `[DD.MM.YY, HH:MM:SS] Name: Message`

To export from WhatsApp:

1. Open the chat you want to export
2. Tap the contact/group name → Export Chat
3. Choose "Without Media"
4. Save the .txt file

## 🐛 Troubleshooting

### ChromaDB Connection Issues

```bash
# Check if ChromaDB is running
curl http://localhost:8000/api/v1/heartbeat

# Restart ChromaDB
chroma run --host localhost --port 8000 --path ./chroma_data
```

### OpenAI API Issues

- Verify your API key is correct
- Check you have available credits
- Ensure you're using a supported model (gpt-4, gpt-3.5-turbo)

### Database Issues

```bash
# Reset database
npx prisma migrate reset

# View database
npx prisma studio
```

### File Upload Issues

- Ensure file is exported as .txt from WhatsApp
- Check file contains proper message format
- Try with "Without Media" export option

## 📦 Production Deployment

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
OPENAI_API_KEY="your-production-openai-key"
CHROMA_URL="your-chroma-instance-url"
```

### Recommended Services

- **Database**: Supabase, PlanetScale, or Railway
- **Hosting**: Vercel, Netlify, or Railway
- **Vector DB**: Hosted ChromaDB or Pinecone

## 🔒 Security Notes

- Never commit `.env` files
- Use strong secrets for production
- Implement rate limiting for API endpoints
- Consider data encryption for sensitive content

## 📝 Development Scripts

```bash
# Development
npm run dev          # Start Next.js dev server
npm run server       # Start Express backend

# Database
npx prisma studio    # Database GUI
npx prisma generate  # Update Prisma client
npx prisma migrate dev  # Run migrations

# Build
npm run build        # Build for production
npm run start        # Start production server
```

## 🆘 Need Help?

If you encounter issues:

1. Check the console logs for specific error messages
2. Verify all services are running (Frontend, Backend, ChromaDB, Database)
3. Ensure environment variables are set correctly
4. Try restarting all services

The platform handles graceful degradation - if ChromaDB or OpenAI are unavailable, it will show appropriate error messages rather than crashing.
