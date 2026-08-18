import React from 'react';
import type { ITask, TaskStatus } from '../../types';
import {
  formatDate,
  isOverdue,
  getPriorityBadgeClass,
  getStatusBadgeClass,
} from '../../utils/helpers';

interface TaskCardProps {
  task: ITask;
  onView: (task: ITask) => void;
  onEdit: (task: ITask) => void;
  onDelete: (taskId: string) => void;
  onStatusChange?: (task: ITask, newStatus: TaskStatus) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const overdue = isOverdue(task.dueDate, task.status);

  const getNextStatus = (current: TaskStatus): TaskStatus => {
    if (current === 'To Do') return 'In Progress';
    if (current === 'In Progress') return 'Done';
    return 'To Do';
  };

  const handleQuickStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStatusChange) {
      const nextStatus = getNextStatus(task.status);
      onStatusChange(task, nextStatus);
    }
  };

  return (
    <div
      onClick={() => onView(task)}
      className="glass-card p-5 hover:border-indigo-500/40 transition-all duration-200 cursor-pointer flex flex-col justify-between group relative hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10"
    >
      <div>
        {/* Card Header: Status & Priority Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={getStatusBadgeClass(task.status)}>{task.status}</span>
          <span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span>
        </div>

        {/* Task Title */}
        <h3 className="text-lg font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1 mb-2">
          {task.title}
        </h3>

        {/* Task Description */}
        {task.description ? (
          <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
            {task.description}
          </p>
        ) : (
          <p className="text-sm text-slate-500 italic mb-4">No description provided</p>
        )}
      </div>

      {/* Card Footer: Due Date & Actions */}
      <div className="pt-3 border-t border-slate-700/40 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5">
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={`font-medium ${overdue ? 'text-red-400 font-bold' : 'text-slate-300'}`}>
            {formatDate(task.dueDate)}
          </span>
          {overdue && (
            <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border border-red-500/30">
              Overdue
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          {onStatusChange && (
            <button
              onClick={handleQuickStatusToggle}
              title={`Advance status to ${getNextStatus(task.status)}`}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}

          <button
            onClick={() => onEdit(task)}
            title="Edit Task"
            className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          <button
            onClick={() => onDelete(task._id)}
            title="Delete Task"
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
