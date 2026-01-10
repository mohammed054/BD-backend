# BD Backend API

Backend API for the Mohammed & Ahmad BD Camping/Party Organizer application.

## Features

- RESTful API for categories, items, and guests
- PostgreSQL database for reliable, persistent storage
- CORS enabled for frontend integration (allows requests from GitHub Pages)
- Health check endpoint
- Auto-redeploy on git push
- Transaction support for data consistency

## API Endpoints

### Health
- `GET /api/health` - Check if server is running

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Items
- `GET /api/items/category/:categoryId` - Get items for a category
- `POST /api/items` - Create new item
- `PUT /api/items/:id/claim` - Claim/unclaim item
- `DELETE /api/items/:id` - Delete item

### Guests
- `GET /api/guests` - Get all guests
- `POST /api/guests` - Register new guest

### Import
- `POST /api/import` - Bulk import categories and items

## Deployment to Railway

### Current Deployment

- **URL**: https://bd-backend.up.railway.app
- **Status**: Live with CORS enabled
- **Frontend**: Connects from https://mohammed054.github.io/BD/

### Automatic Deployment (Recommended)

1. Push code to GitHub
2. Go to [Railway](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select this repository (BD-backend)
5. Click "Deploy Now"
6. **Important**: Set Target Port to **3000** in Railway Networking settings

 Railway will automatically:
- Install dependencies
- Start the server
- Provide a public URL
- Apply CORS configuration for cross-origin requests

### Database Setup on Railway

1. After deploying, go to your Railway project
2. Click "New Service" → "Add PostgreSQL"
3. Railway will create a PostgreSQL database
4. Click the database service → "Variables" tab
5. Copy the `DATABASE_URL` value
6. Go to your backend service → "Variables" tab
7. Add `DATABASE_URL` with the copied value
8. Redeploy your backend service (click "Redeploy" button)

### Manual Deployment

1. Install Railway CLI:
```bash
npm install -g @railway/cli
railway login
```

2. Create and deploy:
```bash
railway init
railway up
```

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string (provided by Railway)

Optional:
- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)

Example:
```bash
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=production
PORT=3000
```

## Database

Uses PostgreSQL for reliable, persistent storage. Database tables are automatically initialized on startup.

## Testing

Test the API:
```bash
curl https://bd-backend.up.railway.app/api/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-01-10T..."}
```

## Development

Local development:
```bash
npm install
npm start
```

Server will run on `http://localhost:3000`

## License

MIT