export type TaskPriority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'To Do' | 'In Progress' | 'Done';

export interface IUserSummary {
  _id?: string;
  id?: string;
  name: string;
  email: string;
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  token?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  user?: string | IUserSummary;
  createdBy?: string | IUserSummary;
  assignees?: (string | IUserSummary)[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  count?: number;
  total?: number;
  page?: number;
  totalPages?: number;
  hasPrevPage?: boolean;
  hasNextPage?: boolean;
  data?: T;
  errors?: Array<{
    type?: string;
    value?: string;
    msg: string;
    path?: string;
    location?: string;
  }>;
}

export interface AuthData {
  id: string;
  name: string;
  email: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface TaskFilterState {
  status?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'dueDate' | 'priority' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface AuthContextType {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

export type ContactPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export interface IContactForm {
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  department: string;
  subject: string;
  priority: ContactPriority;
  message: string;
}

export interface IContactResponseData {
  ticketId: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  department: string;
  subject: string;
  priority: ContactPriority;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string | Date;
}

export interface ITicketStatusInfo {
  ticketId: string;
  name?: string;
  department: string;
  subject: string;
  priority: ContactPriority;
  status: 'Open' | 'In Progress' | 'Resolved';
  createdAt: string | Date;
}

