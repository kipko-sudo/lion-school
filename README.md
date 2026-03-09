# Lion School - Comprehensive E-Learning Platform

A full-stack e-learning platform built with **Next.js 16** (Frontend), **Django 4.2** (Backend), **PostgreSQL** (Database), and **Axios** (API Communication). The platform serves two distinct user types: **Students** who consume content and take assessments, and **Lecturers** who create and manage courses.

## 📋 Platform Overview

**Lion School** is designed to provide a seamless learning experience with:
- 🎓 **Student Dashboard**: Browse, enroll, and track course progress
- 👨‍🏫 **Lecturer Dashboard**: Create, manage courses, and view student analytics
- 📚 **Content Management**: Modular course structure with lessons and quizzes
- ✅ **Assessment System**: Quiz creation and automated grading
- 📊 **Progress Tracking**: Real-time student progress monitoring
- ⭐ **Course Reviews**: Student feedback and ratings system
- 🔐 **Role-Based Access Control**: Distinct permissions for students and lecturers

## 🏗️ Architecture

### Frontend Stack (Next.js)
- **Framework**: Next.js 16.1.6 with App Router
- **Styling**: Tailwind CSS 4.2 + shadcn/ui components
- **Typography**: Poppins font family
- **HTTP Client**: Axios with interceptors for authentication
- **State Management**: React Context API + Custom hooks
- **UI Components**: Pre-built shadcn/ui component library

### Backend Stack (Django)
- **Framework**: Django 4.2
- **API**: Django REST Framework 3.14
- **Database**: PostgreSQL 12+
- **Authentication**: JWT with djangorestframework-simplejwt
- **Permission System**: Custom role-based access control
- **CORS**: django-cors-headers for frontend communication

### Database
- **Engine**: PostgreSQL
- **ORM**: Django ORM with full data validation
- **Relationships**: Properly indexed foreign keys for performance
- **Models**: User, Course, Module, Lesson, Quiz, Question, Enrollment, Progress

## 🚀 Quick Start

### Frontend Setup

```bash
# Install dependencies
npm install
# or
pnpm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local

# Run development server
npm run dev
# Frontend available at http://localhost:3000
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cat > .env << EOF
DEBUG=True
SECRET_KEY=your-super-secret-key-change-in-production
DATABASE_URL=postgresql://postgres:password@localhost:5432/lion_school
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
EOF

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic --noinput

# Run development server
python manage.py runserver
# Backend API available at http://localhost:8000/api
```

## 📁 Project Structure

```
lion-school/
├── app/
│   ├── layout.tsx              # Root layout with Poppins font
│   ├── globals.css             # Design system tokens & colors
│   ├── page.tsx                # Landing page
│   ├── login/                  # Student/Lecturer login
│   ├── register/               # Registration pages
│   ├── dashboard/              # Student dashboard
│   ├── lecturer/               # Lecturer dashboard
│   └── courses/                # Course pages
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── navigation.tsx          # Navigation components
│   ├── course-card.tsx         # Course display component
│   └── ...                     # Other reusable components
├── lib/
│   ├── api-client.ts          # Axios HTTP client with interceptors
│   ├── auth-context.tsx        # Authentication state management
│   └── utils.ts                # Utility functions
├── public/                     # Static assets
├── backend/
│   ├── models.py               # Django models (User, Course, Quiz, etc.)
│   ├── views.py                # Django REST Framework views
│   ├── serializers.py          # DRF serializers
│   ├── urls.py                 # API routing
│   ├── settings_template.py   # Django configuration template
│   ├── requirements.txt        # Python dependencies
│   └── README.md               # Backend documentation
├── .env.local                  # Frontend environment variables
├── .env                        # Backend environment variables (git ignored)
├── next.config.mjs             # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── README.md                   # This file
```

## 🎨 Design System

The platform uses a carefully crafted color palette inspired by the EduLe design:

```
Primary Color:    #2a9d5b (Fresh Green)
Accent Color:     #f4a460 (Warm Orange)
Background:       #f5faf8 (Mint Cream)
Foreground:       #1a1a1a (Dark Grey)
Border:           #e0e0e0 (Light Grey)
```

Typography: **Poppins** font family for consistent, modern appearance
Components: shadcn/ui with Tailwind CSS for responsive, accessible UI

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `GET /api/auth/profile/` - Get current user profile
- `PUT /api/auth/profile/` - Update profile

### Courses
- `GET /api/courses/` - List all courses (with filters)
- `POST /api/courses/` - Create course (lecturer only)
- `GET /api/courses/{id}/` - Get course details
- `PUT /api/courses/{id}/` - Update course (lecturer only)
- `POST /api/courses/{id}/enroll/` - Enroll student
- `GET /api/courses/{id}/progress/` - Get student progress
- `GET /api/courses/{id}/modules/` - Get course modules

### Quizzes
- `GET /api/courses/{id}/quizzes/` - List quizzes for course
- `POST /api/courses/{id}/quizzes/{quiz_id}/submit/` - Submit quiz answers
- `GET /api/quizzes/{id}/questions/` - Get quiz questions
- `POST /api/quizzes/{id}/questions/` - Create question (lecturer only)

### Progress
- `GET /api/enrollments/` - Get student enrollments
- `GET /api/enrollments/{id}/` - Get enrollment details
- `POST /api/lessons/{id}/complete/` - Mark lesson as complete

### Reviews
- `GET /api/courses/{id}/reviews/` - Get course reviews
- `POST /api/courses/{id}/reviews/` - Add review (authenticated users)
- `PUT /api/courses/{id}/reviews/{review_id}/` - Update review

## 🔐 Authentication Flow

1. **Registration**: User fills form, selects role (student/lecturer)
2. **Login**: Email + Password verification
3. **Token Storage**: JWT token stored in HTTP-only cookie via js-cookie
4. **Request Interceptor**: Axios automatically adds token to requests
5. **Response Interceptor**: Handles 401 errors, redirects to login if needed

## 📚 Database Models

### User (CustomUser)
- Extended Django user with role-based access
- Fields: email, username, role (student/lecturer/admin), avatar_url, bio

### Course
- Complete course information with pricing and ratings
- Fields: title, description, category, instructor (FK), price, rating

### Module
- Organizational unit within a course
- Fields: course (FK), title, order

### Lesson
- Individual learning content (video, text, etc.)
- Fields: module (FK), title, content, video_url, is_free_preview

### Quiz
- Assessments for courses
- Fields: course (FK), title, passing_score, time_limit_minutes

### Question
- Individual quiz questions
- Fields: quiz (FK), question_text, question_type, options (JSON), correct_answer

### Enrollment
- Student course enrollment tracking
- Fields: student (FK), course (FK), progress_percentage, status

### LessonProgress
- Track individual lesson completion
- Fields: student (FK), lesson (FK), is_completed, progress_percentage

## 🛠️ Configuration

### Environment Variables (Frontend - .env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Environment Variables (Backend - .env)
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:password@localhost:5432/lion_school
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

## 📦 Dependencies

### Frontend (Key)
- next@16.1.6
- react@19.2.4
- axios@1.6.2
- tailwindcss@4.2.0
- shadcn/ui components
- js-cookie@3.0.5

### Backend (Key)
- Django==4.2.11
- djangorestframework==3.14.0
- psycopg2-binary==2.9.9
- djangorestframework-simplejwt==5.3.2
- django-cors-headers==4.3.1

## 🚢 Deployment

### Frontend (Vercel)
1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Backend (Options)
- **AWS**: EC2 + RDS for PostgreSQL
- **Heroku**: Procfile included, attach PostgreSQL add-on
- **DigitalOcean**: App Platform + Managed Database
- **Railway**: One-click Django + PostgreSQL deployment

See `/backend/DEPLOYMENT.md` for detailed instructions.

## 📖 API Documentation

Interactive API documentation available at:
- **Swagger UI**: `/api/schema/swagger/`
- **ReDoc**: `/api/schema/redoc/`
- **Django Admin**: `/admin/` (superuser only)

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/amazing-feature`
2. Commit changes: `git commit -m 'Add amazing feature'`
3. Push to branch: `git push origin feature/amazing-feature`
4. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 📞 Support

- **Documentation**: See `/backend/README.md` for backend details
- **Issues**: Create GitHub issue for bug reports
- **Feature Requests**: Discuss in GitHub discussions
- **Email**: support@lionschool.com

## 🎯 Roadmap

- [ ] Payment integration (Stripe/PayPal)
- [ ] Live class feature (video conferencing)
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] AI-powered course recommendations
- [ ] Certificate generation
- [ ] Discussion forums
- [ ] Course collaboration features

## 🙌 Credits

Built with:
- Next.js and Django communities
- shadcn/ui component library
- Tailwind CSS framework
- Inspired by EduLe design system

---

**Happy Learning! 🎓**
