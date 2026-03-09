'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth-context';
import { enrollmentsAPI, coursesAPI, handleAPIError } from '@/lib/api-client';
import {
  BarChart3,
  BookOpen,
  Clock,
  LogOut,
  Menu,
  Search,
  Settings,
  Users,
  ChevronRight,
  TrendingUp,
  Award,
  AlertCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Enrollment {
  id: number;
  course: {
    id: number;
    title: string;
    thumbnail_url: string;
    instructor: {
      first_name: string;
      last_name: string;
    };
  };
  status: string;
  progress_percentage: number;
  enrolled_at: string;
}

export default function StudentDashboard() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Redirect non-authenticated users
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Fetch enrollments
  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const response = await enrollmentsAPI.list();
        setEnrollments(response.data.results || response.data);
      } catch (err) {
        setError(handleAPIError(err));
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchEnrollments();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
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

  if (user.role !== 'student') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md text-center p-8">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            This page is for students only. You are logged in as a {user.role}.
          </p>
          <div className="flex gap-2">
            <Link href="/" className="flex-1">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
            <Button onClick={handleLogout} className="flex-1">
              Logout
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const stats = [
    {
      label: 'Courses Enrolled',
      value: enrollments.length.toString(),
      icon: BookOpen,
      color: 'text-primary',
    },
    {
      label: 'In Progress',
      value: enrollments.filter((e) => e.status === 'in_progress').length.toString(),
      icon: TrendingUp,
      color: 'text-accent',
    },
    {
      label: 'Completed',
      value: enrollments.filter((e) => e.status === 'completed').length.toString(),
      icon: Award,
      color: 'text-green-500',
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
            { label: 'Dashboard', icon: BarChart3, href: '/dashboard' },
            { label: 'Courses', icon: BookOpen, href: '/courses' },
            { label: 'Wishlist', icon: Users, href: '/wishlist' },
            { label: 'Settings', icon: Settings, href: '/settings' },
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
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
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
            <div className="flex-1 max-w-md">
              <div className="flex items-center gap-2 bg-secondary rounded-lg px-4 py-2">
                <Search className="w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="bg-transparent outline-none w-full text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-secondary rounded-lg">
                <Clock className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back, {user.first_name}!
            </h1>
            <p className="text-muted-foreground">
              {enrollments.length === 0
                ? 'Start learning by exploring our course catalog'
                : `You have ${enrollments.length} course${enrollments.length !== 1 ? 's' : ''} enrolled`}
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4">
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

          {/* Enrollments */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Courses</h2>
              <Link href="/courses">
                <Button variant="outline" size="sm" className="gap-2">
                  Browse More <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-64" />
                ))}
              </div>
            ) : error ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                <AlertCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-foreground font-medium">{error}</p>
              </div>
            ) : enrollments.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Courses Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start your learning journey by enrolling in a course
                </p>
                <Link href="/courses">
                  <Button>Explore Courses</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid md:grid-cols-3 gap-6">
                {enrollments.map((enrollment) => (
                  <Card
                    key={enrollment.id}
                    className="overflow-hidden hover:shadow-lg transition-shadow group"
                  >
                    {/* Course Image */}
                    <div className="h-40 bg-secondary overflow-hidden">
                      {enrollment.course.thumbnail_url ? (
                        <img
                          src={enrollment.course.thumbnail_url}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                          <BookOpen className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="font-bold text-foreground text-balance line-clamp-2">
                          {enrollment.course.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          by {enrollment.course.instructor.first_name}{' '}
                          {enrollment.course.instructor.last_name}
                        </p>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold text-foreground">
                            {enrollment.progress_percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all"
                            style={{ width: `${enrollment.progress_percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Status Badge */}
                      <Badge
                        variant={
                          enrollment.status === 'completed' ? 'default' : 'outline'
                        }
                        className="w-fit capitalize text-xs"
                      >
                        {enrollment.status}
                      </Badge>

                      {/* Action Button */}
                      <Link
                        href={`/courses/${enrollment.course.id}`}
                        className="block w-full"
                      >
                        <Button className="w-full" size="sm">
                          {enrollment.progress_percentage === 100
                            ? 'Review Course'
                            : 'Continue Learning'}
                        </Button>
                      </Link>
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
