# Wildcat Learn - Flashcard Application

A smart flashcard application built with React frontend and Node.js backend, featuring AI-powered card generation and multiple study modes.

## Features

- 🎴 Create and manage flashcard sets
- 🤖 AI-powered flashcard generation
- 📚 Multiple study modes (Study, Learn, Test)
- 🔍 Search and explore public sets
- 👤 User authentication with Supabase
- 📊 Progress tracking
- 🎨 Modern, responsive UI

## Project Structure

```
Wildcat-Learn/
├── frontend/          # React frontend application
├── backend/           # Node.js backend API
└── README.md
```

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm
- Supabase account (for database and authentication)

### 1. Clone and Install

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd Wildcat-Learn

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Backend Setup

1. **Configure Environment Variables**
   
   Create a `.env` file in the `backend/` directory:
   
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
   
   # AI (optional)
   GEMINI_API_KEY="your-gemini-api-key"
   ```

2. **Get Supabase Credentials**
   - Go to your [Supabase dashboard](https://supabase.com/dashboard)
   - Create a new project or use an existing one
   - Navigate to Settings → API
   - Copy the Project URL, service_role key, and anon key

3. **Start the Backend**
   
   ```bash
   cd backend
   npm run build
   npm start
   ```
   
   The backend should be running on `http://localhost:5555`

### 3. Frontend Setup

1. **Configure Environment Variables**
   
   Create a `.env` file in the `frontend/` directory:
   
   ```env
   VITE_SUPABASE_URL="your-supabase-project-url"
   VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
   ```

2. **Start the Frontend**
   
   ```bash
   cd frontend
   npm run dev
   ```
   
   The frontend should be running on `http://localhost:3000`

## Usage

1. **Create an Account** - Sign up with email and password
2. **Create Flashcard Sets** - Add cards manually or generate with AI
3. **Study Modes** - Use Study, Learn, or Test modes
4. **Track Progress** - Monitor your learning progress

## Development

### Running Tests

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
npm test
```

### API Endpoints

- `POST /api/sets` - Create a new set
- `GET /api/sets` - Get user's sets
- `GET /api/sets/:id` - Get specific set
- `POST /api/cards/batch` - Create multiple cards
- `GET /api/cards/set/:setId` - Get cards for a set
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

## Troubleshooting

### Backend Issues

**Problem**: Backend won't start
- Check all environment variables in `.env`
- Verify Supabase credentials are correct
- Ensure port 5555 is not in use

**Problem**: Cards not saving
- Ensure backend is running on port 5555
- Check browser console for error messages
- Verify Supabase connection

### Frontend Issues

**Problem**: "Page not found" errors
- Check that backend is running
- Verify API endpoints are accessible
- Check browser network tab for failed requests

**Problem**: Authentication issues
- Verify Supabase configuration
- Check CORS settings in backend
- Ensure frontend and backend URLs match

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Check the troubleshooting section above
- Review the backend setup guide in `backend/SETUP.md`
- Test the backend with `node backend/test-backend.js`
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
