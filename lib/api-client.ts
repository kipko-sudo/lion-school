/**
 * Lion School Axios API Client
 * Configured HTTP client for backend communication
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Create and configure axios instance
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include credentials in requests
});

/**
 * Request interceptor - Add auth token to requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle auth errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      Cookies.remove('auth_token');
      Cookies.remove('refresh_token');
      Cookies.remove('user_data');
      // Redirect to login (implement in your auth context)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// Authentication API
// ============================================================================

export const authAPI = {
  register: (data: {
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
    role: 'student' | 'lecturer';
  }) => apiClient.post('/auth/register/', data),

  login: (email: string, password: string) =>
    apiClient.post('/auth/login/', { email, password }),

  profile: () => apiClient.get('/auth/profile/'),

  updateProfile: (data: Record<string, any>) =>
    apiClient.put('/auth/profile/', data),

  logout: () => {
    Cookies.remove('auth_token');
    Cookies.remove('refresh_token');
    Cookies.remove('user_data');
    return Promise.resolve();
  },
};

// ============================================================================
// Courses API
// ============================================================================

export const coursesAPI = {
  list: (params?: {
    category?: string;
    search?: string;
    page?: number;
    is_published?: boolean;
  }) => apiClient.get('/courses/', { params }),

  detail: (courseId: number) => apiClient.get(`/courses/${courseId}/`),

  create: (data: any) => apiClient.post('/courses/', data),

  update: (courseId: number, data: any) =>
    apiClient.put(`/courses/${courseId}/`, data),

  delete: (courseId: number) => apiClient.delete(`/courses/${courseId}/`),

  enroll: (courseId: number) => apiClient.post(`/courses/${courseId}/enroll/`),

  getProgress: (courseId: number) =>
    apiClient.get(`/courses/${courseId}/progress/`),

  // Modules
  getModules: (courseId: number) =>
    apiClient.get(`/courses/${courseId}/modules/`),

  createModule: (courseId: number, data: any) =>
    apiClient.post(`/courses/${courseId}/modules/`, data),

  updateModule: (courseId: number, moduleId: number, data: any) =>
    apiClient.put(`/courses/${courseId}/modules/${moduleId}/`, data),

  deleteModule: (courseId: number, moduleId: number) =>
    apiClient.delete(`/courses/${courseId}/modules/${moduleId}/`),

  // Reviews
  getReviews: (courseId: number) =>
    apiClient.get(`/courses/${courseId}/reviews/`),

  addReview: (courseId: number, data: { rating: number; review_text?: string }) =>
    apiClient.post(`/courses/${courseId}/reviews/`, data),

  updateReview: (courseId: number, reviewId: number, data: any) =>
    apiClient.put(`/courses/${courseId}/reviews/${reviewId}/`, data),

  deleteReview: (courseId: number, reviewId: number) =>
    apiClient.delete(`/courses/${courseId}/reviews/${reviewId}/`),
};

// ============================================================================
// Quizzes API
// ============================================================================

export const quizzesAPI = {
  list: (courseId: number) =>
    apiClient.get(`/courses/${courseId}/quizzes/`),

  detail: (courseId: number, quizId: number) =>
    apiClient.get(`/courses/${courseId}/quizzes/${quizId}/`),

  create: (courseId: number, data: any) =>
    apiClient.post(`/courses/${courseId}/quizzes/`, data),

  update: (courseId: number, quizId: number, data: any) =>
    apiClient.put(`/courses/${courseId}/quizzes/${quizId}/`, data),

  delete: (courseId: number, quizId: number) =>
    apiClient.delete(`/courses/${courseId}/quizzes/${quizId}/`),

  // Questions
  getQuestions: (quizId: number) =>
    apiClient.get(`/quizzes/${quizId}/questions/`),

  addQuestion: (quizId: number, data: any) =>
    apiClient.post(`/quizzes/${quizId}/questions/`, data),

  updateQuestion: (quizId: number, questionId: number, data: any) =>
    apiClient.put(`/quizzes/${quizId}/questions/${questionId}/`, data),

  deleteQuestion: (quizId: number, questionId: number) =>
    apiClient.delete(`/quizzes/${quizId}/questions/${questionId}/`),

  // Submit quiz
  submitQuiz: (courseId: number, quizId: number, answers: Array<{
    question_id: number;
    answer_text: string;
  }>) =>
    apiClient.post(`/courses/${courseId}/quizzes/${quizId}/submit/`, { answers }),
};

// ============================================================================
// Enrollments API
// ============================================================================

export const enrollmentsAPI = {
  list: (params?: { status?: string; page?: number }) =>
    apiClient.get('/enrollments/', { params }),

  detail: (enrollmentId: number) =>
    apiClient.get(`/enrollments/${enrollmentId}/`),
};

// ============================================================================
// Lecturer API
// ============================================================================

export const lecturerAPI = {
  students: () => apiClient.get('/lecturer/students/'),
};

// ============================================================================
// Progress API
// ============================================================================

export const progressAPI = {
  completeLesson: (lessonId: number) =>
    apiClient.post(`/lessons/${lessonId}/complete/`),

  getLessonProgress: (enrollmentId: number) =>
    apiClient.get(`/enrollments/${enrollmentId}/progress/`),
};

// ============================================================================
// Module Quiz API
// ============================================================================

export const moduleQuizAPI = {
  getQuestions: (moduleId: number) =>
    apiClient.get(`/modules/${moduleId}/quiz/`),
  submit: (moduleId: number, answers: Array<{ question_id: number; answer_text: string }>) =>
    apiClient.post(`/modules/${moduleId}/complete/`, { answers }),
};

// ============================================================================
// Error Handling Utility
// ============================================================================

export const handleAPIError = (error: any): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any;
    if (typeof data === 'string') {
      return data;
    }
    if (data?.detail) {
      return data.detail;
    }
    if (data?.error) {
      return data.error;
    }
    if (data?.message) {
      return data.message;
    }
    // Handle field errors
    if (typeof data === 'object') {
      const fieldErrors = Object.entries(data)
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value[0] : value}`)
        .join(', ');
      if (fieldErrors) return fieldErrors;
    }
  }
  return error?.message || 'An error occurred';
};

export default apiClient;
