import React, { useState } from 'react';
import type { ITask } from '../../types';

interface NotificationBannerProps {
  tasks: ITask[];
  onFilterOverdue?: () => void;
  onFilterDueSoon?: () => void;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  tasks,
  onFilterOverdue,
  onFilterDueSoon,
}) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !tasks.length) return null;

  const now = new Date();
  const fortyEightHours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const overdueTasks = tasks.filter((t) => {
    if (t.status === 'Done') return false;
    const due = new Date(t.dueDate);
    return due < now;
  });

  const dueSoonTasks = tasks.filter((t) => {
    if (t.status === 'Done') return false;
    const due = new Date(t.dueDate);
    return due >= now && due <= fortyEightHours;
  });

  if (overdueTasks.length === 0 && dueSoonTasks.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-amber-950/30 to-gray-900/60 p-4 shadow-xl backdrop-blur-md transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
            <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-white text-sm flex items-center gap-2">
              Task Attention Required
              {overdueTasks.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500/20 text-red-300 border border-red-500/40">
                  {overdueTasks.length} Overdue
                </span>
              )}
              {dueSoonTasks.length > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {dueSoonTasks.length} Due Soon
                </span>
              )}
            </h4>
            <p className="text-xs text-gray-300 mt-0.5">
              {overdueTasks.length > 0
                ? `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''} that need urgent attention.`
                : `You have ${dueSoonTasks.length} task${dueSoonTasks.length > 1 ? 's' : ''} due in the next 48 hours.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center">
          {overdueTasks.length > 0 && onFilterOverdue && (
            <button
              onClick={onFilterOverdue}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/40 transition-colors cursor-pointer"
            >
              View Overdue
            </button>
          )}
          {dueSoonTasks.length > 0 && onFilterDueSoon && (
            <button
              onClick={onFilterDueSoon}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition-colors cursor-pointer"
            >
              View Due Soon
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            title="Dismiss notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
