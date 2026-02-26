# DATABASE_URL Troubleshooting Guide

## Error: "invalid port number in database URL"

This error occurs when Prisma cannot parse the port number in your `DATABASE_URL` connection string.

### Common Causes

1. **Missing Port Number**
   - ❌ `mysql://user:pass@host/database`
   - ✅ `mysql://user:pass@host:3306/database`

2. **Invalid Port Format**
   - ❌ `mysql://user:pass@host:abc/database` (non-numeric)
   - ❌ `mysql://user:pass@host:3306.5/database` (decimal)
   - ✅ `mysql://user:pass@host:3306/database` (integer 1-65535)

3. **Port Out of Range**
   - ❌ `mysql://user:pass@host:0/database` (too low)
   - ❌ `mysql://user:pass@host:99999/database` (too high)
   - ✅ `mysql://user:pass@host:3306/database` (valid range: 1-65535)

4. **Special Characters in Password Not URL-Encoded**
   - If your password contains special characters, they must be URL-encoded
   - Common special characters that need encoding:
     - `@` → `%40`
     - `:` → `%3A`
     - `/` → `%2F`
     - `#` → `%23`
     - `?` → `%3F`
     - `&` → `%26`
     - `%` → `%25`
     - `+` → `%2B`
     - `=` → `%3D`

### How to Fix

#### Step 1: Check Your Current DATABASE_URL

In Render dashboard:
1. Go to your service
2. Click "Environment"
3. Find `DATABASE_URL`
4. Copy the value

#### Step 2: Validate the Format

Your `DATABASE_URL` should follow this format:
```
mysql://username:password@hostname:port/database_name
```

**Example (Railway MySQL with SSL):**
```
mysql://root:yourpassword@containers-us-west-123.railway.app:5432/railway?ssl={"rejectUnauthorized":false}
```

#### Step 3: Check Each Component

1. **Protocol**: Must be `mysql://` or `mysql2://`
2. **Username**: Your database username
3. **Password**: Your database password (URL-encode special characters)
4. **Hostname**: Database server hostname (e.g., `containers-us-west-123.railway.app`)
5. **Port**: Numeric port (e.g., `3306`, `5432`)
6. **Database**: Database name (e.g., `railway`, `construction_crm`)

#### Step 4: URL-Encode Special Characters in Password

If your password contains special characters, use an online URL encoder or encode manually:

**Example:**
- Original password: `p@ssw:rd#123`
- URL-encoded: `p%40ssw%3Ard%23123`
- Full URL: `mysql://root:p%40ssw%3Ard%23123@host:3306/database`

**Quick URL Encoding Reference:**
```javascript
// In Node.js console or browser console:
encodeURIComponent('p@ssw:rd#123')
// Returns: 'p%40ssw%3Ard%23123'
```

#### Step 5: Verify Port Number

- Default MySQL port: `3306`
- Default PostgreSQL port: `5432`
- Check Railway dashboard for the actual port number
- Port must be between 1 and 65535

### Railway MySQL Specific

When copying `DATABASE_URL` from Railway:

1. Go to Railway dashboard
2. Click on your MySQL service
3. Go to "Variables" tab
4. Copy the `DATABASE_URL` value exactly as shown
5. If it doesn't include SSL parameters, add them:
   ```
   Original: mysql://root:password@host:port/database
   With SSL: mysql://root:password@host:port/database?ssl={"rejectUnauthorized":false}
   ```

### Testing Your DATABASE_URL

You can test if your `DATABASE_URL` is valid by:

1. **Using Node.js:**
   ```javascript
   const url = new URL('your-database-url-here');
   console.log('Protocol:', url.protocol);
   console.log('Hostname:', url.hostname);
   console.log('Port:', url.port);
   console.log('Pathname:', url.pathname);
   ```

2. **Using Prisma CLI:**
   ```bash
   # Set the DATABASE_URL temporarily
   export DATABASE_URL="your-url-here"
   
   # Try to validate
   npx prisma validate
   ```

### Common Railway DATABASE_URL Formats

**Standard Railway MySQL:**
```
mysql://root:password@containers-us-west-123.railway.app:3306/railway
```

**With SSL (required for production):**
```
mysql://root:password@containers-us-west-123.railway.app:3306/railway?ssl={"rejectUnauthorized":false}
```

**If password has special characters:**
```
mysql://root:p%40ssw%3Ard@containers-us-west-123.railway.app:3306/railway?ssl={"rejectUnauthorized":false}
```

### Still Having Issues?

1. **Check Render Logs**: Look for the exact error message
2. **Verify Environment Variable**: Make sure `DATABASE_URL` is set in Render
3. **Check for Extra Spaces**: Remove any leading/trailing spaces
4. **Check for Quotes**: Remove surrounding quotes if present
5. **Verify Database is Running**: Check Railway dashboard
6. **Test Connection**: Try connecting with MySQL client to verify credentials

### Quick Checklist

- [ ] Port number is present and numeric
- [ ] Port number is between 1 and 65535
- [ ] Special characters in password are URL-encoded
- [ ] Hostname is correct
- [ ] Database name is correct
- [ ] SSL parameters included (for Railway/production)
- [ ] No extra spaces or quotes
- [ ] Protocol is `mysql://` or `mysql2://`
