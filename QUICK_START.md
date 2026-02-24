# Quick Start Guide

## Starting the Backend Server

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Verify routes are registered:**
   When the server starts, you should see logs like:
   ```
   [Nest] LOG [RoutesResolver] ProjectsController {/api/projects}: +Xms
   [Nest] LOG [RouterExplorer] Mapped {/api/projects, GET} route +Xms
   [Nest] LOG [RouterExplorer] Mapped {/api/projects/stats, GET} route +Xms
   [Nest] LOG [RouterExplorer] Mapped {/api/projects/:id, GET} route +Xms
   [Nest] LOG [RouterExplorer] Mapped {/api/projects, POST} route +Xms
   [Nest] LOG [RouterExplorer] Mapped {/api/projects/:id, PATCH} route +Xms
   [Nest] LOG [RouterExplorer] Mapped {/api/projects/:id, DELETE} route +Xms
   ```

4. **Test the API:**
   ```bash
   # Test if server is running
   curl http://localhost:3000/api/auth/me
   
   # Or use Postman/Insomnia to test:
   # GET http://localhost:3000/api/projects
   # (Requires JWT token in Authorization header)
   ```

## Common Issues

### Routes Return 404

**Solution:** Restart the backend server. The server must be restarted after adding new modules/routes.

### Authentication Required

All Projects routes require JWT authentication. You need to:
1. Register/Login first: `POST /api/auth/register` or `POST /api/auth/login`
2. Get the JWT token from the response
3. Include it in requests: `Authorization: Bearer <token>`

### Port Already in Use

If port 3000 is already in use:
```bash
# Find the process
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

## Environment Variables

Make sure `.env` file exists in the `backend` directory with:
```
DATABASE_URL="mysql://user:password@localhost:3306/construction_crm"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
FRONTEND_URL="http://localhost:3001"
```

