# Port Configuration Fix

## Issue
Backend is running on port **3001**, but frontend is configured for port **3000**.

## Solution Options

### Option 1: Change Backend to Port 3000 (Recommended)

Update `backend/.env`:
```
PORT=3000
```

Then restart the backend server.

### Option 2: Update Frontend to Use Port 3001

Update `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Then restart the frontend server.

## Current Status
- Backend: Running on port **3001**
- Frontend: Configured for port **3000**

Choose one option above to fix the mismatch.


