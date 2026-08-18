import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/common/Navbar';
import TaskFilters from '../components/tasks/TaskFilters';
import type { ViewMode } from '../components/tasks/TaskFilters';
import TaskList from '../components/tasks/TaskList';
import KanbanBoard from '../components/tasks/KanbanBoard';
import TaskForm from '../components/tasks/TaskForm';
import TaskDetails from '../components/tasks/TaskDetails';
import type { ITask, TaskFilterState, TaskStatus } from '../types';
import { taskService } from '../services/api';
import { isOverdue, getErrorMessage } from '../utils/helpers';

export const DashboardPage: React.FC = () => {
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [filters, setFilters] = useState<TaskFilterState>({});
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [initialFormStatus, setInitialFormStatus] = useState<TaskStatus | undefined>(undefined);

  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [selectedTask, setSelectedTask] = useState<ITask | null>(null);

  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch tasks
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await taskService.getTasks(filters);
      if (response.success && response.data) {
        setTasks(response.data);
      }
    } catch (err: any) {
      const msg = getErrorMessage(err);
      toast.error(`Failed to load tasks: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Handlers for Modals
  const handleOpenCreateModal = (status?: TaskStatus) => {
    setEditingTask(null);
    setInitialFormStatus(status);
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (task: ITask) => {
    setEditingTask(task);
    setInitialFormStatus(undefined);
    setIsFormOpen(true);
  };

  const handleOpenDetailsModal = (task: ITask) => {
    setSelectedTask(task);
    setIsDetailsOpen(true);
  };

  const handleStatusChange = async (task: ITask, newStatus: TaskStatus) => {
    try {
      const response = await taskService.updateTask(task._id, { status: newStatus });
      if (response.success && response.data) {
        setTasks((prev) =>
          prev.map((t) => (t._id === task._id ? response.data! : t))
        );
        toast.success(`Task moved to ${newStatus}`);
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTaskId) return;
    setIsDeleting(true);
    try {
      await taskService.deleteTask(deletingTaskId);
      toast.success('Task deleted successfully');
      setTasks((prev) => prev.filter((t) => t._id !== deletingTaskId));
      setDeletingTaskId(null);
    } catch (err: any) {
      toast.error(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  // Stats calculation
  const totalCount = tasks.length;
  const todoCount = tasks.filter((t) => t.status === 'To Do').length;
  const progressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const doneCount = tasks.filter((t) => t.status === 'Done').length;
  const overdueCount = tasks.filter((t) => isOverdue(t.dueDate, t.status)).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Task Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Organize, track, and accomplish your tasks efficiently.
            </p>
          </div>

          <button
            onClick={() => handleOpenCreateModal()}
            className="btn-primary py-3 px-5 rounded-xl font-semibold flex items-center justify-center space-x-2 shrink-0 shadow-lg shadow-indigo-500/25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Task</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-8">
          <div className="glass-card p-4 flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-100 mt-2">{totalCount}</span>
          </div>

          <div className="glass-card p-4 flex flex-col justify-between border-l-4 border-l-slate-400">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">To Do</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-200 mt-2">{todoCount}</span>
          </div>

          <div className="glass-card p-4 flex flex-col justify-between border-l-4 border-l-blue-500">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">In Progress</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-blue-300 mt-2">{progressCount}</span>
          </div>

          <div className="glass-card p-4 flex flex-col justify-between border-l-4 border-l-green-500">
            <span className="text-xs font-semibold text-green-400 uppercase tracking-wider">Done</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-green-300 mt-2">{doneCount}</span>
          </div>

          <div className="glass-card p-4 flex flex-col justify-between border-l-4 border-l-red-500 col-span-2 sm:col-span-1">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider">Overdue</span>
            <span className="text-2xl sm:text-3xl font-extrabold text-red-400 mt-2">{overdueCount}</span>
          </div>
        </div>

        {/* Filters */}
        <TaskFilters
          filters={filters}
          onFilterChange={setFilters}
          onReset={() => setFilters({})}
          totalTasks={totalCount}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Task Grid / Kanban Board */}
        {viewMode === 'grid' ? (
          <TaskList
            tasks={tasks}
            isLoading={isLoading}
            onViewTask={handleOpenDetailsModal}
            onEditTask={handleOpenEditModal}
            onDeleteTask={(id) => setDeletingTaskId(id)}
            onStatusChange={handleStatusChange}
            onCreateTaskClick={() => handleOpenCreateModal()}
          />
        ) : (
          <KanbanBoard
            tasks={tasks}
            isLoading={isLoading}
            onViewTask={handleOpenDetailsModal}
            onEditTask={handleOpenEditModal}
            onDeleteTask={(id) => setDeletingTaskId(id)}
            onStatusChange={handleStatusChange}
            onAddTaskInStatus={(status) => handleOpenCreateModal(status)}
          />
        )}
      </main>

      {/* Task Create / Edit Modal */}
      <TaskForm
        isOpen={isFormOpen}
        task={editingTask}
        initialStatus={initialFormStatus}
        onClose={() => setIsFormOpen(false)}
        onSubmitSuccess={fetchTasks}
      />

      {/* Task View Details Modal */}
      <TaskDetails
        isOpen={isDetailsOpen}
        task={selectedTask}
        onClose={() => setIsDetailsOpen(false)}
        onEdit={handleOpenEditModal}
        onDelete={(id) => setDeletingTaskId(id)}
      />

      {/* Delete Confirmation Dialog */}
      {deletingTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-card max-w-sm w-full p-6 text-center border border-red-500/30">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Delete Task?</h3>
            <p className="text-xs text-slate-400 mb-6">
              Are you sure you want to delete this task? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={() => setDeletingTaskId(null)}
                disabled={isDeleting}
                className="btn-secondary text-xs py-2 px-4 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="btn-danger text-xs py-2 px-4 rounded-lg flex items-center space-x-1"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
