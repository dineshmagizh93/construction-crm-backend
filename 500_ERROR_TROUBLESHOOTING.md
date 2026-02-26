# Fix: 500 Internal Server Error on Registration

## The Problem

You're getting a `500 Internal Server Error` when trying to register. This is a server-side error that needs to be diagnosed from the backend logs.

## Step 1: Check Render Logs

The most important step is to see the actual error message:

1. Go to Render dashboard: https://dashboard.render.com
2. Click on your backend service (`construction-crm-backend-vees`)
3. Go to **Logs** tab
4. Look for error messages around the time you tried to register
5. Look for:
   - Database connection errors
   - Prisma errors
   - Table not found errors
   - Migration errors

**Common error messages you might see:**
- `Table 'railway.companies' doesn't exist`
- `Can't reach database server`
- `PrismaClientKnownRequestError`
- `Migration needed`

## Step 2: Run Database Migrations

**Most likely cause:** Database migrations haven't been run on production.

### Option A: Using Render Shell (Recommended)

1. In Render dashboard, go to your backend service
2. Click **Shell** tab (or use Render CLI)
3. Run:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

### Option B: Add to Build Command

Update your Render build command to include migrations:

1. Go to Render → Your service → Settings
2. Find **Build Command**
3. Change from:
   ```
   cd backend && npm install && npm run build
   ```
   To:
   ```
   cd backend && npm install && npm run build && npx prisma migrate deploy
   ```
4. Save and redeploy

### Option C: Using Render CLI

If you have Render CLI installed:
```bash
render shell
cd backend
npx prisma migrate deploy
```

## Step 3: Verify Database Connection

Make sure your `DATABASE_URL` is correct in Render:

1. Go to Render → Your service → Environment
2. Check `DATABASE_URL` value
3. Should be: `mysql://root:password@host:port/database?ssl={"rejectUnauthorized":false}`
4. Make sure it matches your Railway database exactly

## Step 4: Check Database Tables Exist

After running migrations, verify tables were created:

1. Go to Railway dashboard
2. Click on your MySQL service
3. Go to **Data** tab or use **Query** tab
4. Run:
   ```sql
   SHOW TABLES;
   ```
5. You should see tables like:
   - `companies`
   - `users`
   - `projects`
   - etc.

If tables are missing, migrations didn't run successfully.

## Step 5: Generate Prisma Client

Sometimes Prisma Client needs to be regenerated:

1. In Render Shell:
   ```bash
   cd backend
   npx prisma generate
   ```
2. Redeploy your service

## Common Issues and Solutions

### Issue 1: "Table doesn't exist"

**Error:** `Table 'railway.companies' doesn't exist`

**Solution:**
1. Run migrations: `npx prisma migrate deploy`
2. Verify tables were created
3. Check migration status: `npx prisma migrate status`

### Issue 2: "Can't reach database server"

**Error:** Database connection failed

**Solution:**
1. Verify `DATABASE_URL` in Render is correct
2. Check Railway database is running
3. Verify SSL parameters are included
4. Test connection from Railway dashboard

### Issue 3: "Migration needed"

**Error:** Database is not up to date

**Solution:**
1. Run: `npx prisma migrate deploy`
2. This applies all pending migrations

### Issue 4: "Prisma Client not generated"

**Error:** `@prisma/client did not initialize yet`

**Solution:**
1. Run: `npx prisma generate`
2. Make sure it's in your build command or run it manually

## Quick Fix Checklist

- [ ] Check Render logs for actual error message
- [ ] Verify `DATABASE_URL` is set correctly in Render
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Verify tables exist in Railway database
- [ ] Generate Prisma Client: `npx prisma generate` (if needed)
- [ ] Redeploy backend service
- [ ] Test registration again

## Step-by-Step Fix

### 1. Check Logs First

```bash
# In Render dashboard → Logs tab
# Look for the error message when registration fails
```

### 2. Run Migrations

```bash
# In Render Shell
cd backend
npx prisma migrate deploy
```

### 3. Verify Database

```bash
# In Railway dashboard → Query tab
SHOW TABLES;
# Should show: companies, users, projects, etc.
```

### 4. Test Connection

```bash
# In Render Shell
cd backend
npx prisma db pull
# Should connect successfully
```

### 5. Redeploy

After fixing issues, redeploy your backend:
- Render will auto-redeploy on next git push
- Or manually trigger redeploy from Render dashboard

## Expected Logs After Fix

When registration works, you should see in Render logs:

```
📥 [timestamp] POST /api/auth/register
   Body: { "companyName": "...", "email": "...", ... }
✅ Registration successful
```

## Still Having Issues?

1. **Share the exact error from Render logs** - This will help diagnose the specific issue
2. **Check Railway database status** - Make sure it's running
3. **Verify all environment variables** - Especially `DATABASE_URL`
4. **Check Prisma schema** - Make sure it matches your database structure

## Testing After Fix

1. Go to your Vercel frontend
2. Try to register again
3. Check browser console for errors
4. Check Render logs for success/error messages
5. If successful, you should see: "Registration successful. Your account is pending approval..."
