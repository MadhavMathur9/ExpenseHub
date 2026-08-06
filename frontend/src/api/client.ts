export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8082';

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  profileImageUrl: string;
}

export interface Transaction {
  id: number;
  name: string;
  amount: number;
  date: string; // ISO format YYYY-MM-DD
  categoryId?: number | null;
  categoryName?: string;
  type: 'INCOME' | 'EXPENSE';
}

export interface Category {
  id: number;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon: string;
}

export interface DashboardData {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  recentTransactions: Transaction[];
  expenseByCategory: Record<string, number>;
}

export interface SavingsData {
  period: string;
  totalIncome: number;
  totalExpense: number;
  savings: number;
  previousPeriodSavings?: number;
  percentChange?: number;
}

export interface Milestone {
  id: number;
  title: string;
  icon: string;
  targetAmount: number;
  targetDate?: string;
  currentAmount: number;
  percentComplete: number;
  monthsRemainingAtCurrentPace?: number;
}

export interface MilestonePayload {
  title: string;
  icon: string;
  targetAmount: number;
  targetDate?: string;
}

export interface FilterParams {
  type: 'ALL' | 'INCOME' | 'EXPENSE';
  categoryId?: number | null;
  startDate: string | null;
  endDate: string | null;
  keyword: string | null;
  sortField: 'date' | 'amount';
  sortOrder: 'asc' | 'desc';
}

class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function apiCall<T>(endpoint: string, method = 'GET', body: any = null, isBlob = false): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config: RequestInit = { method, headers };
  if (body) {
    if (body instanceof FormData) {
      config.body = body;
    } else {
      headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(body);
    }
  }

  const response = await fetch(API_BASE + endpoint, config);

  if ((response.status === 401 || response.status === 403) &&
      !['/login', '/register', '/forgot-password', '/reset-password', '/auth/sso/callback'].includes(endpoint) &&
      !endpoint.startsWith('/auth/sso/')) {
    localStorage.removeItem('token');
    window.location.href = '/login?expired=true';
    throw new ApiError('Unauthorized', response.status);
  }

  if (!response.ok) {
    let msg = 'Request failed';
    try {
      const d = await response.json();
      msg = d.message || msg;
    } catch {
      try {
        msg = await response.text() || msg;
      } catch {}
    }
    throw new ApiError(msg, response.status);
  }

  if (isBlob) return (await response.blob()) as unknown as T;
  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}

export const api = {
  // Auth
  login: (data: any) => apiCall<{ token: string }>('/login', 'POST', data),
  register: (data: any) => apiCall('/register', 'POST', data),
  forgotPassword: (data: any) => apiCall<{ message: string }>('/forgot-password', 'POST', data),
  resetPassword: (data: any) => apiCall<{ message: string }>('/reset-password', 'POST', data),
  getSsoUrl: (provider: string, redirectUri: string) => apiCall<{ url: string }>(`/auth/sso/url?provider=${encodeURIComponent(provider)}&redirect_uri=${encodeURIComponent(redirectUri)}`),
  ssoCallback: (code: string, redirectUri: string) => apiCall<{ access_token: string }>('/auth/sso/callback', 'POST', { code, redirect_uri: redirectUri }),

  // Profile
  getMe: () => apiCall<UserProfile>('/me'),
  updateMe: (data: any) => apiCall('/me', 'PUT', data),
  deleteMe: () => apiCall('/me', 'DELETE'),

  // Dashboard & Transactions
  getDashboard: () => apiCall<DashboardData>('/api/dashboard'),
  filterTransactions: (filters: FilterParams) => apiCall<Transaction[]>('/api/filter', 'POST', filters),
  createIncome: (data: any) => apiCall('/api/incomes', 'POST', data),
  createExpense: (data: any) => apiCall('/api/expenses', 'POST', data),
  updateIncome: (id: number, data: any) => apiCall(`/api/incomes/${id}`, 'PUT', data),
  updateExpense: (id: number, data: any) => apiCall(`/api/expenses/${id}`, 'PUT', data),
  deleteIncome: (id: number) => apiCall(`/api/incomes/${id}`, 'DELETE'),
  deleteExpense: (id: number) => apiCall(`/api/expenses/${id}`, 'DELETE'),
  exportExcel: () => apiCall<Blob>('/api/excel/export', 'GET', null, true),

  // Categories
  getCategories: () => apiCall<Category[]>('/api/categories'),
  createCategory: (data: any) => apiCall('/api/categories', 'POST', data),
  deleteCategory: (id: number) => apiCall(`/api/categories/${id}`, 'DELETE'),

  // Advisor
  getInsights: () => apiCall<{ insights: string }>('/api/advisor/insights', 'GET'),
  getGoalsInsights: () => apiCall<{ insights: string }>('/api/advisor/insights?context=goals', 'GET'),

  // Savings & Goals
  getSavings: (period: string) => apiCall<SavingsData>(`/api/savings?period=${period}`),
  getMilestones: () => apiCall<Milestone[]>('/api/milestones'),
  createMilestone: (data: MilestonePayload) => apiCall<Milestone>('/api/milestones', 'POST', data),
  updateMilestone: (id: number, data: MilestonePayload) => apiCall<Milestone>(`/api/milestones/${id}`, 'PUT', data),
  deleteMilestone: (id: number) => apiCall(`/api/milestones/${id}`, 'DELETE'),
};
