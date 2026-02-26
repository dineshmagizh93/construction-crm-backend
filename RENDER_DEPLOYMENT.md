# Deployment Guide for Render + Railway MySQL

This guide explains how to deploy the Construction CRM backend to Render with Railway MySQL.

## Prerequisites

1. **Render Account**: Sign up at https://render.com
2. **Railway Account**: Sign up at https://railway.app
3. **GitHub Repository**: Your code should be in a GitHub repository

## Step 1: Set Up Railway MySQL Database

1. Go to https://railway.app and create a new project
2. Click "New" → "Database" → "MySQL"
3. Wait for the database to be provisioned
4. Click on the MySQL service
5. Go to the "Variables" tab

**⚠️ Important**: Railway uses template variables like `${{MYSQLUSER}}` which **do NOT work in Render**. You must get the actual values and construct the URL manually.

**See detailed guide**: [RAILWAY_TO_RENDER_SETUP.md](./RAILWAY_TO_RENDER_SETUP.md)

### Quick Steps:

1. **Get actual values from Railway Variables tab:**
   - `MYSQLUSER` or `MYSQLUSERNAME` (usually `root`)
   - `MYSQL_ROOT_PASSWORD` (your actual password)
   - `RAILWAY_TCP_PROXY_DOMAIN` (hostname)
   - `RAILWAY_TCP_PROXY_PORT` (port, usually `3306`)
   - `MYSQL_DATABASE` (database name)

2. **Construct the DATABASE_URL:**
   ```
   mysql://username:password@hostname:port/database?ssl={"rejectUnauthorized":false}
   ```

3. **URL-encode special characters in password** (if any):
   - `@` → `%40`, `:` → `%3A`, `/` → `%2F`, etc.

4. **Example:**
   ```
   mysql://root:MyP%40ssw0rd@containers-us-west-123.railway.app:3306/railway?ssl={"rejectUnauthorized":false}
   ```

## Step 2: Deploy Backend to Render

1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `construction-crm-backend` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm run start:prod`
   - **Root Directory**: Leave empty (or set to `backend` if your repo structure requires it)

## Step 3: Configure Environment Variables on Render

In your Render service dashboard, go to "Environment" and add these variables:

### Required Variables

```bash
# Database (from Railway)
DATABASE_URL=mysql://root:password@host:port/database?ssl={"rejectUnauthorized":false}

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-generate-with-openssl-rand-base64-32
JWT_EXPIRES_IN=7d

# Application
NODE_ENV=production
PORT=10000  # Render will override this, but set it anyway

# Frontend URL (your frontend deployment URL)
FRONTEND_URL=https://your-frontend-app.onrender.com
```

### Optional Variables

```bash
# Email Configuration (if using email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Render Service Name (for logging)
RENDER_SERVICE_NAME=construction-crm-backend
```

## Step 4: Generate JWT Secret

Generate a strong JWT secret:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `JWT_SECRET` value.

## Step 5: Run Database Migrations

After deployment, you need to run Prisma migrations:

1. In Render dashboard, go to your service
2. Click "Shell" (or use Render CLI)
3. Run:

```bash
cd backend
npx prisma migrate deploy
```

Or, you can add this to your build command:

```bash
cd backend && npm install && npm run build && npx prisma migrate deploy
```

## Step 6: Verify Deployment

1. Check Render logs for successful startup
2. Test the API endpoint: `https://your-backend.onrender.com/api`
3. Test health endpoint (if you have one)

## Environment Variables Summary

### Required in Production

- `DATABASE_URL` - Railway MySQL connection string with SSL
- `JWT_SECRET` - Strong secret for JWT tokens
- `JWT_EXPIRES_IN` - JWT expiration (default: 7d)
- `NODE_ENV` - Set to `production`
- `FRONTEND_URL` - Your frontend deployment URL
- `PORT` - Render provides this automatically, but set a fallback

### Optional

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - For email features
- `RENDER_SERVICE_NAME` - For logging

## Troubleshooting

### Database Connection Issues

- **Error**: "Can't reach database server"
  - **Solution**: Check that `DATABASE_URL` includes SSL parameters
  - Verify Railway database is running
  - Check firewall/network settings

- **Error**: "SSL connection required"
  - **Solution**: Ensure `DATABASE_URL` includes `?ssl={"rejectUnauthorized":false}`

- **Error**: "invalid port number in database URL"
  - **Solution**: This error occurs when the port in your `DATABASE_URL` is missing, invalid, or contains non-numeric characters
  - **Check your DATABASE_URL format**: `mysql://user:password@host:port/database`
  - **Common issues**:
    - Missing port: `mysql://user:pass@host/database` ❌ (should include `:3306` or your port)
    - Invalid port: `mysql://user:pass@host:abc/database` ❌ (port must be a number)
    - Port out of range: `mysql://user:pass@host:99999/database` ❌ (port must be 1-65535)
  - **Correct format**: `mysql://user:password@host:3306/database` ✅
  - **For Railway MySQL**: Copy the exact connection string from Railway's Variables tab
  - **Special characters in password**: If your password contains special characters (like `@`, `:`, `/`, `#`, `?`), you must URL-encode them:
    - `@` → `%40`
    - `:` → `%3A`
    - `/` → `%2F`
    - `#` → `%23`
    - `?` → `%3F`
    - `&` → `%26`
  - **Example**: If password is `p@ssw:rd`, use `mysql://user:p%40ssw%3Ard@host:3306/database`

### JWT Issues

- **Error**: "JWT_SECRET is required"
  - **Solution**: Set `JWT_SECRET` in Render environment variables

### CORS Issues

- **Error**: "CORS blocked"
  - **Solution**: Set `FRONTEND_URL` to your exact frontend URL (with https://)

### Port Issues

- Render automatically sets `PORT` environment variable
- The app will use `process.env.PORT` (provided by Render)
- Fallback is 5000 if not set

## Local Development

For local development, create a `.env` file in the `backend` directory:

```bash
DATABASE_URL="mysql://root:password@localhost:3306/construction_crm"
JWT_SECRET="local-dev-secret"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
```

## Production Checklist

- [ ] Railway MySQL database created and running
- [ ] `DATABASE_URL` includes SSL parameters
- [ ] `JWT_SECRET` is set and strong (32+ characters)
- [ ] `FRONTEND_URL` matches your frontend deployment URL
- [ ] `NODE_ENV` is set to `production`
- [ ] Database migrations run successfully
- [ ] All environment variables set in Render
- [ ] Application starts without errors
- [ ] API endpoints are accessible
- [ ] CORS is configured correctly

## Security Notes

1. **Never commit `.env` files** - They contain sensitive credentials
2. **Use strong JWT secrets** - Generate with `openssl rand -base64 32`
3. **Enable SSL for database** - Required for Railway MySQL
4. **Set proper CORS origins** - Only allow your frontend URL in production
5. **Use HTTPS** - Render provides HTTPS automatically

## Support

If you encounter issues:
1. Check Render logs for error messages
2. Verify all environment variables are set correctly
3. Ensure database is accessible from Render
4. Check Railway database logs
