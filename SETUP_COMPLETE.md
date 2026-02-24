# Complete Backend Setup Guide

## ✅ All Backend Modules Created

All backend APIs have been created:
- ✅ Projects
- ✅ Leads
- ✅ Payments
- ✅ Expenses
- ✅ Site Progress
- ✅ Vendors
- ✅ Labour
- ✅ Documents

## Step 1: Create Database Migration

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate
```

When prompted, name the migration: `add_all_modules`

## Step 2: Start Backend Server

```bash
npm run dev
```

You should see all routes registered:
```
[Nest] LOG [RoutesResolver] ProjectsController {/api/projects}
[Nest] LOG [RoutesResolver] LeadsController {/api/leads}
[Nest] LOG [RoutesResolver] PaymentsController {/api/payments}
[Nest] LOG [RoutesResolver] ExpensesController {/api/expenses}
[Nest] LOG [RoutesResolver] SiteProgressController {/api/site-progress}
[Nest] LOG [RoutesResolver] VendorsController {/api/vendors}
[Nest] LOG [RoutesResolver] LabourController {/api/labour}
[Nest] LOG [RoutesResolver] DocumentsController {/api/documents}
```

## Step 3: Test Backend

### Register a Company/User:
```bash
POST http://localhost:3000/api/auth/register
{
  "companyName": "Test Company",
  "email": "admin@test.com",
  "password": "password123",
  "firstName": "Admin",
  "lastName": "User"
}
```

### Login:
```bash
POST http://localhost:3000/api/auth/login
{
  "email": "admin@test.com",
  "password": "password123"
}
```

Save the `accessToken` from the response.

### Test Projects API:
```bash
GET http://localhost:3000/api/projects
Authorization: Bearer <your-token>
```

## API Endpoints

All endpoints require JWT authentication (except `/api/auth/register` and `/api/auth/login`).

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List all projects
- `GET /api/projects/stats` - Get project statistics
- `GET /api/projects/:id` - Get project by ID
- `PATCH /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project (soft)

### Leads
- `POST /api/leads` - Create lead
- `GET /api/leads?type=LEAD|CLIENT|all` - List leads/clients
- `GET /api/leads/:id` - Get lead by ID
- `PATCH /api/leads/:id` - Update lead
- `POST /api/leads/:id/convert` - Convert lead to client
- `DELETE /api/leads/:id` - Delete lead (soft)

### Payments
- `POST /api/payments` - Create payment
- `GET /api/payments?projectId=xxx` - List payments
- `GET /api/payments/:id` - Get payment by ID
- `PATCH /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment (soft)

### Expenses
- `POST /api/expenses` - Create expense
- `GET /api/expenses?projectId=xxx` - List expenses
- `GET /api/expenses/:id` - Get expense by ID
- `PATCH /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense (soft)

### Site Progress
- `POST /api/site-progress` - Create site progress
- `GET /api/site-progress?projectId=xxx` - List site progress
- `GET /api/site-progress/:id` - Get site progress by ID
- `PATCH /api/site-progress/:id` - Update site progress
- `DELETE /api/site-progress/:id` - Delete site progress (soft)

### Vendors
- `POST /api/vendors` - Create vendor
- `GET /api/vendors?type=xxx` - List vendors
- `GET /api/vendors/:id` - Get vendor by ID
- `PATCH /api/vendors/:id` - Update vendor
- `DELETE /api/vendors/:id` - Delete vendor (soft)

### Labour
- `POST /api/labour` - Create labour entry
- `GET /api/labour?projectId=xxx` - List labour entries
- `GET /api/labour/:id` - Get labour entry by ID
- `PATCH /api/labour/:id` - Update labour entry
- `DELETE /api/labour/:id` - Delete labour entry (soft)

### Documents
- `POST /api/documents` - Create document
- `GET /api/documents?projectId=xxx&type=xxx` - List documents
- `GET /api/documents/:id` - Get document by ID
- `PATCH /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document (soft)

## Next Steps

1. Run migration to create all database tables
2. Start backend server
3. Update frontend modules to use backend APIs (in progress)
4. Create authentication pages
5. Test complete integration

