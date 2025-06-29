# Qdrant Migration Guide

## Why Qdrant?

We've migrated from ChromaDB to Qdrant for the following reasons:

1. **Better Production Support**: Qdrant is designed for production deployments with proper Docker support
2. **Improved Reliability**: More stable and consistent performance
3. **Better Coolify Integration**: Works seamlessly with Coolify's container orchestration
4. **Enhanced Scalability**: Better handling of large datasets
5. **Superior API**: More intuitive and reliable API

## Changes Made

### 1. Package Dependencies

- Removed: `chromadb`
- Added: `@qdrant/js-client-rest`

### 2. Vector Store Implementation

- Updated `lib/vector-store.ts` to use Qdrant client
- Improved error handling and type safety
- Added health check functionality

### 3. Backend Server

- Updated `backend/server.js` to use new vector store
- Simplified embedding storage process
- Better error handling for vector operations

### 4. Docker Configuration

- Added `docker-compose.yml` with Qdrant service
- Proper volume management for data persistence
- Environment variable configuration

## Environment Variables

Add these to your `.env` file:

```env
# Qdrant Configuration
QDRANT_URL=http://localhost:6333

# Database Configuration (for Coolify)
POSTGRES_DB=soulecho
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://postgres:your_secure_password@postgres:5432/soulecho
```

## Deployment in Coolify

### Option 1: Using Docker Compose

1. Upload the `docker-compose.yml` file to Coolify
2. Set the environment variables in Coolify dashboard
3. Deploy the stack

### Option 2: Using Individual Services

1. Deploy the main application container
2. Add Qdrant as a separate service
3. Add PostgreSQL as a separate service
4. Configure networking between services

## Local Development

To run locally with Qdrant:

```bash
# Start all services
docker-compose up -d

# Check services
docker-compose ps

# View logs
docker-compose logs -f app
docker-compose logs -f qdrant
```

## Health Check

The application now includes a health check endpoint that verifies:

- Qdrant vector database connection
- PostgreSQL database connection
- OpenAI API configuration
- Resend email service configuration

Access at: `GET /api/health`

## Migration from ChromaDB

If you have existing ChromaDB data:

1. **Export existing data** (if needed)
2. **Deploy new Qdrant setup**
3. **Re-upload conversation files** (recommended approach)
4. **Verify functionality** through the health check endpoint

## Benefits

- ✅ **Production Ready**: Proper containerization and orchestration
- ✅ **Better Performance**: Optimized for large-scale operations
- ✅ **Reliable**: More stable connection handling
- ✅ **Scalable**: Better resource management
- ✅ **Maintainable**: Cleaner codebase and better error handling

## Troubleshooting

### Qdrant Connection Issues

```bash
# Check if Qdrant is running
curl http://localhost:6333/collections

# Check logs
docker-compose logs qdrant
```

### Vector Store Errors

- Verify `QDRANT_URL` environment variable
- Check Qdrant service health
- Review application logs for detailed error messages

### Performance Issues

- Monitor Qdrant resource usage
- Consider adjusting batch sizes in vector operations
- Check network connectivity between services
