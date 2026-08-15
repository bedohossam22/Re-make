import React from 'react';
import { ITask, TaskStatus } from '../../types';
import TaskCard from './TaskCard';
import LoadingSpinner from '../common/LoadingSpinner';

interface TaskListProps {
  tasks: ITask[];
  isLoading: boolean;
  onViewTask: (task: ITask) => void;
  onEditTask: (task: ITask) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange?: (task: ITask, newStatus: TaskStatus) => void;
  onCreateTaskClick?: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading,
  onViewTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onCreateTaskClick,
}) => {
  if (isLoading) {
    return (
      <div className="py-16 flex flex-col items-center justify-center">
        <LoadingSpinner message="Fetching your tasks..." />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="glass-card p-12 text-center flex flex-col items-center justify-center my-6">
        <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-slate-200 mb-2">No Tasks Found</h3>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          No tasks match your current criteria. Create a new task or adjust your search filters.
        </p>
        {onCreateTaskClick && (
          <button
            onClick={onCreateTaskClick}
            className="btn-primary text-sm px-5 py-2.5 rounded-xl font-semibold flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Task</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          onView={onViewTask}
          onEdit={onEditTask}
          onDelete={onDeleteTask}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};

export default TaskList;
