'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { coursesAPI, handleAPIError } from '@/lib/api-client';
import {
  BookOpen,
  Search,
  Star,
  Users,
  Clock,
  DollarSign,
  AlertCircle,
  ChevronLeft,
} from 'lucide-react';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  category: string;
  thumbnail_url: string;
  price: string | number;
  rating: number;
  total_ratings: number;
  total_students: number;
  estimated_duration_hours: number;
  instructor: {
    username: string;
    first_name: string;
    last_name: string;
    avatar_url?: string;
  };
}

const CATEGORIES = [
  { id: 'development', label: 'Development' },
  { id: 'design', label: 'UI/UX Design' },
  { id: 'business', label: 'Business' },
  { id: 'science', label: 'Data Science' },
  { id: 'marketing', label: 'Marketing' },
  { id: 'finance', label: 'Finance' },
];

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await coursesAPI.list({
          category: selectedCategory || undefined,
          search: searchQuery || undefined,
          is_published: true,
        });
        setCourses(response.data.results || response.data);
      } catch (err) {
        setError(handleAPIError(err));
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchCourses, 500);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  const sortedCourses = [...courses].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return Number(a.price) - Number(b.price);
      case 'price-high':
        return Number(b.price) - Number(a.price);
      case 'rating':
        return b.rating - a.rating;
      case 'students':
        return b.total_students - a.total_students;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-4">
            <ChevronLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-4">Browse Courses</h1>
          <div className="flex gap-3 flex-col sm:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses by name, topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="students">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-20">
              <h3 className="font-bold text-foreground mb-4">Categories</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === null
                      ? 'bg-primary text-white'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  All Courses
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-white'
                        : 'text-foreground hover:bg-secondary'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-80" />
                ))}
              </div>
            ) : error ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-12 text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Courses</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            ) : sortedCourses.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Courses Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'No courses available in this category'}
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Showing {sortedCourses.length} course{sortedCourses.length !== 1 ? 's' : ''}
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  {sortedCourses.map((course) => (
                    <Card
                      key={course.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow group flex flex-col"
                    >
                      {/* Image */}
                      <div className="h-48 bg-secondary overflow-hidden relative">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                            <BookOpen className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3 flex-1 flex flex-col">
                        <div>
                          <Badge variant="outline" className="mb-2 w-fit">
                            {course.category}
                          </Badge>
                          <h3 className="font-bold text-foreground text-balance line-clamp-2 mb-2">
                            {course.title}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {course.description}
                          </p>
                        </div>

                        {/* Instructor */}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                            {course.instructor.first_name.charAt(0)}
                          </div>
                          <span>
                            {course.instructor.first_name} {course.instructor.last_name}
                          </span>
                        </div>

                        {/* Stats */}
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 fill-accent text-accent" />
                              <span className="font-semibold text-foreground">{course.rating}</span>
                              <span>({course.total_ratings})</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              <span>{course.total_students.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{course.estimated_duration_hours} hours</span>
                          </div>
                        </div>

                        {/* Price & Button */}
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-primary" />
                            <span className="font-bold text-foreground">
                              {typeof course.price === 'string'
                                ? course.price
                                : `$${course.price.toFixed(2)}`}
                            </span>
                          </div>
                        </div>

                        <Link href={`/courses/${course.id}`} className="block w-full">
                          <Button className="w-full mt-auto">View Course</Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
