"""
Lion School API Views
DRF ViewSets and Views for API endpoints
"""

import django
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model, authenticate
from django.shortcuts import get_object_or_404
from django.db.models import Max
from rest_framework_simplejwt.tokens import RefreshToken
from .models import (
    Course, Module, Lesson, Quiz, Question, QuizSubmission, Answer,
    Enrollment, LessonProgress, CourseReview, ModuleQuizQuestion, ModuleProgress
)
from .serializers import (
    ModuleSerializer, UserDetailSerializer, UserRegistrationSerializer,
    CourseListSerializer, CourseDetailSerializer, CourseCreateUpdateSerializer,
    QuizSerializer, QuizDetailSerializer, QuestionSerializer, QuestionDetailSerializer,
    QuizSubmissionSerializer, EnrollmentListSerializer, EnrollmentDetailSerializer, LessonProgressSerializer,
    CourseReviewSerializer, LecturerEnrollmentSerializer,
    ModuleQuizQuestionSerializer, ModuleQuizQuestionPublicSerializer
)

User = get_user_model()


# ============================================================================
# PERMISSION CLASSES
# ============================================================================

class IsLecturerOrReadOnly(permissions.BasePermission):
    """Allow lecturers to create/edit, others can read"""
    
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'lecturer'


class IsLecturerOrOwner(permissions.BasePermission):
    """Allow lecturers to manage their own courses"""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.instructor == request.user


# ============================================================================
# AUTHENTICATION VIEWS
# ============================================================================

class RegisterView(APIView):
    """User registration endpoint"""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'message': 'User registered successfully',
                'user': UserDetailSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """User login endpoint"""
    
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response(
                {'error': 'Email and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = authenticate(username=email, password=password)
        if user is None:
            # Try with username as fallback
            try:
                user = User.objects.get(email=email)
                if user.check_password(password):
                    user = authenticate(username=user.username, password=password)
            except User.DoesNotExist:
                pass
        
        if user is not None:
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            return Response({
                'message': 'Login successful',
                'user': UserDetailSerializer(user).data,
                'token': access_token,
                'access': access_token,
                'refresh': str(refresh),
            }, status=status.HTTP_200_OK)
        
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class ProfileView(APIView):
    """Get/update current user profile"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserDetailSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# ============================================================================
# COURSE VIEWS
# ============================================================================

class CourseViewSet(viewsets.ModelViewSet):
    """Course management ViewSet"""
    
    permission_classes = [IsLecturerOrReadOnly]
    filterset_fields = ['category', 'is_published']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'rating', 'total_students']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return CourseCreateUpdateSerializer
        return CourseListSerializer
    
    def get_queryset(self):
        queryset = Course.objects.select_related('instructor').prefetch_related('modules')
        
        if self.request.user.is_authenticated and self.request.user.role == 'lecturer':
            return queryset
        return queryset.filter(is_published=True)
    
    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        """Enroll student in course"""
        course = self.get_object()
        
        if request.user.role != 'student':
            return Response(
                {'error': 'Only students can enroll in courses'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        enrollment, created = Enrollment.objects.get_or_create(
            student=request.user,
            course=course,
            defaults={'status': 'enrolled'}
        )
        
        if not created:
            return Response(
                {'message': 'Already enrolled in this course'},
                status=status.HTTP_200_OK
            )
        
        return Response(
            {'message': 'Enrolled successfully', 'enrollment': EnrollmentListSerializer(enrollment).data},
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def progress(self, request, pk=None):
        """Get student's progress in course"""
        course = self.get_object()
        
        try:
            enrollment = Enrollment.objects.get(student=request.user, course=course)
            serializer = EnrollmentDetailSerializer(enrollment)
            return Response(serializer.data)
        except Enrollment.DoesNotExist:
            return Response(
                {'error': 'Not enrolled in this course'},
                status=status.HTTP_404_NOT_FOUND
            )


class ModuleViewSet(viewsets.ModelViewSet):
    """Module management ViewSet"""
    
    permission_classes = [IsLecturerOrReadOnly]
    serializer_class = ModuleSerializer
    
    def get_queryset(self):
        course_id = self.kwargs.get('course_pk')
        return Module.objects.filter(course_id=course_id).prefetch_related('lessons')
    
    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_pk')
        course = get_object_or_404(Course, id=course_id)
        order = serializer.validated_data.get('order')
        if not order or order <= 0:
            max_order = (
                Module.objects.filter(course=course)
                .aggregate(max_order=Max('order'))
                .get('max_order')
            )
            order = (max_order or 0) + 1
        serializer.save(course=course, order=order)


# ============================================================================
# MODULE QUIZ VIEWS
# ============================================================================

class ModuleQuizView(APIView):
    """List or create module quiz questions"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, module_id):
        module = get_object_or_404(Module, id=module_id)
        questions = ModuleQuizQuestion.objects.filter(module=module).order_by('order')
        if request.user.is_authenticated and request.user.role == 'lecturer':
            serializer = ModuleQuizQuestionSerializer(questions, many=True)
        else:
            serializer = ModuleQuizQuestionPublicSerializer(questions, many=True)
        return Response(serializer.data)

    def post(self, request, module_id):
        if request.user.role != 'lecturer':
            return Response(
                {'error': 'Only lecturers can create module quiz questions.'},
                status=status.HTTP_403_FORBIDDEN
            )
        module = get_object_or_404(Module, id=module_id)
        serializer = ModuleQuizQuestionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(module=module)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ModuleCompleteView(APIView):
    """Submit module quiz and mark completion"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, module_id):
        if request.user.role != 'student':
            return Response(
                {'error': 'Only students can complete modules.'},
                status=status.HTTP_403_FORBIDDEN
            )

        module = get_object_or_404(Module, id=module_id)
        questions = list(ModuleQuizQuestion.objects.filter(module=module).order_by('order'))
        if not questions:
            return Response(
                {'error': 'No quiz questions configured for this module.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        answers = request.data.get('answers', [])
        answer_map = {int(a.get('question_id')): str(a.get('answer_text', '')).strip()
                      for a in answers if a.get('question_id')}

        total = len(questions)
        correct = 0
        for question in questions:
            expected = str(question.correct_answer).strip().lower()
            provided = str(answer_map.get(question.id, '')).strip().lower()
            if expected == provided:
                correct += 1

        percentage = (correct / total) * 100 if total else 0
        passed = percentage >= 70

        progress, _ = ModuleProgress.objects.get_or_create(
            student=request.user,
            module=module
        )
        progress.attempts += 1
        progress.last_score = percentage
        if passed:
            progress.is_completed = True
            progress.completed_at = progress.completed_at or django.utils.timezone.now()
        progress.save()

        # Update enrollment progress for this course
        course = module.course
        enrollment = Enrollment.objects.filter(student=request.user, course=course).first()
        total_modules = Module.objects.filter(course=course).count()
        completed_modules = ModuleProgress.objects.filter(
            student=request.user,
            module__course=course,
            is_completed=True
        ).count()
        course_progress = (completed_modules / total_modules) * 100 if total_modules else 0
        if enrollment:
            enrollment.progress_percentage = course_progress
            if course_progress >= 100:
                enrollment.status = 'completed'
                enrollment.is_completed = True
                enrollment.completed_at = enrollment.completed_at or django.utils.timezone.now()
            enrollment.save()

        return Response({
            'passed': passed,
            'score': percentage,
            'correct': correct,
            'total': total,
            'attempts': progress.attempts,
            'module_completed': progress.is_completed,
            'course_progress_percentage': course_progress,
        })

# ============================================================================
# QUIZ VIEWS
# ============================================================================

class QuizViewSet(viewsets.ModelViewSet):
    """Quiz management ViewSet"""
    
    permission_classes = [IsLecturerOrReadOnly]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return QuizDetailSerializer
        return QuizSerializer
    
    def get_queryset(self):
        course_id = self.kwargs.get('course_pk')
        return Quiz.objects.filter(course_id=course_id)


class QuestionViewSet(viewsets.ModelViewSet):
    """Question management ViewSet"""
    
    permission_classes = [IsLecturerOrReadOnly]
    
    def get_serializer_class(self):
        if self.request.user.is_authenticated and self.request.user.role == 'lecturer':
            return QuestionDetailSerializer
        return QuestionSerializer
    
    def get_queryset(self):
        quiz_id = self.kwargs.get('quiz_pk')
        return Question.objects.filter(quiz_id=quiz_id).order_by('order')


class QuizSubmissionView(APIView):
    """Submit quiz answers"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, course_pk, quiz_pk):
        quiz = get_object_or_404(Quiz, id=quiz_pk, course_id=course_pk)
        
        if request.user.role != 'student':
            return Response(
                {'error': 'Only students can submit quizzes'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create submission
        submission, created = QuizSubmission.objects.get_or_create(
            student=request.user,
            quiz=quiz,
            defaults={'status': 'in_progress'}
        )
        
        # Process answers
        answers_data = request.data.get('answers', [])
        total_score = 0
        max_score = 0
        
        for answer_data in answers_data:
            question_id = answer_data.get('question_id')
            answer_text = answer_data.get('answer_text')
            
            question = get_object_or_404(Question, id=question_id, quiz=quiz)
            
            # Check if answer is correct
            is_correct = answer_text.lower() == question.correct_answer.lower()
            points = question.points if is_correct else 0
            
            Answer.objects.update_or_create(
                submission=submission,
                question=question,
                defaults={
                    'answer_text': answer_text,
                    'is_correct': is_correct,
                    'points_awarded': points
                }
            )
            
            total_score += points
            max_score += question.points
        
        # Update submission
        percentage = (total_score / max_score * 100) if max_score > 0 else 0
        passed = percentage >= quiz.passing_score
        
        submission.status = 'submitted'
        submission.total_score = total_score
        submission.max_score = max_score
        submission.percentage = percentage
        submission.passed = passed
        submission.submitted_at = submission.submitted_at or django.utils.timezone.now()
        submission.save()
        
        serializer = QuizSubmissionSerializer(submission)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


# ============================================================================
# PROGRESS VIEWS
# ============================================================================

class EnrollmentViewSet(viewsets.ReadOnlyModelViewSet):
    """Student enrollments"""
    
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['status', 'course__category']
    ordering_fields = ['enrolled_at', 'progress_percentage']
    ordering = ['-enrolled_at']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return EnrollmentDetailSerializer
        return EnrollmentListSerializer
    
    def get_queryset(self):
        return Enrollment.objects.filter(student=self.request.user).select_related('course')


class LecturerStudentsView(APIView):
    """Students enrolled in lecturer's courses"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'lecturer':
            return Response(
                {'error': 'Only lecturers can view enrolled students.'},
                status=status.HTTP_403_FORBIDDEN
            )
        enrollments = (
            Enrollment.objects
            .filter(course__instructor=request.user)
            .select_related('student', 'course')
            .order_by('-enrolled_at')
        )
        serializer = LecturerEnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)


class LessonProgressView(APIView):
    """Mark lesson as complete and update progress"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, lesson_id):
        lesson = get_object_or_404(Lesson, id=lesson_id)
        
        progress, created = LessonProgress.objects.get_or_create(
            student=request.user,
            lesson=lesson,
            defaults={'is_completed': True, 'progress_percentage': 100}
        )
        
        if not created:
            progress.is_completed = True
            progress.progress_percentage = 100
            progress.save()
        
        # Update enrollment progress
        enrollment = get_object_or_404(
            Enrollment,
            student=request.user,
            course=lesson.module.course
        )
        
        # Calculate total progress
        total_lessons = lesson.module.course.modules.values('lessons').count()
        completed_lessons = LessonProgress.objects.filter(
            student=request.user,
            lesson__module__course=lesson.module.course,
            is_completed=True
        ).count()
        
        if total_lessons > 0:
            progress_percentage = (completed_lessons / total_lessons) * 100
            enrollment.progress_percentage = progress_percentage
            enrollment.status = 'in_progress'
            if progress_percentage == 100:
                enrollment.status = 'completed'
                enrollment.is_completed = True
            enrollment.save()
        
        serializer = LessonProgressSerializer(progress)
        return Response(serializer.data)


# ============================================================================
# REVIEW VIEWS
# ============================================================================

class CourseReviewViewSet(viewsets.ModelViewSet):
    """Course reviews"""
    
    serializer_class = CourseReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        course_id = self.kwargs.get('course_pk')
        return CourseReview.objects.filter(course_id=course_id)
    
    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_pk')
        course = get_object_or_404(Course, id=course_id)
        serializer.save(student=self.request.user, course=course)
