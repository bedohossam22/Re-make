import React from 'react';
import { TaskFilterState } from '../../types';

interface TaskFiltersProps {
  filters: TaskFilterState;
  onFilterChange: (newFilters: TaskFilterState) => void;
  onReset: () => void;
  totalTasks: number;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
  totalTasks,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, status: e.target.value });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, priority: e.target.value });
  };

  const hasActiveFilters = Boolean(filters.search || filters.status || filters.priority);

  return (
    <div className="glass-card p-4 sm:p-5 mb-6">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={filters.search || ''}
            onChange={handleSearchChange}
            placeholder="Search tasks by title..."
            className="input-field pl-10 pr-10 py-2.5 text-sm w-full"
          />
          {filters.search && (
            <button
              onClick={() => onFilterChange({ ...filters, search: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdowns & Actions */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          {/* Status Dropdown */}
          <select
            value={filters.status || ''}
            onChange={handleStatusChange}
            className="input-field py-2.5 px-3 text-sm bg-slate-900/80 cursor-pointer min-w-[130px]"
          >
            <option value="">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>

          {/* Priority Dropdown */}
          <select
            value={filters.priority || ''}
            onChange={handlePriorityChange}
            className="input-field py-2.5 px-3 text-sm bg-slate-900/80 cursor-pointer min-w-[130px]"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Clear Button */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="btn-secondary py-2.5 px-4 text-xs font-medium shrink-0 flex items-center space-x-1 hover:border-slate-500"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;
