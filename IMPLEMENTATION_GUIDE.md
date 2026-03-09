# Lion School - Implementation Guide

Complete guide for setting up and running the comprehensive e-learning platform.

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Frontend Setup](#frontend-setup)
5. [Backend Setup](#backend-setup)
6. [Database Configuration](#database-configuration)
7. [API Integration](#api-integration)
8. [Feature Implementation](#feature-implementation)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## Project Overview

**Lion School** is a full-stack e-learning platform with:
- Public landing page showcasing courses
- User authentication (students & lecturers)
- Student dashboard for course browsing and learning
- Lecturer dashboard for course creation and management
- Quiz system with automated grading
- Progress tracking for students
- Course reviews and ratings

## Tech Stack

### Frontend
- **Next.js 16.1.6** - React framework with App Router
- **Tailwind CSS 4.2** - Utility-first CSS framework
- **shadcn/ui** - Pre-built component library
- **Axios** - HTTP client for API communication
- **Poppins Font** - Modern typography
- **React Context API** - State management

### Backend
- **Django 4.2** - Python web framework
- **Django REST Framework** - API development
- **PostgreSQL** - Relational database
- **JWT Authentication** - Secure user sessions
- **django-cors-headers** - Enable frontend-backend communication

## Prerequisites

### System Requirements
- Node.js 18+ & npm/pnpm
- Python 3.10+
- PostgreSQL 12+
- Git

### Installation Verification
```bash
node --version      # Should be 18 or higher
npm --version       # Should be 9+
python3 --version   # Should be 3.10+
psql --version      # Should be 12+
```

## Frontend Setup

### 1. Clone & Install

```bash
# Clone repository
git clone <repository-url>
cd lion-school

# Install dependencies
npm install
# or
pnpm install
```

### 2. Environment Configuration

Create `.env.local` in the project root:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Optional
NEXT_PUBLIC_ANALYTICS_ID=
```

### 3. Start Development Server

```bash
npm run dev
# Frontend will be available at http://localhost:3000
```

### 4. Project Structure
```
app/
├── page.tsx              # Landing page
├── login/               # Student/Lecturer login
├── register/            # Registration with role selection
├── dashboard/           # Student dashboard
├── courses/
│   ├── page.tsx        # Course listing with filters
│   └── [id]/            # Course detail page
├── lecturer/
│   ├── dashboard/       # Lecturer dashboard
│   ├── courses/
│   │   ├── create/     # Create course
│   │   └── [id]/       # Manage course
│   └── students/        # View enrolled students
├── layout.tsx           # Root layout with Poppins font
└── globals.css          # Design tokens and colors

lib/
├── api-client.ts       # Axios HTTP client with interceptors
├── auth-context.tsx    # Authentication state management
└── utils.ts            # Helper functions
```

## Backend Setup

### 1. Navigate to Backend

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
# On macOS/Linux
python3 -m venv venv
source venv/bin/activate

# On Windows
python -m venv venv
venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Environment Configuration

Create `.env` in backend directory:

```bash
# Security
DEBUG=True
SECRET_KEY=your-super-secret-key-change-in-production
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_ENGINE=django.db.backends.postgresql
DB_NAME=lion_school
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### 5. Django Settings

The system includes `settings_template.py`. Copy and configure:

```bash
cp settings_template.py lion_school/settings.py
```

### 6. Database Migrations

```bash
# Create migration files
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

### 7. Create Superuser

```bash
python manage.py createsuperuser
# Follow prompts to create admin account
```

### 8. Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### 9. Start Django Server

```bash
python manage.py runserver
# Backend API will be available at http://localhost:8000/api
```

## Database Configuration

### PostgreSQL Setup

#### macOS (Homebrew)
```bash
# Install PostgreSQL
brew install postgresql@15

# Start service
brew services start postgresql@15

# Create database
createdb lion_school
```

#### Ubuntu/Debian
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb lion_school
```

#### Windows (Using PostgreSQL Installer)
1. Download from https://www.postgresql.org/download/windows/
2. Run installer and follow prompts
3. Remember the password for `postgres` user
4. Open pgAdmin and create `lion_school` database

#### Docker (Recommended)
```bash
# Using Docker Compose
docker run -d \
  --name lion_school_db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lion_school \
  -p 5432:5432 \
  postgres:15
```

### Verify Connection

```bash
psql -U postgres -d lion_school -h localhost
# Should connect successfully
```

## API Integration

### Axios HTTP Client

The frontend uses Axios with automatic token management:

```typescript
// lib/api-client.ts includes:
// - Request interceptors (add auth token)
// - Response interceptors (handle 401 errors)
// - Organized API modules (auth, courses, quizzes, etc.)
```

### Authentication Flow

1. **Registration**: POST `/api/auth/register/`
   ```json
   {
     "email": "user@example.com",
     "username": "user",
     "first_name": "John",
     "last_name": "Doe",
     "password": "securepass123",
     "password_confirm": "securepass123",
     "role": "student" // or "lecturer"
   }
   ```

2. **Login**: POST `/api/auth/login/`
   ```json
   {
     "email": "user@example.com",
     "password": "securepass123"
   }
   ```

3. **Token Storage**: JWT stored in HTTP-only cookie
4. **Auto Refresh**: Interceptors handle token renewal

### API Documentation

Interactive API docs available after backend starts:
- **Swagger UI**: http://localhost:8000/schema/swagger/
- **ReDoc**: http://localhost:8000/schema/redoc/

## Feature Implementation

### Landing Page
- Course showcase with filters
- Instructor information display
- Call-to-action buttons
- Responsive design with Tailwind CSS
- Dynamic course grid with images

### Authentication System
- Role-based registration (student/lecturer)
- Email verification (template included)
- Password hashing with Django's PBKDF2
- JWT token management with js-cookie

### Student Dashboard
- Enrolled courses display
- Progress tracking per course
- Course filtering by status
- Quick enrollment button
- Statistics (courses, progress, completed)

### Course Management (Lecturers)
- Create/edit courses with full details
- Upload course thumbnail
- Manage course modules and lessons
- Set pricing and availability
- View student enrollments
- Monitor course ratings and reviews

### Quiz System
- Multiple question types (MC, T/F, Short Answer)
- Automatic answer grading
- Time-limited quizzes
- Result tracking per student
- Answer review capability

### Progress Tracking
- Lesson completion tracking
- Overall course progress percentage
- Student statistics
- Time spent tracking
- Certificate generation (backend ready)

## Deployment

### Frontend Deployment (Vercel)

```bash
# Connect GitHub
# Push code to main branch

# Vercel will:
# 1. Detect Next.js
# 2. Build automatically
# 3. Deploy to Vercel domain
# 4. Enable CD/CI

# Set environment variables in Vercel dashboard:
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
```

### Backend Deployment Options

#### AWS EC2 + RDS
```bash
# SSH to EC2
ssh -i key.pem ubuntu@ip-address

# Clone repo and setup
git clone <repo>
cd lion-school/backend

# Install system dependencies
sudo apt update
sudo apt install python3-pip python3-venv postgresql-client

# Setup environment and run
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
gunicorn lion_school.wsgi --bind 0.0.0.0:8000
```

#### Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create lion-school-api

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:standard-0

# Deploy
git push heroku main

# Run migrations
heroku run python manage.py migrate
```

#### DigitalOcean App Platform
```bash
# Connect GitHub
# Select repository and branch
# Specify build/run commands

# Build: pip install -r requirements.txt
# Run: gunicorn lion_school.wsgi --bind 0.0.0.0:8000
```

## Troubleshooting

### Frontend Issues

#### Port 3000 Already in Use
```bash
# Kill process
lsof -ti:3000 | xargs kill -9
# or use different port
npm run dev -- -p 3001
```

#### Module Not Found Errors
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### CORS Errors
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check Django `CORS_ALLOWED_ORIGINS` setting
- Ensure backend is running

### Backend Issues

#### Database Connection Error
```bash
# Verify PostgreSQL
psql -U postgres

# Check Django database config
python manage.py dbshell

# View database settings
cat .env | grep DB_
```

#### Migration Errors
```bash
# Check migration status
python manage.py showmigrations

# Rollback specific migration
python manage.py migrate app_name 0001

# Create fresh migrations
python manage.py makemigrations --no-header
```

#### Authentication Issues
```bash
# Verify JWT settings
python manage.py shell
from django.conf import settings
print(settings.SIMPLE_JWT)

# Test token creation
from rest_framework_simplejwt.tokens import RefreshToken
token = RefreshToken.for_user(user)
```

### General Debugging

#### Enable Debug Logging
```python
# backend/settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```

#### Frontend Network Debugging
```javascript
// Add to lib/api-client.ts
apiClient.interceptors.request.use(config => {
  console.log('API Request:', config);
  return config;
});
```

## Common Tasks

### Add a New Course Field
1. Update `backend/models.py` (Course model)
2. Run `python manage.py makemigrations`
3. Run `python manage.py migrate`
4. Update `backend/serializers.py`
5. Update frontend forms/displays

### Create Admin User
```bash
python manage.py createsuperuser
# Access at http://localhost:8000/admin
```

### Backup Database
```bash
# PostgreSQL backup
pg_dump -U postgres lion_school > backup.sql

# Restore
psql -U postgres lion_school < backup.sql
```

### Reset Database
```bash
# WARNING: This deletes all data
python manage.py migrate zero
python manage.py migrate
```

## Next Steps

1. **Customize Design**: Modify color tokens in `/app/globals.css`
2. **Add Payment Integration**: Implement Stripe in course checkout
3. **Enable Email Notifications**: Configure SMTP in Django
4. **Setup CDN**: Upload course images to AWS S3/Vercel Blob
5. **Add Real-time Features**: Implement WebSockets for live classes
6. **Mobile App**: Build React Native version using same API

## Support & Resources

- **Documentation**: See `README.md` and `backend/README.md`
- **API Reference**: http://localhost:8000/schema/swagger/
- **Django Docs**: https://docs.djangoproject.com/
- **Next.js Docs**: https://nextjs.org/docs
- **DRF Docs**: https://www.django-rest-framework.org/

---

**Happy Teaching & Learning! 🎓**
