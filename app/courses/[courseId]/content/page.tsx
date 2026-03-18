'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAuth } from '@/lib/auth-context';
import { coursesAPI, handleAPIError, moduleQuizAPI } from '@/lib/api-client';
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

interface ModuleQuizQuestion {
  id: number;
  question_text: string;
  options: Record<string, string>;
  order: number;
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
  const [quizOpen, setQuizOpen] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizError, setQuizError] = useState('');
  const [quizResult, setQuizResult] = useState<null | {
    passed: boolean;
    score: number;
    correct: number;
    total: number;
    attempts: number;
    course_progress_percentage: number;
  }>(null);
  const [quizQuestions, setQuizQuestions] = useState<ModuleQuizQuestion[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});

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
  const isStudent = user?.role === 'student';

  const sortedModules = useMemo(
    () => [...modules].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [modules]
  );

  const activeModule = sortedModules.find((m) => m.id === activeModuleId) || sortedModules[0];

  const openQuiz = async () => {
    if (!activeModule) return;
    setQuizOpen(true);
    setQuizLoading(true);
    setQuizError('');
    setQuizResult(null);
    try {
      const response = await moduleQuizAPI.getQuestions(activeModule.id);
      const data = response.data || [];
      setQuizQuestions(data);
      setQuizAnswers({});
      if (data.length === 0) {
        setQuizError('No quiz questions configured for this module yet.');
      }
    } catch (err) {
      setQuizError(handleAPIError(err));
    } finally {
      setQuizLoading(false);
    }
  };

  const submitQuiz = async () => {
    if (!activeModule) return;
    setQuizLoading(true);
    setQuizError('');
    try {
      const answers = quizQuestions.map((q) => ({
        question_id: q.id,
        answer_text: quizAnswers[q.id] || '',
      }));
      const response = await moduleQuizAPI.submit(activeModule.id, answers);
      setQuizResult(response.data);
    } catch (err) {
      setQuizError(handleAPIError(err));
    } finally {
      setQuizLoading(false);
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
                {isStudent && (
                  <div className="mt-4">
                    <Button onClick={openQuiz}>Complete Module</Button>
                  </div>
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

      <Dialog open={quizOpen} onOpenChange={setQuizOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Module Quiz</DialogTitle>
            <DialogDescription>
              Complete this short quiz to mark the module as done. You can retry as many times as you need.
            </DialogDescription>
          </DialogHeader>

          {quizLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading quiz...
            </div>
          ) : quizError ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {quizError}
            </div>
          ) : quizResult ? (
            <div className="space-y-2 text-sm">
              <p>
                Score: <span className="font-semibold">{quizResult.score.toFixed(0)}%</span> (
                {quizResult.correct}/{quizResult.total})
              </p>
              <p>
                Status:{' '}
                <span className={quizResult.passed ? 'text-primary' : 'text-destructive'}>
                  {quizResult.passed ? 'Passed' : 'Failed'}
                </span>
              </p>
              <p className="text-muted-foreground">
                Course progress: {quizResult.course_progress_percentage.toFixed(0)}%
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {quizQuestions.map((q, index) => (
                <div key={q.id} className="space-y-2">
                  <p className="font-semibold">
                    {index + 1}. {q.question_text}
                  </p>
                  <RadioGroup
                    value={quizAnswers[q.id] || ''}
                    onValueChange={(value) =>
                      setQuizAnswers((prev) => ({ ...prev, [q.id]: value }))
                    }
                    className="space-y-2"
                  >
                    {Object.entries(q.options || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <RadioGroupItem value={key} id={`${q.id}-${key}`} />
                        <label htmlFor={`${q.id}-${key}`} className="text-sm">
                          {key}. {value}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="gap-2">
            {quizResult && (
              <Button variant="outline" onClick={openQuiz}>
                Retry Quiz
              </Button>
            )}
            {!quizResult && !quizError && (
              <Button onClick={submitQuiz} disabled={quizLoading || quizQuestions.length === 0}>
                Submit Quiz
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
