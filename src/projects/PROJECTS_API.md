# Projects API Documentation

## Base URL
```
http://localhost:3000/api/projects
```

## Authentication
All endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Create Project
**POST** `/api/projects`

**Request Body:**
```json
{
  "name": "Downtown Office Complex",
  "clientName": "ABC Corporation",
  "location": "New York, NY",
  "description": "A modern 20-story office building",
  "startDate": "2024-01-15",
  "endDate": "2025-06-30",
  "status": "Planning",
  "estimatedBudget": 5000000,
  "progress": 0
}
```

**Required Fields:**
- `name` (string)
- `status` (enum: "Planning", "In Progress", "On Hold", "Completed")

**Optional Fields:**
- `clientName`, `location`, `description`
- `startDate`, `endDate` (ISO date strings)
- `estimatedBudget`, `actualBudget` (numbers)
- `progress` (0-100)

**Response:** 201 Created
```json
{
  "id": "uuid",
  "companyId": "uuid",
  "name": "Downtown Office Complex",
  "clientName": "ABC Corporation",
  "location": "New York, NY",
  "description": "A modern 20-story office building",
  "startDate": "2024-01-15T00:00:00.000Z",
  "endDate": "2025-06-30T00:00:00.000Z",
  "status": "Planning",
  "estimatedBudget": "5000000",
  "actualBudget": null,
  "progress": 0,
  "createdAt": "2024-01-10T00:00:00.000Z",
  "updatedAt": "2024-01-10T00:00:00.000Z",
  "deletedAt": null
}
```

---

### 2. Get All Projects
**GET** `/api/projects`

**Response:** 200 OK
```json
[
  {
    "id": "uuid",
    "companyId": "uuid",
    "name": "Downtown Office Complex",
    "clientName": "ABC Corporation",
    "location": "New York, NY",
    "status": "In Progress",
    "progress": 75,
    ...
  }
]
```

**Note:** Only returns projects for the authenticated user's company.

---

### 3. Get Project Statistics
**GET** `/api/projects/stats`

**Response:** 200 OK
```json
{
  "total": 10,
  "inProgress": 5,
  "completed": 2,
  "onHold": 1,
  "planning": 2,
  "avgProgress": 45.5
}
```

---

### 4. Get Single Project
**GET** `/api/projects/:id`

**Response:** 200 OK
```json
{
  "id": "uuid",
  "companyId": "uuid",
  "name": "Downtown Office Complex",
  ...
}
```

**Error:** 404 Not Found if project doesn't exist or doesn't belong to company.

---

### 5. Update Project
**PATCH** `/api/projects/:id`

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Project Name",
  "status": "In Progress",
  "progress": 50,
  "actualBudget": 2500000
}
```

**Response:** 200 OK
```json
{
  "id": "uuid",
  "name": "Updated Project Name",
  "status": "In Progress",
  "progress": 50,
  ...
}
```

**Error:** 404 Not Found if project doesn't exist or doesn't belong to company.

---

### 6. Delete Project (Soft Delete)
**DELETE** `/api/projects/:id`

**Response:** 204 No Content

**Error:** 404 Not Found if project doesn't exist or doesn't belong to company.

**Note:** This is a soft delete. The project's `deletedAt` field is set, but the record remains in the database.

---

## Status Values
- `Planning`
- `In Progress`
- `On Hold`
- `Completed`

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Project not found"
}
```

### 400 Bad Request (Validation Error)
```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "status must be one of the following values: Planning, In Progress, On Hold, Completed"
  ],
  "error": "Bad Request"
}
```

---

## Testing with Postman

1. **First, get a JWT token:**
   - POST `/api/auth/login`
   - Body: `{ "email": "admin@construction.com", "password": "password123" }`
   - Copy the `access_token` from response

2. **Set Authorization:**
   - Go to Authorization tab
   - Type: Bearer Token
   - Token: `<paste your access_token>`

3. **Test endpoints:**
   - Create: POST `/api/projects`
   - List: GET `/api/projects`
   - Stats: GET `/api/projects/stats`
   - Get One: GET `/api/projects/:id`
   - Update: PATCH `/api/projects/:id`
   - Delete: DELETE `/api/projects/:id`

