import React from 'react';
import type { ITask } from '../../types';
import {
  formatDate,
  isOverdue,
  getPriorityBadgeClass,
  getStatusBadgeClass,
} from '../../utils/helpers';

interface TaskDetailsProps {
  task: ITask | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (task: ITask) => void;
  onDelete: (taskId: string) => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !task) return null;

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="glass-card w-full max-w-lg p-6 sm:p-8 relative shadow-2xl border border-slate-700/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Close Modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Badges */}
        <div className="flex items-center space-x-3 mb-4">
          <span className={getStatusBadgeClass(task.status)}>{task.status}</span>
          <span className={getPriorityBadgeClass(task.priority)}>{task.priority} Priority</span>
          {overdue && (
            <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs uppercase font-bold border border-red-500/30">
              Overdue
            </span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-100 mb-4 leading-snug">
          {task.title}
        </h2>

        {/* Description */}
        <div className="mb-6">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-2">
            Description
          </h4>
          <p className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-900/60 p-4 rounded-xl border border-slate-800 leading-relaxed min-h-[80px]">
            {task.description || 'No detailed description provided for this task.'}
          </p>
        </div>

        {/* Task Metadata */}
        <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-slate-800 text-xs mb-6">
          <div>
            <span className="text-slate-400 block mb-1">Due Date</span>
            <span className={`font-semibold ${overdue ? 'text-red-400' : 'text-slate-200'}`}>
              {formatDate(task.dueDate)}
            </span>
          </div>

          <div>
            <span className="text-slate-400 block mb-1">Created At</span>
            <span className="text-slate-300 font-medium">
              {formatDate(task.createdAt)}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={() => {
              onClose();
              onDelete(task._id);
            }}
            className="btn-danger text-xs sm:text-sm"
          >
            Delete Task
          </button>
          <button
            onClick={() => {
              onClose();
              onEdit(task);
            }}
            className="btn-primary text-xs sm:text-sm"
          >
            Edit Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
