import type { TaskPriority, TaskStatus } from '../types';

/**
 * Format ISO date string into a human readable string.
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

/**
 * Format ISO date string into YYYY-MM-DD for HTML date input.
 */
export const formatInputDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

/**
 * Check if a task is overdue.
 */
export const isOverdue = (dueDate: string, status: TaskStatus): boolean => {
  if (status === 'Done' || !dueDate) return false;
  const due = new Date(dueDate);
  const now = new Date();
  // Strip time for fair date comparison
  due.setHours(23, 59, 59, 999);
  return due < now;
};

/**
 * Get CSS badge classes based on task priority.
 */
export const getPriorityBadgeClass = (priority: TaskPriority): string => {
  switch (priority) {
    case 'High':
      return 'badge-priority-high';
    case 'Medium':
      return 'badge-priority-medium';
    case 'Low':
      return 'badge-priority-low';
    default:
      return 'badge-secondary';
  }
};

/**
 * Get CSS badge classes based on task status.
 */
export const getStatusBadgeClass = (status: TaskStatus): string => {
  switch (status) {
    case 'Done':
      return 'badge-status-done';
    case 'In Progress':
      return 'badge-status-progress';
    case 'To Do':
      return 'badge-status-todo';
    default:
      return 'badge-secondary';
  }
};

/**
 * Extract human-readable error message from API response or Axios error.
 */
export const getErrorMessage = (error: any): string => {
  if (!error) return 'An unexpected error occurred';
  if (typeof error === 'string') return error;

  if (error.response?.data) {
    const data = error.response.data;
    if (data.message) return data.message;
    if (Array.isArray(data.errors) && data.errors.length > 0) {
      return data.errors.map((err: any) => err.msg || err.message).join(', ');
    }
  }

  if (error.message) return error.message;

  return 'An error occurred while processing your request';
};
