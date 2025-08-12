# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SoulEcho (branded as "Talkers") is a grief support platform that uses AI to help people process loss and reconnect with deceased loved ones through preserved conversations. The platform allows users to upload WhatsApp conversations, create memorial interactions, and provides grief support features including analytics, milestones, and subscription management.

## Core Architecture

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Vector Database**: Weaviate for conversation embeddings
- **Authentication**: NextAuth.js with JWT sessions
- **UI**: Tailwind CSS with Radix UI components (shadcn/ui)
- **Payment**: Stripe for subscriptions
- **AI**: OpenAI and Anthropic APIs for conversation generation
- **Email**: Resend for transactional emails

## Essential Commands

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production (includes SEO checks)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Database
- `npm run db:migrate` - Run Prisma migrations in development
- `npm run db:deploy` - Deploy migrations to production
- `npm run db:seed` - Seed database with test data
- `npx prisma generate` - Generate Prisma client after schema changes
- `npx prisma studio` - Open Prisma Studio for database management

### Docker
- `npm run docker:up` - Start Docker containers
- `npm run docker:down` - Stop Docker containers
- `npm run docker:build` - Build Docker images
- `npm run docker:logs` - View container logs

### SEO & Auditing
- `npm run seo:check` - Run comprehensive SEO checks (runs automatically before build)
- `npm run seo:audit` - Full SEO audit with live site analysis

## Key File Locations

### Core Application
- `app/` - Next.js App Router pages and API routes
- `components/` - React components (UI components in `ui/`, business components at root)
- `lib/` - Utility functions and service integrations
- `prisma/schema.prisma` - Database schema
- `types/` - TypeScript type definitions

### Configuration
- `next.config.js` - Next.js configuration with SEO optimizations
- `tailwind.config.ts` - Tailwind CSS configuration
- `components.json` - shadcn/ui configuration

### Scripts
- `scripts/seo-check.js` - SEO validation script
- `scripts/start.js` - Application startup script

## Database Schema Key Models

- **User** - Core user model with subscription and trial management
- **ChatSession** - Conversation sessions with deceased persons
- **Conversation** - Individual chat messages and AI responses
- **MemoryMilestone** - Important dates and memories
- **MemoryCard** - Generated memorial cards
- **NotificationLog** - System notifications and reminders

## Environment Variables Required

Core variables (check `.env.example` if it exists):
- `DATABASE_URL` - PostgreSQL connection string
- `WEAVIATE_HOST` - Vector database host
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key
- `NEXTAUTH_SECRET` - NextAuth secret
- `STRIPE_SECRET_KEY` - Stripe secret key
- `RESEND_API_KEY` - Email service API key

## Key Features & Components

### WhatsApp Parser (`lib/whatsapp-parser.ts`)
- Parses multiple WhatsApp export formats
- Filters messages by specific person
- Handles various timestamp formats and system messages

### Subscription Management
- Stripe integration for payment processing
- Trial management with usage tracking
- Token-based usage limits for different subscription tiers

### AI Chat System
- Vector similarity search using Weaviate
- Context-aware conversation generation
- Support for both OpenAI and Anthropic models

### SEO Optimization
- Comprehensive meta tag management for grief support keywords
- Structured data for medical/health organization
- Performance optimizations and Core Web Vitals focus
- Automated SEO checks before deployment

## Development Notes

- The codebase uses TypeScript with strict mode
- ESLint is configured but ignored during builds (`ignoreDuringBuilds: true`)
- The application is optimized for grief support and bereavement counseling SEO
- Docker setup available for containerized deployment
- Both development and production database configurations supported via Prisma

## Testing & Quality

- No test framework is currently configured
- SEO validation runs automatically before builds
- Prisma provides type safety for database operations
- Comprehensive error handling in API routes

## Deployment

The application supports Docker deployment and includes health checks. The build process includes automatic SEO validation to ensure optimal search engine performance for grief support keywords.