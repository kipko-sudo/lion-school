'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { coursesAPI, handleAPIError } from '@/lib/api-client';
import { ArrowLeft, BookOpen, Clock, Loader2, Star, Users } from 'lucide-react';

interface LessonSummary {
  id: number;
  title: string;
  lesson_type: string;
}

interface ModuleItem {
  id: number;
  title: string;
  description: string;
  order: number;
  lessons: LessonSummary[];
}

interface CourseDetail {
  id: number;
  title: string;
  description: string;
  category: string;
  thumbnail_url: string;
  price: string | number;
  rating: number;
  total_students: number;
  estimated_duration_hours: number;
  instructor?: {
    first_name: string;
    last_name: string;
  };
  enrollment_status?: {
    enrolled: boolean;
    progress_percentage?: number;
    status?: string;
  } | null;
}

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = Number(params.courseId);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState('');

  const fetchCourseData = async () => {
    if (!courseId || Number.isNaN(courseId)) return;

    try {
      const [courseResponse, modulesResponse] = await Promise.all([
        coursesAPI.detail(courseId),
        coursesAPI.getModules(courseId),
      ]);

      setCourse(courseResponse.data);
      setModules(modulesResponse.data.results || modulesResponse.data || []);
      setError('');
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  const sortedModules = useMemo(
    () => [...modules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [modules]
  );

  const isStudent = user?.role === 'student';
  const isLecturer = user?.role === 'lecturer';
  const isEnrolled = Boolean(course?.enrollment_status?.enrolled);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isStudent) return;

    setIsEnrolling(true);
    try {
      await coursesAPI.enroll(courseId);
      await fetchCourseData();
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Card className="p-6 text-destructive max-w-3xl mx-auto">
          {error || 'Course not found.'}
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Link href="/courses" className="inline-flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-4 h-4" />
            Back to Courses
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div className="h-64 bg-secondary overflow-hidden">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                  <BookOpen className="w-10 h-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="p-6 space-y-4">
              <Badge variant="outline">{course.category}</Badge>
              <h1 className="text-3xl font-bold text-foreground">{course.title}</h1>
              <p className="text-muted-foreground">{course.description}</p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Course Content</h2>
            {sortedModules.length === 0 ? (
              <p className="text-sm text-muted-foreground">No modules have been added yet.</p>
            ) : (
              <div className="space-y-3">
                {sortedModules.map((module) => (
                  <div key={module.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold">
                      {module.order}. {module.title}
                    </h3>
                    {module.description && (
                      <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                    )}
                    {module.lessons?.length > 0 && (
                      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                        {module.lessons.map((lesson) => (
                          <li key={lesson.id}>
                            • {lesson.title} ({lesson.lesson_type})
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Price</span>
              <span className="font-bold text-lg">
                {typeof course.price === 'string' ? course.price : `$${course.price.toFixed(2)}`}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Rating</span>
              <span className="font-semibold inline-flex items-center gap-1">
                <Star className="w-4 h-4 fill-accent text-accent" />
                {course.rating.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Students</span>
              <span className="font-semibold inline-flex items-center gap-1">
                <Users className="w-4 h-4" />
                {course.total_students.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-semibold inline-flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {course.estimated_duration_hours} hrs
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Instructor:{' '}
              {course.instructor
                ? `${course.instructor.first_name} ${course.instructor.last_name}`
                : 'N/A'}
            </div>

            {isStudent && (
              <Button
                onClick={handleEnroll}
                disabled={isEnrolling || isEnrolled}
                className="w-full gap-2"
              >
                {isEnrolling && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEnrolled ? 'Enrolled' : 'Enroll Now'}
              </Button>
            )}

            {isLecturer && (
              <Link href={`/lecturer/courses/${course.id}/content`} className="block">
                <Button className="w-full" variant="outline">
                  Manage Content
                </Button>
              </Link>
            )}
          </Card>

          {error && <Card className="p-4 text-destructive">{error}</Card>}
        </div>
      </div>
    </div>
  );
}

