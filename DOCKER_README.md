# Wildcat Learn - Docker Setup

This document explains how to run the Wildcat Learn application using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Clone and navigate to the project:**
   ```bash
   git clone <repository-url>
   cd Wildcat-Learn
   ```

2. **Build and start the application:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - Backend Health: http://localhost:3001/health

## Development vs Production

### Development Mode
```bash
# Start with hot reload (for development)
docker-compose up --build --watch
```

### Production Mode
```bash
# Build and run in production mode
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
```

## Docker Commands

### Build Services
```bash
# Build both services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend
```

### Start Services
```bash
# Start in foreground
docker-compose up

# Start in background (detached)
docker-compose up -d

# Start specific service
docker-compose up backend
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### View Logs
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f backend
```

### Health Checks
```bash
# Check service health
docker-compose ps

# View health status
curl http://localhost:3001/health
curl http://localhost:3000/health
```

## Environment Variables

The Docker setup uses the following environment variables:

### Backend
- `DATABASE_URL=file:./dev.db` - SQLite database path
- `JWT_SECRET=your-super-secret-jwt-key-change-this-in-production` - JWT signing secret
- `JWT_EXPIRES_IN=7d` - Token expiration
- `PORT=3001` - Backend port
- `NODE_ENV=production` - Environment mode
- `FRONTEND_URL=http://localhost:3000` - Frontend URL for CORS

### Frontend
- Uses nginx to serve the built React application
- API calls are proxied to the backend

## Database

### SQLite (Current)
- Database file: `./backend/dev.db`
- Persisted in Docker volume: `backend_data`
- Automatically seeded with initial data

### PostgreSQL (Future)
To migrate to PostgreSQL:
1. Uncomment the PostgreSQL service in `docker-compose.yml`
2. Update the `DATABASE_URL` environment variable
3. Run Prisma migrations:
   ```bash
   docker-compose exec backend npx prisma migrate dev
   ```

## Troubleshooting

### Port Conflicts
If ports 3000 or 3001 are already in use:
```bash
# Change ports in docker-compose.yml
ports:
  - "3002:3000"  # Frontend on port 3002
  - "3002:3001"  # Backend on port 3002
```

### Permission Issues
If you encounter permission errors with the database:
```bash
# Fix database file permissions
sudo chown -R $USER:$USER ./backend/dev.db
```

### Rebuild Services
If you make changes to the code:
```bash
# Rebuild and restart
docker-compose up --build --force-recreate
```

### Clear Cache
If you encounter caching issues:
```bash
# Remove all containers, images, and volumes
docker-compose down -v --rmi all
```

## Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │
│   (React)       │    │   (Express)     │
│   Port: 3000    │◄──►│   Port: 3001    │
│   Nginx         │    │   Node.js       │
└─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   Database      │
                       │   (SQLite)      │
                       │   dev.db        │
                       └─────────────────┘
```

## Production Considerations

1. **Security**: Update the JWT_SECRET with a strong, unique value
2. **Database**: Consider migrating to PostgreSQL for production
3. **SSL/TLS**: Add HTTPS termination (nginx or load balancer)
4. **Monitoring**: Add logging and monitoring solutions
5. **Scaling**: Use Docker Swarm or Kubernetes for horizontal scaling

## Useful Docker Tips

### Enter Container Shell
```bash
# Enter backend container
docker-compose exec backend sh

# Enter frontend container
docker-compose exec frontend sh
```

### View Resource Usage
```bash
# View container resource usage
docker stats
```

### Clean Up
```bash
# Remove unused Docker resources
docker system prune -a
```

## Support

If you encounter issues with Docker:

1. Check Docker Desktop is running
2. Verify ports are not in use
3. Check the logs: `docker-compose logs`
4. Ensure you have sufficient disk space
5. Try rebuilding: `docker-compose up --build --force-recreate`
