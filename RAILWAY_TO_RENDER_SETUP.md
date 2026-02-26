# Setting Up Railway MySQL with Render

## The Problem

Railway uses template variables like `${{MYSQLUSER}}` in their connection strings, but **Render does not support this syntax**. You need to get the actual values from Railway and construct the complete `DATABASE_URL` manually.

## Solution: Get Actual Values from Railway

### Step 1: Get Values from Railway Dashboard

1. Go to your Railway project: https://railway.app
2. Click on your **MySQL service**
3. Go to the **"Variables"** tab
4. You'll see all the environment variables. Find these values:

   - `MYSQLUSER` or `MYSQLUSERNAME` - Your MySQL username (usually `root`)
   - `MYSQL_ROOT_PASSWORD` - Your MySQL root password
   - `MYSQL_DATABASE` - Your database name
   - `RAILWAY_TCP_PROXY_DOMAIN` - The hostname (e.g., `containers-us-west-123.railway.app`)
   - `RAILWAY_TCP_PROXY_PORT` - The port number (usually `3306` for MySQL)

### Step 2: Construct the DATABASE_URL

Replace the template variables with actual values:

**Railway Template (Won't work in Render):**
```
mysql://${{MYSQLUSER}}:${{MYSQL_ROOT_PASSWORD}}@${{RAILWAY_TCP_PROXY_DOMAIN}}:${{RAILWAY_TCP_PROXY_PORT}}/${{MYSQL_DATABASE}}
```

**Actual Format (Use this in Render):**
```
mysql://username:password@hostname:port/database
```

### Step 3: Example

If your Railway variables are:
- `MYSQLUSER` = `root`
- `MYSQL_ROOT_PASSWORD` = `MyP@ssw0rd123`
- `RAILWAY_TCP_PROXY_DOMAIN` = `containers-us-west-123.railway.app`
- `RAILWAY_TCP_PROXY_PORT` = `3306`
- `MYSQL_DATABASE` = `railway`

**Important:** If your password contains special characters, you must URL-encode them:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `#` → `%23`
- `?` → `%3F`
- `&` → `%26`

**Example with password encoding:**
- Original password: `MyP@ssw0rd123`
- URL-encoded password: `MyP%40ssw0rd123`
- Full URL: `mysql://root:MyP%40ssw0rd123@containers-us-west-123.railway.app:3306/railway`

### Step 4: Add SSL Parameters (Required for Railway)

Railway MySQL requires SSL. Add SSL parameters to the end:

**Without SSL (won't work):**
```
mysql://root:password@hostname:3306/database
```

**With SSL (correct):**
```
mysql://root:password@hostname:3306/database?ssl={"rejectUnauthorized":false}
```

**Complete Example:**
```
mysql://root:MyP%40ssw0rd123@containers-us-west-123.railway.app:3306/railway?ssl={"rejectUnauthorized":false}
```

### Step 5: Set in Render

1. Go to Render dashboard: https://dashboard.render.com
2. Click on your backend service
3. Go to **"Environment"** tab
4. Find or add `DATABASE_URL`
5. Paste the complete URL (with actual values, not template variables)
6. Click **"Save Changes"**

## Quick Reference: URL Encoding

If your password has special characters, use this encoding:

| Character | Encoded |
|-----------|---------|
| `@` | `%40` |
| `:` | `%3A` |
| `/` | `%2F` |
| `#` | `%23` |
| `?` | `%3F` |
| `&` | `%26` |
| `%` | `%25` |
| `+` | `%2B` |
| `=` | `%3D` |

**Or use JavaScript to encode:**
```javascript
encodeURIComponent('MyP@ssw0rd123')
// Returns: 'MyP%40ssw0rd123'
```

## Alternative: Use Railway's Public Networking

If Railway provides a `DATABASE_URL` variable that already has all values filled in:

1. In Railway dashboard, look for a variable called `DATABASE_URL` or `MYSQL_URL`
2. This should already have the complete connection string
3. Copy that entire value
4. Add SSL parameters if not present: `?ssl={"rejectUnauthorized":false}`
5. Paste into Render's `DATABASE_URL` environment variable

## Verification

After setting the `DATABASE_URL` in Render:

1. **Check the format:**
   - ✅ Starts with `mysql://`
   - ✅ Has username and password
   - ✅ Has hostname
   - ✅ Has port number (numeric, 1-65535)
   - ✅ Has database name
   - ✅ Has SSL parameters for Railway

2. **Test the connection:**
   - Deploy your service
   - Check Render logs
   - Should see: "Database connection established" ✅
   - Should NOT see: "invalid port number" ❌

## Common Mistakes

❌ **Using Railway template syntax in Render:**
```
mysql://${{MYSQLUSER}}:${{MYSQL_ROOT_PASSWORD}}@...
```

✅ **Using actual values:**
```
mysql://root:actualpassword@actualhost:3306/actualdatabase
```

❌ **Missing SSL parameters:**
```
mysql://root:pass@host:3306/db
```

✅ **With SSL parameters:**
```
mysql://root:pass@host:3306/db?ssl={"rejectUnauthorized":false}
```

❌ **Not encoding special characters in password:**
```
mysql://root:MyP@ssw0rd@host:3306/db
```

✅ **With URL-encoded password:**
```
mysql://root:MyP%40ssw0rd@host:3306/db
```

## Still Having Issues?

1. **Double-check each value** from Railway Variables tab
2. **URL-encode special characters** in password
3. **Include SSL parameters** for Railway
4. **Verify port is numeric** (usually 3306 for MySQL)
5. **Check Render logs** for specific error messages
6. **No spaces or quotes** around the URL in Render
