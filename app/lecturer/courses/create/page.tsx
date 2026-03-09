'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function CreateCoursePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
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
  }, [isAuthenticated, authLoading, user, router]);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title,
      slug: generateSlug(title),
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast({
        title: 'Error',
        description: 'Course title is required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const courseData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        estimated_duration_hours:
          parseFloat(formData.estimated_duration_hours) || 0,
      };

      const response = await coursesAPI.create(courseData);

      toast({
        title: 'Success',
        description: 'Course created successfully',
      });

      router.push(`/lecturer/courses/${response.data.id}/edit`);
    } catch (error) {
      const errorMessage = handleAPIError(error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
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
      {/* Header */}
      <div className="border-b bg-white sticky top-0 z-40">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/lecturer/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Create New Course</h1>
              <p className="text-sm text-muted-foreground">
                Fill in the details below to create a new course
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 max-w-4xl mx-auto">
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-base font-semibold">
                Course Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter course title"
                value={formData.title}
                onChange={handleTitleChange}
                disabled={loading}
                className="mt-2"
              />
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug" className="text-base font-semibold">
                Slug (auto-generated)
              </Label>
              <Input
                id="slug"
                name="slug"
                placeholder="course-slug"
                value={formData.slug}
                disabled
                className="mt-2 bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Auto-generated from title
              </p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter course description"
                value={formData.description}
                onChange={handleChange}
                disabled={loading}
                rows={5}
                className="mt-2"
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-base font-semibold">
                Category
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleSelectChange('category', value)}
                disabled={loading}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price & Duration */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price" className="text-base font-semibold">
                  Price ($)
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={loading}
                  min="0"
                  step="0.01"
                  className="mt-2"
                />
              </div>
              <div>
                <Label
                  htmlFor="estimated_duration_hours"
                  className="text-base font-semibold"
                >
                  Estimated Duration (hours)
                </Label>
                <Input
                  id="estimated_duration_hours"
                  name="estimated_duration_hours"
                  type="number"
                  placeholder="0"
                  value={formData.estimated_duration_hours}
                  onChange={handleChange}
                  disabled={loading}
                  min="0"
                  step="0.5"
                  className="mt-2"
                />
              </div>
            </div>

            {/* Media URLs */}
            <div>
              <Label htmlFor="thumbnail_url" className="text-base font-semibold">
                Thumbnail URL
              </Label>
              <Input
                id="thumbnail_url"
                name="thumbnail_url"
                type="url"
                placeholder="https://example.com/thumbnail.jpg"
                value={formData.thumbnail_url}
                onChange={handleChange}
                disabled={loading}
                className="mt-2"
              />
            </div>

            <div>
              <Label
                htmlFor="preview_video_url"
                className="text-base font-semibold"
              >
                Preview Video URL
              </Label>
              <Input
                id="preview_video_url"
                name="preview_video_url"
                type="url"
                placeholder="https://example.com/preview.mp4"
                value={formData.preview_video_url}
                onChange={handleChange}
                disabled={loading}
                className="mt-2"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <Link href="/lecturer/dashboard" className="flex-1">
                <Button
                  type="button"
                  variant="outline"
                  disabled={loading}
                  className="w-full"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Creating...' : 'Create Course'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
