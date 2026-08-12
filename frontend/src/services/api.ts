import axios from 'axios';
import {
  ApiResponse,
  AuthData,
  ITask,
  LoginCredentials,
  RegisterCredentials,
  TaskFilterState,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid credentials
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Dispatch custom event so AuthContext or app can react
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Auth Service Endpoints
export const authService = {
  register: async (credentials: RegisterCredentials): Promise<ApiResponse<AuthData>> => {
    const response = await api.post<ApiResponse<AuthData>>('/auth/register', credentials);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<ApiResponse<AuthData>> => {
    const response = await api.post<ApiResponse<AuthData>>('/auth/login', credentials);
    return response.data;
  },
};

// Task Service Endpoints
export const taskService = {
  getTasks: async (filters?: TaskFilterState): Promise<ApiResponse<ITask[]>> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `/tasks?${queryString}` : '/tasks';
    const response = await api.get<ApiResponse<ITask[]>>(url);
    return response.data;
  },

  getTaskById: async (id: string): Promise<ApiResponse<ITask>> => {
    const response = await api.get<ApiResponse<ITask>>(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (taskData: Partial<ITask>): Promise<ApiResponse<ITask>> => {
    const response = await api.post<ApiResponse<ITask>>('/tasks', taskData);
    return response.data;
  },

  updateTask: async (id: string, taskData: Partial<ITask>): Promise<ApiResponse<ITask>> => {
    const response = await api.put<ApiResponse<ITask>>(`/tasks/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await api.delete<ApiResponse<{ message: string }>>(`/tasks/${id}`);
    return response.data;
  },
};

export default api;
