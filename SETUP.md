# Backend Setup Instructions

## Prerequisites
- Node.js (v18 or higher)
- MySQL (v8 or higher) installed and running
- MySQL database created (or create one)

## Step-by-Step Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database

Edit the `.env` file and update the `DATABASE_URL` with your MySQL credentials:

```env
DATABASE_URL="mysql://username:password@localhost:3306/construction_crm"
```

**Important:** Replace:
- `username` with your MySQL username (usually `root`)
- `password` with your MySQL password
- `construction_crm` with your database name (create it first if it doesn't exist)

**Example:**
```env
DATABASE_URL="mysql://root:mypassword@localhost:3306/construction_crm"
```

### 3. Create Database (if not exists)

Connect to MySQL and create the database:
```sql
CREATE DATABASE construction_crm;
```

Or use MySQL command line:
```bash
mysql -u root -p -e "CREATE DATABASE construction_crm;"
```

### 4. Run Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations (creates tables)
npm run prisma:migrate

# Seed database with test data
npm run prisma:seed
```

### 5. Start the Server

```bash
# Development mode
npm run start:dev

# The server will run on http://localhost:3000
```

## Troubleshooting

### Error: Environment variable not found: DATABASE_URL
- Make sure `.env` file exists in the `backend` folder
- Check that `DATABASE_URL` is set correctly in `.env`
- No spaces around the `=` sign in `.env` file

### Error: Can't reach database server
- Make sure MySQL is running
- Check your MySQL credentials
- Verify the database exists

### Error: Migration failed
- Make sure the database exists
- Check database user has proper permissions
- Try dropping and recreating the database

## Test the API

Once running, you can test the endpoints:

**Register a new company:**
```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "companyName": "Test Company",
  "email": "test@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Login:**
```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@construction.com",
  "password": "password123"
}
```

**Get current user (requires JWT token):**
```bash
GET http://localhost:3000/api/auth/me
Authorization: Bearer <your-jwt-token>
```

## Seed Data

After running `npm run prisma:seed`, you'll have:

- **Company:** test@construction.com
- **Admin User:** admin@construction.com / password123
- **Regular User:** user@construction.com / password123

