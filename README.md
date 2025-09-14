# Buyer Lead Management App

A comprehensive Next.js application for managing real estate buyer leads with CRUD operations, advanced search/filtering, CSV import/export, and dual authentication systems (Supabase + Demo mode).

## Features

### Core Functionality

**Complete Lead Management**: Create, read, update, and delete buyer leads with full CRUD operations
**Advanced Search & Filtering**: Multi-field filtering by city, property type, status, timeline with URL synchronization
**CSV Import/Export**: Bulk import leads (up to 200 rows) and export filtered results with Excel compatibility
**Dual Authentication**: Supabase magic link authentication + Demo login system for easy evaluation
**Ownership Control**: Users can only access and edit their own leads with Row Level Security
**Complete Audit Trail**: Full history tracking of all lead changes with detailed diff logging
**Responsive Design**: Mobile-first design with professional UI using shadcn/ui components
**Rate Limiting**: API protection against abuse (10 requests/minute per IP)
**Error Boundaries**: Graceful error handling throughout the application

### Technical Features

**Server-Side Rendering**: SEO-optimized pages with Next.js App Router
**Real-Time Data**: SWR for data fetching, caching, and synchronization
**Type Safety**: Full TypeScript implementation with Zod validation
**Performance Optimized**: Database indexes, debounced search, efficient pagination
**Security First**: Input sanitization, CSRF protection, SQL injection prevention

## Tech Stack

### Frontend

**Next.js 15** (App Router) - React framework with server-side rendering
**TypeScript** - Type-safe development
**Tailwind CSS v4** - Utility-first CSS framework
**shadcn/ui** - 40+ high-quality UI components
**React Hook Form** - Form handling with validation
**SWR** - Data fetching and caching

### Backend

**Next.js API Routes** - Serverless API endpoints
**Prisma ORM** - Type-safe database operations
**PostgreSQL** - Primary database (via Supabase)
**Zod** - Runtime type validation and schema validation

### Infrastructure

**Supabase** - Database hosting and authentication
**Vercel** - Deployment and hosting platform
**Vercel Analytics** - Performance monitoring

### Development Tools

**Jest** - Testing framework
**React Testing Library** - Component testing
**ESLint** - Code linting
**Prisma Studio** - Database management GUI

## Demo System

The application includes a complete demo system for easy evaluation:

### Demo Access

**URL**: `/demo-login`
**Demo User**: `demo@example.com`
**Sample Data**: 5 pre-configured buyer leads with realistic data
**Full Functionality**: All features available without Supabase setup

### Demo Features

Complete CRUD operations on sample leads
Search and filtering capabilities
CSV import/export functionality
History tracking and audit trail
No external dependencies required

## Data Model

### Core Tables

**buyers** - Main lead storage

```sql
id (UUID, Primary Key)
fullName, email, phone (Contact information)
city (Enum: Chandigarh, Mohali, Zirakpur, Panchkula, Other)
propertyType (Enum: Apartment, Villa, Plot, Office, Retail)
bhk (Enum: Studio, 1BHK, 2BHK, 3BHK, 4BHK)
purpose (Enum: Buy, Rent)
budgetMin, budgetMax (Integer, in lakhs)
timeline (Enum: 0-3 months, 3-6 months, 6+ months, Exploring)
source (Enum: Website, Referral, Walk-in, Call, Other)
status (Enum: New, Qualified, Contacted, Visited, Negotiation, Converted, Dropped)
notes, tags (Text fields for additional information)
ownerId (UUID, Foreign Key to users)
createdAt, updatedAt (Timestamps)
```

**buyer_history** - Complete audit trail

```sql
id (UUID, Primary Key)
buyerId (UUID, Foreign Key)
changedBy (UUID, Foreign Key to users)
changedAt (Timestamp)
diff (JSONB - stores detailed field changes)
```

**users** - Authentication and ownership

```sql
id (UUID, matches Supabase auth.users)
email, fullName (User information)
createdAt, updatedAt (Timestamps)
```

### Database Optimizations

**Indexes**: Optimized for filtering (city, property type, status, owner)
**Row Level Security**: Automatic ownership-based access control
**Cascade Deletes**: Maintains data integrity
**JSONB Storage**: Flexible history tracking

## Project Deplyoment

**Project Demo**
[Click-Here]()

#### Installation Steps

1. **Clone and Install**

```bash
git clone https://github.com/vishnuu5/Buyer-Lead-intake-app.git
cd buyer-lead-app
npm install
```

2. **Environment Configuration**
   Create `.env.local` with required variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Database
DATABASE_URL="postgresql://postgres:[password]@db.[project].supabase.co:5432/postgres"

# Development
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL="http://localhost:3000"
NEXTAUTH_SECRET=""
```

3. **Supabase Setup**

   - Create new project at [supabase.com](https://supabase.com)
   - Get credentials from Project Settings → API
   - Run `scripts/001_initial_schema.sql` in Supabase SQL Editor

4. **Database Operations**

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (alternative to SQL script)
npm run db:push

# Optional: Add sample data
npm run db:seed
```

5. **Development Server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## API Documentation

### Authentication

All API routes require authentication via Supabase session cookies or demo user session.

### Core Endpoints

**GET /api/buyers**
**Purpose**: Retrieve paginated list of buyer leads
**Query Parameters**:
`search` (string): Search in name, email, phone
`city` (enum): Filter by city
`propertyType` (enum): Filter by property type
`status` (enum): Filter by lead status
`timeline` (enum): Filter by purchase timeline
`page` (number): Page number (default: 1)
`limit` (number): Items per page (default: 10, max: 50)
**Response**: Paginated leads with metadata
**Authorization**: Returns only leads owned by authenticated user

**POST /api/buyers**
**Purpose**: Create new buyer lead
**Body**: Buyer lead data (validated with Zod schema)
**Response**: Created lead with generated UUID
**Rate Limit**: 10 requests per minute per IP
**Validation**: Comprehensive field validation with detailed error messages

**GET /api/buyers/[id]**
**Purpose**: Retrieve single buyer lead
**Parameters**: `id` (UUID) - Buyer lead ID
**Response**: Complete buyer lead data
**Authorization**: Must be lead owner

**PUT /api/buyers/[id]**
**Purpose**: Update existing buyer lead
**Parameters**: `id` (UUID) - Buyer lead ID
**Body**: Updated buyer data (partial updates supported)
**Response**: Updated lead data
**Authorization**: Must be lead owner
**Audit Trail**: Automatically creates history entry with changes

**DELETE /api/buyers/[id]**
**Purpose**: Delete buyer lead
**Parameters**: `id` (UUID) - Buyer lead ID
**Response**: Success confirmation
**Authorization**: Must be lead owner
**Cascade**: Removes associated history entries

**POST /api/buyers/import**
**Purpose**: Bulk import buyer leads from CSV
**Body**: FormData with CSV file
**File Limits**: Max 5MB, up to 200 rows
**Validation**: Comprehensive field validation with detailed error reporting
**Response**: Import results with success/error counts and detailed feedback
**Supported Formats**: CSV with standard headers

**GET /api/buyers/export**
**Purpose**: Export filtered buyer leads to CSV
**Query Parameters**: Same as GET /api/buyers (for filtering)
**Response**: CSV file download with proper headers
**Format**: Excel-compatible CSV with all lead fields
**Authorization**: Exports only user's leads

### Error Handling

**400 Bad Request**: Validation errors with detailed field messages
**401 Unauthorized**: Authentication required
**403 Forbidden**: Insufficient permissions (not lead owner)
**404 Not Found**: Resource not found
**429 Too Many Requests**: Rate limit exceeded
**500 Internal Server Error**: Server errors with sanitized messages

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test buyer.validation.test.ts

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

**Validation Schemas**: Complete Zod schema testing
**Utility Functions**: CSV processing, formatting, auth utilities
**Component Testing**: Form validation, error handling
**API Routes**: Integration testing (planned)
**E2E Testing**: Full user workflows (planned)

## Deployment

### Vercel

1. **Connect Repository**
   Import project from GitHub to Vercel
   Vercel auto-detects Next.js configuration

2. **Environment Variables**
   Add all required environment variables in Vercel dashboard
   Use Supabase integration for automatic configuration

3. **Database Setup**
   Ensure Supabase project is properly configured
   Run database scripts via Supabase SQL Editor

4. **Deploy**
   Automatic deployment on git push to main branch
   Preview deployments for pull requests
   Custom domains and SSL certificates included

## Development Guidelines

### Code Organization Principles

**Server vs Client Components**
**Server Components**: Use for data fetching, SEO-critical pages, and static content
**Client Components**: Use for interactive forms, real-time features, and user interactions
**API Routes**: Handle all database operations with proper validation and error handling

**Validation Strategy**

1. **Client-side**: React Hook Form + Zod for immediate user feedback
2. **Server-side**: Zod validation in API routes for security and data integrity
3. **Database**: Prisma schema constraints as final validation layer

**Performance Best Practices**
Server-side rendering for listing pages and SEO
Client-side caching with SWR for real-time data
Debounced search inputs (300ms delay) to reduce API calls
Efficient pagination with database-level limiting
Strategic database indexes on frequently filtered fields

**Security Measures**
Row Level Security (RLS) through ownership checks
Rate limiting on all API endpoints
Comprehensive input sanitization and validation
CSRF protection via SameSite cookies
SQL injection prevention through Prisma ORM

### Development Workflow

**Local Development**

```bash
# Start development server
npm run dev

# Run database migrations
npm run db:push

# Open Prisma Studio
npm run db:studio

# Run tests in watch mode
npm run test:watch
```

## Troubleshooting

### Common Issues

**"Missing Supabase environment variables"**
Ensure all `SUPABASE_*` environment variables are properly set
Verify Supabase project is fully provisioned (can take 2-3 minutes)
Check API keys are correct with no extra spaces or characters
Confirm environment variables are available in your deployment platform

**"Database connection failed"**
Verify `DATABASE_URL` format is correct
Ensure Supabase project is running and accessible
Check network connectivity and firewall settings
Confirm database credentials are valid

**"Authentication not working"**
Check `NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL` is set correctly
Ensure Supabase Auth is enabled in project settings
Verify email provider configuration in Supabase dashboard
Check middleware configuration for route protection

**"Magic link redirects to login page"**
Ensure `/auth/callback` route is excluded from middleware protection
Check Supabase redirect URLs are configured correctly
Verify email templates are properly configured
Confirm session cookies are being set correctly

**"Import/Export not working"**
Check file size limits (maximum 5MB for imports)
Verify CSV format matches expected template
Ensure proper column headers are present
Check file encoding (UTF-8 recommended)

**"Rate limit errors"**
Default limit: 10 requests per minute per IP address
Increase limits in `lib/rate-limit.ts` if needed
Consider implementing user-based rate limiting
Monitor API usage patterns

**"Demo login not working"**
Ensure middleware excludes `/demo-login` from auth checks
Verify demo login API route is properly configured
Check cookie settings and domain configuration
Confirm demo user data exists in seed script

### Debug Mode

Enable detailed logging by adding debug statements:

```typescript
console.log("[v0] Debug info:", data);
console.log("[v0] API request:", request);
console.log("[v0] Database query:", query);
```

## License

MIT License - see [LICENSE](LICENSE) file for details.
