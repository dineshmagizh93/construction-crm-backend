# Quick Fix: Database Connection Error

## The Problem
Your `.env` file has placeholder database credentials. You need to update them with your actual MySQL credentials.

## Solution

1. **Open `backend/.env` file**

2. **Find this line:**
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/construction_crm?schema=public"
   ```

3. **Replace it with your actual MySQL credentials:**
   ```env
   DATABASE_URL="mysql://YOUR_USERNAME:YOUR_PASSWORD@localhost:3306/construction_crm"
   ```

   **Examples:**
   
   If your MySQL username is `root` and password is `mypassword123`:
   ```env
   DATABASE_URL="mysql://root:mypassword123@localhost:3306/construction_crm"
   ```
   
   If your MySQL has no password (not recommended for production):
   ```env
   DATABASE_URL="mysql://root@localhost:3306/construction_crm"
   ```

4. **Make sure:**
   - MySQL server is running
   - The database `construction_crm` exists (or create it)
   - No spaces around the `=` sign
   - No quotes needed around the URL (or use double quotes if you prefer)

5. **Create the database (if it doesn't exist):**
   
   Option A - Using MySQL command line:
   ```bash
   mysql -u root -p -e "CREATE DATABASE construction_crm;"
   ```
   
   Option B - Using MySQL Workbench or phpMyAdmin:
   - Connect to MySQL
   - Create a new database named `construction_crm`

6. **Run the commands again:**
   ```bash
   npm run prisma:migrate
   npm run prisma:seed
   ```

## Common Issues

### "Access denied for user"
- Check your MySQL username and password
- Make sure MySQL is running
- Try connecting with MySQL client first to verify credentials

### "Unknown database"
- Create the database first (see step 5 above)

### "Can't connect to MySQL server"
- Make sure MySQL service is running
- Check if MySQL is on port 3306 (default)
- Verify MySQL is installed and running

