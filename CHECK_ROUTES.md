# How to Check if Routes are Registered

## Step 1: Check Backend Terminal Logs

When you start the backend with `npm run dev`, look for these logs:

### ✅ Routes ARE Registered (Good):
```
[Nest] LOG [RoutesResolver] AuthController {/api/auth}: +Xms
[Nest] LOG [RouterExplorer] Mapped {/api/auth/register, POST} route +Xms
[Nest] LOG [RouterExplorer] Mapped {/api/auth/login, POST} route +Xms
[Nest] LOG [RoutesResolver] ProjectsController {/api/projects}: +Xms
[Nest] LOG [RouterExplorer] Mapped {/api/projects, GET} route +Xms
[Nest] LOG [RouterExplorer] Mapped {/api/projects/stats, GET} route +Xms
[Nest] LOG [RouterExplorer] Mapped {/api/projects/:id, GET} route +Xms
[Nest] LOG [RouterExplorer] Mapped {/api/projects, POST} route +Xms
```

### ❌ Routes NOT Registered (Problem):
- No `[RoutesResolver] ProjectsController` log
- No `[RouterExplorer] Mapped {/api/projects` logs
- Compilation errors in the terminal

## Step 2: Check for Compilation Errors

Look for TypeScript errors in the terminal:
```
error TSXXXX: ...
```

If you see errors, fix them and restart the server.

## Step 3: Test the API Directly

### Test Auth Endpoint (should work without auth):
```bash
curl http://localhost:3000/api/auth/register -X POST -H "Content-Type: application/json" -d "{\"companyName\":\"Test\",\"email\":\"test@test.com\",\"password\":\"test123\"}"
```

### Test Projects Endpoint (requires auth):
```bash
# First login to get token
curl http://localhost:3000/api/auth/login -X POST -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"test123\"}"

# Then use the token
curl http://localhost:3000/api/projects -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Step 4: Common Issues

### Issue: No routes logged
**Solution:** 
1. Check for compilation errors
2. Verify `ProjectsModule` is imported in `app.module.ts`
3. Restart the server: `Ctrl+C` then `npm run dev`

### Issue: 404 on all routes
**Solution:**
- The server might not be running the NestJS app
- Check if port 3000 is being used by another application
- Verify the server started successfully

### Issue: Compilation errors
**Solution:**
- Fix TypeScript errors
- Run `npm run build` to see all errors
- Check `tsconfig.json` configuration

## Step 5: Verify Server is Running

```bash
# Check if something is listening on port 3000
netstat -ano | findstr :3000

# Check if it's the NestJS process
# Look for node.exe process
```

