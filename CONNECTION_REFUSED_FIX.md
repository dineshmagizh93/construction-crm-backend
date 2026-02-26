# Fix: ERR_CONNECTION_REFUSED Error

## The Problem

You're seeing these errors in the browser:
- `ERR_CONNECTION_REFUSED` when trying to access `localhost:3001/api/auth/login`
- `ERR_CONNECTION_REFUSED` when trying to access `localhost:3001/api/auth/register`
- `404` errors

This means **the backend server is not running** or not accessible on port 3001.

## Solution: Start the Backend Server

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Check if Backend is Already Running

Check if something is already running on port 3001:

**Windows (PowerShell):**
```powershell
netstat -ano | findstr :3001
```

**Windows (Command Prompt):**
```cmd
netstat -ano | findstr :3001
```

If you see output, a process is using port 3001. You can either:
- Stop that process (if it's an old backend instance)
- Or use a different port

### Step 3: Install Dependencies (if not done)

```bash
npm install
```

### Step 4: Set Up Environment Variables

Create a `.env` file in the `backend` directory if it doesn't exist:

```env
# Database
DATABASE_URL="mysql://root:password@localhost:3306/construction_crm"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Application
PORT=3001
NODE_ENV=development

# Frontend URL
FRONTEND_URL="http://localhost:3000"
```

**Important:** Replace the `DATABASE_URL` with your actual database credentials.

### Step 5: Run Database Migrations (if needed)

```bash
npm run prisma:migrate
```

Or if you haven't set up the database yet:
```bash
npx prisma migrate dev
```

### Step 6: Start the Backend Server

**Development mode (with hot reload):**
```bash
npm run start:dev
```

**Or production mode:**
```bash
npm run build
npm run start:prod
```

### Step 7: Verify Backend is Running

You should see output like:
```
✅ Application is running on port: 3001
✅ API Base URL: http://localhost:3001/api
✅ Environment: development
✅ All routes registered successfully!
```

### Step 8: Test the Backend

Open your browser and go to:
- `http://localhost:3001/api` - Should show API info or 404 (but not connection refused)
- `http://localhost:3001/api/auth/me` - Should return 401 (unauthorized, but server is responding)

Or use curl:
```bash
curl http://localhost:3001/api/auth/me
```

## Common Issues

### Issue 1: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3001`

**Solution:**
1. Find the process using port 3001:
   ```powershell
   netstat -ano | findstr :3001
   ```
2. Kill the process (replace `<PID>` with the actual process ID):
   ```powershell
   taskkill /PID <PID> /F
   ```
3. Start the backend again

### Issue 2: Database Connection Error

**Error:** `Failed to connect to database`

**Solution:**
1. Make sure MySQL is running
2. Check your `DATABASE_URL` in `.env` file
3. Verify database credentials are correct
4. Ensure the database exists

### Issue 3: Missing Environment Variables

**Error:** `DATABASE_URL environment variable is required`

**Solution:**
1. Create a `.env` file in the `backend` directory
2. Add all required environment variables (see Step 4 above)

### Issue 4: Prisma Client Not Generated

**Error:** `@prisma/client did not initialize yet`

**Solution:**
```bash
npx prisma generate
```

## Quick Start Checklist

- [ ] Backend directory: `cd backend`
- [ ] Dependencies installed: `npm install`
- [ ] `.env` file created with correct values
- [ ] Database is running and accessible
- [ ] Prisma migrations run: `npm run prisma:migrate`
- [ ] Backend server started: `npm run start:dev`
- [ ] Backend is running on port 3001 (check console output)
- [ ] Test endpoint: `http://localhost:3001/api/auth/me` returns 401 (not connection refused)

## After Backend is Running

Once the backend is running, your frontend should be able to connect. The frontend is already configured to use `http://localhost:3001/api`.

If you still see errors:
1. **Refresh your browser** (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)
2. **Check browser console** for any CORS errors
3. **Verify frontend is using correct API URL** - should be `http://localhost:3001/api`

## Still Having Issues?

1. **Check backend logs** - Look for error messages in the terminal where backend is running
2. **Check port** - Verify backend is actually running on port 3001
3. **Check firewall** - Make sure Windows Firewall isn't blocking port 3001
4. **Try different port** - Change `PORT=3002` in backend `.env` and update frontend `.env.local` to match
