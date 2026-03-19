'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { coursesAPI, handleAPIError } from '@/lib/api-client';
import Markdown from '@/components/markdown';
import { ArrowLeft, BookOpen, Clock, Loader2, Star, Users } from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState('');

  const fetchCourseData = async () => {
    if (!courseId || Number.isNaN(courseId)) return;

    try {
      const courseResponse = await coursesAPI.detail(courseId);
      setCourse(courseResponse.data);
      setError('');
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId, user?.role]);

  const isStudent = user?.role === 'student';
  const isLecturer = user?.role === 'lecturer';
  const isEnrolled = Boolean(course?.enrollment_status?.enrolled);
  const canViewContent = isLecturer || isEnrolled;

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

  const handleUnenroll = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isStudent) return;

    const confirmed = window.confirm('Unenroll from this course? Your progress will be lost.');
    if (!confirmed) return;

    setIsEnrolling(true);
    try {
      await coursesAPI.unenroll(courseId);
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
              <Markdown content={course.description} className="text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Course Content</h2>
            {!canViewContent ? (
              <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                Enroll in this course to unlock the full module content.
              </div>
            ) : (
              <div className="rounded-lg border p-6 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">Ready to continue learning?</p>
                  <p className="text-sm text-muted-foreground">
                    Open the content page with the module sidebar and lesson list.
                  </p>
                </div>
                <Link href={`/courses/${course.id}/content`}>
                  <Button>Open Course Content</Button>
                </Link>
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
                {course.total_students.toLocaleString()} enrolled
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
              <div className="space-y-2">
                <Button
                  onClick={handleEnroll}
                  disabled={isEnrolling || isEnrolled}
                  className="w-full gap-2"
                >
                  {isEnrolling && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEnrolled ? 'Enrolled' : 'Enroll Now'}
                </Button>
                {isEnrolled && (
                  <Button
                    onClick={handleUnenroll}
                    disabled={isEnrolling}
                    variant="outline"
                    className="w-full"
                  >
                    Unenroll
                  </Button>
                )}
              </div>
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
