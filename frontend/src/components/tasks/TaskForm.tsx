import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import type { ITask, TaskPriority, TaskStatus } from '../../types';
import { taskService } from '../../services/api';
import { formatInputDate, getErrorMessage } from '../../utils/helpers';

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
  dueDate: yup.string().required('Due date is required'),
});

export const TaskForm: React.FC<TaskFormProps> = ({
  task,
  initialStatus,
  isOpen,
  onClose,
  onSubmitSuccess,
}) => {
  const isEditMode = Boolean(task);

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
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        priority: task.priority,
        dueDate: formatInputDate(task.dueDate),
      });
    } else {
      reset({
        title: '',
        description: '',
        status: initialStatus || 'To Do',
        priority: 'Medium',
        dueDate: getTodayFormatted(),
      });
    }
  }, [task, initialStatus, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditMode && task) {
        await taskService.updateTask(task._id, data);
        toast.success('Task updated successfully!');
      } else {
        await taskService.createTask(data);
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
        className="glass-card w-full max-w-lg p-6 sm:p-8 relative shadow-2xl border border-slate-700/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
          <h2 className="text-xl font-bold text-slate-100">
            {isEditMode ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Implement authentication flow"
              {...register('title')}
              className={`input-field ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Add extra context or sub-tasks..."
              {...register('description')}
              className="input-field resize-none"
            />
          </div>

          {/* Grid: Status, Priority, Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select {...register('status')} className="input-field bg-slate-900 cursor-pointer text-sm py-2 px-2.5">
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select {...register('priority')} className="input-field bg-slate-900 cursor-pointer text-sm py-2 px-2.5">
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Due Date *
              </label>
              <input
                type="date"
                {...register('dueDate')}
                className={`input-field bg-slate-900 cursor-pointer text-sm py-2 px-2.5 ${errors.dueDate ? 'border-red-500' : ''}`}
              />
              {errors.dueDate && (
                <p className="mt-1 text-xs text-red-400">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 mt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-sm min-w-[100px] flex items-center justify-center"
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
