# Docker Containerization Setup

This document explains the complete Docker setup for FlowState application.

## Architecture Overview

The application is containerized using Docker Compose with the following services:

1. **PostgreSQL** - Database service
2. **Redis** - Cache and job queue service
3. **Backend** - NestJS API service
4. **Frontend** - Angular application served by Nginx

## Backend Containerization

### Dockerfile Structure

The backend Dockerfile uses a multi-stage build:

1. **Builder Stage**:
   - Installs all dependencies (including dev dependencies for Prisma)
   - Copies Prisma schema and migrations
   - Generates Prisma Client
   - Builds the NestJS application

2. **Production Stage**:
   - Uses minimal Node.js Alpine image
   - Copies built application and dependencies
   - Copies Prisma files for migrations
   - Includes initialization script

### Initialization Process

The backend container uses an entrypoint script (`docker-entrypoint.sh`) that:

1. Waits for PostgreSQL to be ready (with timeout)
2. Executes Prisma migrations automatically
3. Starts the NestJS application

This ensures the database is properly migrated before the application starts.

### Key Features

- Automatic database migrations on container start
- Health checks for service monitoring
- Non-root user for security
- Proper dependency management

## Frontend Containerization

### Dockerfile Structure

The frontend Dockerfile uses a multi-stage build:

1. **Builder Stage**:
   - Installs dependencies
   - Replaces API URL in environment file at build time
   - Builds Angular application for production

2. **Production Stage**:
   - Uses Nginx Alpine image
   - Copies built application
   - Serves static files with optimized configuration

### API URL Configuration

The frontend uses the backend API URL configured at build time. Since the frontend runs in the browser, it must use the public URL (`http://localhost:3000/api`) rather than the internal Docker network URL.

The API URL can be customized using the `API_URL` build argument in docker-compose.yml.

## Docker Compose Configuration

### Service Dependencies

- Backend depends on PostgreSQL and Redis (waits for health checks)
- Frontend depends on Backend (waits for health check)

### Network Configuration

All services run on the same Docker network, allowing internal communication using service names:
- Backend can access PostgreSQL at `postgres:5432`
- Backend can access Redis at `redis:6379`
- Frontend container can access Backend at `backend:3000` (for server-side requests)

However, browser requests from the frontend must use `localhost:3000` as the browser cannot resolve Docker service names.

### Health Checks

All services include health checks:
- PostgreSQL: `pg_isready` command
- Redis: `redis-cli ping` command
- Backend: HTTP GET to `/api/health/live`
- Frontend: HTTP GET to `/health`

### Volumes

- `postgres_data`: Persistent storage for PostgreSQL data
- `redis_data`: Persistent storage for Redis data

## Environment Variables

Required environment variables in `.env` file:

```env
# Database
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

# Email
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# Application
APP_NAME=FlowState
NODE_ENV=production
PORT=3000
FRONTEND_PORT=80

# API URL (for frontend build)
API_URL=http://localhost:3000/api
```

## Running the Application

### Start All Services

```bash
docker-compose up -d --build
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Stop Services

```bash
docker-compose down
```

### Rebuild After Changes

```bash
docker-compose up -d --build --force-recreate
```

## Troubleshooting

### Backend Migration Issues

If migrations fail, check:
1. PostgreSQL is running and accessible
2. DATABASE_URL is correct
3. Database user has proper permissions
4. Check backend logs: `docker-compose logs backend`

### Frontend Cannot Connect to Backend

If the frontend cannot reach the backend API:
1. Verify backend is running: `docker-compose ps`
2. Check backend health: `curl http://localhost:3000/api/health/live`
3. Verify API_URL in frontend build matches backend URL
4. Check browser console for CORS errors
5. Verify FRONTEND_URL in backend environment matches frontend URL

### Database Connection Issues

If backend cannot connect to database:
1. Check PostgreSQL is healthy: `docker-compose ps postgres`
2. Verify DATABASE_URL format
3. Check network connectivity: `docker-compose exec backend nc -z postgres 5432`
4. Review PostgreSQL logs: `docker-compose logs postgres`

## Production Considerations

For production deployment:

1. **Use Secrets Management**: Store sensitive environment variables in Docker secrets or external secret management
2. **Use Production Database**: Consider managed database services (Cloud SQL, RDS, etc.)
3. **Enable SSL/TLS**: Configure HTTPS for frontend and backend
4. **Resource Limits**: Set appropriate CPU and memory limits
5. **Monitoring**: Add logging and monitoring solutions
6. **Backup Strategy**: Implement database backup procedures
7. **Security**: Review and harden container security settings
