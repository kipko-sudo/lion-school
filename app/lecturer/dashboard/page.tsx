'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';
import { coursesAPI, handleAPIError } from '@/lib/api-client';
import {
  BarChart3,
  BookOpen,
  LogOut,
  Menu,
  Plus,
  Settings,
  TrendingUp,
  Users,
  AlertCircle,
  Edit,
  Trash2,
  Eye,
  PieChart,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface LecturerCourse {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  thumbnail_url: string;
  price: string | number;
  is_published: boolean;
  status: string;
  total_students: number;
  review_count: number;
  rating: number;
  modules_count: number;
}

export default function LecturerDashboard() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [courses, setCourses] = useState<LecturerCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deletingCourseId, setDeletingCourseId] = useState<number | null>(null);

  // Redirect non-authenticated lecturers
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'lecturer')) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Fetch instructor's courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await coursesAPI.list();
        setCourses(response.data.results || response.data);
      } catch (err) {
        setError(handleAPIError(err));
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'lecturer') {
      fetchCourses();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleDeleteCourse = async (courseId: number) => {
    try {
      await coursesAPI.delete(courseId);
      setCourses(courses.filter((c) => c.id !== courseId));
      setDeletingCourseId(null);
    } catch (err) {
      setError(handleAPIError(err));
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen bg-background">
        <Skeleton className="w-64 h-screen" />
        <div className="flex-1 p-8 space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (user.role !== 'lecturer') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md text-center p-8">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            This page is for lecturers only. You are logged in as a {user.role}.
          </p>
          <Button onClick={handleLogout} className="w-full">
            Logout & Return Home
          </Button>
        </Card>
      </div>
    );
  }

  const totalStudents = courses.reduce((sum, course) => sum + course.total_students, 0);
  const publishedCourses = courses.filter((c) => c.is_published).length;
  const stats = [
    {
      label: 'Total Courses',
      value: courses.length.toString(),
      icon: BookOpen,
      color: 'text-primary',
    },
    {
      label: 'Published',
      value: publishedCourses.toString(),
      icon: Eye,
      color: 'text-accent',
    },
    {
      label: 'Total Students',
      value: totalStudents.toLocaleString(),
      icon: Users,
      color: 'text-green-500',
    },
    {
      label: 'Avg Rating',
      value: courses.length > 0
        ? (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1)
        : '0.0',
      icon: TrendingUp,
      color: 'text-blue-500',
    },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-card border-r border-border transition-all duration-300 flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 border-b border-border flex items-center justify-between px-4">
          {sidebarOpen && (
            <Link href="/" className="flex items-center gap-2 font-bold">
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span>Lion School</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-secondary rounded-lg"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {[
            { label: 'Dashboard', icon: BarChart3, href: '/lecturer/dashboard' },
            { label: 'My Courses', icon: BookOpen, href: '/lecturer/courses' },
            { label: 'Students', icon: Users, href: '/lecturer/students' },
            { label: 'Analytics', icon: PieChart, href: '/lecturer/analytics' },
            { label: 'Settings', icon: Settings, href: '/lecturer/settings' },
          ].map((item) => (
            <Link key={item.label} href={item.href}>
              <button className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-secondary transition-colors">
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="border-t border-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2 hover:bg-secondary p-2 rounded-lg">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {user.first_name.charAt(0)}
                </div>
                {sidebarOpen && (
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">Lecturer</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/lecturer/profile" className="cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="border-b border-border bg-white sticky top-0 z-40">
          <div className="px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Lecturer Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user.first_name}!</p>
            </div>
            <Link href="/lecturer/courses/create">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create Course
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color} opacity-60`} />
                </div>
              </Card>
            ))}
          </div>

          {/* Courses Section */}
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">Your Courses</h2>
              <p className="text-muted-foreground">
                Manage and monitor your courses
              </p>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            ) : error ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-foreground font-medium">{error}</p>
              </div>
            ) : courses.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Courses Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first course to start teaching
                </p>
                <Link href="/lecturer/courses/create">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Course
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="space-y-4">
                {courses.map((course) => (
                  <Card key={course.id} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      {/* Course Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-foreground text-lg line-clamp-1">
                              {course.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {course.description.substring(0, 100)}...
                            </p>
                          </div>
                          <Badge
                            variant={course.is_published ? 'default' : 'outline'}
                            className="flex-shrink-0"
                          >
                            {course.is_published ? 'Published' : 'Draft'}
                          </Badge>
                        </div>

                        {/* Stats */}
                        <div className="flex flex-wrap gap-4 mt-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{course.total_students} students</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{course.modules_count} modules</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4" />
                            <span>{course.rating.toFixed(1)} rating</span>
                          </div>
                          {course.is_published && (
                            <div className="flex items-center gap-1">
                              <span className="font-semibold text-foreground">
                                ${typeof course.price === 'string' ? course.price : course.price.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/lecturer/courses/${course.id}/edit`}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Course
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/lecturer/courses/${course.id}/content`}>
                                <BookOpen className="w-4 h-4 mr-2" />
                                Manage Content
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/lecturer/courses/${course.id}/students`}>
                                <Users className="w-4 h-4 mr-2" />
                                View Students
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <div className="text-destructive cursor-pointer flex items-center">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Course
                                  </div>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogTitle>Delete Course</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{course.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                  <div className="flex justify-end gap-2">
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteCourse(course.id)}
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </div>
                                </AlertDialogContent>
                              </AlertDialog>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
