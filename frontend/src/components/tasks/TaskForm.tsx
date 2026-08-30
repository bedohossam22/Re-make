import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import type { ITask, IUser, TaskPriority, TaskStatus } from '../../types';
import { authService, taskService } from '../../services/api';
import { formatInputDate, getErrorMessage } from '../../utils/helpers';
import { useAuth } from '../../hooks/useAuth';

interface TaskFormProps {
  task?: ITask | null;
  initialStatus?: TaskStatus;
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

interface FormValues {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
}

const schema = yup.object().shape({
  title: yup
    .string()
    .required('Task title is required')
    .max(100, 'Title cannot exceed 100 characters'),
  description: yup.string().optional(),
  status: yup
    .mixed<TaskStatus>()
    .oneOf(['To Do', 'In Progress', 'Done'])
    .required('Status is required'),
  priority: yup
    .mixed<TaskPriority>()
    .oneOf(['Low', 'Medium', 'High'])
    .required('Priority is required'),
  dueDate: yup
    .string()
    .required('Due date is required')
    .test('not-in-past', 'Due date cannot be in the past', (value) => {
      if (!value) return true;
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      return value >= todayStr;
    }),
});

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  initialStatus,
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const { user: currentUser } = useAuth();
  const isEditMode = Boolean(task);
  const [availableUsers, setAvailableUsers] = useState<IUser[]>([]);
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  const getTodayFormatted = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      status: initialStatus || 'To Do',
      priority: 'Medium',
      dueDate: getTodayFormatted(),
    },
  });

  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
          const res = await authService.getUsers();
          if (res.success && res.data) {
            setAvailableUsers(res.data);
          }
        } catch {
          // ignore or handle silently
        } finally {
          setLoadingUsers(false);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: formatInputDate(task.dueDate),
      });
      if (task.assignees && Array.isArray(task.assignees)) {
        const ids = task.assignees.map((a) =>
          typeof a === 'string' ? a : a.id || a._id || ''
        ).filter(Boolean);
        setSelectedAssignees(ids);
      } else {
        setSelectedAssignees([]);
      }
    } else {
      reset({
        title: '',
        description: '',
        status: initialStatus || 'To Do',
        priority: 'Medium',
        dueDate: getTodayFormatted(),
      });
      const creatorId = currentUser?.id;
      setSelectedAssignees(creatorId ? [creatorId] : []);
    }
  }, [task, initialStatus, reset, isOpen, currentUser]);

  if (!isOpen) return null;

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const onSubmit = async (data: FormValues) => {
    try {
      const payload = {
        ...data,
        assignees: selectedAssignees,
      };
      if (isEditMode && task) {
        await taskService.updateTask(task._id, payload);
        toast.success('Task updated successfully!');
      } else {
        await taskService.createTask(payload);
        toast.success('Task created successfully!');
      }
      onSubmitSuccess();
      onClose();
    } catch (err: any) {
      const msg = getErrorMessage(err);
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="glass-card w-full max-w-lg p-5 sm:p-7 relative shadow-2xl border border-slate-700/60 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800 shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-slate-100">
            {isEditMode ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 overflow-y-auto pr-1 flex-1">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Implement authentication flow"
              {...register('title')}
              className={`input-field ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400 font-medium">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add extra context or sub-tasks..."
              {...register('description')}
              className="input-field resize-none text-sm"
            />
          </div>

          {/* Grid: Status, Priority, Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Status */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select {...register('status')} className="input-field bg-slate-900 cursor-pointer text-xs sm:text-sm py-2 px-2.5">
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select {...register('priority')} className="input-field bg-slate-900 cursor-pointer text-xs sm:text-sm py-2 px-2.5">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Due Date *
              </label>
              <input
                type="date"
                min={getTodayFormatted()}
                {...register('dueDate')}
                className={`input-field bg-slate-900 cursor-pointer text-xs sm:text-sm py-2 px-2.5 ${errors.dueDate ? 'border-red-500' : ''}`}
              />
              {errors.dueDate && (
                <p className="mt-1 text-xs text-red-400 font-medium">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Assignees Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Assign Members (Assignees)
            </label>
            {loadingUsers ? (
              <div className="text-xs text-slate-400 py-2">Loading users...</div>
            ) : availableUsers.length === 0 ? (
              <div className="text-xs text-slate-500 italic py-1">No other users found</div>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1 max-h-32 overflow-y-auto p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                {availableUsers.map((user) => {
                  const isSelected = selectedAssignees.includes(user.id);
                  const isCreator = user.id === currentUser?.id;
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => toggleAssignee(user.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 border ${
                        isSelected
                          ? 'bg-indigo-600/30 border-indigo-500 text-indigo-200'
                          : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-700 text-indigo-300 flex items-center justify-center text-[10px] font-bold uppercase shrink-0">
                        {user.name.charAt(0)}
                      </span>
                      <span className="truncate max-w-[120px]">
                        {user.name} {isCreator && <span className="text-[10px] text-indigo-400 font-semibold">(You)</span>}
                      </span>
                      {isSelected && (
                        <svg className="w-3.5 h-3.5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 mt-4 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-xs sm:text-sm min-w-[110px] flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
