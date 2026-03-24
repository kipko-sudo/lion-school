'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuth } from '@/lib/auth-context';
import { coursesAPI, handleAPIError, lecturerAPI } from '@/lib/api-client';
import {
  AlertCircle,
  ArrowLeft,
  BarChart3,
  BookOpen,
  TrendingUp,
  Users,
} from 'lucide-react';

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

interface LecturerCourse {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  thumbnail_url: string;
  price: string | number;
  total_students: number;
  modules_count: number;
}

const formatPercent = (value: number) => `${Math.round(value)}%`;

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : '—';

export default function LecturerAnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
  const [courses, setCourses] = useState<LecturerCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'lecturer')) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [studentsResponse, coursesResponse] = await Promise.all([
          lecturerAPI.students(),
          coursesAPI.list(),
        ]);
        setEnrollments(studentsResponse.data || []);
        const courseData = coursesResponse.data.results || coursesResponse.data || [];
        setCourses(courseData);
        setError('');
      } catch (err) {
        setError(handleAPIError(err));
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'lecturer') {
      fetchAnalytics();
    }
  }, [user]);

  const courseMap = useMemo(() => {
    const map = new Map<number, LecturerCourse>();
    courses.forEach((course) => map.set(course.id, course));
    return map;
  }, [courses]);

  const filteredEnrollments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return enrollments.filter((row) => {
      const matchesCourse = courseFilter === 'all' || row.course_id.toString() === courseFilter;
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
      const matchesSearch =
        query.length === 0 ||
        `${row.student.first_name} ${row.student.last_name}`.toLowerCase().includes(query) ||
        row.student.email.toLowerCase().includes(query) ||
        row.course_title.toLowerCase().includes(query);
      return matchesCourse && matchesStatus && matchesSearch;
    });
  }, [enrollments, courseFilter, statusFilter, searchQuery]);

  const stats = useMemo(() => {
    const total = filteredEnrollments.length;
    const uniqueStudents = new Set(filteredEnrollments.map((row) => row.student.id)).size;
    const completed = filteredEnrollments.filter(
      (row) => row.status === 'completed' || row.progress_percentage >= 100
    ).length;
    const inProgress = filteredEnrollments.filter(
      (row) => row.progress_percentage > 0 && row.progress_percentage < 100
    ).length;
    const notStarted = filteredEnrollments.filter((row) => row.progress_percentage === 0).length;
    const avgProgress =
      total === 0
        ? 0
        : filteredEnrollments.reduce((sum, row) => sum + row.progress_percentage, 0) / total;
    return {
      total,
      uniqueStudents,
      completed,
      inProgress,
      notStarted,
      avgProgress,
    };
  }, [filteredEnrollments]);

  const courseSummaries = useMemo(() => {
    const map = new Map<number, EnrollmentRow[]>();
    filteredEnrollments.forEach((row) => {
      if (!map.has(row.course_id)) {
        map.set(row.course_id, []);
      }
      map.get(row.course_id)!.push(row);
    });

    return Array.from(map.entries())
      .map(([courseId, rows]) => {
        const avgProgress =
          rows.reduce((sum, row) => sum + row.progress_percentage, 0) / rows.length;
        const completed = rows.filter(
          (row) => row.status === 'completed' || row.progress_percentage >= 100
        ).length;
        return {
          courseId,
          title: rows[0]?.course_title || courseMap.get(courseId)?.title || 'Untitled Course',
          totalEnrollments: rows.length,
          avgProgress,
          completionRate: rows.length ? (completed / rows.length) * 100 : 0,
        };
      })
      .sort((a, b) => b.totalEnrollments - a.totalEnrollments);
  }, [filteredEnrollments, courseMap]);

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
            <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
            <p className="text-sm text-muted-foreground">
              Track student progress, completion, and engagement across your courses
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-6xl mx-auto space-y-6">
        {error && (
          <Card className="p-6 text-destructive flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Enrollments</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
          </Card>
          <Card className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unique Students</p>
              <p className="text-2xl font-semibold">{stats.uniqueStudents}</p>
            </div>
          </Card>
          <Card className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Progress</p>
              <p className="text-2xl font-semibold">{formatPercent(stats.avgProgress)}</p>
            </div>
          </Card>
          <Card className="p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-semibold">
                {stats.total ? formatPercent((stats.completed / stats.total) * 100) : '0%'}
              </p>
            </div>
          </Card>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold">Filter Insights</h2>
              <p className="text-sm text-muted-foreground">
                Refine the view by course, status, or student name
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-3 w-full lg:w-auto">
              <div className="relative w-full md:w-72">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students or courses..."
                />
              </div>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id.toString()}>
                    {course.title}
                  </option>
                ))}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All statuses</option>
                <option value="enrolled">Enrolled</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="dropped">Dropped</option>
              </select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">In Progress</p>
              <p className="text-2xl font-semibold mt-2">{stats.inProgress}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Not Started</p>
              <p className="text-2xl font-semibold mt-2">{stats.notStarted}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">Completed</p>
              <p className="text-2xl font-semibold mt-2">{stats.completed}</p>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Course Performance</h2>
              <p className="text-sm text-muted-foreground">
                Progress averages based on the filtered enrollments
              </p>
            </div>
            {courseSummaries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No courses match the current filters.</p>
            ) : (
              <div className="space-y-4">
                {courseSummaries.map((course) => (
                  <div key={course.courseId} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{course.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {course.totalEnrollments} enrollment{course.totalEnrollments === 1 ? '' : 's'}
                        </p>
                      </div>
                      <Badge variant="outline">{formatPercent(course.completionRate)} completed</Badge>
                    </div>
                    <Progress value={course.avgProgress} />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Average progress</span>
                      <span>{formatPercent(course.avgProgress)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Engagement Signals</h2>
              <p className="text-sm text-muted-foreground">
                Spot learners who might need extra support
              </p>
            </div>
            <div className="space-y-3">
              {filteredEnrollments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No enrollments to analyze yet.</p>
              ) : (
                filteredEnrollments
                  .filter((row) => row.progress_percentage > 0 && row.progress_percentage < 25)
                  .slice(0, 5)
                  .map((row) => (
                    <div key={row.id} className="flex items-center justify-between border rounded-lg p-3">
                      <div>
                        <p className="font-semibold text-sm">
                          {row.student.first_name} {row.student.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">{row.course_title}</p>
                      </div>
                      <Badge variant="outline">{formatPercent(row.progress_percentage)}</Badge>
                    </div>
                  ))
              )}
            </div>
            {filteredEnrollments.length > 5 && (
              <p className="text-xs text-muted-foreground">
                Showing first 5 at-risk learners. Use filters to view more.
              </p>
            )}
          </Card>
        </div>

        <Card className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Student Progress</h2>
            <p className="text-sm text-muted-foreground">
              Module-level completion is only available to the signed-in student, so this view uses course-level
              progress for accuracy.
            </p>
          </div>
          {filteredEnrollments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No enrollments match your current filters.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Enrolled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments
                  .slice()
                  .sort((a, b) => b.progress_percentage - a.progress_percentage)
                  .map((row) => {
                    return (
                      <TableRow key={row.id}>
                        <TableCell>
                          <div>
                            <p className="font-semibold text-sm">
                              {row.student.first_name} {row.student.last_name}
                            </p>
                            <p className="text-xs text-muted-foreground">{row.student.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{row.course_title}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              row.status === 'completed'
                                ? 'default'
                                : row.progress_percentage >= 100
                                ? 'default'
                                : 'outline'
                            }
                            className="capitalize"
                          >
                            {row.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-[160px]">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                              <span>{formatPercent(row.progress_percentage)}</span>
                              {row.progress_percentage > 0 && row.progress_percentage < 25 && (
                                <span className="text-destructive">At risk</span>
                              )}
                            </div>
                            <Progress value={row.progress_percentage} />
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(row.enrolled_at)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
}
