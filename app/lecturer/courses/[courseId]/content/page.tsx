'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { coursesAPI, handleAPIError } from '@/lib/api-client';
import Markdown from '@/components/markdown';
import { ArrowLeft, BookOpen, Loader2, Plus, Trash2 } from 'lucide-react';

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

interface CourseSummary {
  id: number;
  title: string;
  status: string;
  is_published: boolean;
}

export default function CourseContentPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = Number(params.courseId);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    order: '',
  });

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'lecturer')) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, user, router]);

  const fetchContent = async () => {
    if (!courseId || Number.isNaN(courseId)) return;

    try {
      const [courseResponse, modulesResponse] = await Promise.all([
        coursesAPI.detail(courseId),
        coursesAPI.getModules(courseId),
      ]);

      setCourse(courseResponse.data);
      const moduleData = modulesResponse.data.results || modulesResponse.data || [];
      setModules(moduleData);
      setError('');
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'lecturer') {
      fetchContent();
    }
  }, [courseId, user]);

  const sortedModules = useMemo(
    () => [...modules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [modules]
  );

  const handleCreateModule = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError('Module title is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await coursesAPI.createModule(courseId, {
        title: form.title.trim(),
        description: form.description.trim(),
        order: Number(form.order) || sortedModules.length + 1,
      });

      setForm({ title: '', description: '', order: '' });
      await fetchContent();
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    const confirmed = window.confirm('Delete this module? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await coursesAPI.deleteModule(courseId, moduleId);
      setModules((prev) => prev.filter((m) => m.id !== moduleId));
    } catch (err) {
      setError(handleAPIError(err));
    }
  };

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
            <h1 className="text-2xl font-bold text-foreground">Manage Content</h1>
            <p className="text-sm text-muted-foreground">
              {course?.title || 'Course'} modules and lessons
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-5xl mx-auto space-y-6">
        {error && <Card className="p-4 text-destructive">{error}</Card>}

        <Card className="p-6">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <h2 className="text-lg font-semibold">Course Status</h2>
            {course?.is_published ? <Badge>Published</Badge> : <Badge variant="outline">Draft</Badge>}
            {course?.status && <Badge variant="secondary">{course.status}</Badge>}
          </div>

          <form onSubmit={handleCreateModule} className="space-y-4">
            <div>
              <Label htmlFor="title">Module Title</Label>
              <Input
                id="title"
                placeholder="Module 1: Introduction"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                disabled={isSubmitting}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description (Markdown supported)</Label>
              <Textarea
                id="description"
                placeholder="What students will learn in this module..."
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                disabled={isSubmitting}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                min="1"
                placeholder={String(sortedModules.length + 1)}
                value={form.order}
                onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Module
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Modules ({sortedModules.length})</h2>

          {sortedModules.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              No modules yet. Add your first module above.
            </div>
          ) : (
            <div className="space-y-3">
              {sortedModules.map((module) => (
                <div key={module.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {module.order}. {module.title}
                      </p>
                      {module.description && (
                        <Markdown
                          content={module.description}
                          className="text-sm text-muted-foreground mt-1"
                        />
                      )}
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {module.lessons?.length || 0} lesson(s)
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDeleteModule(module.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
