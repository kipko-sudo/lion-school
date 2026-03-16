'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';
import { lecturerAPI, handleAPIError } from '@/lib/api-client';
import { ArrowLeft, Users, AlertCircle } from 'lucide-react';

interface EnrollmentRow {
  id: number;
  student: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    avatar_url?: string;
  };
  course_id: number;
  course_title: string;
  status: string;
  progress_percentage: number;
  enrolled_at: string;
}

export default function LecturerStudentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'lecturer')) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await lecturerAPI.students();
        setEnrollments(response.data || []);
        setError('');
      } catch (err) {
        setError(handleAPIError(err));
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'lecturer') {
      fetchStudents();
    }
  }, [user]);

  const groupedByCourse = useMemo(() => {
    const map = new Map<number, { title: string; rows: EnrollmentRow[] }>();
    enrollments.forEach((row) => {
      if (!map.has(row.course_id)) {
        map.set(row.course_id, { title: row.course_title, rows: [] });
      }
      map.get(row.course_id)!.rows.push(row);
    });
    return Array.from(map.entries()).map(([courseId, data]) => ({
      courseId,
      title: data.title,
      rows: data.rows,
    }));
  }, [enrollments]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Skeleton className="h-10 w-48 mb-4" />
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-32 w-full" />
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
            <h1 className="text-2xl font-bold text-foreground">Students</h1>
            <p className="text-sm text-muted-foreground">All students enrolled in your courses</p>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-5xl mx-auto space-y-6">
        {error && (
          <Card className="p-6 text-destructive flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </Card>
        )}

        {groupedByCourse.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-lg font-semibold">No Enrollments Yet</h2>
            <p className="text-sm text-muted-foreground mt-2">
              Students will appear here once they enroll in your courses.
            </p>
          </Card>
        ) : (
          groupedByCourse.map((group) => (
            <Card key={group.courseId} className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">{group.title}</h2>
                  <p className="text-xs text-muted-foreground">
                    {group.rows.length} student{group.rows.length === 1 ? '' : 's'}
                  </p>
                </div>
                <Link href={`/lecturer/courses/${group.courseId}/students`}>
                  <Button variant="outline" size="sm">Course Overview</Button>
                </Link>
              </div>

              <div className="space-y-3">
                {group.rows.map((row) => (
                  <div key={row.id} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                        {row.student.first_name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="font-semibold">
                          {row.student.first_name} {row.student.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{row.student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-xs text-muted-foreground">
                        Progress: <span className="font-semibold text-foreground">{row.progress_percentage.toFixed(0)}%</span>
                      </div>
                      <Badge variant={row.status === 'completed' ? 'default' : 'outline'} className="capitalize">
                        {row.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

