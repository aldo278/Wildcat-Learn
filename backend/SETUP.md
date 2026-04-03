# Backend Setup Guide

## Prerequisites
- Node.js installed
- Supabase project created

## Setup Steps

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Configuration
Create a `.env` file in the backend directory with the following:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wildcat_learn"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=5555
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# Supabase
SUPABASE_URL="your-supabase-project-url"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# AI (if needed for backend processing)
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Get Supabase Credentials
1. Go to your Supabase project dashboard
2. Settings → API
3. Copy the Project URL (SUPABASE_URL)
4. Copy the service_role key (SUPABASE_SERVICE_ROLE_KEY)
5. Copy the anon key (SUPABASE_ANON_KEY)

### 4. Build and Start
```bash
# Build the TypeScript code
npm run build

# Start the server
npm start
```

The backend should now be running on `http://localhost:5555`

## Troubleshooting

### Backend won't start
- Check that all environment variables are set
- Ensure Supabase credentials are correct
- Check that the port 5555 is not already in use

### Cards not saving
- Ensure backend is running on port 5555
- Check browser console for error messages
- Verify Supabase connection is working

### Common Issues
- If you get "Missing Supabase environment variables", check your .env file
- If you get database connection errors, verify your DATABASE_URL
- If you get authentication errors, check your JWT_SECRET

## Testing
You can test the backend is working by visiting:
- `http://localhost:5555/health` - Should return {"status": "OK"}

## API Endpoints
- POST `/api/sets` - Create a new set
- POST `/api/cards/batch` - Create multiple cards
- GET `/api/sets` - Get user's sets
- GET `/api/cards/set/:setId` - Get cards for a set
