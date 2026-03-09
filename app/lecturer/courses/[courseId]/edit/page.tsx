'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/lib/auth-context';
import { coursesAPI, handleAPIError } from '@/lib/api-client';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const CATEGORIES = [
  { value: 'development', label: 'Development' },
  { value: 'design', label: 'Design' },
  { value: 'business', label: 'Business' },
  { value: 'science', label: 'Data Science' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'finance', label: 'Finance' },
  { value: 'other', label: 'Other' },
];

interface FormData {
  title: string;
  slug: string;
  description: string;
  category: string;
  price: string;
  thumbnail_url: string;
  preview_video_url: string;
  estimated_duration_hours: string;
  is_published: boolean;
}

export default function EditCoursePage() {
  const params = useParams<{ courseId: string }>();
  const courseId = Number(params.courseId);
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    title: '',
    slug: '',
    description: '',
    category: 'development',
    price: '0',
    thumbnail_url: '',
    preview_video_url: '',
    estimated_duration_hours: '0',
    is_published: false,
  });

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
        const c = response.data;
        setFormData({
          title: c.title || '',
          slug: c.slug || '',
          description: c.description || '',
          category: c.category || 'development',
          price: String(c.price ?? '0'),
          thumbnail_url: c.thumbnail_url || '',
          preview_video_url: c.preview_video_url || '',
          estimated_duration_hours: String(c.estimated_duration_hours ?? '0'),
          is_published: Boolean(c.is_published),
        });
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        estimated_duration_hours: parseFloat(formData.estimated_duration_hours) || 0,
      };
      await coursesAPI.update(courseId, payload);
      toast({
        title: 'Success',
        description: 'Course updated successfully.',
      });
      router.push('/lecturer/dashboard');
    } catch (err) {
      toast({
        title: 'Error',
        description: handleAPIError(err),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
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
            <h1 className="text-2xl font-bold text-foreground">Edit Course</h1>
            <p className="text-sm text-muted-foreground">Update course details</p>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-4xl mx-auto">
        {error ? (
          <Card className="p-6 text-destructive">{error}</Card>
        ) : (
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-base font-semibold">Course Title</Label>
                <Input id="title" name="title" value={formData.title} disabled className="mt-2 bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">Title is immutable after creation.</p>
              </div>

              <div>
                <Label htmlFor="slug" className="text-base font-semibold">Slug</Label>
                <Input id="slug" name="slug" value={formData.slug} disabled className="mt-2 bg-muted" />
                <p className="text-xs text-muted-foreground mt-1">Slug is immutable after creation.</p>
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-semibold">Description</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={5} className="mt-2" />
              </div>

              <div>
                <Label htmlFor="category" className="text-base font-semibold">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" className="text-base font-semibold">Price ($)</Label>
                  <Input id="price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="estimated_duration_hours" className="text-base font-semibold">Estimated Duration (hours)</Label>
                  <Input id="estimated_duration_hours" name="estimated_duration_hours" type="number" min="0" step="0.5" value={formData.estimated_duration_hours} onChange={handleChange} className="mt-2" />
                </div>
              </div>

              <div>
                <Label htmlFor="thumbnail_url" className="text-base font-semibold">Thumbnail URL</Label>
                <Input id="thumbnail_url" name="thumbnail_url" type="url" value={formData.thumbnail_url} onChange={handleChange} className="mt-2" />
              </div>

              <div>
                <Label htmlFor="preview_video_url" className="text-base font-semibold">Preview Video URL</Label>
                <Input id="preview_video_url" name="preview_video_url" type="url" value={formData.preview_video_url} onChange={handleChange} className="mt-2" />
              </div>

              <div className="flex items-center gap-3">
                <input
                  id="is_published"
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_published: e.target.checked }))}
                />
                <Label htmlFor="is_published">Publish course</Label>
              </div>

              <div className="flex justify-end gap-3">
                <Link href="/lecturer/dashboard">
                  <Button type="button" variant="outline">Cancel</Button>
                </Link>
                <Button type="submit" disabled={isSaving} className="gap-2">
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
}
