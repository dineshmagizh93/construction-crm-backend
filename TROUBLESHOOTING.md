# Troubleshooting Guide

## Projects API Returns 404

If you're getting 404 errors when accessing `/api/projects`, try the following:

### 1. Restart the Backend Server

The backend server needs to be restarted to pick up new routes:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
cd backend
npm run dev
```

### 2. Verify Routes are Registered

Check that the Projects module is imported in `app.module.ts`:

```typescript
import { ProjectsModule } from './projects/projects.module';

@Module({
  imports: [
    // ... other modules
    ProjectsModule,
  ],
})
```

### 3. Check Server Logs

When the server starts, you should see:
```
[Nest] LOG [RoutesResolver] ProjectsController {/api/projects}: +Xms
[Nest] LOG [RouterExplorer] Mapped {/api/projects, GET} route +Xms
[Nest] LOG [RouterExplorer] Mapped {/api/projects/stats, GET} route +Xms
```

If you don't see these logs, the routes aren't registered.

### 4. Verify Migration

Ensure the Project table exists:

```bash
cd backend
npm run prisma:migrate
```

### 5. Check for Compilation Errors

Look for TypeScript compilation errors in the terminal. Fix any errors and restart the server.

### 6. Authentication Required

All Projects routes require JWT authentication. Make sure:
- You have a valid JWT token in localStorage (`auth_token`)
- The token hasn't expired
- You've logged in first

To test without auth, temporarily remove `@UseGuards(JwtAuthGuard)` from the controller (not recommended for production).

### 7. CORS Issues

If you see CORS errors, check `backend/src/main.ts`:

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true,
});
```

Make sure your frontend URL matches the CORS origin.

## Common Issues

### "Route not found" Error

- **Cause**: Backend server not running or routes not registered
- **Solution**: Restart the backend server

### "Authentication required" Error

- **Cause**: Missing or invalid JWT token
- **Solution**: Login first to get a token, or check token expiration

### "Network error" Error

- **Cause**: Backend server not accessible
- **Solution**: Verify backend is running on port 3000

### HTML Response Instead of JSON

- **Cause**: Getting a 404 HTML page instead of API response
- **Solution**: Check that you're hitting the correct URL (`/api/projects` not `/projects`)

