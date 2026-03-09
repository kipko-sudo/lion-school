# Lion School - Django Backend

Comprehensive e-learning platform backend built with Django, Django REST Framework, and PostgreSQL.

## Architecture Overview

```
backend/
├── lion_school/          # Main project settings
│   ├── settings.py       # Django configuration
│   ├── urls.py           # Root URL routing
│   ├── wsgi.py           # WSGI application
│   └── asgi.py           # ASGI application
├── accounts/             # User authentication & management
│   ├── models.py         # Custom user model, user profiles
│   ├── views.py          # Auth endpoints (login, register, profile)
│   ├── serializers.py    # User serializers
│   └── urls.py           # Account routes
├── courses/              # Course management
│   ├── models.py         # Course, Module, Lesson models
│   ├── views.py          # Course CRUD & enrollment
│   ├── serializers.py    # Course serializers
│   └── urls.py           # Course routes
├── quizzes/              # Quiz & assessment system
│   ├── models.py         # Quiz, Question, Answer models
│   ├── views.py          # Quiz endpoints & submissions
│   ├── serializers.py    # Quiz serializers
│   └── urls.py           # Quiz routes
├── progress/             # Student progress tracking
│   ├── models.py         # Enrollment, Progress models
│   ├── views.py          # Progress tracking endpoints
│   ├── serializers.py    # Progress serializers
│   └── urls.py           # Progress routes
├── requirements.txt      # Python dependencies
└── manage.py             # Django CLI
```

## Setup Instructions

### Prerequisites
- Python 3.10+
- PostgreSQL 12+
- Virtual environment (venv or Poetry)

### Installation

1. **Clone and setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Configure environment variables:**
Create `.env` file in the backend directory:
```
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/lion_school
ALLOWED_HOSTS=localhost,127.0.0.1,yourdomain.com
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

3. **Database setup:**
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

4. **Run development server:**
```bash
python manage.py runserver
```

Server will be available at `http://localhost:8000`

## API Endpoints

### Authentication (`/api/accounts/`)
- `POST /register/` - Register new user
- `POST /login/` - Login user
- `POST /logout/` - Logout user
- `GET /profile/` - Get current user profile
- `PUT /profile/` - Update user profile
- `POST /change-password/` - Change password

### Courses (`/api/courses/`)
- `GET /` - List all courses
- `POST /` - Create course (lecturer only)
- `GET /<id>/` - Get course details
- `PUT /<id>/` - Update course (lecturer only)
- `DELETE /<id>/` - Delete course (lecturer only)
- `POST /<id>/enroll/` - Enroll student in course
- `POST /<id>/modules/` - Add module to course (lecturer only)

### Quiz (`/api/quizzes/`)
- `GET /` - List all quizzes
- `POST /` - Create quiz (lecturer only)
- `GET /<id>/` - Get quiz details
- `POST /<id>/submit/` - Submit quiz answers
- `GET /<id>/results/` - Get quiz results

### Progress (`/api/progress/`)
- `GET /enrollments/` - Get student enrollments
- `GET /enrollment/<id>/progress/` - Get enrollment progress
- `POST /lesson/<id>/complete/` - Mark lesson as complete
- `GET /statistics/` - Get student statistics

## Database Schema

### Users (Custom User Model)
- `id`, `email`, `username`, `password_hash`
- `first_name`, `last_name`, `avatar_url`
- `role` (student/lecturer), `is_active`, `created_at`, `updated_at`

### Courses
- `id`, `title`, `description`, `category`
- `instructor_id` (FK to User), `thumbnail_url`
- `price`, `rating`, `total_ratings`
- `created_at`, `updated_at`, `published`

### Modules
- `id`, `course_id` (FK), `title`, `order`
- `created_at`, `updated_at`

### Lessons
- `id`, `module_id` (FK), `title`, `content`
- `video_url`, `duration`, `order`
- `created_at`, `updated_at`

### Quizzes
- `id`, `course_id` (FK), `title`, `description`
- `passing_score`, `time_limit`, `published`
- `created_at`, `updated_at`

### Questions
- `id`, `quiz_id` (FK), `question_text`, `question_type`
- `options` (JSON), `correct_answer`, `order`

### Enrollments
- `id`, `student_id` (FK to User), `course_id` (FK)`
- `progress` (percentage), `status`, `enrolled_at`, `completed_at`

## Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- CORS configuration for frontend
- Password hashing with Django's default (PBKDF2)
- SQL injection protection via ORM
- CSRF protection on state-changing requests
- Rate limiting for auth endpoints

## Technology Stack

- **Framework:** Django 4.2
- **API:** Django REST Framework 3.14
- **Database:** PostgreSQL
- **Authentication:** Django JWT (djangorestframework-simplejwt)
- **Validation:** Django REST Framework serializers
- **CORS:** django-cors-headers
- **Environment:** python-decouple

## Development Notes

- Use Django admin panel at `/admin/` for data management
- All API responses follow REST conventions with proper HTTP status codes
- Pagination: Default 20 items per page, configurable via query params
- Filtering: Most list endpoints support filtering via query parameters
- Ordering: Default ordering specified in ViewSets, customizable

## Deployment

See `DEPLOYMENT.md` for production deployment guide on AWS, Heroku, or DigitalOcean.