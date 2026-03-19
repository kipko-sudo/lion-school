'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { coursesAPI, handleAPIError, moduleQuizAPI } from '@/lib/api-client';
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

interface ModuleQuizQuestion {
  id: number;
  question_text: string;
  order: number;
  options: Record<string, string>;
  correct_answer?: string;
}

export default function CourseContentPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = Number(params.courseId);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<CourseSummary | null>(null);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [activeModuleId, setActiveModuleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    order: '',
  });
  const [quizQuestions, setQuizQuestions] = useState<ModuleQuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [questionForm, setQuestionForm] = useState({
    question_text: '',
    order: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correct_answer: 'A',
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
      if (moduleData.length > 0 && !activeModuleId) {
        setActiveModuleId(moduleData[0].id);
      }
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
  const activeModule = sortedModules.find((m) => m.id === activeModuleId) || null;

  const fetchQuizQuestions = async (moduleId: number) => {
    setQuizLoading(true);
    setQuizError('');
    try {
      const response = await moduleQuizAPI.getQuestions(moduleId);
      setQuizQuestions(response.data || []);
    } catch (err) {
      setQuizError(handleAPIError(err));
    } finally {
      setQuizLoading(false);
    }
  };

  useEffect(() => {
    if (activeModuleId) {
      fetchQuizQuestions(activeModuleId);
    } else {
      setQuizQuestions([]);
    }
  }, [activeModuleId]);

  useEffect(() => {
    if (!activeModuleId) return;
    if (questionForm.order) return;
    setQuestionForm((prev) => ({
      ...prev,
      order: quizQuestions.length ? String(quizQuestions.length + 1) : '1',
    }));
  }, [activeModuleId, quizQuestions.length]);

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

  const handleAddQuestion = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeModuleId) return;

    setQuizLoading(true);
    setQuizError('');
    try {
      const desiredOrder = Number(questionForm.order) || quizQuestions.length + 1;
      if (quizQuestions.some((q) => q.order === desiredOrder)) {
        setQuizError(`Order ${desiredOrder} is already used. Choose a new order.`);
        return;
      }
      const options = {
        A: questionForm.optionA,
        B: questionForm.optionB,
        C: questionForm.optionC,
        D: questionForm.optionD,
      };
      await moduleQuizAPI.createQuestion(activeModuleId, {
        question_text: questionForm.question_text.trim(),
        order: desiredOrder,
        options,
        correct_answer: questionForm.correct_answer,
      });

      setQuestionForm({
        question_text: '',
        order: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correct_answer: 'A',
      });
      await fetchQuizQuestions(activeModuleId);
    } catch (err) {
      setQuizError(handleAPIError(err));
    } finally {
      setQuizLoading(false);
    }
  };

  const handleDeleteModule = async (moduleId: number) => {
    const confirmed = window.confirm('Delete this module? This action cannot be undone.');
    if (!confirmed) return;

    try {
      await coursesAPI.deleteModule(courseId, moduleId);
      setModules((prev) => {
        const next = prev.filter((m) => m.id !== moduleId);
        if (activeModuleId === moduleId) {
          setActiveModuleId(next[0]?.id ?? null);
        }
        return next;
      });
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
                <div
                  key={module.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveModuleId(module.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveModuleId(module.id);
                    }
                  }}
                  className={`border rounded-lg p-4 text-left transition-colors cursor-pointer ${
                    module.id === activeModuleId ? 'bg-primary/5 border-primary' : 'hover:bg-secondary'
                  }`}
                >
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModule(module.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Module Quiz Questions</h2>
          {!activeModule ? (
            <p className="text-sm text-muted-foreground">Select a module to manage its quiz.</p>
          ) : (
            <div className="space-y-4">
              {quizError && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  {quizError}
                </div>
              )}

              <form onSubmit={handleAddQuestion} className="space-y-4">
                <div>
                  <Label htmlFor="question_text">Question</Label>
                  <Textarea
                    id="question_text"
                    value={questionForm.question_text}
                    onChange={(e) =>
                      setQuestionForm((prev) => ({ ...prev, question_text: e.target.value }))
                    }
                    rows={3}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="optionA">Option A</Label>
                    <Input
                      id="optionA"
                      value={questionForm.optionA}
                      onChange={(e) =>
                        setQuestionForm((prev) => ({ ...prev, optionA: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="optionB">Option B</Label>
                    <Input
                      id="optionB"
                      value={questionForm.optionB}
                      onChange={(e) =>
                        setQuestionForm((prev) => ({ ...prev, optionB: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="optionC">Option C</Label>
                    <Input
                      id="optionC"
                      value={questionForm.optionC}
                      onChange={(e) =>
                        setQuestionForm((prev) => ({ ...prev, optionC: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="optionD">Option D</Label>
                    <Input
                      id="optionD"
                      value={questionForm.optionD}
                      onChange={(e) =>
                        setQuestionForm((prev) => ({ ...prev, optionD: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="order">Order</Label>
                    <Input
                      id="order"
                      type="number"
                      min="1"
                      value={questionForm.order}
                      onChange={(e) =>
                        setQuestionForm((prev) => ({ ...prev, order: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Correct Answer</Label>
                    <Select
                      value={questionForm.correct_answer}
                      onValueChange={(value) =>
                        setQuestionForm((prev) => ({ ...prev, correct_answer: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select answer" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">A</SelectItem>
                        <SelectItem value="B">B</SelectItem>
                        <SelectItem value="C">C</SelectItem>
                        <SelectItem value="D">D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button type="submit" disabled={quizLoading}>
                  {quizLoading ? 'Saving...' : 'Add Question'}
                </Button>
              </form>

              <div className="space-y-3">
                {quizLoading ? (
                  <p className="text-sm text-muted-foreground">Loading questions...</p>
                ) : quizQuestions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No questions added yet.</p>
                ) : (
                  quizQuestions.map((q, idx) => (
                    <div key={q.id} className="border rounded-lg p-4">
                      <p className="font-semibold">
                        {idx + 1}. {q.question_text}
                      </p>
                      <div className="mt-2 grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        {Object.entries(q.options || {}).map(([key, value]) => (
                          <div key={key}>
                            {key}. {value}
                          </div>
                        ))}
                      </div>
                      {q.correct_answer && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Correct: {q.correct_answer}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
