(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/projects/lion-school/lib/api-client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "authAPI",
    ()=>authAPI,
    "coursesAPI",
    ()=>coursesAPI,
    "default",
    ()=>__TURBOPACK__default__export__,
    "enrollmentsAPI",
    ()=>enrollmentsAPI,
    "handleAPIError",
    ()=>handleAPIError,
    "progressAPI",
    ()=>progressAPI,
    "quizzesAPI",
    ()=>quizzesAPI
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/projects/lion-school/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
/**
 * Lion School Axios API Client
 * Configured HTTP client for backend communication
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$axios$40$1$2e$13$2e$6$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/lion-school/node_modules/.pnpm/axios@1.13.6/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$js$2d$cookie$40$3$2e$0$2e$5$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/lion-school/node_modules/.pnpm/js-cookie@3.0.5/node_modules/js-cookie/dist/js.cookie.mjs [app-client] (ecmascript)");
;
;
// API Configuration
const API_BASE_URL = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
/**
 * Create and configure axios instance
 */ const apiClient = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$axios$40$1$2e$13$2e$6$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});
/**
 * Request interceptor - Add auth token to requests
 */ apiClient.interceptors.request.use((config)=>{
    const token = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$js$2d$cookie$40$3$2e$0$2e$5$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error)=>{
    return Promise.reject(error);
});
/**
 * Response interceptor - Handle auth errors
 */ apiClient.interceptors.response.use((response)=>response, (error)=>{
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
        __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$js$2d$cookie$40$3$2e$0$2e$5$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].remove('auth_token');
        __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$js$2d$cookie$40$3$2e$0$2e$5$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].remove('refresh_token');
        __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$js$2d$cookie$40$3$2e$0$2e$5$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].remove('user_data');
        // Redirect to login (implement in your auth context)
        if ("TURBOPACK compile-time truthy", 1) {
            window.location.href = '/login';
        }
    }
    return Promise.reject(error);
});
const authAPI = {
    register: (data)=>apiClient.post('/auth/register/', data),
    login: (email, password)=>apiClient.post('/auth/login/', {
            email,
            password
        }),
    profile: ()=>apiClient.get('/auth/profile/'),
    updateProfile: (data)=>apiClient.put('/auth/profile/', data),
    logout: ()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$js$2d$cookie$40$3$2e$0$2e$5$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].remove('auth_token');
        __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$js$2d$cookie$40$3$2e$0$2e$5$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].remove('refresh_token');
        __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$js$2d$cookie$40$3$2e$0$2e$5$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].remove('user_data');
        return Promise.resolve();
    }
};
const coursesAPI = {
    list: (params)=>apiClient.get('/courses/', {
            params
        }),
    detail: (courseId)=>apiClient.get(`/courses/${courseId}/`),
    create: (data)=>apiClient.post('/courses/', data),
    update: (courseId, data)=>apiClient.put(`/courses/${courseId}/`, data),
    delete: (courseId)=>apiClient.delete(`/courses/${courseId}/`),
    enroll: (courseId)=>apiClient.post(`/courses/${courseId}/enroll/`),
    getProgress: (courseId)=>apiClient.get(`/courses/${courseId}/progress/`),
    // Modules
    getModules: (courseId)=>apiClient.get(`/courses/${courseId}/modules/`),
    createModule: (courseId, data)=>apiClient.post(`/courses/${courseId}/modules/`, data),
    updateModule: (courseId, moduleId, data)=>apiClient.put(`/courses/${courseId}/modules/${moduleId}/`, data),
    deleteModule: (courseId, moduleId)=>apiClient.delete(`/courses/${courseId}/modules/${moduleId}/`),
    // Reviews
    getReviews: (courseId)=>apiClient.get(`/courses/${courseId}/reviews/`),
    addReview: (courseId, data)=>apiClient.post(`/courses/${courseId}/reviews/`, data),
    updateReview: (courseId, reviewId, data)=>apiClient.put(`/courses/${courseId}/reviews/${reviewId}/`, data),
    deleteReview: (courseId, reviewId)=>apiClient.delete(`/courses/${courseId}/reviews/${reviewId}/`)
};
const quizzesAPI = {
    list: (courseId)=>apiClient.get(`/courses/${courseId}/quizzes/`),
    detail: (courseId, quizId)=>apiClient.get(`/courses/${courseId}/quizzes/${quizId}/`),
    create: (courseId, data)=>apiClient.post(`/courses/${courseId}/quizzes/`, data),
    update: (courseId, quizId, data)=>apiClient.put(`/courses/${courseId}/quizzes/${quizId}/`, data),
    delete: (courseId, quizId)=>apiClient.delete(`/courses/${courseId}/quizzes/${quizId}/`),
    // Questions
    getQuestions: (quizId)=>apiClient.get(`/quizzes/${quizId}/questions/`),
    addQuestion: (quizId, data)=>apiClient.post(`/quizzes/${quizId}/questions/`, data),
    updateQuestion: (quizId, questionId, data)=>apiClient.put(`/quizzes/${quizId}/questions/${questionId}/`, data),
    deleteQuestion: (quizId, questionId)=>apiClient.delete(`/quizzes/${quizId}/questions/${questionId}/`),
    // Submit quiz
    submitQuiz: (courseId, quizId, answers)=>apiClient.post(`/courses/${courseId}/quizzes/${quizId}/submit/`, {
            answers
        })
};
const enrollmentsAPI = {
    list: (params)=>apiClient.get('/enrollments/', {
            params
        }),
    detail: (enrollmentId)=>apiClient.get(`/enrollments/${enrollmentId}/`)
};
const progressAPI = {
    completeLesson: (lessonId)=>apiClient.post(`/lessons/${lessonId}/complete/`),
    getLessonProgress: (enrollmentId)=>apiClient.get(`/enrollments/${enrollmentId}/progress/`)
};
const handleAPIError = (error)=>{
    if (__TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$axios$40$1$2e$13$2e$6$2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].isAxiosError(error)) {
        const data = error.response?.data;
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
            const fieldErrors = Object.entries(data).map(([key, value])=>`${key}: ${Array.isArray(value) ? value[0] : value}`).join(', ');
            if (fieldErrors) return fieldErrors;
        }
    }
    return error?.message || 'An error occurred';
};
const __TURBOPACK__default__export__ = apiClient;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/projects/lion-school/lib/auth-context.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AuthProvider",
    ()=>AuthProvider,
    "getDashboardPath",
    ()=>getDashboardPath,
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/lion-school/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
/**
 * Lion School Authentication Context
 * Manages user authentication state globally
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/lion-school/node_modules/.pnpm/next@16.1.6_react-dom@19.2.4_react@19.2.4__react@19.2.4/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$js$2d$cookie$40$3$2e$0$2e$5$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/lion-school/node_modules/.pnpm/js-cookie@3.0.5/node_modules/js-cookie/dist/js.cookie.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/projects/lion-school/lib/api-client.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
;
const getDashboardPath = (role)=>{
    if (role === 'lecturer') return '/lecturer/dashboard';
    return '/dashboard';
};
const AuthContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
const persistAuth = (token, refresh, userData)=>{
    if (token) {
        __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$js$2d$cookie$40$3$2e$0$2e$5$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].set('auth_token', token, {
            expires: 7
        });
    }
    if (refresh) {
        __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$js$2d$cookie$40$3$2e$0$2e$5$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].set('refresh_token', refresh, {
            expires: 7
        });
    }
    if (userData) {
        __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$js$2d$cookie$40$3$2e$0$2e$5$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].set('user_data', JSON.stringify(userData), {
            expires: 7
        });
    }
};
const clearAuth = ()=>{
    __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$js$2d$cookie$40$3$2e$0$2e$5$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].remove('auth_token');
    __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$js$2d$cookie$40$3$2e$0$2e$5$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].remove('refresh_token');
    __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$js$2d$cookie$40$3$2e$0$2e$5$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].remove('user_data');
};
function AuthProvider({ children }) {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isLoading, setIsLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Initialize auth from cookies
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "AuthProvider.useEffect": ()=>{
            const initAuth = {
                "AuthProvider.useEffect.initAuth": async ()=>{
                    try {
                        const token = __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$js$2d$cookie$40$3$2e$0$2e$5$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('auth_token');
                        if (token) {
                            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authAPI"].profile();
                            setUser(response.data);
                        }
                    } catch (error) {
                        console.error('Failed to fetch profile:', error);
                        clearAuth();
                    } finally{
                        setIsLoading(false);
                    }
                }
            }["AuthProvider.useEffect.initAuth"];
            initAuth();
        }
    }["AuthProvider.useEffect"], []);
    const register = async (data)=>{
        try {
            const registerResponse = await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authAPI"].register(data);
            // Register endpoint may not return tokens; exchange credentials via login.
            const loginResponse = await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authAPI"].login(data.email, data.password);
            const authPayload = loginResponse.data;
            const newUser = authPayload.user || registerResponse.data?.user;
            const token = authPayload.access || authPayload.token;
            const refresh = authPayload.refresh;
            persistAuth(token, refresh, newUser);
            setUser(newUser);
            return {
                ...registerResponse.data,
                ...authPayload
            };
        } catch (error) {
            throw error;
        }
    };
    const login = async (email, password)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authAPI"].login(email, password);
            const { user: loggedInUser, token, access, refresh } = response.data;
            persistAuth(access || token, refresh, loggedInUser);
            setUser(loggedInUser);
            return response.data;
        } catch (error) {
            throw error;
        }
    };
    const logout = async ()=>{
        try {
            await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authAPI"].logout();
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };
    const updateProfile = async (data)=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authAPI"].updateProfile(data);
            setUser(response.data);
            __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$js$2d$cookie$40$3$2e$0$2e$5$2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].set('user_data', JSON.stringify(response.data), {
                expires: 7
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    };
    const fetchProfile = async ()=>{
        try {
            const response = await __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$lib$2f$api$2d$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["authAPI"].profile();
            setUser(response.data);
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            clearAuth();
            setUser(null);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AuthContext.Provider, {
        value: {
            user,
            isLoading,
            isAuthenticated: !!user,
            register,
            login,
            logout,
            updateProfile,
            fetchProfile
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/projects/lion-school/lib/auth-context.tsx",
        lineNumber: 151,
        columnNumber: 5
    }, this);
}
_s(AuthProvider, "YajQB7LURzRD+QP5gw0+K2TZIWA=");
_c = AuthProvider;
function useAuth() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$projects$2f$lion$2d$school$2f$node_modules$2f2e$pnpm$2f$next$40$16$2e$1$2e$6_react$2d$dom$40$19$2e$2$2e$4_react$40$19$2e$2$2e$4_$5f$react$40$19$2e$2$2e$4$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
_s1(useAuth, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "AuthProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=projects_lion-school_lib_3b2f7003._.js.map