# FlowState

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

**FlowState** - A calm place for your busy mind. A productivity application built with Angular 17+ and NestJS in an Nx monorepo.

## 🏗️ Architecture

This is an Nx monorepo containing:
- **Frontend**: Angular 17+ application with Tailwind CSS, TanStack Query, and standalone components
- **Backend**: NestJS API with PostgreSQL, Redis, JWT authentication, and comprehensive task/project management

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker and Docker Compose (for containerized deployment)
- PostgreSQL 16+ (if running backend locally)
- Redis 7+ (if running backend locally)

### Development Setup

#### Option 1: Docker Compose (Recommended)

1. **Create a `.env` file** in the root directory:

```env
# Database
DB_PASSWORD=your_secure_password

# JWT Secrets
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key

# Email Configuration (for OTP)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password

# Application
APP_NAME=FlowState
NODE_ENV=production
PORT=3000
FRONTEND_PORT=80

# API URL for frontend (used during build)
API_URL=http://backend:3000/api
```

2. **Start all services**:

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database (port 5432)
- Redis cache (port 6379)
- Backend API (port 3000)
- Frontend application (port 80)

3. **Access the application**:
   - Frontend: http://localhost
   - Backend API: http://localhost:3000
   - API Documentation: http://localhost:3000/api/docs

#### Option 2: Local Development

**Backend**:

```bash
cd backend
npm install
npm run start:dev
```

**Frontend**:

```bash
npx nx serve frontend
```

Access the frontend at http://localhost:4200

## 📦 Docker Commands

### Build and Start Services

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

### Individual Service Management

```bash
# Start only backend
docker-compose up -d backend

# Start only frontend
docker-compose up -d frontend

# Restart a service
docker-compose restart backend

# View logs for a specific service
docker-compose logs -f frontend
```

## 🛠️ Development Tasks

### Frontend

```bash
# Serve frontend in development mode
npx nx serve frontend

# Build frontend for production
npx nx build frontend --configuration=production

# Run linter
npx nx lint frontend

# Run tests
npx nx test frontend
```

### Backend

```bash
# Serve backend in development mode
cd backend
npm run start:dev

# Build backend for production
npx nx build backend --prod

# Run database migrations
cd backend
npx prisma migrate dev
```

## 📁 Project Structure

```
flowstate/
├── apps/
│   ├── frontend/          # Angular 17+ application
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── core/          # Services, guards, interceptors
│   │   │   │   ├── features/      # Feature modules (auth, today, etc.)
│   │   │   │   ├── layouts/       # Layout components
│   │   │   │   └── shared/        # Shared UI components
│   │   │   └── environments/      # Environment configurations
│   │   ├── Dockerfile             # Frontend container definition
│   │   └── nginx.conf             # Nginx configuration
│   └── backend/           # NestJS API
│       ├── src/
│       │   ├── auth/      # Authentication module
│       │   ├── tasks/     # Tasks module
│       │   ├── projects/ # Projects module
│       │   └── ...
│       └── Dockerfile     # Backend container definition
├── docker-compose.yml     # Docker Compose configuration
└── package.json           # Root package.json for monorepo
```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DB_PASSWORD=your_secure_password

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (for OTP)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Application Configuration
APP_NAME=FlowState
NODE_ENV=production
PORT=3000
FRONTEND_PORT=80

# API URL (used during frontend build)
API_URL=http://backend:3000/api
```

## 🧪 Testing

```bash
# Run all tests
npx nx test

# Run frontend tests
npx nx test frontend

# Run backend tests
npx nx test backend

# Run E2E tests
npx nx e2e frontend-e2e
```

## 📝 Code Quality

```bash
# Lint all projects
npx nx run-many --target=lint --all

# Format code
npx nx format:write

# Type check
npx nx run-many --target=typecheck --all
```

## 🚢 Deployment

### Production Build

```bash
# Build both frontend and backend
npx nx build frontend --configuration=production
npx nx build backend --prod

# Or use Docker
docker-compose -f docker-compose.yml build
docker-compose -f docker-compose.yml up -d
```

### Health Checks

- Backend: http://localhost:3000/health/live
- Frontend: http://localhost/health

## 📚 Technology Stack

- **Frontend**: Angular 17+, Tailwind CSS, TanStack Query, Angular Signals
- **Backend**: NestJS, PostgreSQL, Redis, Prisma ORM, JWT Auth
- **DevOps**: Docker, Docker Compose, Nginx
- **Monorepo**: Nx

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linter
4. Submit a pull request

## 📄 License

MIT

---

Built with ❤️ using [Nx](https://nx.dev)
