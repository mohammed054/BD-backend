# PostgreSQL Migration Guide

## What Changed?

We migrated from SQLite to PostgreSQL to fix the database persistence issues on Railway.

### Key Changes:

1. **Database**: SQLite → PostgreSQL
2. **Dependencies**: `sqlite3` → `pg` + `dotenv`
3. **Query Syntax**: SQLite uses `?` parameters, PostgreSQL uses `$1`, `$2`, etc.
4. **Data Types**: PostgreSQL uses `BOOLEAN`, `NUMERIC`, `SERIAL` instead of SQLite types

## Setup Steps

### 1. Add PostgreSQL Database on Railway

1. Go to your Railway project
2. Click "New Service" → Select "PostgreSQL"
3. Railway will create a database instance
4. Wait for it to be ready (green status)

### 2. Connect Backend to Database

1. Click on your PostgreSQL service
2. Go to the "Variables" tab
3. Copy the `DATABASE_URL` value
4. Click on your backend service
5. Go to the "Variables" tab
6. Add a new variable:
   - Name: `DATABASE_URL`
   - Value: (paste the URL from step 3)
7. Click "Add Variable"
8. Click "Redeploy" to apply changes

### 3. Verify Deployment

Check the logs:
```bash
# In Railway console, go to your backend service → "Deployments" → latest → "View Logs"
```

You should see:
```
Connected to PostgreSQL database
Database tables initialized
Server running on port 3000
```

### 4. Test the API

```bash
curl https://bd-backend.up.railway.app/api/health
```

Should return:
```json
{"status":"ok","timestamp":"..."}
```

## Local Development

To run locally with Railway's PostgreSQL:

1. Install dependencies:
```bash
cd BD-backend
npm install
```

2. Set up environment variables:
```bash
# Create .env file
cp .env.example .env

# Add your DATABASE_URL from Railway
```

3. Start the server:
```bash
npm start
```

## Troubleshooting

### Error: "relation does not exist"
- The database tables will be created automatically on first startup
- Check that DATABASE_URL is correct
- Redeploy if tables weren't created

### Error: "connection refused"
- Verify DATABASE_URL is correct
- Check PostgreSQL service is running (green status)
- Make sure DATABASE_URL is added to backend service, not just PostgreSQL service

### Data migration from SQLite
If you had data in SQLite, you'll need to manually re-import it:
1. Use the Import panel in the frontend
2. Or export from SQLite and insert into PostgreSQL using SQL

## Benefits of PostgreSQL over SQLite

✅ **Persistent storage** - Data survives deployments and restarts
✅ **Scalable** - Can handle more concurrent connections
✅ **Production-ready** - Managed service with automatic backups
✅ **Better for multi-instance deployments** - SQLite locks the database file
