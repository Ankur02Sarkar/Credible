# Database Integration Guide

This document provides a comprehensive guide to the credit card application's database integration, which replaces the external API calls with a local PostgreSQL database using Prisma ORM.

## Overview

The application has been migrated from using external API calls to a robust database-driven architecture with the following key features:

- **PostgreSQL Database** with Prisma ORM
- **Vector Embeddings** for semantic search using Google Gemini AI
- **Chat History** storage and management
- **Search Analytics** and query tracking
- **Comprehensive API Endpoints** for all operations

## Database Schema

### Core Models

#### CreditCard
Stores all credit card information with comprehensive indexing for fast queries.

```sql
Table: credit_cards
- id: String (CUID)
- cardID: String (unique)
- cardName: String
- cardImage: String
- cardIssuerName: String?
- cardLogo: String?
- cardIssuerID: String?
- issuerImage: String
- issuerSlug: String
- isFeatured: Int
- cardCount: Int?
- publish: Int
- joiningFee: String
- annualFee: String
- minMonthlyIncome: Int
- annualPercentageRate: String
- cardType: String
- employmentType: String
- networkType: String?
- urlSlug: String (unique)
- overAllRating: Float
- statsCount: Int
- rewardPoints: String?
- bestFor: String
- totalCards: Int?
- rewardRate: String
- referralLink: String?
- datecreated: DateTime
- createdAt: DateTime
- updatedAt: DateTime
```

#### CardFeature
Stores individual features for each credit card.

```sql
Table: card_features
- id: String (CUID)
- cardFeatureID: String?
- cardID: String (FK to credit_cards)
- serialNumber: Int?
- heading: String
- description: String?
- createdAt: DateTime
- updatedAt: DateTime
```

#### CardEmbedding
Stores vector embeddings for semantic search capabilities.

```sql
Table: card_embeddings
- id: String (CUID)
- cardID: String (FK to credit_cards)
- content: String
- contentType: String (card_summary, features, etc.)
- embedding: Float[] (vector array)
- createdAt: DateTime
- updatedAt: DateTime
```

### Support Models

#### CardIssuer, CardType, NetworkType, EmploymentType
Reference tables for normalization and filtering.

#### ChatSession & ChatMessage
Store conversation history for the AI chat feature.

#### SearchQuery
Analytics table tracking user search patterns.

#### UserPreference
Store user preferences for personalized recommendations.

## API Endpoints

### 1. Cards API (`/api/cards`)

**Purpose**: Main endpoint for retrieving credit cards with filtering and pagination.

**Methods**: GET, POST

**Features**:
- Advanced filtering (card type, employment type, income range)
- Multiple sorting options (featured, rating, income, name)
- Pagination support
- Relationship loading (features included)

**Example Request**:
```json
POST /api/cards
{
  "sortby": "featured",
  "privileges": "Premium",
  "emptype": "Salaried",
  "incomeRange": "50000-100000",
  "page": 0,
  "limit": 20
}
```

**Example Response**:
```json
{
  "cardIssuer": [...], // Array of credit cards
  "cardFeatureList": [...], // Array of features
  "totalCardCount": 150,
  "pageCount": 8,
  "pagination": {
    "currentPage": 0,
    "totalPages": 8,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### 2. Search API (`/api/search`)

**Purpose**: Semantic search using vector embeddings with keyword fallback.

**Methods**: GET, POST

**Features**:
- AI-powered semantic search using Google Gemini embeddings
- Cosine similarity scoring
- Automatic fallback to keyword search
- Configurable similarity thresholds
- Search query logging for analytics

**Example Request**:
```json
POST /api/search
{
  "query": "best travel credit cards with airport lounge access",
  "limit": 10,
  "threshold": 0.7
}
```

**Example Response**:
```json
{
  "query": "best travel credit cards with airport lounge access",
  "results": [...], // Array of matching cards with similarity scores
  "searchType": "semantic",
  "totalResults": 8,
  "threshold": 0.7
}
```

### 3. Suggestions API (`/api/suggestions`)

**Purpose**: Generate search suggestions based on popular queries and AI recommendations.

**Methods**: GET, POST

**Features**:
- Popular query suggestions from analytics
- AI-generated suggestions based on available cards
- Mixed suggestions combining both approaches
- Related query suggestions

**Example Request**:
```bash
GET /api/suggestions?type=mixed&limit=8
```

### 4. Chat API (`/api/chat`)

**Purpose**: AI-powered conversational interface for credit card recommendations.

**Methods**: GET, POST, DELETE

**Features**:
- Session-based conversation history
- Context-aware responses using conversation history
- Integration with credit card database for accurate recommendations
- Message persistence and retrieval

**Example Request**:
```json
POST /api/chat
{
  "message": "What are the best credit cards for travel?",
  "sessionId": "session-123",
  "userId": "user-456"
}
```

## Setup Instructions

### 1. Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/credible_db"

# AI Services
NEXT_PUBLIC_GEMINI_API_KEY="your_gemini_api_key_here"

# Optional: For development
NODE_ENV="development"
```

### 2. Database Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### 3. Data Seeding

```bash
# Prepare your credit card data
# Replace the SEED_DATA in src/scripts/seedData.ts with your actual data

# Run the seeding script
npm run db:seed

# Or manually:
npx tsx src/scripts/seedData.ts
```

### 4. Testing

```bash
# Start the development server
npm run dev

# In another terminal, run API tests
npx tsx src/scripts/testApis.ts
```

## Data Migration Guide

### From External API to Database

1. **Export Data**: Use the original API to export all credit card data
2. **Format Data**: Structure the data to match the `SeedData` interface
3. **Update seedData.ts**: Replace the `SEED_DATA` constant with your actual data
4. **Run Seeding**: Execute the seeding script to populate the database
5. **Generate Embeddings**: The seeding process automatically generates vector embeddings
6. **Verify Data**: Use Prisma Studio or the test script to verify data integrity

### Data Structure Requirements

Your data should match this structure:

```typescript
interface SeedData {
  cardIssuer: CreditCardData[];
  cardFeatureList: CardFeatureData[];
}

interface CreditCardData {
  cardID: string;
  cardName: string;
  // ... other fields as defined in schema
}

interface CardFeatureData {
  cardID: string;
  heading: string;
  description?: string;
  // ... other fields
}
```

## Performance Optimizations

### Database Indexes

The schema includes strategic indexes for:
- Card filtering (cardType, employmentType, minMonthlyIncome)
- Search operations (bestFor, overAllRating, isFeatured)
- Relationship queries (cardID foreign keys)

### Query Optimizations

- **Pagination**: All queries support pagination to limit data transfer
- **Selective Loading**: Only load related data when needed
- **Caching**: Implement Redis caching for frequently accessed data (future enhancement)

### Vector Search Optimizations

- **Batch Embedding Generation**: Process embeddings in batches during seeding
- **Similarity Thresholds**: Configurable thresholds to balance relevance and performance
- **Fallback Mechanisms**: Automatic fallback to keyword search when embeddings fail

## AI Integration

### Google Gemini Integration

The application uses Google Gemini for:
1. **Text Embeddings**: Converting card descriptions into vector representations
2. **Natural Language Processing**: Understanding user queries and generating responses
3. **Content Generation**: Creating card summaries and comparisons

### Embedding Strategy

- **Card Summary Embeddings**: Comprehensive embeddings including card details and features
- **Feature Embeddings**: Separate embeddings for detailed feature search
- **Query Embeddings**: Real-time embedding generation for user searches

## Error Handling

### Database Errors
- Connection failures with automatic retry
- Transaction rollbacks for data consistency
- Graceful degradation when database is unavailable

### AI Service Errors
- Fallback to keyword search when embeddings fail
- Retry mechanisms with exponential backoff
- Static suggestions when AI generation fails

### API Error Responses
```json
{
  "error": "Descriptive error message",
  "details": "Additional details (development only)",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Monitoring and Analytics

### Search Analytics
- Query frequency tracking
- Popular search terms identification
- Search success rate monitoring

### Performance Metrics
- API response times
- Database query performance
- Embedding generation times

### User Behavior
- Chat session analysis
- Feature usage tracking
- Conversion funnel analysis

## Security Considerations

### Data Protection
- Environment variable management for sensitive keys
- Database connection security
- Input validation and sanitization

### API Security
- Rate limiting (to be implemented)
- Input validation
- SQL injection prevention through Prisma

### AI Service Security
- API key protection
- Request/response logging
- Content filtering

## Maintenance

### Regular Tasks
- **Database Backups**: Implement automated backup strategy
- **Embedding Updates**: Re-generate embeddings when card data changes
- **Analytics Cleanup**: Archive old search queries and chat sessions
- **Performance Monitoring**: Monitor query performance and optimize as needed

### Data Updates
- **Incremental Updates**: Update individual cards without full re-seeding
- **Batch Operations**: Use transactions for bulk updates
- **Consistency Checks**: Verify data integrity after updates

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL environment variable
   - Verify PostgreSQL service is running
   - Check database credentials and permissions

2. **Embedding Generation Fails**
   - Verify NEXT_PUBLIC_GEMINI_API_KEY is set
   - Check Gemini API quota and limits
   - Review network connectivity to Google APIs

3. **Search Returns No Results**
   - Check if embeddings were generated successfully
   - Lower similarity threshold for testing
   - Verify seed data was imported correctly

4. **Slow API Responses**
   - Check database query performance with EXPLAIN
   - Review index usage
   - Consider pagination adjustments

### Debug Tools

- **Prisma Studio**: Visual database browser
- **API Test Suite**: Comprehensive testing script
- **Database Logs**: Enable query logging for debugging
- **Network Monitoring**: Monitor external API calls

## Future Enhancements

### Performance
- Implement Redis caching layer
- Add database connection pooling
- Optimize vector search with specialized databases (e.g., Pinecone, Weaviate)

### Features
- Real-time recommendations
- User personalization
- Advanced analytics dashboard
- A/B testing framework

### Scalability
- Database sharding strategy
- CDN integration for static assets
- Microservices architecture consideration
- Auto-scaling infrastructure

## Contributing

When contributing to the database layer:

1. **Schema Changes**: Always create migrations for schema changes
2. **Seed Data**: Update seed scripts when adding new data types
3. **API Changes**: Update tests when modifying API endpoints
4. **Documentation**: Keep this documentation up to date

## Support

For issues related to database integration:

1. Check the troubleshooting section above
2. Review the test suite results
3. Examine database logs and query performance
4. Verify environment configuration

---

This database integration provides a robust, scalable foundation for the credit card application with advanced search capabilities and comprehensive data management.