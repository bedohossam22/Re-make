import React, { useState, useEffect } from 'react';
import type { ITask, ISubtask } from '../../types';
import { useTimer } from '../../context/TimerContext';
import { taskService } from '../../services/api';
import { toast } from 'react-toastify';
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
  onTaskUpdated?: () => void;
}

export const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onTaskUpdated,
}) => {
  const { setAttachedTask, setIsModalOpen, startTimer } = useTimer();
  const [subtasks, setSubtasks] = useState<ISubtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isUpdatingSubtasks, setIsUpdatingSubtasks] = useState(false);

  useEffect(() => {
    if (task) {
      setSubtasks(task.subtasks || []);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const overdue = isOverdue(task.dueDate, task.status);

  const handleStartFocus = () => {
    onClose();
    setAttachedTask(task._id, task.title);
    startTimer();
    setIsModalOpen(true);
  };

  const handleSaveSubtasks = async (updatedList: ISubtask[]) => {
    setSubtasks(updatedList);
    setIsUpdatingSubtasks(true);
    try {
      await taskService.updateTask(task._id, { subtasks: updatedList });
      if (onTaskUpdated) onTaskUpdated();
    } catch {
      toast.error('Failed to update subtask');
    } finally {
      setIsUpdatingSubtasks(false);
    }
  };

  const handleToggleSubtask = (index: number) => {
    const updated = subtasks.map((st, i) =>
      i === index ? { ...st, completed: !st.completed } : st
    );
    handleSaveSubtasks(updated);
  };

  const handleAddSubtask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newSubtaskTitle.trim();
    if (!trimmed) return;

    const updated = [...subtasks, { title: trimmed, completed: false }];
    setNewSubtaskTitle('');
    handleSaveSubtasks(updated);
  };

  const handleDeleteSubtask = (index: number) => {
    const updated = subtasks.filter((_, i) => i !== index);
    handleSaveSubtasks(updated);
  };

  const totalSubtasks = subtasks.length;
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const percentCompleted = totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0;

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

          {/* Subtasks Checklist Section */}
          <div className="pt-3 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 00-2 2h2a2 2 0 00-2m-6 9l2 2 4-4" />
                </svg>
                Subtasks Checklist
              </h4>
              {totalSubtasks > 0 && (
                <span className="text-xs font-semibold text-indigo-300">
                  {completedSubtasks} / {totalSubtasks} ({percentCompleted}%)
                </span>
              )}
            </div>

            {/* Subtask Progress Bar */}
            {totalSubtasks > 0 && (
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    percentCompleted === 100 ? 'bg-emerald-400' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${percentCompleted}%` }}
                />
              </div>
            )}

            {/* Checklist items list */}
            <div className="space-y-2 bg-slate-900/60 p-3 rounded-xl border border-slate-800 max-h-48 overflow-y-auto">
              {subtasks.length === 0 ? (
                <div className="text-xs text-slate-500 italic text-center py-2">
                  No subtasks added yet. Add one below!
                </div>
              ) : (
                subtasks.map((st, idx) => (
                  <div
                    key={st._id || idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-950/40 border border-slate-800/80 hover:border-slate-700/60 transition-colors group"
                  >
                    <label className="flex items-center space-x-3 cursor-pointer flex-1 min-w-0 pr-2">
                      <input
                        type="checkbox"
                        checked={st.completed}
                        disabled={isUpdatingSubtasks}
                        onChange={() => handleToggleSubtask(idx)}
                        className="w-4 h-4 rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900 cursor-pointer accent-indigo-500"
                      />
                      <span
                        className={`text-xs sm:text-sm truncate select-none ${
                          st.completed ? 'line-through text-slate-500' : 'text-slate-200 font-medium'
                        }`}
                      >
                        {st.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(idx)}
                      disabled={isUpdatingSubtasks}
                      className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors opacity-80 group-hover:opacity-100"
                      title="Remove subtask"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Quick Add Subtask Input */}
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a new subtask..."
                className="input-field text-xs py-2 bg-slate-900/90"
              />
              <button
                type="submit"
                disabled={!newSubtaskTitle.trim() || isUpdatingSubtasks}
                className="btn-primary text-xs py-2 px-3 shrink-0 flex items-center gap-1 disabled:opacity-50"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Add</span>
              </button>
            </form>
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
