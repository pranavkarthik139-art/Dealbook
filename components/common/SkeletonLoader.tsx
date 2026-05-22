'use client';

interface SkeletonLoaderProps {
  lines?: number;
  width?: string;
  height?: string;
  variant?: 'text' | 'card' | 'title' | 'page';
}

export function SkeletonLoader({
  lines = 3,
  width = '100%',
  height = '16px',
  variant = 'text'
}: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200';

  if (variant === 'title') {
    return (
      <div className={`${baseClasses} h-8 w-2/3 mb-6`} />
    );
  }

  if (variant === 'card') {
    return (
      <div className="space-y-4 p-6 bg-white rounded-lg border border-line">
        <div className={`${baseClasses} h-6 w-1/3`} />
        <div className={`${baseClasses} h-4 w-full`} />
        <div className={`${baseClasses} h-4 w-5/6`} />
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div className="space-y-6">
        <div className={`${baseClasses} h-10 w-1/2`} />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`${baseClasses} h-24`} />
          ))}
        </div>
        <div className={`${baseClasses} h-64 w-full`} />
      </div>
    );
  }

  return (
    <div className="space-y-3" style={{ width }}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className={baseClasses}
          style={{
            height,
            width: i === lines - 1 ? '80%' : width,
          }}
        />
      ))}
    </div>
  );
}

export function DealDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Column */}
      <div className="lg:col-span-2 space-y-12">
        {/* Header */}
        <div>
          <SkeletonLoader variant="title" />
          <div className="grid grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <SkeletonLoader width="60px" height="12px" />
                <SkeletonLoader width="100%" height="24px" />
              </div>
            ))}
          </div>
        </div>

        {/* Company Enrichment */}
        <div className="space-y-4">
          <SkeletonLoader variant="card" />
        </div>

        {/* Contacts */}
        <div className="space-y-4">
          <SkeletonLoader width="100px" height="14px" />
          {[...Array(3)].map((_, i) => (
            <SkeletonLoader key={i} variant="card" />
          ))}
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <SkeletonLoader variant="card" />
          <SkeletonLoader variant="card" />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <SkeletonLoader key={i} variant="card" />
        ))}
      </div>
    </div>
  );
}
