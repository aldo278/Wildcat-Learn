# CI/CD Setup for Wildcat Learn

## 🚀 Overview

This repository uses GitHub Actions for Continuous Integration and Continuous Deployment (CI/CD).

## 📁 Workflow Files

### `frontend.yml`
- **Triggers**: Push/PR to main branch with frontend changes
- **Jobs**: 
  - `test`: Linting, type checking, building
  - `deploy`: Deploy to Vercel (main branch only)

### `backend.yml`
- **Triggers**: Push/PR to main branch with backend changes
- **Jobs**:
  - `test`: Linting, type checking, database migrations, tests
  - `deploy`: Deploy to Railway (main branch only)

### `database.yml`
- **Triggers**: Manual workflow dispatch
- **Purpose**: Run database migrations on specific environments

## 🔧 Required Secrets

Add these secrets in GitHub repo → Settings → Secrets and variables → Actions:

### Frontend Secrets
```
VERCEL_TOKEN=your_vercel_token
VERCEL_ORG_ID=your_vercel_org_id
VERCEL_PROJECT_ID=your_vercel_project_id
```

### Backend Secrets
```
RAILWAY_TOKEN=your_railway_token
RAILWAY_SERVICE_ID=your_railway_service_id
DATABASE_URL=your_production_database_url
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

## 🚀 Deployment Process

### Automatic Deployment
1. Push code to `main` branch
2. GitHub Actions runs tests
3. If tests pass, automatically deploys to production

### Manual Database Migration
1. Go to Actions tab in GitHub
2. Select "Database Migration" workflow
3. Click "Run workflow"
4. Choose environment (staging/production)

## 📊 Monitoring

- **GitHub Actions**: Check Actions tab for build status
- **Vercel**: Dashboard for frontend deployments
- **Railway**: Dashboard for backend deployments

## 🛠 Local Development

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
```

## 🔍 Troubleshooting

### Common Issues
1. **Secrets not set**: Add all required secrets in GitHub settings
2. **Build failures**: Check action logs for specific error messages
3. **Database migrations**: Ensure DATABASE_URL is correct and accessible

### Getting Help
- Check GitHub Actions logs for detailed error messages
- Verify all secrets are correctly configured
- Ensure package.json scripts are properly set up
