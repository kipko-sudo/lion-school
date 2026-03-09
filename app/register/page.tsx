'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getDashboardPath, useAuth } from '@/lib/auth-context';
import { handleAPIError } from '@/lib/api-client';
import { BookOpen, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { register } = useAuth();

  const [step, setStep] = useState<'role' | 'form' | 'success'>('role');
  const [role, setRole] = useState<'student' | 'lecturer'>('student');

  const [formData, setFormData] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    password: '',
    password_confirm: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const queryRole = searchParams.get('role');
    if (queryRole === 'student' || queryRole === 'lecturer') {
      setRole(queryRole);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await register({
        ...formData,
        role,
      });
      setStep('success');
      setTimeout(() => {
        router.push(getDashboardPath(result?.user?.role || role));
      }, 2000);
    } catch (err: any) {
      setError(handleAPIError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Lion School</span>
          </Link>
        </div>
      </div>

      {/* Registration Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <div className="p-8 space-y-6">
            {step === 'role' && (
              <>
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl font-bold text-foreground">Join Lion School</h1>
                  <p className="text-muted-foreground">
                    Choose your role to get started
                  </p>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setRole('student');
                      setStep('form');
                    }}
                    className="w-full p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left group"
                  >
                    <h3 className="font-bold text-foreground group-hover:text-primary mb-1">
                      I'm a Student
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Learn from expert instructors and advance your skills
                    </p>
                  </button>

                  <button
                    onClick={() => {
                      setRole('lecturer');
                      setStep('form');
                    }}
                    className="w-full p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left group"
                  >
                    <h3 className="font-bold text-foreground group-hover:text-primary mb-1">
                      I'm a Lecturer
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Create and share your knowledge with thousands of students
                    </p>
                  </button>
                </div>

                <div className="text-center text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </div>
              </>
            )}

            {step === 'form' && (
              <>
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
                  <p className="text-muted-foreground">
                    {role === 'student' ? "Student" : "Lecturer"} Registration
                  </p>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="first_name" className="text-sm font-medium">
                        First Name
                      </Label>
                      <Input
                        id="first_name"
                        name="first_name"
                        placeholder="John"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        required
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name" className="text-sm font-medium">
                        Last Name
                      </Label>
                      <Input
                        id="last_name"
                        name="last_name"
                        placeholder="Doe"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        disabled={isLoading}
                        required
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      required
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      Username
                    </Label>
                    <Input
                      id="username"
                      name="username"
                      placeholder="johndoe"
                      value={formData.username}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      required
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      required
                      className="h-10"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum 8 characters
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password_confirm" className="text-sm font-medium">
                      Confirm Password
                    </Label>
                    <Input
                      id="password_confirm"
                      name="password_confirm"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password_confirm}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      required
                      className="h-10"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isLoading}
                      onClick={() => setStep('role')}
                      className="w-full h-10"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-10 gap-2"
                    >
                      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      {isLoading ? 'Creating...' : 'Create Account'}
                    </Button>
                  </div>
                </form>

                <div className="text-center text-sm">
                  Already have an account?{' '}
                  <Link href="/login" className="text-primary hover:underline font-medium">
                    Sign in
                  </Link>
                </div>
              </>
            )}

            {step === 'success' && (
              <div className="space-y-6 text-center py-8">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    Welcome to Lion School!
                  </h2>
                  <p className="text-muted-foreground">
                    Your account has been created successfully.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Redirecting to dashboard...
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <RegisterPageContent />
    </Suspense>
  );
}
