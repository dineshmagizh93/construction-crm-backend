# ⚠️ URGENT: Run Database Migrations

## The Error

```
The table `companies` does not exist in the current database.
```

This means your database tables haven't been created yet. You need to run Prisma migrations.

## Quick Fix: Run Migrations Now

### Option 1: Using Render Shell (Fastest - Do This Now!)

1. Go to Render dashboard: https://dashboard.render.com
2. Click on your backend service: `construction-crm-backend-vees`
3. Click **Shell** tab (or use Render CLI)
4. Run this command:
   ```bash
   cd backend && npx prisma migrate deploy
   ```
5. Wait for it to complete - you should see messages like:
   ```
   Applying migration `20260105085536_init`
   Migration applied successfully
   ```
6. Try registering again - it should work now!

### Option 2: Add to Build Command (For Future Deployments)

To automatically run migrations on every deployment:

1. Go to Render → Your service → Settings
2. Find **Build Command**
3. Change it to:
   ```
   cd backend && npm install && npm run build && npx prisma migrate deploy
   ```
4. Save changes
5. This will run migrations automatically on every deploy

## Verify Migrations Ran

After running migrations, verify tables were created:

1. Go to Railway dashboard
2. Click on your MySQL service
3. Go to **Query** tab
4. Run:
   ```sql
   SHOW TABLES;
   ```
5. You should see tables like:
   - `companies`
   - `users`
   - `projects`
   - `leads`
   - `payments`
   - etc.

## After Running Migrations

1. ✅ Tables will be created
2. ✅ Registration will work
3. ✅ All API endpoints will work

## If You Get Errors

### Error: "Migration already applied"
- This is fine - it means migrations were already run
- Try registering again

### Error: "Can't reach database server"
- Check `DATABASE_URL` in Render environment variables
- Verify Railway database is running
- Check SSL parameters are included

### Error: "No migrations found"
- Check that `prisma/migrations` folder exists in your repository
- Make sure migrations are committed to git
- You may need to create initial migration locally first

## Step-by-Step (Copy & Paste)

```bash
# 1. Open Render Shell
# 2. Run this:
cd backend
npx prisma migrate deploy

# 3. Wait for success message
# 4. Try registration again
```

That's it! After running migrations, registration should work.
