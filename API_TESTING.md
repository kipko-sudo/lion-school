# Lion School - API Testing Guide

Complete guide for testing the Lion School API endpoints using curl, Postman, or REST clients.

## Prerequisites

- Backend running: `http://localhost:8000`
- API base URL: `http://localhost:8000/api`
- Postman or curl installed

## Base Setup

All requests require proper Content-Type header:
```bash
-H "Content-Type: application/json"
-H "Accept: application/json"
```

Authentication header (after login):
```bash
-H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Authentication Endpoints

### 1. Register New User

**Endpoint**: `POST /api/auth/register/`

**Student Registration**:
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "username": "student",
    "first_name": "John",
    "last_name": "Doe",
    "password": "securepass123",
    "password_confirm": "securepass123",
    "role": "student"
  }'
```

**Lecturer Registration**:
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lecturer@example.com",
    "username": "lecturer",
    "first_name": "Jane",
    "last_name": "Smith",
    "password": "securepass123",
    "password_confirm": "securepass123",
    "role": "lecturer"
  }'
```

**Expected Response** (201 Created):
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "student@example.com",
    "username": "student",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student",
    "avatar_url": null,
    "bio": null
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 2. User Login

**Endpoint**: `POST /api/auth/login/`

```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "securepass123"
  }'
```

**Expected Response** (200 OK):
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "student@example.com",
    "username": "student",
    "first_name": "John",
    "last_name": "Doe",
    "role": "student"
  },
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### 3. Get User Profile

**Endpoint**: `GET /api/auth/profile/`

```bash
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Update User Profile

**Endpoint**: `PUT /api/auth/profile/`

```bash
curl -X PUT http://localhost:8000/api/auth/profile/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "bio": "Passionate learner",
    "phone_number": "+1234567890"
  }'
```

## Course Endpoints

### 1. List All Courses

**Endpoint**: `GET /api/courses/`

**Basic List**:
```bash
curl -X GET http://localhost:8000/api/courses/
```

**With Filters**:
```bash
curl -X GET "http://localhost:8000/api/courses/?category=development&is_published=true&page=1"
```

**With Search**:
```bash
curl -X GET "http://localhost:8000/api/courses/?search=web+development"
```

**With Ordering**:
```bash
curl -X GET "http://localhost:8000/api/courses/?ordering=-created_at"
```

**Expected Response** (200 OK):
```json
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Web Development with React",
      "slug": "web-development-with-react",
      "description": "Learn modern web development...",
      "category": "development",
      "instructor": {
        "id": 2,
        "username": "lecturer",
        "first_name": "Jane",
        "last_name": "Smith"
      },
      "price": "49.99",
      "rating": 4.8,
      "total_ratings": 245,
      "thumbnail_url": "https://...",
      "total_students": 1250,
      "modules_count": 10
    }
  ]
}
```

### 2. Get Course Details

**Endpoint**: `GET /api/courses/{id}/`

```bash
curl -X GET http://localhost:8000/api/courses/1/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response includes**: Full course details, modules with lessons, reviews, enrollment status

### 3. Create Course (Lecturer Only)

**Endpoint**: `POST /api/courses/`

```bash
curl -X POST http://localhost:8000/api/courses/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer LECTURER_JWT_TOKEN" \
  -d '{
    "title": "Advanced React Patterns",
    "slug": "advanced-react-patterns",
    "description": "Master advanced React patterns and best practices",
    "category": "development",
    "price": "79.99",
    "thumbnail_url": "https://example.com/course.jpg",
    "estimated_duration_hours": 40
  }'
```

### 4. Update Course (Lecturer Only)

**Endpoint**: `PUT /api/courses/{id}/`

```bash
curl -X PUT http://localhost:8000/api/courses/1/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer LECTURER_JWT_TOKEN" \
  -d '{
    "title": "Advanced React Patterns - Updated",
    "price": "89.99"
  }'
```

### 5. Delete Course (Lecturer Only)

**Endpoint**: `DELETE /api/courses/{id}/`

```bash
curl -X DELETE http://localhost:8000/api/courses/1/ \
  -H "Authorization: Bearer LECTURER_JWT_TOKEN"
```

### 6. Enroll in Course

**Endpoint**: `POST /api/courses/{id}/enroll/`

```bash
curl -X POST http://localhost:8000/api/courses/1/enroll/ \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN"
```

**Response**:
```json
{
  "message": "Enrolled successfully",
  "enrollment": {
    "id": 1,
    "course": 1,
    "course_title": "Web Development with React",
    "status": "enrolled",
    "progress_percentage": 0,
    "enrolled_at": "2024-03-09T10:30:00Z"
  }
}
```

### 7. Get Course Progress

**Endpoint**: `GET /api/courses/{id}/progress/`

```bash
curl -X GET http://localhost:8000/api/courses/1/progress/ \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN"
```

## Module Endpoints

### 1. Get Course Modules

**Endpoint**: `GET /api/courses/{course_id}/modules/`

```bash
curl -X GET http://localhost:8000/api/courses/1/modules/
```

### 2. Create Module (Lecturer Only)

**Endpoint**: `POST /api/courses/{course_id}/modules/`

```bash
curl -X POST http://localhost:8000/api/courses/1/modules/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer LECTURER_JWT_TOKEN" \
  -d '{
    "title": "Chapter 1: Getting Started",
    "description": "Introduction to React",
    "order": 1
  }'
```

## Quiz Endpoints

### 1. List Course Quizzes

**Endpoint**: `GET /api/courses/{course_id}/quizzes/`

```bash
curl -X GET http://localhost:8000/api/courses/1/quizzes/
```

### 2. Get Quiz Details

**Endpoint**: `GET /api/courses/{course_id}/quizzes/{quiz_id}/`

```bash
curl -X GET http://localhost:8000/api/courses/1/quizzes/1/
```

### 3. Create Quiz (Lecturer Only)

**Endpoint**: `POST /api/courses/{course_id}/quizzes/`

```bash
curl -X POST http://localhost:8000/api/courses/1/quizzes/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer LECTURER_JWT_TOKEN" \
  -d '{
    "title": "Chapter 1 Quiz",
    "description": "Test your knowledge",
    "passing_score": 70,
    "time_limit_minutes": 30,
    "is_published": true
  }'
```

### 4. Submit Quiz Answers

**Endpoint**: `POST /api/courses/{course_id}/quizzes/{quiz_id}/submit/`

```bash
curl -X POST http://localhost:8000/api/courses/1/quizzes/1/submit/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN" \
  -d '{
    "answers": [
      {
        "question_id": 1,
        "answer_text": "A"
      },
      {
        "question_id": 2,
        "answer_text": "True"
      },
      {
        "question_id": 3,
        "answer_text": "JavaScript"
      }
    ]
  }'
```

**Response**:
```json
{
  "id": 1,
  "quiz": 1,
  "quiz_title": "Chapter 1 Quiz",
  "status": "submitted",
  "total_score": 2,
  "max_score": 3,
  "percentage": 66.67,
  "passed": false,
  "started_at": "2024-03-09T10:30:00Z",
  "submitted_at": "2024-03-09T10:45:00Z",
  "time_spent_seconds": 900
}
```

## Enrollment Endpoints

### 1. List Student Enrollments

**Endpoint**: `GET /api/enrollments/`

```bash
curl -X GET http://localhost:8000/api/enrollments/ \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN"
```

### 2. Get Enrollment Details

**Endpoint**: `GET /api/enrollments/{id}/`

```bash
curl -X GET http://localhost:8000/api/enrollments/1/ \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN"
```

## Progress Endpoints

### 1. Mark Lesson Complete

**Endpoint**: `POST /api/lessons/{lesson_id}/complete/`

```bash
curl -X POST http://localhost:8000/api/lessons/1/complete/ \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN"
```

## Review Endpoints

### 1. Get Course Reviews

**Endpoint**: `GET /api/courses/{course_id}/reviews/`

```bash
curl -X GET http://localhost:8000/api/courses/1/reviews/
```

### 2. Add Course Review

**Endpoint**: `POST /api/courses/{course_id}/reviews/`

```bash
curl -X POST http://localhost:8000/api/courses/1/reviews/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN" \
  -d '{
    "rating": 5,
    "review_text": "Excellent course! Highly recommended."
  }'
```

## Error Handling

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 400 Bad Request
```json
{
  "field_name": ["Error message"]
}
```

## Testing Tools Setup

### Postman Collection

1. Create new Collection: "Lion School API"
2. Add Environment variable: `base_url` = `http://localhost:8000/api`
3. Add Environment variable: `token` = `{jwt_token_from_login}`
4. Create requests for each endpoint above

### Command Line Tips

Save token to variable:
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"securepass123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo $TOKEN
```

Use in subsequent requests:
```bash
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer $TOKEN"
```

### Python Requests

```python
import requests
import json

BASE_URL = "http://localhost:8000/api"

# Login
response = requests.post(f"{BASE_URL}/auth/login/", json={
    "email": "student@example.com",
    "password": "securepass123"
})

data = response.json()
token = data["token"]

# Get courses
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(f"{BASE_URL}/courses/", headers=headers)
courses = response.json()
print(json.dumps(courses, indent=2))
```

### JavaScript Fetch

```javascript
const BASE_URL = "http://localhost:8000/api";

// Login
const loginResponse = await fetch(`${BASE_URL}/auth/login/`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "student@example.com",
    password: "securepass123"
  })
});

const { token } = await loginResponse.json();

// Get courses
const coursesResponse = await fetch(`${BASE_URL}/courses/`, {
  headers: { Authorization: `Bearer ${token}` }
});

const courses = await coursesResponse.json();
console.log(courses);
```

## Common Test Scenarios

### Scenario 1: Complete Student Journey
1. Register as student
2. Login
3. Browse courses
4. Enroll in course
5. Mark lessons complete
6. Take quiz
7. Leave review
8. View progress

### Scenario 2: Complete Lecturer Journey
1. Register as lecturer
2. Login
3. Create course
4. Add modules and lessons
5. Create quiz with questions
6. Publish course
7. View enrolled students
8. Monitor course analytics

### Scenario 3: Error Cases
1. Login with invalid credentials (401)
2. Access lecturer endpoint as student (403)
3. Request non-existent course (404)
4. Submit invalid data (400)
5. Enroll without authentication (401)

## Performance Testing

List 100 courses with pagination:
```bash
curl -X GET "http://localhost:8000/api/courses/?page=1&page_size=100"
```

Search with complex filters:
```bash
curl -X GET "http://localhost:8000/api/courses/?category=development&search=React&ordering=-rating"
```

## Debugging Tips

Enable Django debug logging:
```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}
```

Enable verbose curl output:
```bash
curl -v http://localhost:8000/api/courses/
```

---

For more information, see the main README.md and backend/README.md
