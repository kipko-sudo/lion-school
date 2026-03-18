"""
Lion School URL Configuration
API endpoints routing
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from . import views

# Create router for ViewSets
router = DefaultRouter()
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'enrollments', views.EnrollmentViewSet, basename='enrollment')

# Nested routers
courses_router = DefaultRouter()
courses_router.register(r'modules', views.ModuleViewSet, basename='module')

quizzes_router = DefaultRouter()
quizzes_router.register(r'quizzes', views.QuizViewSet, basename='quiz')

app_name = 'api'

urlpatterns = [
    # Authentication endpoints
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/login/', views.LoginView.as_view(), name='login'),
    path('auth/profile/', views.ProfileView.as_view(), name='profile'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('auth/token/verify/', TokenVerifyView.as_view(), name='token-verify'),
    
    # Main routers
    path('', include(router.urls)),
    
    # Nested course routes
    path('courses/<int:course_pk>/', include(courses_router.urls)),
    path('courses/<int:course_pk>/', include(quizzes_router.urls)),
    
    # Quiz questions
    path('quizzes/<int:quiz_pk>/questions/', views.QuestionViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name='question-list'),
    path('quizzes/<int:quiz_pk>/questions/<int:pk>/', views.QuestionViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'patch': 'partial_update',
        'delete': 'destroy'
    }), name='question-detail'),
    
    # Quiz submission
    path('courses/<int:course_pk>/quizzes/<int:quiz_pk>/submit/', 
         views.QuizSubmissionView.as_view(), name='quiz-submit'),
    
    # Lesson progress
    path('lessons/<int:lesson_id>/complete/', 
         views.LessonProgressView.as_view(), name='lesson-complete'),

    # Module quiz & completion
    path('modules/<int:module_id>/quiz/', views.ModuleQuizView.as_view(), name='module-quiz'),
    path('modules/<int:module_id>/complete/', views.ModuleCompleteView.as_view(), name='module-complete'),

    # Lecturer students overview
    path('lecturer/students/', views.LecturerStudentsView.as_view(), name='lecturer-students'),
    
    # Course reviews
    path('courses/<int:course_pk>/reviews/',
         views.CourseReviewViewSet.as_view({
             'get': 'list',
             'post': 'create'
         }), name='course-reviews'),
    path('courses/<int:course_pk>/reviews/<int:pk>/',
         views.CourseReviewViewSet.as_view({
             'get': 'retrieve',
             'put': 'update',
             'delete': 'destroy'
         }), name='course-review-detail'),
]
