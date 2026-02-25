# Database Seeding Guide

This guide explains how to seed the database with sample data for demo purposes.

## Overview

The seed script (`prisma/seed.ts`) creates comprehensive professional data for all modules in the Construction CRM system, including:

- **Company & Users**: Professional construction company with admin, project managers, supervisors, and estimators
- **Projects**: 8 real-world projects (office towers, residential, healthcare, retail, etc.)
- **Leads**: 6 qualified leads and converted clients
- **Vendors**: 7 vendors (material suppliers, equipment rental, subcontractors)
- **Payments**: 12 payment records with realistic milestones
- **Expenses**: 14 expense records across different categories
- **Site Progress**: 10 site progress entries with detailed notes
- **Labour**: 10 labour entries with realistic headcounts and rates
- **Documents**: 10 professional documents (permits, plans, contracts, reports)
- **Inventory Items**: 8 inventory items with proper stock levels
- **Inventory Transactions**: 8 transactions (in/out) with references
- **Tasks**: 10 tasks with realistic priorities and statuses
- **Task Comments**: 6 professional comments
- **Task Activities**: 6 activity logs

## Running the Seed Script

### Prerequisites

1. Make sure your database is set up and migrations are run:
   ```bash
   npm run prisma:migrate
   ```

2. Ensure your `.env` file has the correct `DATABASE_URL`

### Seed the Database

```bash
npm run prisma:seed
```

### What Happens

1. **Company & Users**: Always created/updated (using `upsert`)
   - Company: `test@construction.com`
   - Admin user: `admin@construction.com` / `password123`
   - Regular user: `user@construction.com` / `password123`
   - Project manager: `pm@construction.com` / `password123`

2. **Sample Data**: Only created if no projects exist
   - The script checks if projects already exist
   - If projects exist, it skips creating sample data to avoid duplicates
   - This prevents affecting existing production data

## Reseeding (Clearing and Recreating Data)

If you want to reseed the database with fresh sample data:

### Option 1: Delete Specific Data (Recommended)

You can manually delete data from specific tables using Prisma Studio:

```bash
npm run prisma:studio
```

Then delete the data you want to reseed.

### Option 2: Reset Database (⚠️ Destructive)

**WARNING**: This will delete ALL data in your database!

```bash
# Reset database (drops all tables and recreates them)
npx prisma migrate reset

# This will:
# 1. Drop the database
# 2. Create a new database
# 3. Run all migrations
# 4. Run the seed script automatically
```

### Option 3: Manual SQL (Advanced)

Connect to your MySQL database and delete specific records:

```sql
-- Delete all sample data (keep company and users)
DELETE FROM task_activities;
DELETE FROM task_comments;
DELETE FROM tasks;
DELETE FROM inventory_transactions;
DELETE FROM inventory_items;
DELETE FROM documents;
DELETE FROM labours;
DELETE FROM site_progress;
DELETE FROM expenses;
DELETE FROM payments;
DELETE FROM leads;
DELETE FROM vendors;
DELETE FROM projects;
```

Then run the seed script again:
```bash
npm run prisma:seed
```

## Sample Data Details

### Projects

1. **Manhattan Financial District Office Tower** - In Progress (62% complete) - $125M
2. **Riverside Luxury Condominium Complex** - In Progress (36% complete) - $95M
3. **Brooklyn Medical Center Expansion** - In Progress (72% complete) - $68M
4. **Queens Shopping Center Renovation** - In Progress (62% complete) - $32M
5. **Long Island Corporate Campus** - Planning (6% complete) - $145M
6. **Staten Island School Modernization** - Completed (100% complete) - $18.5M
7. **Bronx Affordable Housing Development** - In Progress (75% complete) - $42M
8. **Westchester Hotel & Conference Center** - In Progress (30% complete) - $78M

### Login Credentials

- **Admin**: `michael.chen@premierbuilders.com` / `Admin@2024`
- **Project Manager**: `jennifer.martinez@premierbuilders.com` / `Admin@2024`
- **Site Supervisor**: `robert.williams@premierbuilders.com` / `Admin@2024`
- **Estimator**: `sarah.johnson@premierbuilders.com` / `Admin@2024`

### Data Relationships

All sample data is properly linked:
- Payments, Expenses, Site Progress, Labour, Documents → Projects
- Inventory Transactions → Inventory Items & Projects
- Tasks → Projects & Users (assignees)
- Task Comments & Activities → Tasks & Users

## Troubleshooting

### "Sample data already exists" Message

This means projects already exist in your database. The seed script skips creating sample data to avoid duplicates.

**Solution**: Delete existing projects (or use one of the reseeding options above).

### Foreign Key Constraint Errors

If you get foreign key errors, make sure:
1. All migrations are up to date
2. The database schema matches the Prisma schema
3. You're not trying to delete referenced data

### Connection Errors

Make sure:
- MySQL server is running
- `DATABASE_URL` in `.env` is correct
- Database exists and is accessible

## Notes

- The seed script is **safe** - it won't overwrite existing data
- All data is **professional and realistic** - suitable for demonstrations
- Company name: **Premier Builders & Construction**
- All dates are realistic and relative to 2024
- Financial amounts are in USD and reflect real-world construction project values
- The script uses `upsert` for company/users to allow re-running safely
- All project names, client names, and vendor names are professional and realistic
