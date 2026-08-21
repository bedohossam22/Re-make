import React, { useState } from 'react';
import type { ITask, TaskStatus } from '../../types';
import KanbanCard from './KanbanCard';
import { KanbanColumnSkeleton } from '../common/Skeleton';

interface KanbanBoardProps {
  tasks: ITask[];
  isLoading: boolean;
  onViewTask: (task: ITask) => void;
  onEditTask: (task: ITask) => void;
  onDeleteTask: (taskId: string) => void;
  onStatusChange: (task: ITask, newStatus: TaskStatus) => void;
  onAddTaskInStatus?: (status: TaskStatus) => void;
}

interface ColumnConfig {
  id: TaskStatus;
  title: string;
  badgeClass: string;
  borderAccentClass: string;
  bgHeaderClass: string;
  iconSvg: React.ReactNode;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'To Do',
    title: 'To Do',
    badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
    borderAccentClass: 'border-t-slate-400',
    bgHeaderClass: 'bg-slate-900/80',
    iconSvg: (
      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
  {
    id: 'In Progress',
    title: 'In Progress',
    badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    borderAccentClass: 'border-t-indigo-500',
    bgHeaderClass: 'bg-indigo-950/30',
    iconSvg: (
      <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    id: 'Done',
    title: 'Completed',
    badgeClass: 'bg-green-500/20 text-green-300 border-green-500/30',
    borderAccentClass: 'border-t-green-500',
    bgHeaderClass: 'bg-green-950/30',
    iconSvg: (
      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  isLoading,
  onViewTask,
  onEditTask,
  onDeleteTask,
  onStatusChange,
  onAddTaskInStatus,
}) => {
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<TaskStatus>('To Do');

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {[1, 2, 3].map((idx) => (
          <KanbanColumnSkeleton key={idx} />
        ))}
      </div>
    );
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, status: TaskStatus) => {
    e.preventDefault();
    if (dragOverColumn === status) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    const taskId = e.dataTransfer.getData('text/plain');
    if (!taskId) return;

    const task = tasks.find((t) => t._id === taskId);
    if (task && task.status !== targetStatus) {
      onStatusChange(task, targetStatus);
    }
  };

  return (
    <div className="w-full">
      {/* Mobile Column Navigation Tabs (< 768px) */}
      <div className="flex md:hidden items-center justify-between p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 mb-5">
        {COLUMNS.map((col) => {
          const count = tasks.filter((t) => t.status === col.id).length;
          const isActive = activeMobileTab === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setActiveMobileTab(col.id)}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{col.title}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? 'bg-indigo-900/60 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid Layout for Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.id);
          const isHovered = dragOverColumn === col.id;
          const isHiddenOnMobile = activeMobileTab !== col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={(e) => handleDragLeave(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`glass-card rounded-2xl flex flex-col min-h-[480px] border-t-4 ${col.borderAccentClass} transition-all duration-200 ${
                isHovered
                  ? 'ring-2 ring-indigo-500/80 bg-slate-900/90 shadow-2xl shadow-indigo-500/10'
                  : 'bg-slate-950/40'
              } ${isHiddenOnMobile ? 'hidden md:flex' : 'flex'}`}
            >
              {/* Column Header */}
              <div className={`p-4 rounded-t-xl flex items-center justify-between border-b border-slate-800/80 ${col.bgHeaderClass}`}>
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
                    {col.iconSvg}
                  </div>
                  <h3 className="font-bold text-slate-200 text-sm tracking-wide">
                    {col.title}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold border ${col.badgeClass}`}>
                    {columnTasks.length}
                  </span>
                </div>

                {onAddTaskInStatus && (
                  <button
                    onClick={() => onAddTaskInStatus(col.id)}
                    title={`Add Task to ${col.id}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-slate-800 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Drop Zone & Task Cards List */}
              <div className="p-3 flex-1 flex flex-col space-y-3 overflow-y-auto max-h-[calc(100vh-260px)] min-h-[220px]">
                {columnTasks.length > 0 ? (
                  columnTasks.map((task) => (
                    <KanbanCard
                      key={task._id}
                      task={task}
                      onView={onViewTask}
                      onEdit={onEditTask}
                      onDelete={onDeleteTask}
                      onStatusChange={onStatusChange}
                    />
                  ))
                ) : (
                  <div className={`flex-1 min-h-[160px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center transition-colors ${
                    isHovered
                      ? 'border-indigo-400 bg-indigo-500/10 text-indigo-300'
                      : 'border-slate-800/80 text-slate-500'
                  }`}>
                    <p className="text-xs font-medium">
                      {isHovered ? 'Drop task here' : `No tasks in ${col.title}`}
                    </p>
                    {!isHovered && onAddTaskInStatus && (
                      <button
                        onClick={() => onAddTaskInStatus(col.id)}
                        className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-semibold"
                      >
                        + Add Task
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
