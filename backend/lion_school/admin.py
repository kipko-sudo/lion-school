from django.contrib import admin
from .models import (
    CustomUser, Course, Module, Lesson, Quiz, Question, QuizSubmission, Answer,
    Enrollment, LessonProgress, CourseReview, ModuleQuizQuestion, ModuleProgress
)


# ============================================================================
# USER ADMINISTRATION
# ============================================================================

@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    """Admin interface for CustomUser"""
    
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'is_email_verified', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Authentication', {'fields': ('username', 'email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'date_of_birth', 'avatar_url')}),
        ('Role & Permissions', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Contact', {'fields': ('phone_number', 'bio')}),
        ('Status', {'fields': ('is_email_verified', 'created_at', 'updated_at')}),
    )


# ============================================================================
# COURSE ADMINISTRATION
# ============================================================================

class ModuleInline(admin.TabularInline):
    """Inline admin for modules within a course"""
    model = Module
    extra = 1
    fields = ['title', 'description', 'order']


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    """Admin interface for Course"""
    
    list_display = ['title', 'instructor', 'category', 'price', 'is_published', 'total_students', 'rating', 'created_at']
    list_filter = ['is_published', 'status', 'category', 'created_at']
    search_fields = ['title', 'slug', 'description', 'instructor__username']
    readonly_fields = ['slug', 'created_at', 'updated_at', 'total_ratings', 'total_students', 'total_lessons']
    inlines = [ModuleInline]
    
    fieldsets = (
        ('Course Information', {'fields': ('title', 'slug', 'description', 'category')}),
        ('Instructor & Access', {'fields': ('instructor', 'is_published', 'status')}),
        ('Media & Content', {'fields': ('thumbnail_url', 'preview_video_url')}),
        ('Pricing & Ratings', {'fields': ('price', 'rating', 'total_ratings', 'review_count')}),
        ('Statistics', {'fields': ('total_students', 'total_lessons', 'estimated_duration_hours')}),
        ('Metadata', {'fields': ('created_at', 'updated_at')}),
    )


class LessonInline(admin.TabularInline):
    """Inline admin for lessons within a module"""
    model = Lesson
    extra = 1
    fields = ['title', 'lesson_type', 'order', 'is_free_preview']


@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    """Admin interface for Module"""
    
    list_display = ['title', 'course', 'order', 'created_at']
    list_filter = ['course', 'created_at']
    search_fields = ['title', 'course__title']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [LessonInline]


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    """Admin interface for Lesson"""
    
    list_display = ['title', 'module', 'lesson_type', 'order', 'is_free_preview', 'created_at']
    list_filter = ['lesson_type', 'is_free_preview', 'module__course', 'created_at']
    search_fields = ['title', 'content', 'module__title']
    readonly_fields = ['created_at', 'updated_at']


# ============================================================================
# QUIZ & ASSESSMENT ADMINISTRATION
# ============================================================================

class QuestionInline(admin.TabularInline):
    """Inline admin for questions within a quiz"""
    model = Question
    extra = 1
    fields = ['question_text', 'question_type', 'order', 'points']


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    """Admin interface for Quiz"""
    
    list_display = ['title', 'course', 'passing_score', 'total_questions', 'is_published', 'created_at']
    list_filter = ['is_published', 'allow_retake', 'course', 'created_at']
    search_fields = ['title', 'description', 'course__title']
    readonly_fields = ['created_at', 'updated_at', 'total_questions']
    inlines = [QuestionInline]


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    """Admin interface for Question"""
    
    list_display = ['question_text', 'quiz', 'question_type', 'order', 'points', 'created_at']
    list_filter = ['question_type', 'quiz__course', 'created_at']
    search_fields = ['question_text', 'quiz__title']
    readonly_fields = ['created_at', 'updated_at']


class AnswerInline(admin.TabularInline):
    """Inline admin for answers within a quiz submission"""
    model = Answer
    extra = 0
    readonly_fields = ['question', 'answer_text', 'is_correct', 'points_awarded', 'answered_at']
    can_delete = False


@admin.register(QuizSubmission)
class QuizSubmissionAdmin(admin.ModelAdmin):
    """Admin interface for QuizSubmission"""
    
    list_display = ['student', 'quiz', 'status', 'percentage', 'passed', 'submitted_at']
    list_filter = ['status', 'passed', 'quiz__course', 'submitted_at']
    search_fields = ['student__username', 'quiz__title']
    readonly_fields = ['started_at', 'submitted_at', 'graded_at']
    inlines = [AnswerInline]


@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    """Admin interface for Answer"""
    
    list_display = ['submission', 'question', 'is_correct', 'points_awarded']
    list_filter = ['is_correct', 'submission__quiz__course']
    search_fields = ['submission__student__username', 'question__question_text']
    readonly_fields = ['answered_at']


# ============================================================================
# ENROLLMENT & PROGRESS ADMINISTRATION
# ============================================================================

class LessonProgressInline(admin.TabularInline):
    """Inline admin for lesson progress"""
    model = LessonProgress
    extra = 0
    readonly_fields = ['lesson', 'progress_percentage', 'is_completed', 'started_at', 'completed_at']
    can_delete = False


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    """Admin interface for Enrollment"""
    
    list_display = ['student', 'course', 'status', 'progress_percentage', 'is_completed', 'enrolled_at']
    list_filter = ['status', 'is_completed', 'course', 'enrolled_at']
    search_fields = ['student__username', 'course__title']
    readonly_fields = ['enrolled_at', 'completed_at']


@admin.register(LessonProgress)
class LessonProgressAdmin(admin.ModelAdmin):
    """Admin interface for LessonProgress"""
    
    list_display = ['student', 'lesson', 'progress_percentage', 'is_completed', 'started_at']
    list_filter = ['is_completed', 'lesson__module__course', 'started_at']
    search_fields = ['student__username', 'lesson__title']


@admin.register(ModuleQuizQuestion)
class ModuleQuizQuestionAdmin(admin.ModelAdmin):
    """Admin interface for module quiz questions"""

    list_display = ['module', 'order', 'question_text', 'created_at']
    list_filter = ['module__course', 'module']
    search_fields = ['question_text', 'module__title']


@admin.register(ModuleProgress)
class ModuleProgressAdmin(admin.ModelAdmin):
    """Admin interface for module progress"""

    list_display = ['student', 'module', 'is_completed', 'attempts', 'last_score', 'updated_at']
    list_filter = ['is_completed', 'module__course']
    search_fields = ['student__username', 'module__title']
    readonly_fields = ['completed_at']


@admin.register(CourseReview)
class CourseReviewAdmin(admin.ModelAdmin):
    """Admin interface for CourseReview"""
    
    list_display = ['student', 'course', 'rating', 'review_text', 'created_at']
    list_filter = ['rating', 'course', 'created_at']
    search_fields = ['student__username', 'course__title', 'review_text']
    readonly_fields = ['created_at', 'updated_at']
