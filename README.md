# FlowState - Full-Stack To-Do List Application

FlowState is a comprehensive productivity application built as a full-stack solution using Node.js (NestJS), Angular 17+, and PostgreSQL. The application provides advanced task management capabilities with user authentication, project organization, goal tracking, and focus session analytics.

## Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation and Local Setup](#installation-and-local-setup)
- [Running the Application](#running-the-application)
- [Docker Deployment](#docker-deployment)
- [Deployment on Google Cloud Platform (GCP)](#deployment-on-google-cloud-platform-gcp)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Frontend Application Guide](#frontend-application-guide)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Quality and Standards](#code-quality-and-standards)
- [Project Structure](#project-structure)
- [Git Repository and Commits](#git-repository-and-commits)
- [Additional Features](#additional-features)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Project Overview

FlowState is built as an Nx monorepo containing both frontend and backend applications. The backend is a production-ready NestJS API with comprehensive CRUD operations, authentication, and advanced features. The frontend is an Angular 17+ application with modern UI components, state management, and a responsive design.

The application goes beyond basic task management by implementing:
- User authentication with JWT and OTP verification
- Task management with priorities, tags, due dates, and energy levels
- Project organization and collaboration
- Goal tracking with progress monitoring
- Habit tracking with streak management
- Focus session analytics
- Natural language processing for task creation

## Architecture

This is an Nx monorepo workspace containing:

**Frontend Application** (`apps/frontend/`)
- Angular 17+ with standalone components
- Tailwind CSS for styling
- TanStack Query for server state management
- Angular Signals for local UI state
- Reactive forms with validation
- Route guards for authentication
- HTTP interceptors for token management

**Backend API** (`backend/`)
- NestJS framework with TypeScript
- PostgreSQL database with Prisma ORM
- Redis for caching and job queues
- JWT authentication with refresh tokens
- Swagger/OpenAPI documentation
- Email service for OTP delivery
- Scheduled tasks for reminders and reports

## Features

### Core Requirements (Implemented)

1. **Database Schema**
   - PostgreSQL database with comprehensive schema
   - Tasks table with id, title, description, created_at, updated_at
   - Additional fields: priority, tags, dueDate, isCompleted, projectId, goalId
   - User authentication tables
   - Project and goal management tables

2. **Backend API - CRUD Operations**
   - Create: POST /api/tasks
   - Read: GET /api/tasks (with filtering)
   - Update: PATCH /api/tasks/:id
   - Delete: DELETE /api/tasks/:id
   - Additional endpoints for task completion, snoozing, and NLP parsing

3. **Frontend Application**
   - Task list display with filtering and sorting
   - Add new tasks with title and description
   - Edit existing tasks
   - Delete tasks
   - Task completion toggle
   - Responsive design with modern UI

4. **Docker Configuration**
   - Dockerfile for backend (multi-stage build)
   - Dockerfile for frontend (Nginx production server)
   - docker-compose.yml for full application stack
   - Health checks for all services

### Advanced Features (Implemented)

1. **User Authentication**
   - User registration with email verification (OTP)
   - Login with JWT tokens
   - Refresh token mechanism
   - Password reset functionality
   - Protected routes with guards

2. **Task Management Enhancements**
   - Task prioritization (1-5 scale)
   - Tags for categorization
   - Due dates with time support
   - Task completion status
   - Task snoozing functionality
   - Natural language input parsing
   - Energy level matching (low/medium/high)
   - Estimated duration tracking

3. **Project Management**
   - Create and manage projects
   - Project progress tracking
   - Project member collaboration
   - Project deadlines
   - Color coding for projects

4. **Goal Tracking**
   - Create goals with target dates
   - Progress calculation
   - Goal types (personal, professional, health, etc.)
   - Link goals to projects
   - Track tasks contributing to goals

5. **Habit Tracking**
   - Create habits with schedules
   - Streak tracking (current and best)
   - Link habits to goals
   - Daily/weekly habit completion

6. **Focus Sessions**
   - Track focus time on tasks
   - Planned vs actual duration
   - Focus rating system
   - Analytics and reporting

7. **Additional Features**
   - Email notifications via Gmail SMTP
   - Background job processing with Bull queues
   - Scheduled tasks for reminders
   - Overdue task detection
   - Weekly focus reports
   - API rate limiting
   - Request validation
   - Error handling and logging
   - Health check endpoints

## Technology Stack

### Frontend
- Angular 17+ (Standalone Components)
- TypeScript 5.9+
- Tailwind CSS 3.4+
- TanStack Query Angular (Server State)
- Angular Signals (Local State)
- Angular CDK (Drag & Drop, Scrolling)
- RxJS 7.8+
- date-fns (Date manipulation)

### Backend
- NestJS 11+
- TypeScript 5.9+
- PostgreSQL 16+ (Database)
- Prisma ORM 7.1+ (Database client)
- Redis 7+ (Caching and queues)
- Bull (Job queue)
- JWT (Authentication)
- Bcrypt (Password hashing)
- Nodemailer (Email service)
- Swagger/OpenAPI (API documentation)
- Helmet (Security headers)
- Class Validator (Input validation)

### DevOps
- Docker & Docker Compose
- Nginx (Frontend production server)
- Node.js 20+ (Runtime)

### Development Tools
- Nx 22.2+ (Monorepo management)
- ESLint (Code linting)
- Prettier (Code formatting)
- Jest (Testing framework)
- Playwright (E2E testing)

## Prerequisites

Before installing and running the application, ensure you have the following installed:

- Node.js 20.0 or higher
- npm 10.0 or higher (comes with Node.js)
- Docker 24.0 or higher (for containerized deployment)
- Docker Compose 2.0 or higher (for multi-container orchestration)
- PostgreSQL 16.0 or higher (if running database locally)
- Redis 7.0 or higher (if running Redis locally)
- Git (for cloning the repository)

## Installation and Local Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/fokou-winny-chanelle/flowstate.git
cd flowstate
```

### Step 2: Install Dependencies

Install all dependencies for the monorepo:

```bash
npm install
```

This will install dependencies for both frontend and backend applications.

### Step 3: Database Setup

#### Option A: Using Docker (Recommended)

Start PostgreSQL and Redis using Docker Compose:

```bash
docker-compose up -d postgres redis
```

#### Option B: Local Installation

1. Install PostgreSQL locally and create a database:

```bash
createdb flowstate
```

2. Install Redis locally and start the service:

```bash
redis-server
```

### Step 4: Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/flowstate?schema=public
DB_PASSWORD=your_secure_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_minimum_32_characters_long
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_minimum_32_characters_long
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (for OTP)
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password

# Application Configuration
APP_NAME=FlowState
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:4200

# API URL (for frontend)
API_URL=http://localhost:3000/api
```

**Important**: Replace all placeholder values with your actual configuration. For Gmail, you'll need to generate an App Password from your Google Account settings.

### Step 5: Database Migrations

Run Prisma migrations to set up the database schema:

```bash
cd backend
npx prisma migrate dev
npx prisma generate
cd ..
```

This will create all necessary tables in your PostgreSQL database.

### Step 6: Seed Database (Optional)

If you want to populate the database with sample data:

```bash
cd backend
npx prisma db seed
cd ..
```

## Running the Application

### Development Mode

#### Start Backend API

Open a terminal and run:

```bash
cd backend
npm run start:dev
```

The backend API will be available at:
- API Base URL: http://localhost:3000/api
- API Documentation: http://localhost:3000/api/docs
- Health Check: http://localhost:3000/api/health/live

#### Start Frontend Application

Open another terminal and run:

```bash
npx nx serve frontend
```

The frontend application will be available at:
- Application URL: http://localhost:4200

The application will automatically reload when you make changes to the source files.

### Production Build

#### Build Backend

```bash
npx nx build backend --prod
```

The built files will be in `dist/backend/`.

#### Build Frontend

```bash
npx nx build frontend --configuration=production
```

The built files will be in `dist/apps/frontend/browser/`.

## Docker Deployment

The application is fully containerized using Docker and Docker Compose. This is the recommended way to deploy the application.

### Prerequisites for Docker

- Docker 24.0 or higher
- Docker Compose 2.0 or higher

### Docker Configuration Files

1. **Backend Dockerfile** (`backend/Dockerfile`)
   - Multi-stage build for optimization
   - Node.js 20 Alpine base image
   - Production-ready configuration

2. **Frontend Dockerfile** (`apps/frontend/Dockerfile`)
   - Multi-stage build (Node.js for build, Nginx for serving)
   - Nginx Alpine base image
   - Optimized static file serving

3. **Docker Compose** (`docker-compose.yml`)
   - PostgreSQL service
   - Redis service
   - Backend API service
   - Frontend application service
   - Volume management
   - Health checks

### Running with Docker Compose

#### Step 1: Create Environment File

Create a `.env` file in the root directory (see Installation section for details).

#### Step 2: Build and Start Services

```bash
docker-compose up -d --build
```

This command will:
- Build all Docker images
- Start PostgreSQL, Redis, backend, and frontend services
- Create necessary volumes
- Set up network connections

#### Step 3: Verify Services

Check that all services are running:

```bash
docker-compose ps
```

You should see all four services (postgres, redis, backend, frontend) with status "Up".

#### Step 4: View Logs

View logs from all services:

```bash
docker-compose logs -f
```

View logs from a specific service:

```bash
docker-compose logs -f backend
docker-compose logs -f frontend
```

#### Step 5: Access the Application

- Frontend: http://localhost
- Backend API: http://localhost:3000/api
- API Documentation: http://localhost:3000/api/docs

### Docker Commands Reference

**Start services:**
```bash
docker-compose up -d
```

**Stop services:**
```bash
docker-compose down
```

**Stop and remove volumes (deletes database data):**
```bash
docker-compose down -v
```

**Restart a specific service:**
```bash
docker-compose restart backend
docker-compose restart frontend
```

**Rebuild and restart:**
```bash
docker-compose up -d --build
```

**View service status:**
```bash
docker-compose ps
```

**Execute commands in a container:**
```bash
docker-compose exec backend sh
docker-compose exec postgres psql -U postgres -d flowstate
```

**Run database migrations in container:**
```bash
docker-compose exec backend npx prisma migrate deploy
```

## Deployment on Google Cloud Platform (GCP)

This section provides step-by-step instructions for deploying FlowState on Google Cloud Platform.

### Prerequisites

- Google Cloud Platform account
- Google Cloud SDK (gcloud) installed
- Docker installed locally
- Domain name (optional, for custom domain)

### Option 1: Cloud Run (Recommended for Serverless)

Cloud Run is a fully managed serverless platform that automatically scales your containers.

#### Step 1: Build and Push Docker Images

1. Create a Google Cloud project:

```bash
gcloud projects create flowstate-project --name="FlowState Application"
gcloud config set project flowstate-project
```

2. Enable required APIs:

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable sqladmin.googleapis.com
gcloud services enable redis.googleapis.com
```

3. Create Artifact Registry repository:

```bash
gcloud artifacts repositories create flowstate-repo \
  --repository-format=docker \
  --location=us-central1
```

4. Build and push backend image:

```bash
gcloud builds submit --tag us-central1-docker.pkg.dev/flowstate-project/flowstate-repo/backend:latest backend/
```

5. Build and push frontend image:

```bash
gcloud builds submit --tag us-central1-docker.pkg.dev/flowstate-project/flowstate-repo/frontend:latest apps/frontend/
```

#### Step 2: Set Up Cloud SQL (PostgreSQL)

1. Create Cloud SQL instance:

```bash
gcloud sql instances create flowstate-db \
  --database-version=POSTGRES_16 \
  --tier=db-f1-micro \
  --region=us-central1 \
  --root-password=your_secure_password
```

2. Create database:

```bash
gcloud sql databases create flowstate --instance=flowstate-db
```

3. Get connection name:

```bash
gcloud sql instances describe flowstate-db --format="value(connectionName)"
```

#### Step 3: Set Up Cloud Memorystore (Redis)

```bash
gcloud redis instances create flowstate-redis \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0
```

#### Step 4: Deploy Backend to Cloud Run

```bash
gcloud run deploy flowstate-backend \
  --image us-central1-docker.pkg.dev/flowstate-project/flowstate-repo/backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="DATABASE_URL=postgresql://postgres:password@/flowstate?host=/cloudsql/CONNECTION_NAME" \
  --set-env-vars="REDIS_HOST=REDIS_IP" \
  --add-cloudsql-instances=CONNECTION_NAME \
  --memory 512Mi \
  --cpu 1
```

#### Step 5: Deploy Frontend to Cloud Run

```bash
gcloud run deploy flowstate-frontend \
  --image us-central1-docker.pkg.dev/flowstate-project/flowstate-repo/frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="API_URL=https://flowstate-backend-xxx.run.app/api" \
  --memory 256Mi \
  --cpu 1
```

### Option 2: Compute Engine with Docker

For more control, deploy on Compute Engine VMs.

#### Step 1: Create VM Instance

```bash
gcloud compute instances create flowstate-vm \
  --zone=us-central1-a \
  --machine-type=e2-medium \
  --image-family=cos-stable \
  --image-project=cos-cloud \
  --boot-disk-size=20GB
```

#### Step 2: Install Docker on VM

SSH into the VM and install Docker:

```bash
gcloud compute ssh flowstate-vm --zone=us-central1-a
```

Then install Docker:

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo systemctl start docker
sudo systemctl enable docker
```

#### Step 3: Deploy Application

Copy your docker-compose.yml and .env files to the VM, then run:

```bash
docker-compose up -d
```

### Option 3: Google Kubernetes Engine (GKE)

For production-scale deployments with high availability.

#### Step 1: Create GKE Cluster

```bash
gcloud container clusters create flowstate-cluster \
  --num-nodes=3 \
  --zone=us-central1-a \
  --machine-type=e2-medium
```

#### Step 2: Configure kubectl

```bash
gcloud container clusters get-credentials flowstate-cluster --zone us-central1-a
```

#### Step 3: Deploy with Kubernetes Manifests

Create Kubernetes deployment files and apply:

```bash
kubectl apply -f k8s/
```

### Environment Variables for GCP

When deploying to GCP, ensure these environment variables are set:

```env
DATABASE_URL=postgresql://user:password@/flowstate?host=/cloudsql/CONNECTION_NAME
REDIS_HOST=REDIS_IP_ADDRESS
JWT_SECRET=your_secret_key
JWT_REFRESH_SECRET=your_refresh_secret
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_app_password
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### Post-Deployment Steps

1. Run database migrations:

```bash
gcloud run jobs create migrate-db \
  --image us-central1-docker.pkg.dev/flowstate-project/flowstate-repo/backend:latest \
  --command="npx,prisma,migrate,deploy" \
  --set-env-vars="DATABASE_URL=..."
```

2. Set up custom domain (optional):

```bash
gcloud run domain-mappings create \
  --service flowstate-frontend \
  --domain api.yourdomain.com
```

3. Configure SSL certificates (automatic with Cloud Run)

4. Set up monitoring and logging in GCP Console

## Database Schema

The application uses PostgreSQL with the following main tables:

### Tasks Table

The core tasks table includes all required fields plus additional features:

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  is_completed BOOLEAN DEFAULT false,
  due_date TIMESTAMP,
  priority INTEGER DEFAULT 3,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  goal_id UUID REFERENCES goals(id) ON DELETE SET NULL,
  estimated_duration INTEGER,
  energy_level VARCHAR(10),
  metadata JSONB,
  raw_nlp_input TEXT
);
```

### Additional Tables

- **users**: User accounts with authentication
- **projects**: Project organization
- **goals**: Goal tracking
- **habits**: Habit tracking
- **focus_sessions**: Focus time analytics
- **refresh_tokens**: JWT refresh token management
- **otps**: One-time password for email verification

Full schema is defined in `backend/prisma/schema.prisma`.

## API Documentation

The backend API is fully documented using Swagger/OpenAPI. Once the backend is running, access the interactive API documentation at:

**http://localhost:3000/api/docs**

### Main API Endpoints

#### Authentication

- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login and get JWT tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and invalidate tokens
- `POST /api/auth/send-otp` - Send OTP for email verification
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

#### Tasks (CRUD Operations)

- `POST /api/tasks` - Create a new task
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/today` - Get today's tasks
- `GET /api/tasks/:id` - Get a specific task
- `PATCH /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task
- `POST /api/tasks/:id/complete` - Mark task as completed
- `POST /api/tasks/:id/snooze` - Snooze a task
- `POST /api/tasks/from-nlp` - Create task from natural language

#### Projects

- `POST /api/projects` - Create a project
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get a specific project
- `PATCH /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project
- `POST /api/projects/:id/members` - Add project member

#### Goals

- `POST /api/goals` - Create a goal
- `GET /api/goals` - Get all goals
- `GET /api/goals/:id` - Get a specific goal
- `PATCH /api/goals/:id` - Update a goal
- `DELETE /api/goals/:id` - Delete a goal

#### Habits

- `POST /api/habits` - Create a habit
- `GET /api/habits` - Get all habits
- `PATCH /api/habits/:id` - Update a habit
- `DELETE /api/habits/:id` - Delete a habit
- `POST /api/habits/:id/complete` - Mark habit as completed

#### Focus Sessions

- `POST /api/focus-sessions` - Create a focus session
- `GET /api/focus-sessions` - Get all focus sessions
- `PATCH /api/focus-sessions/:id` - Update a focus session

### Authentication

All task, project, goal, habit, and focus session endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

## Frontend Application Guide

### Navigating the Application

1. **Landing/Login Page** (`/auth/login`)
   - Enter email and password to login
   - Link to signup page for new users
   - Forgot password option

2. **Signup Page** (`/auth/signup`)
   - Create new account with email, full name, and password
   - Automatic redirect to OTP verification

3. **OTP Verification** (`/auth/verify-otp`)
   - Enter 6-digit code sent to email
   - Resend code option
   - Automatic redirect to Today page after verification

4. **Today Page** (`/today`)
   - Main dashboard showing today's tasks
   - Personalized greeting with user name
   - Task list with completion checkboxes
   - Task details: title, description, tags, due date, priority
   - Empty state when no tasks exist
   - Add task button (to be implemented)

### Using Task Management

#### Viewing Tasks

- Tasks are displayed in a card-based layout
- Each task shows:
  - Checkbox for completion status
  - Task title (bold)
  - Description (if available)
  - Tags as badges
  - Due date
  - Priority indicator

#### Adding a Task

1. Click the "Add first task" button (when no tasks exist) or use the add task feature
2. Enter task title (required)
3. Optionally add description
4. Set due date, priority, tags, and other properties
5. Click "Create" to save

#### Editing a Task

1. Click on a task card to open edit mode
2. Modify title, description, or other fields
3. Changes are saved automatically or click "Save"

#### Completing a Task

1. Click the checkbox next to a task
2. Task is marked as completed
3. Completed tasks appear with reduced opacity and strikethrough text

#### Deleting a Task

1. Open task details
2. Click delete button
3. Confirm deletion

### User Interface Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Clean, minimalist design with Tailwind CSS
- **Loading States**: Visual feedback during API calls
- **Error Handling**: User-friendly error messages
- **Accessibility**: Keyboard navigation and ARIA labels
- **Dark Mode Ready**: CSS custom properties support theming

## Development Workflow

### Code Organization

The project follows a feature-based architecture:

**Frontend Structure:**
```
apps/frontend/src/app/
├── core/              # Singleton services, guards, interceptors
│   ├── services/      # API services, auth service
│   ├── guards/       # Route guards
│   ├── interceptors/ # HTTP interceptors
│   └── models/       # TypeScript interfaces
├── features/         # Feature modules (lazy-loaded)
│   ├── auth/         # Authentication pages
│   └── today/        # Today dashboard
├── layouts/          # Layout components
│   ├── app-shell/    # Main app layout
│   └── auth-layout/  # Auth pages layout
└── shared/           # Shared UI components
    └── ui/           # Reusable components (Button, Card, Input, Badge)
```

**Backend Structure:**
```
backend/src/
├── auth/             # Authentication module
├── tasks/            # Tasks CRUD operations
├── projects/         # Projects management
├── goals/            # Goals tracking
├── habits/           # Habits tracking
├── focus-sessions/   # Focus analytics
├── email-queue/      # Email service
├── scheduler/        # Scheduled tasks
├── nlp/              # Natural language processing
├── health/           # Health checks
└── prisma/           # Database client
```

### Making Changes

1. **Create a feature branch:**
```bash
git checkout -b feature/your-feature-name
```

2. **Make your changes** following the existing code patterns

3. **Run linter:**
```bash
npx nx lint frontend
npx nx lint backend
```

4. **Run tests:**
```bash
npx nx test frontend
npx nx test backend
```

5. **Commit changes:**
```bash
git add .
git commit -m "feat: description of your changes"
```

6. **Push and create pull request:**
```bash
git push origin feature/your-feature-name
```

### Commit Message Convention

We follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Example:
```
feat(tasks): add task priority filtering
fix(auth): resolve token refresh issue
docs(readme): update installation instructions
```

## Testing

### Running Tests

**Frontend Tests:**
```bash
npx nx test frontend
```

**Backend Tests:**
```bash
npx nx test backend
```

**E2E Tests:**
```bash
npx nx e2e frontend-e2e
```

**All Tests:**
```bash
npx nx run-many --target=test --all
```

### Test Coverage

Generate coverage reports:

```bash
npx nx test frontend --coverage
npx nx test backend --coverage
```

Coverage reports are generated in `coverage/` directories.

### Writing Tests

**Frontend Component Test Example:**
```typescript
describe('TaskCardComponent', () => {
  it('should display task title', () => {
    // Test implementation
  });
});
```

**Backend Service Test Example:**
```typescript
describe('TasksService', () => {
  it('should create a task', async () => {
    // Test implementation
  });
});
```

## Code Quality and Standards

### Linting

Run ESLint on all projects:

```bash
npx nx run-many --target=lint --all
```

Fix auto-fixable issues:

```bash
npx nx lint frontend --fix
npx nx lint backend --fix
```

### Code Formatting

Format code with Prettier:

```bash
npx nx format:write
```

### Type Checking

Check TypeScript types:

```bash
npx nx run-many --target=typecheck --all
```

### Pre-commit Hooks

Consider setting up Husky for pre-commit hooks to run linting and tests automatically.

## Project Structure

```
flowstate/
├── apps/
│   ├── frontend/                 # Angular application
│   │   ├── src/
│   │   │   ├── app/             # Application code
│   │   │   ├── assets/          # Static assets
│   │   │   └── environments/    # Environment configs
│   │   ├── Dockerfile           # Frontend container
│   │   └── nginx.conf           # Nginx configuration
│   └── frontend-e2e/            # E2E tests
├── backend/                      # NestJS API
│   ├── src/                     # Source code
│   ├── prisma/                  # Database schema
│   │   └── schema.prisma
│   └── Dockerfile               # Backend container
├── libs/                        # Shared libraries
├── docker-compose.yml           # Docker orchestration
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── nx.json                      # Nx configuration
├── package.json                 # Root dependencies
├── tsconfig.base.json           # TypeScript config
└── README.md                    # This file
```

## Git Repository and Commits

### Repository

The project is hosted on GitHub:
**https://github.com/fokou-winny-chanelle/flowstate.git**

### Commit History

The repository contains meaningful, organized commits demonstrating the development process:

1. **Initial Setup**: Project structure and configuration
2. **Backend Implementation**: API endpoints and services
3. **Database Schema**: Prisma models and migrations
4. **Authentication**: JWT and OTP implementation
5. **Frontend Foundation**: Angular setup and routing
6. **UI Components**: Shared component library
7. **Task Management**: CRUD operations and UI
8. **Advanced Features**: Projects, goals, habits
9. **Docker Configuration**: Containerization
10. **Documentation**: README and API docs

Each commit follows conventional commit format with clear descriptions of changes.

### Branching Strategy

- `master`: Main production branch
- `feature/*`: Feature development branches
- `fix/*`: Bug fix branches
- `docs/*`: Documentation updates

## Additional Features

Beyond the core requirements, the following advanced features have been implemented:

### 1. Natural Language Processing

Users can create tasks using natural language input:
- "Call John tomorrow at 3pm"
- "Finish report by Friday high priority"
- "Buy groceries today #personal"

The backend parses the input and extracts:
- Task title
- Due date and time
- Priority level
- Tags
- Estimated duration

### 2. Task Organization

- **Projects**: Group related tasks
- **Tags**: Categorize tasks with multiple tags
- **Priorities**: 1-5 scale for task importance
- **Energy Levels**: Match tasks to user's energy (low/medium/high)
- **Due Dates**: Schedule tasks with specific dates and times

### 3. User Experience Enhancements

- **Personalized Greetings**: Time-based greetings with user name
- **Empty States**: Helpful messages when no tasks exist
- **Loading States**: Visual feedback during operations
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Works on all device sizes

### 4. Performance Optimizations

- **Lazy Loading**: Feature modules loaded on demand
- **Caching**: TanStack Query for efficient data fetching
- **Optimistic Updates**: Immediate UI updates before server confirmation
- **Code Splitting**: Reduced initial bundle size
- **Virtual Scrolling**: Efficient rendering of long lists

### 5. Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: Bcrypt for password security
- **OTP Verification**: Email verification for accounts
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Server-side validation
- **CORS Configuration**: Secure cross-origin requests
- **Helmet**: Security headers

### 6. Developer Experience

- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting
- **Hot Reload**: Fast development iteration
- **API Documentation**: Swagger/OpenAPI
- **Health Checks**: Service monitoring

## Troubleshooting

### Common Issues

**Issue: Database connection failed**

Solution:
- Verify PostgreSQL is running: `docker-compose ps postgres`
- Check DATABASE_URL in .env file
- Ensure database exists: `createdb flowstate`
- Run migrations: `npx prisma migrate dev`

**Issue: Frontend cannot connect to backend**

Solution:
- Verify backend is running on port 3000
- Check API_URL in frontend environment files
- Verify CORS configuration in backend
- Check browser console for errors

**Issue: Docker build fails**

Solution:
- Clear Docker cache: `docker system prune -a`
- Rebuild without cache: `docker-compose build --no-cache`
- Check Dockerfile syntax
- Verify all files are copied correctly

**Issue: OTP emails not sending**

Solution:
- Verify Gmail credentials in .env
- Check Gmail App Password is correct
- Ensure email service is running
- Check Redis is running (required for email queue)

**Issue: Port already in use**

Solution:
- Change port in .env file
- Stop conflicting services
- Use different ports: `PORT=3001` for backend

### Getting Help

- Check API documentation: http://localhost:3000/api/docs
- Review error logs: `docker-compose logs`
- Check GitHub issues
- Review code comments and documentation

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write or update tests
5. Ensure all tests pass
6. Run linter and fix issues
7. Commit with conventional commit format
8. Push to your fork
9. Create a pull request

### Code Style

- Follow existing code patterns
- Use TypeScript strict mode
- Write self-documenting code
- Add comments for complex logic
- Keep functions small and focused
- Use meaningful variable names

## License

This project is licensed under the MIT License.

---

**Built with Nx, Angular, and NestJS**

For questions or support, please open an issue on GitHub.
