"""
Lion School Core Models
Comprehensive database schema for e-learning platform
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


# ============================================================================
# AUTHENTICATION & ACCOUNTS
# ============================================================================

class CustomUser(AbstractUser):
    """Extended user model with role-based access"""
    
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('lecturer', 'Lecturer'),
        ('admin', 'Administrator'),
    ]
    
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    avatar_url = models.URLField(blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(blank=True, null=True)
    is_email_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.get_role_display()})"


# ============================================================================
# COURSE MANAGEMENT
# ============================================================================

class Course(models.Model):
    """Course model representing a complete course"""
    
    CATEGORY_CHOICES = [
        ('development', 'Development'),
        ('design', 'Design'),
        ('business', 'Business'),
        ('science', 'Data Science'),
        ('marketing', 'Marketing'),
        ('finance', 'Finance'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived'),
    ]
    
    # Basic info
    title = models.CharField(max_length=200, db_index=True)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    
    # Instructor & access
    instructor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='courses_taught')
    is_published = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Media & content
    thumbnail_url = models.URLField(blank=True)
    preview_video_url = models.URLField(blank=True, null=True)
    
    # Pricing & ratings
    price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    rating = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    total_ratings = models.IntegerField(default=0)
    review_count = models.IntegerField(default=0)
    
    # Statistics
    total_students = models.IntegerField(default=0)
    total_lessons = models.IntegerField(default=0)
    estimated_duration_hours = models.FloatField(default=0)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['instructor', 'is_published']),
            models.Index(fields=['category']),
            models.Index(fields=['slug']),
        ]
    
    def __str__(self):
        return self.title


class Module(models.Model):
    """Module within a course (e.g., "Chapter 1")"""
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='modules')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['course', 'order']
        unique_together = ['course', 'order']
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Lesson(models.Model):
    """Individual lesson within a module"""
    
    LESSON_TYPE_CHOICES = [
        ('video', 'Video'),
        ('text', 'Text Content'),
        ('exercise', 'Exercise'),
        ('resource', 'Resource'),
    ]
    
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    content = models.TextField()
    lesson_type = models.CharField(max_length=20, choices=LESSON_TYPE_CHOICES, default='video')
    order = models.PositiveIntegerField(default=0, db_index=True)
    
    # Media
    video_url = models.URLField(blank=True, null=True)
    video_duration_seconds = models.IntegerField(blank=True, null=True)
    resource_url = models.URLField(blank=True, null=True)
    
    # Engagement
    is_free_preview = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['module', 'order']
        unique_together = ['module', 'order']
    
    def __str__(self):
        return f"{self.module.title} - {self.title}"


# ============================================================================
# MODULE QUIZZES & PROGRESS
# ============================================================================

class ModuleQuizQuestion(models.Model):
    """Quiz question tied to a module"""

    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='quiz_questions')
    question_text = models.TextField()
    order = models.PositiveIntegerField(default=0)
    options = models.JSONField(default=dict, blank=True)
    correct_answer = models.CharField(max_length=500)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['module', 'order']
        unique_together = ['module', 'order']

    def __str__(self):
        return f"{self.module.title} Q{self.order}"


class ModuleProgress(models.Model):
    """Track student completion per module"""

    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='module_progress')
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name='student_progress')
    is_completed = models.BooleanField(default=False)
    attempts = models.PositiveIntegerField(default=0)
    last_score = models.FloatField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['student', 'module']
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.student.get_full_name()} - {self.module.title}"


# ============================================================================
# QUIZZES & ASSESSMENTS
# ============================================================================

class Quiz(models.Model):
    """Quiz/Assessment for a course"""
    
    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer'),
        ('essay', 'Essay'),
    ]
    
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    passing_score = models.FloatField(default=70.0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    time_limit_minutes = models.IntegerField(null=True, blank=True)
    total_questions = models.IntegerField(default=0)
    is_published = models.BooleanField(default=False)
    allow_retake = models.BooleanField(default=True)
    show_correct_answers = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"


class Question(models.Model):
    """Individual quiz question"""
    
    QUESTION_TYPE_CHOICES = [
        ('multiple_choice', 'Multiple Choice'),
        ('true_false', 'True/False'),
        ('short_answer', 'Short Answer'),
        ('essay', 'Essay'),
    ]
    
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPE_CHOICES, default='multiple_choice')
    order = models.PositiveIntegerField(default=0)
    points = models.FloatField(default=1.0, validators=[MinValueValidator(0)])
    
    # JSON field for multiple choice options: {"A": "Option A", "B": "Option B"}
    options = models.JSONField(default=dict, blank=True)
    
    # Correct answer - can be "A", "B", etc. for MC or "true"/"false" for T/F
    correct_answer = models.CharField(max_length=500)
    
    explanation = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['quiz', 'order']
    
    def __str__(self):
        return f"Q{self.order}: {self.question_text[:50]}"


class QuizSubmission(models.Model):
    """Student's quiz submission"""
    
    STATUS_CHOICES = [
        ('in_progress', 'In Progress'),
        ('submitted', 'Submitted'),
        ('graded', 'Graded'),
    ]
    
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='quiz_submissions')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='submissions')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='in_progress')
    
    # Scores
    total_score = models.FloatField(null=True, blank=True)
    max_score = models.FloatField(null=True, blank=True)
    percentage = models.FloatField(null=True, blank=True)
    passed = models.BooleanField(null=True, blank=True)
    
    # Tracking
    started_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    graded_at = models.DateTimeField(null=True, blank=True)
    
    # Time tracking
    time_spent_seconds = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ['student', 'quiz']
        ordering = ['-submitted_at']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.quiz.title}"


class Answer(models.Model):
    """Student's answer to a quiz question"""
    
    submission = models.ForeignKey(QuizSubmission, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    
    # Student's answer
    answer_text = models.TextField()
    
    # Grading
    is_correct = models.BooleanField(null=True, blank=True)
    points_awarded = models.FloatField(null=True, blank=True)
    
    # Metadata
    answered_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['submission', 'question']
    
    def __str__(self):
        return f"Answer to Q{self.question.order} by {self.submission.student}"


# ============================================================================
# ENROLLMENT & PROGRESS TRACKING
# ============================================================================

class Enrollment(models.Model):
    """Student enrollment in a course"""
    
    STATUS_CHOICES = [
        ('enrolled', 'Enrolled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('dropped', 'Dropped'),
    ]
    
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='enrolled')
    
    # Progress
    progress_percentage = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    is_completed = models.BooleanField(default=False)
    
    # Timestamps
    enrolled_at = models.DateTimeField(auto_now_add=True)
    last_accessed_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Optional: certificate URL once completed
    certificate_url = models.URLField(blank=True, null=True)
    
    class Meta:
        unique_together = ['student', 'course']
        ordering = ['-enrolled_at']
        indexes = [
            models.Index(fields=['student', 'status']),
            models.Index(fields=['course', 'status']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.course.title}"


class LessonProgress(models.Model):
    """Track student progress on individual lessons"""
    
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='lesson_progress')
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='student_progress')
    
    # Status
    is_completed = models.BooleanField(default=False)
    
    # Watch/read progress (percentage for videos/content)
    progress_percentage = models.FloatField(default=0, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Timestamps
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'lesson']
        indexes = [
            models.Index(fields=['student', 'is_completed']),
        ]
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.lesson.title}"


class CourseReview(models.Model):
    """Student reviews for courses"""
    
    student = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='course_reviews')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='reviews')
    
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    review_text = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['student', 'course']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student.get_full_name()} - {self.course.title} ({self.rating}★)"
