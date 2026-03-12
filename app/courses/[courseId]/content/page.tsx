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
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';

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
  category: string;
  enrollment_status?: {
    enrolled: boolean;
  } | null;
}

export default function CourseContentPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = Number(params.courseId);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchContent = async () => {
      if (!courseId || Number.isNaN(courseId)) return;
      try {
        const courseResponse = await coursesAPI.detail(courseId);
        const courseData = courseResponse.data;
        setCourse(courseData);

        const canViewContent =
          user?.role === 'lecturer' || Boolean(courseData?.enrollment_status?.enrolled);

        if (!canViewContent) {
          setModules([]);
          return;
        }

        const modulesResponse = await coursesAPI.getModules(courseId);
        const moduleData = modulesResponse.data.results || modulesResponse.data || [];
        setModules(moduleData);
        if (moduleData.length > 0) {
          setActiveModuleId(moduleData[0].id);
        }
        setError('');
      } catch (err) {
        setError(handleAPIError(err));
      } finally {
        setIsLoading(false);
      }
    };

    fetchContent();
  }, [courseId, user?.role]);

  const isLecturer = user?.role === 'lecturer';
  const isEnrolled = Boolean(course?.enrollment_status?.enrolled);
  const canViewContent = isLecturer || isEnrolled;

  const sortedModules = useMemo(
    () => [...modules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [modules]
  );

  const activeModule = sortedModules.find((m) => m.id === activeModuleId) || sortedModules[0];

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

  if (!canViewContent) {
    return (
      <div className="min-h-screen bg-background p-8">
        <Card className="p-6 max-w-3xl mx-auto">
          <h1 className="text-xl font-semibold">Course Content Locked</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Enroll in this course to access the modules and lessons.
          </p>
          <div className="mt-4">
            <Button onClick={() => router.push(`/courses/${courseId}`)}>
              Back to Course Overview
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href={`/courses/${course.id}`} className="inline-flex items-center gap-2 text-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{course.category}</Badge>
            <span className="font-semibold text-foreground">{course.title}</span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 grid lg:grid-cols-[280px_1fr] gap-6">
        <Card className="p-4 h-fit lg:sticky lg:top-24">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Modules
          </h2>
          {sortedModules.length === 0 ? (
            <p className="text-sm text-muted-foreground">No modules added yet.</p>
          ) : (
            <div className="space-y-2">
              {sortedModules.map((module) => (
                <button
                  key={module.id}
                  className={`w-full text-left rounded-lg border px-3 py-2 transition-colors ${
                    module.id === (activeModule?.id ?? module.id)
                      ? 'bg-primary text-white border-primary'
                      : 'hover:bg-secondary'
                  }`}
                  onClick={() => setActiveModuleId(module.id)}
                >
                  <p className="text-sm font-semibold">{module.title}</p>
                  <p className="text-xs opacity-80">{module.lessons?.length || 0} lessons</p>
                </button>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-6">
          {activeModule ? (
            <>
              <Card className="p-6">
                <h1 className="text-2xl font-bold text-foreground">{activeModule.title}</h1>
                {activeModule.description && (
                  <Markdown
                    content={activeModule.description}
                    className="text-sm text-muted-foreground mt-2"
                  />
                )}
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Lessons</h2>
                {activeModule.lessons?.length > 0 ? (
                  <div className="space-y-3">
                    {activeModule.lessons.map((lesson, index) => (
                      <div key={lesson.id} className="border rounded-lg p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{lesson.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {lesson.lesson_type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No lessons added to this module yet.</p>
                )}
              </Card>
            </>
          ) : (
            <Card className="p-6">
              <BookOpen className="w-8 h-8 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Select a module from the left to see its lessons.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

