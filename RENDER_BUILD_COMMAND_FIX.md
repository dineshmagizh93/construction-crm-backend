# Fix: Build Command Error - "No such file or directory"

## The Error

```
bash: line 1: cd: backend: No such file or directory
```

This happens because your GitHub repository `construction-crm-backend` has the backend code at the **root**, not in a `backend/` subfolder.

## Solution: Update Build Command

### Option 1: If Backend is at Repository Root (Most Likely)

If your repository structure is:
```
construction-crm-backend/
├── src/
├── package.json
├── prisma/
└── ...
```

Then your build command should be:
```
npm install && npm run build && npx prisma migrate deploy
```

**Remove `cd backend &&` from the build command.**

### Option 2: Set Root Directory in Render

Alternatively, you can set the Root Directory in Render:

1. Go to Render → Your service → Settings
2. Find **Root Directory**
3. Set it to: `backend` (if your repo has a backend folder)
4. Then keep the build command as: `npm install && npm run build && npx prisma migrate deploy`

## How to Fix in Render

### Step 1: Check Your Repository Structure

Look at your GitHub repo: `https://github.com/dineshmagizh93/construction-crm-backend`

- **If `package.json` is at the root** → Use Option 1 (remove `cd backend`)
- **If `package.json` is in a `backend/` folder** → Use Option 2 (set Root Directory)

### Step 2: Update Build Command

1. Go to Render dashboard
2. Click on your service: `construction-crm-backend-vees`
3. Go to **Settings** tab
4. Find **Build Command**
5. **Change it to one of these:**

**If backend is at root:**
```
npm install && npm run build && npx prisma migrate deploy
```

**If backend is in a folder (and you set Root Directory to `backend`):**
```
npm install && npm run build && npx prisma migrate deploy
```

**If backend is in a folder (and Root Directory is empty):**
```
cd backend && npm install && npm run build && npx prisma migrate deploy
```

### Step 3: Update Start Command

Also check your **Start Command**:

**If backend is at root:**
```
npm run start:prod
```

**If backend is in a folder:**
```
cd backend && npm run start:prod
```

Or if Root Directory is set to `backend`:
```
npm run start:prod
```

## Quick Fix (Most Common Case)

Since your repo is named `construction-crm-backend`, it's likely the backend code is at the root:

1. **Build Command:**
   ```
   npm install && npm run build && npx prisma migrate deploy
   ```

2. **Start Command:**
   ```
   npm run start:prod
   ```

3. **Root Directory:** Leave empty (or set to `.`)

## Verify After Fix

After updating and redeploying, check the build logs. You should see:
```
==> Running build command 'npm install && npm run build && npx prisma migrate deploy'...
==> Installing dependencies...
==> Building...
==> Running migrations...
==> Build succeeded ✅
```

## Still Having Issues?

1. **Check your GitHub repository structure** - Look at the files at the root level
2. **Check if `package.json` exists** - This tells you where the backend code is
3. **Check Render Root Directory setting** - Should match your repo structure
4. **Check build logs** - They show the exact path being used
