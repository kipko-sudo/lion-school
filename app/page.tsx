'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BookOpen, Users, TrendingUp, Star, Award } from 'lucide-react';
import { getDashboardPath, useAuth } from '@/lib/auth-context';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'development' | 'design' | 'business' | 'science' | 'marketing' | 'finance'>('development');

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(getDashboardPath(user.role));
    }
  }, [isLoading, user, router]);

  if (isLoading || user) {
    return null;
  }

  const categories = [
    { id: 'development', label: 'Development', count: 12 },
    { id: 'design', label: 'UI/UX Design', count: 8 },
    { id: 'business', label: 'Business', count: 6 },
    { id: 'science', label: 'Data Science', count: 9 },
    { id: 'marketing', label: 'Marketing', count: 5 },
    { id: 'finance', label: 'Finance', count: 7 },
  ];

  const featuredCourses = [
    {
      id: 1,
      title: 'Advanced Web Development with React',
      instructor: 'John Williams',
      category: 'Development',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
      price: '$85.00',
      originalPrice: '$120.00',
      rating: 4.9,
      reviews: 2345,
      students: 12450,
      duration: '40 hrs',
      lectures: 180,
    },
    {
      id: 2,
      title: 'Create Amazing Color Schemes for Your UX Design',
      instructor: 'Patricia Foster',
      category: 'Design',
      image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop',
      price: '$42.00',
      originalPrice: '$85.00',
      rating: 4.9,
      reviews: 1876,
      students: 8540,
      duration: '25 hrs',
      lectures: 95,
    },
    {
      id: 3,
      title: 'Culture & Leadership: Strategies for a Successful Team',
      instructor: 'Rose Simmons',
      category: 'Business',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=300&fit=crop',
      price: '$29.50',
      originalPrice: '$45.00',
      rating: 4.9,
      reviews: 1245,
      students: 6230,
      duration: '20 hrs',
      lectures: 72,
    },
  ];

  const stats = [
    { label: 'Courses', value: '1,235', icon: BookOpen },
    { label: 'Students', value: '500K+', icon: Users },
    { label: 'Trending', value: '#1', icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl hidden sm:inline">Lion School</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-foreground hover:text-primary text-sm font-medium">Home</Link>
            <Link href="#" className="text-foreground hover:text-primary text-sm font-medium">All Courses</Link>
            <Link href="#" className="text-foreground hover:text-primary text-sm font-medium">Pages</Link>
            <Link href="#" className="text-foreground hover:text-primary text-sm font-medium">Blog</Link>
            <Link href="#" className="text-foreground hover:text-primary text-sm font-medium">Contact</Link>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-sm">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="text-sm">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-accent/5 to-background py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight text-balance">
                  Start your favorite course
                </h1>
                <h2 className="text-3xl md:text-4xl font-bold">
                  Now learning from anywhere, and build your <span className="text-primary">bright career.</span>
                </h2>
              </div>

              <p className="text-muted-foreground text-lg">
                It has survived not only five centuries but also the leap into electronic typesetting.
              </p>

              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Start A Course <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              {/* Stats */}
              <div className="flex gap-8 pt-4">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <stat.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-bold text-lg text-foreground">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="hidden md:block h-[400px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Award className="w-20 h-20 text-primary mx-auto opacity-50" />
                  <p className="text-muted-foreground">Hero Image</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Courses Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Section Header */}
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                All <span className="text-primary">Courses</span> of Lion School
              </h2>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="Search your course"
                  className="flex-1 px-4 py-2 rounded-lg border border-border bg-white text-foreground placeholder:text-muted-foreground"
                />
                <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id as any)}
                  className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
                    activeTab === cat.id
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-primary/20 text-foreground hover:border-primary'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Course Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative h-40 bg-secondary overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-4 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-bold text-foreground text-balance line-clamp-2">
                          {course.title}
                        </h3>
                      </div>
                      <Badge variant="outline" className="w-fit">
                        {course.category}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                        {course.instructor[0]}
                      </div>
                      <span>{course.instructor}</span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-accent text-accent" />
                        <span className="font-semibold">{course.rating}</span>
                        <span className="text-muted-foreground">({course.reviews.toLocaleString()})</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{course.students.toLocaleString()} students</span>
                      <span>{course.duration}</span>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <span className="font-bold text-lg text-foreground">{course.price}</span>
                      <span className="line-through text-sm text-muted-foreground">{course.originalPrice}</span>
                    </div>

                    <Link href={`/courses/${course.id}`} className="block w-full">
                      <Button className="w-full" variant="outline">
                        View Course
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            {/* View More */}
            <div className="text-center pt-4">
              <Link href="/courses">
                <Button variant="outline" className="mx-auto">
                  View All Courses
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor CTA Section */}
      <section className="bg-primary/5 py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                  Become A Instructor
                </h2>
                <h3 className="text-2xl md:text-3xl font-bold">
                  You can join with Lion School <span className="text-primary">as a instructor?</span>
                </h3>
              </div>
              <p className="text-muted-foreground text-lg">
                Share your knowledge and expertise with thousands of students worldwide. Create high-quality courses and make a difference.
              </p>
              <Link href="/register?role=lecturer">
                <Button size="lg" className="gap-2">
                  Drop Information <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="hidden md:block h-[300px] bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl flex items-center justify-center">
              <div className="text-center space-y-2">
                <Award className="w-20 h-20 text-accent mx-auto opacity-50" />
                <p className="text-muted-foreground">Instructor Resources</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Lion School
              </h4>
              <p className="text-sm opacity-75">Comprehensive e-learning platform for students and lecturers worldwide.</p>
            </div>
            <div>
              <h5 className="font-bold mb-4">Quick Links</h5>
              <ul className="space-y-2 text-sm opacity-75">
                <li><Link href="/courses" className="hover:opacity-100">Courses</Link></li>
                <li><Link href="#" className="hover:opacity-100">About Us</Link></li>
                <li><Link href="#" className="hover:opacity-100">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Support</h5>
              <ul className="space-y-2 text-sm opacity-75">
                <li><Link href="#" className="hover:opacity-100">FAQ</Link></li>
                <li><Link href="#" className="hover:opacity-100">Help Center</Link></li>
                <li><Link href="#" className="hover:opacity-100">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">Legal</h5>
              <ul className="space-y-2 text-sm opacity-75">
                <li><Link href="#" className="hover:opacity-100">Privacy</Link></li>
                <li><Link href="#" className="hover:opacity-100">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 text-center text-sm opacity-75">
            <p>&copy; 2024 Lion School. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
