import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => {
  return (
    <div
      className={`skeleton-shimmer rounded-md ${className}`}
      style={style}
    />
  );
};

export const TaskCardSkeleton: React.FC = () => {
  return (
    <div className="glass-card p-5 flex flex-col justify-between h-48 border border-slate-800/80">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>

        {/* Title */}
        <Skeleton className="h-6 w-3/4 mb-3 rounded-lg" />

        {/* Description lines */}
        <Skeleton className="h-3.5 w-full mb-2 rounded" />
        <Skeleton className="h-3.5 w-2/3 rounded" />
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded" />
        <div className="flex space-x-1.5">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="w-7 h-7 rounded-lg" />
        </div>
      </div>
    </div>
  );
};

export const KanbanColumnSkeleton: React.FC = () => {
  return (
    <div className="glass-card rounded-2xl flex flex-col min-h-[500px] border-t-4 border-t-slate-700 bg-slate-950/40 p-4 space-y-4">
      {/* Column Header Skeleton */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <Skeleton className="w-7 h-7 rounded-lg" />
          <Skeleton className="h-5 w-24 rounded" />
          <Skeleton className="w-6 h-5 rounded-full" />
        </div>
        <Skeleton className="w-6 h-6 rounded-lg" />
      </div>

      {/* Cards Skeletons */}
      <div className="space-y-3 flex-1">
        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="w-4 h-4 rounded" />
          </div>
          <Skeleton className="h-5 w-4/5 rounded" />
          <Skeleton className="h-3 w-full rounded" />
          <div className="pt-2 border-t border-slate-800 flex justify-between">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-3.5 w-16 rounded" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="w-4 h-4 rounded" />
          </div>
          <Skeleton className="h-5 w-3/4 rounded" />
          <Skeleton className="h-3 w-5/6 rounded" />
          <div className="pt-2 border-t border-slate-800 flex justify-between">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-3.5 w-16 rounded" />
          </div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-3 hidden sm:block">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16 rounded-full" />
            <Skeleton className="w-4 h-4 rounded" />
          </div>
          <Skeleton className="h-5 w-2/3 rounded" />
          <div className="pt-2 border-t border-slate-800 flex justify-between">
            <Skeleton className="h-3.5 w-20 rounded" />
            <Skeleton className="h-3.5 w-16 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
};

export const StatsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`glass-card p-4 flex flex-col justify-between ${
            i === 5 ? 'col-span-2 sm:col-span-1' : ''
          }`}
        >
          <Skeleton className="h-3.5 w-16 rounded uppercase mb-2" />
          <Skeleton className="h-8 w-12 rounded-lg mt-1" />
        </div>
      ))}
    </div>
  );
};

export default Skeleton;
