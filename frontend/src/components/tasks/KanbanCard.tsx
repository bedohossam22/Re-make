import React, { useState } from 'react';
import type { ITask, TaskStatus } from '../../types';
import {
  formatDate,
  isOverdue,
  getPriorityBadgeClass,
} from '../../utils/helpers';

interface KanbanCardProps {
  task: ITask;
  onView: (task: ITask) => void;
  onEdit: (task: ITask) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (task: ITask, newStatus: TaskStatus) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = ({
  task,
  onView,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [wasDragged, setWasDragged] = useState(false);
  const overdue = isOverdue(task.dueDate, task.status);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData('text/plain', task._id);
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    setWasDragged(true);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setTimeout(() => setWasDragged(false), 150);
  };

  const handleClick = () => {
    if (!wasDragged) {
      onView(task);
    }
  };

  const getPreviousStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'In Progress') return 'To Do';
    if (current === 'Done') return 'In Progress';
    return null;
  };

  const getNextStatus = (current: TaskStatus): TaskStatus | null => {
    if (current === 'To Do') return 'In Progress';
    if (current === 'In Progress') return 'Done';
    return null;
  };

  const prevStatus = getPreviousStatus(task.status);
  const nextStatus = getNextStatus(task.status);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={`glass-card p-4 rounded-xl border border-slate-700/60 bg-slate-900/60 hover:border-indigo-500/50 transition-all duration-200 cursor-grab active:cursor-grabbing select-none group relative ${
        isDragging ? 'opacity-40 scale-95 border-dashed border-indigo-400' : 'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/10'
      }`}
    >
      {/* Card Header: Priority badge & drag handle */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className={getPriorityBadgeClass(task.priority)}>{task.priority}</span>
        <div className="text-slate-500 group-hover:text-slate-400 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </div>
      </div>

      {/* Task Title */}
      <h4 className="text-base font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 mb-2 leading-snug">
        {task.title}
      </h4>

      {/* Task Description snippet */}
      {task.description ? (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {task.description}
        </p>
      ) : (
        <p className="text-xs text-slate-600 italic mb-3">No description</p>
      )}

      {/* Footer: Due date & status move buttons */}
      <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
        {/* Due Date */}
        <div className="flex items-center space-x-1 text-slate-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={`text-[11px] ${overdue ? 'text-red-400 font-bold' : ''}`}>
            {formatDate(task.dueDate)}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
          {/* Move Prev */}
          {prevStatus && (
            <button
              onClick={() => onStatusChange(task, prevStatus)}
              title={`Move back to ${prevStatus}`}
              className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Move Next */}
          {nextStatus && (
            <button
              onClick={() => onStatusChange(task, nextStatus)}
              title={`Advance to ${nextStatus}`}
              className="p-1 rounded text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Edit */}
          <button
            onClick={() => onEdit(task)}
            title="Edit Task"
            className="p-1 rounded text-slate-400 hover:text-teal-400 hover:bg-slate-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={() => onDelete(task._id)}
            title="Delete Task"
            className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default KanbanCard;
