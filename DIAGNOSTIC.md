# Backend Diagnostic Guide

## Quick Diagnostic Test

Run this command to test if routes are working:

```bash
cd backend
node test-routes.js
```

This will test:
- `/api/auth/register` (should return 400/422 - route exists)
- `/api/projects` (should return 401 - route exists, needs auth)
- `/api/projects/stats` (should return 401 - route exists, needs auth)

## What Each Response Means

### ✅ Route Exists:
- **401 Unauthorized**: Route exists, but you need authentication
- **400/422 Bad Request**: Route exists, but request validation failed
- **200 OK**: Route exists and working

### ❌ Route Doesn't Exist:
- **404 Not Found**: Route is not registered

## If All Routes Return 404

This means the NestJS app isn't registering routes. Check:

1. **Backend Terminal Logs**
   - Look for: `[RoutesResolver] ProjectsController`
   - If missing, routes aren't registered

2. **Compilation Errors**
   - Look for: `error TS` in terminal
   - Fix errors and restart

3. **Module Import**
   - Verify `ProjectsModule` is in `app.module.ts` imports array

4. **Server Restart**
   ```bash
   # Stop server (Ctrl+C)
   cd backend
   npm run build  # Check for build errors
   npm run dev    # Restart
   ```

## Manual Route Test

### Test Auth (no auth required):
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Test","email":"test@test.com","password":"test123","firstName":"Test","lastName":"User"}'
```

Expected: 201 Created or 400/422 (validation error) = Route exists ✅

### Test Projects (auth required):
```bash
curl http://localhost:3000/api/projects
```

Expected: 401 Unauthorized = Route exists ✅
If 404 = Route not registered ❌

## Common Issues

### Issue: Server running but all routes 404
**Cause**: Routes not registered (compilation error or module not imported)
**Fix**: Check terminal for errors, verify module imports, restart server

### Issue: Some routes work, Projects don't
**Cause**: ProjectsModule not imported or compilation error in Projects module
**Fix**: Check `app.module.ts`, verify ProjectsModule import, check for TypeScript errors

### Issue: 401 on all routes
**Cause**: Routes exist but need authentication (this is normal!)
**Fix**: Login first to get JWT token, then include in requests

