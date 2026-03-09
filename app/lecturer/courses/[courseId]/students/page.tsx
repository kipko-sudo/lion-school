'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { coursesAPI, handleAPIError } from '@/lib/api-client';
import { ArrowLeft, Loader2, Users } from 'lucide-react';

interface CourseSummary {
  id: number;
  title: string;
  total_students: number;
  rating: number;
  review_count: number;
}

export default function CourseStudentsPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = Number(params.courseId);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'lecturer')) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId || Number.isNaN(courseId)) return;
      try {
        const response = await coursesAPI.detail(courseId);
        setCourse(response.data);
      } catch (err) {
        setError(handleAPIError(err));
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'lecturer') {
      fetchCourse();
    }
  }, [courseId, user]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'lecturer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-white sticky top-0 z-40">
        <div className="px-8 py-4 flex items-center gap-4">
          <Link href="/lecturer/dashboard">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Course Students</h1>
            <p className="text-sm text-muted-foreground">Student overview for this course</p>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto space-y-6">
        {error ? (
          <Card className="p-6 text-destructive">{error}</Card>
        ) : (
          <Card className="p-6 space-y-4">
            <h2 className="text-xl font-semibold">{course?.title || 'Course'}</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-bold">{course?.total_students ?? 0}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-2xl font-bold">{(course?.rating ?? 0).toFixed(1)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">Reviews</p>
                <p className="text-2xl font-bold">{course?.review_count ?? 0}</p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 mt-0.5 text-muted-foreground" />
            <div>
              <h3 className="font-semibold">Detailed student roster</h3>
              <p className="text-sm text-muted-foreground mt-1">
                The backend currently exposes student counts for lecturers but does not yet provide a per-course
                student list endpoint. This page now works and can be expanded as soon as that endpoint is added.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
