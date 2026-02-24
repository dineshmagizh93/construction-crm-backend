# Construction CRM Backend

Backend API for Construction CRM built with NestJS, MySQL, and Prisma.

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update:
   - `DATABASE_URL` with your MySQL connection string
   - `JWT_SECRET` with a secure random string
   - `PORT` (default: 3000)

3. **Set up database:**
   ```bash
   # Generate Prisma Client
   npm run prisma:generate
   
   # Run migrations
   npm run prisma:migrate
   
   # Seed database (optional)
   npm run prisma:seed
   ```

4. **Start the server:**
   ```bash
   # Development
   npm run start:dev
   
   # Production
   npm run build
   npm run start:prod
   ```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new company and admin user
- `POST /api/auth/login` - Login with email and password
- `GET /api/auth/me` - Get current user info (requires JWT)

### Company

- `GET /api/company/me` - Get current company info (requires JWT)

### User

- `GET /api/user/me` - Get current user info (requires JWT)

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Database Schema

- **Company**: Multi-tenant company information
- **User**: Users belonging to companies with roles

All models support soft deletes via `deletedAt` field.

## Seed Data

The seed script creates:
- Test company: `test@construction.com`
- Admin user: `admin@construction.com` / `password123`
- Regular user: `user@construction.com` / `password123`

## Development

- Run migrations: `npm run prisma:migrate`
- Open Prisma Studio: `npm run prisma:studio`
- Run tests: `npm test`

