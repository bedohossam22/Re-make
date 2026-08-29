import React from 'react';
import type { ITask } from '../../types';
import { useTimer } from '../../context/TimerContext';
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
  const { setAttachedTask, setIsModalOpen, startTimer } = useTimer();

  if (!isOpen || !task) return null;

  const overdue = isOverdue(task.dueDate, task.status);

  const handleStartFocus = () => {
    onClose();
    setAttachedTask(task._id, task.title);
    startTimer();
    setIsModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        className="glass-card w-full max-w-lg p-5 sm:p-7 relative shadow-2xl border border-slate-700/60 max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          title="Close Modal"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 flex-1 space-y-4">
          {/* Header Badges */}
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <span className={getStatusBadgeClass(task.status)}>{task.status}</span>
            <span className={getPriorityBadgeClass(task.priority)}>{task.priority} Priority</span>
            {overdue && (
              <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded text-xs uppercase font-bold border border-red-500/30">
                Overdue
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-100 leading-snug">
            {task.title}
          </h2>

          {/* Description */}
          <div>
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-2">
              Description
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 whitespace-pre-wrap bg-slate-900/80 p-4 rounded-xl border border-slate-800 leading-relaxed min-h-[80px]">
              {task.description || 'No detailed description provided for this task.'}
            </p>
          </div>

          {/* Task Metadata */}
          <div className="grid grid-cols-2 gap-4 py-3 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block mb-1">Due Date</span>
              <span className={`font-semibold ${overdue ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
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

          {/* People: Creator & Assignees */}
          <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
            {task.createdBy && typeof task.createdBy === 'object' && (
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1.5">
                  Created By
                </span>
                <div className="flex items-center space-x-2 text-slate-200 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                    {task.createdBy.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold">{task.createdBy.name}</div>
                    <div className="text-[11px] text-slate-400">{task.createdBy.email}</div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1.5">
                Assigned Members
              </span>
              {task.assignees && task.assignees.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {task.assignees.map((assignee, idx) => {
                    const isObj = typeof assignee === 'object';
                    const name = isObj ? assignee.name : 'Assigned User';
                    const email = isObj ? assignee.email : '';
                    return (
                      <div
                        key={idx}
                        className="flex items-center space-x-2 bg-slate-900/60 p-2 px-3 rounded-xl border border-slate-800 text-slate-200"
                      >
                        <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-[10px] uppercase shrink-0">
                          {name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-xs">{name}</div>
                          {email && <div className="text-[10px] text-slate-400">{email}</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-slate-500 italic">No assigned members</div>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
          <button
            onClick={handleStartFocus}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Start Focus Timer</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onDelete(task._id);
              }}
              className="btn-danger text-xs sm:text-sm"
            >
              Delete
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(task);
              }}
              className="btn-primary text-xs sm:text-sm"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;
