"""
Lion School Serializers
DRF serializers for API responses
"""

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    Course, Module, Lesson, Quiz, Question, QuizSubmission, Answer,
    Enrollment, LessonProgress, CourseReview, CustomUser, ModuleQuizQuestion, ModuleProgress
)

User = get_user_model()


# ============================================================================
# USER SERIALIZERS
# ============================================================================

class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer for public views"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 
                  'avatar_url', 'role', 'bio']
        read_only_fields = ['id']


class UserDetailSerializer(serializers.ModelSerializer):
    """Detailed user serializer for profile views"""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name',
                  'avatar_url', 'bio', 'phone_number', 'date_of_birth',
                  'role', 'is_email_verified', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_email_verified']


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    class Meta:
        model = User
        fields = ['email', 'username', 'first_name', 'last_name', 
                  'password', 'password_confirm', 'role']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match"})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


# ============================================================================
# COURSE SERIALIZERS
# ============================================================================

class LessonSerializer(serializers.ModelSerializer):
    """Serializer for lessons"""
    
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'lesson_type', 'order',
                  'video_url', 'video_duration_seconds', 'resource_url',
                  'is_free_preview', 'created_at']
        read_only_fields = ['id', 'created_at']


class ModuleQuizQuestionSerializer(serializers.ModelSerializer):
    """Serializer for module quiz questions (lecturer view)"""

    class Meta:
        model = ModuleQuizQuestion
        fields = ['id', 'question_text', 'order', 'options', 'correct_answer', 'created_at']
        read_only_fields = ['id', 'created_at']


class ModuleQuizQuestionPublicSerializer(serializers.ModelSerializer):
    """Serializer for module quiz questions (student view)"""

    class Meta:
        model = ModuleQuizQuestion
        fields = ['id', 'question_text', 'order', 'options', 'created_at']
        read_only_fields = fields


class ModuleProgressSerializer(serializers.ModelSerializer):
    """Serializer for module progress"""

    module_title = serializers.CharField(source='module.title', read_only=True)

    class Meta:
        model = ModuleProgress
        fields = ['id', 'module', 'module_title', 'is_completed',
                  'attempts', 'last_score', 'completed_at', 'updated_at']
        read_only_fields = fields


class ModuleSerializer(serializers.ModelSerializer):
    """Serializer for modules with nested lessons"""
    
    lessons = LessonSerializer(many=True, read_only=True)
    
    class Meta:
        model = Module
        fields = ['id', 'title', 'description', 'order', 'lessons', 'created_at']
        read_only_fields = ['id', 'created_at']


class CourseListSerializer(serializers.ModelSerializer):
    """Simplified course serializer for list views"""
    
    instructor = UserSerializer(read_only=True)
    modules_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'slug', 'description', 'category',
                  'instructor', 'price', 'rating', 'total_ratings',
                  'thumbnail_url', 'total_students', 'modules_count']
        read_only_fields = fields
    
    def get_modules_count(self, obj):
        return obj.modules.count()


class CourseDetailSerializer(serializers.ModelSerializer):
    """Detailed course serializer with nested data"""
    
    instructor = UserSerializer(read_only=True)
    modules = ModuleSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()
    enrollment_status = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'slug', 'description', 'category',
                  'instructor', 'price', 'rating', 'total_ratings', 'review_count',
                  'thumbnail_url', 'preview_video_url', 'total_students',
                  'estimated_duration_hours', 'is_published', 'modules',
                  'reviews', 'enrollment_status', 'created_at', 'updated_at']
        read_only_fields = fields
    
    def get_reviews(self, obj):
        reviews = obj.reviews.all()[:5]
        return CourseReviewSerializer(reviews, many=True).data
    
    def get_enrollment_status(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            try:
                enrollment = Enrollment.objects.get(student=request.user, course=obj)
                return {
                    'enrolled': True,
                    'status': enrollment.status,
                    'progress_percentage': enrollment.progress_percentage
                }
            except Enrollment.DoesNotExist:
                return {'enrolled': False}
        return None


class CourseCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating courses"""
    
    class Meta:
        model = Course
        fields = ['title', 'slug', 'description', 'category', 'price',
                  'thumbnail_url', 'preview_video_url', 'estimated_duration_hours',
                  'is_published']
        # Title and slug should not be editable once created; they'll be
        # marked read-only dynamically in the initializer.
        read_only_fields = []

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Only lock title/slug on updates.
        if self.instance is not None:
            self.fields['title'].read_only = True
            self.fields['slug'].read_only = True


# ============================================================================
# QUIZ SERIALIZERS
# ============================================================================

class QuestionSerializer(serializers.ModelSerializer):
    """Serializer for quiz questions"""
    
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'order', 'points',
                  'options', 'explanation']
        # Don't expose correct_answer in student views
        read_only_fields = ['id']


class QuestionDetailSerializer(serializers.ModelSerializer):
    """Detailed question serializer (instructor only)"""
    
    class Meta:
        model = Question
        fields = ['id', 'question_text', 'question_type', 'order', 'points',
                  'options', 'correct_answer', 'explanation']
        read_only_fields = ['id']


class QuizSerializer(serializers.ModelSerializer):
    """Basic quiz serializer"""
    
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'passing_score',
                  'time_limit_minutes', 'total_questions', 'is_published']
        read_only_fields = ['id', 'total_questions']


class QuizDetailSerializer(serializers.ModelSerializer):
    """Detailed quiz with questions"""
    
    questions = QuestionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'passing_score',
                  'time_limit_minutes', 'total_questions', 'is_published',
                  'allow_retake', 'show_correct_answers', 'questions']
        read_only_fields = fields


class AnswerSerializer(serializers.ModelSerializer):
    """Serializer for quiz answers"""
    
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    
    class Meta:
        model = Answer
        fields = ['id', 'question', 'question_text', 'answer_text',
                  'is_correct', 'points_awarded']
        read_only_fields = ['id', 'is_correct', 'points_awarded']


class QuizSubmissionSerializer(serializers.ModelSerializer):
    """Serializer for quiz submissions"""
    
    answers = AnswerSerializer(many=True, read_only=True)
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    
    class Meta:
        model = QuizSubmission
        fields = ['id', 'quiz', 'quiz_title', 'status', 'total_score',
                  'max_score', 'percentage', 'passed', 'started_at',
                  'submitted_at', 'time_spent_seconds', 'answers']
        read_only_fields = fields


# ============================================================================
# PROGRESS & ENROLLMENT SERIALIZERS
# ============================================================================

class LessonProgressSerializer(serializers.ModelSerializer):
    """Serializer for lesson progress"""
    
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    
    class Meta:
        model = LessonProgress
        fields = ['id', 'lesson', 'lesson_title', 'is_completed',
                  'progress_percentage', 'started_at', 'completed_at']
        read_only_fields = ['id', 'started_at']


class EnrollmentDetailSerializer(serializers.ModelSerializer):
    """Detailed enrollment serializer"""
    
    course = CourseListSerializer(read_only=True)
    lesson_progress = LessonProgressSerializer(many=True, read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'status', 'progress_percentage',
                  'is_completed', 'enrolled_at', 'completed_at',
                  'last_accessed_at', 'certificate_url', 'lesson_progress']
        read_only_fields = fields


class EnrollmentListSerializer(serializers.ModelSerializer):
    """Simplified enrollment serializer for lists"""
    
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_thumbnail = serializers.CharField(source='course.thumbnail_url', read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'course', 'course_title', 'course_thumbnail',
                  'status', 'progress_percentage', 'enrolled_at']
        read_only_fields = fields


class LecturerEnrollmentSerializer(serializers.ModelSerializer):
    """Enrollment serializer for lecturer student views"""

    student = UserSerializer(read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    course_id = serializers.IntegerField(source='course.id', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'course_id', 'course_title',
                  'status', 'progress_percentage', 'enrolled_at']
        read_only_fields = fields


# ============================================================================
# REVIEW SERIALIZERS
# ============================================================================

class CourseReviewSerializer(serializers.ModelSerializer):
    """Serializer for course reviews"""
    
    reviewer_name = serializers.CharField(source='student.get_full_name', read_only=True)
    reviewer_avatar = serializers.CharField(source='student.avatar_url', read_only=True)
    
    class Meta:
        model = CourseReview
        fields = ['id', 'rating', 'review_text', 'reviewer_name', 'reviewer_avatar',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
