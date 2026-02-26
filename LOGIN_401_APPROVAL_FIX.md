# Fix: 401 Unauthorized on Login - Account Pending Approval

## The Problem

You're getting `401 Unauthorized` when trying to login. This is most likely because:

**Your account is pending approval.** When you register, your account is created with `isApproved: false`, and you need admin approval before you can login.

## Why This Happens

The registration process creates users with `isApproved: false` by design. This is a security feature to prevent unauthorized access. The login endpoint checks this and returns 401 if the account isn't approved yet.

## Solution: Approve Your Account

### Option 1: Approve via Database (Quick Fix)

1. **Go to Railway Dashboard:**
   - https://railway.app
   - Click on your MySQL service

2. **Go to Query tab** and run:

   ```sql
   -- Find your user
   SELECT id, email, firstName, lastName, isApproved, isActive 
   FROM users 
   WHERE email = 'your-email@example.com';
   
   -- Approve your account
   UPDATE users 
   SET isApproved = true 
   WHERE email = 'your-email@example.com';
   ```

   Replace `'your-email@example.com'` with the email you used to register.

3. **Verify it worked:**
   ```sql
   SELECT email, isApproved FROM users WHERE email = 'your-email@example.com';
   ```
   Should show `isApproved: 1` (or `true`)

4. **Try logging in again** - it should work now!

### Option 2: Use the Approve User Endpoint (If Available)

If you have access to the approve endpoint:

```bash
POST https://construction-crm-backend-vees.onrender.com/api/auth/approve-user
Content-Type: application/json

{
  "userId": "user-id-here",
  "companyId": "company-id-here",
  "approved": true
}
```

You'll need to get the `userId` and `companyId` from the database first.

### Option 3: Auto-Approve for Development (Temporary)

If you want to auto-approve users during development, you can modify the registration:

**In `backend/src/auth/auth.service.ts`**, change line 58 from:
```typescript
isApproved: false, // Require admin approval
```

To:
```typescript
isApproved: true, // Auto-approve for development
```

Then redeploy. **Note:** This is only for development - remove this change in production!

## Common 401 Error Causes

### 1. Account Not Approved (Most Common)
**Error:** `Your account is pending approval. Please wait for admin approval before logging in.`

**Fix:** Approve the account in the database (see Option 1 above)

### 2. Wrong Email or Password
**Error:** `Invalid credentials`

**Fix:** 
- Double-check your email and password
- Make sure you registered first
- Try resetting your password if needed

### 3. Account Inactive
**Error:** `User account is inactive`

**Fix:** Activate the account in database:
```sql
UPDATE users SET isActive = true WHERE email = 'your-email@example.com';
```

### 4. User Doesn't Exist
**Error:** `Invalid credentials`

**Fix:** Register a new account first

## Quick Approval Script

Here's a complete SQL script to approve your account:

```sql
-- Step 1: Find your user
SELECT 
  u.id as userId,
  u.email,
  u.firstName,
  u.lastName,
  u.isApproved,
  u.isActive,
  c.id as companyId,
  c.name as companyName
FROM users u
JOIN companies c ON u.companyId = c.id
WHERE u.email = 'your-email@example.com';

-- Step 2: Approve and activate
UPDATE users 
SET 
  isApproved = true,
  isActive = true
WHERE email = 'your-email@example.com';

-- Step 3: Verify
SELECT email, isApproved, isActive 
FROM users 
WHERE email = 'your-email@example.com';
```

## After Approval

Once your account is approved:

1. ✅ You can login successfully
2. ✅ You'll receive a JWT token
3. ✅ You can access protected endpoints
4. ✅ You can use the dashboard

## For Production

In production, you should:

1. **Set up email notifications** - So admins know when new users register
2. **Create an admin panel** - To approve users via UI
3. **Or use the approve endpoint** - Via API

For now, manual database approval works fine for testing!

## Test After Approval

1. Go to your Vercel frontend login page
2. Enter your email and password
3. Click Login
4. Should redirect to dashboard ✅

## Summary

- **401 Error = Account needs approval**
- **Approve in database** using the SQL commands above
- **Then login will work** ✅

The registration worked - you just need to approve the account!
