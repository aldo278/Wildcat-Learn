.PHONY: help build up down logs clean health dev prod

# Default target
help:
	@echo "Wildcat Learn - Docker Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev      - Start development environment"
	@echo "  make build    - Build Docker images"
	@echo "  make up       - Start services"
	@echo "  make down     - Stop services"
	@echo "  make logs     - View logs"
	@echo "  make health   - Check service health"
	@echo "  make clean    - Clean up Docker resources"
	@echo ""
	@echo "Production:"
	@echo "  make prod     - Start production environment"
	@echo "  make prod-down - Stop production environment"
	@echo ""
	@echo "Utilities:"
	@echo "  make shell-backend - Enter backend container"
	@echo "  make shell-frontend - Enter frontend container"

# Build Docker images
build:
	docker-compose build

# Start development environment
dev:
	docker-compose up --build

# Start services in background
up:
	docker-compose up -d

# Stop services
down:
	docker-compose down

# Stop services and remove volumes
down-clean:
	docker-compose down -v

# View logs
logs:
	docker-compose logs -f

# View backend logs
logs-backend:
	docker-compose logs -f backend

# View frontend logs
logs-frontend:
	docker-compose logs -f frontend

# Check service health
health:
	@echo "=== Service Status ==="
	docker-compose ps
	@echo ""
	@echo "=== Backend Health ==="
	curl -f http://localhost:3001/health || echo "Backend unhealthy"
	@echo ""
	@echo "=== Frontend Health ==="
	curl -f http://localhost:3000/health || echo "Frontend unhealthy"

# Clean up Docker resources
clean:
	docker-compose down -v --rmi all
	docker system prune -f

# Start production environment
prod:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d

# Stop production environment
prod-down:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml down

# Enter backend container shell
shell-backend:
	docker-compose exec backend sh

# Enter frontend container shell
shell-frontend:
	docker-compose exec frontend sh

# Rebuild and restart services
rebuild:
	docker-compose down
	docker-compose up --build --force-recreate

# Seed database
seed:
	docker-compose exec backend npx prisma db seed

# Generate Prisma client
prisma-generate:
	docker-compose exec backend npx prisma generate

# Run database migrations (when using PostgreSQL)
migrate:
	docker-compose exec backend npx prisma migrate dev

# Reset database
reset-db:
	docker-compose exec backend npx prisma migrate reset

# Watch for changes and rebuild
watch:
	docker-compose up --build --watch
