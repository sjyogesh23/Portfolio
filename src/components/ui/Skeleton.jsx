// Reusable shimmer skeleton blocks

export function SkeletonBox({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} />
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4 rounded"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`rounded-2xl p-5 border border-border space-y-3 ${className}`}>
      <SkeletonBox className="h-40 w-full" />
      <SkeletonBox className="h-5 w-3/4" />
      <SkeletonText lines={2} />
      <div className="flex gap-2">
        <SkeletonBox className="h-6 w-16 rounded-full" />
        <SkeletonBox className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}

export function SkeletonHero() {
  return (
    <div className="min-h-screen flex items-center px-6 md:px-16 space-x-8">
      <div className="flex-1 space-y-6">
        <SkeletonBox className="h-6 w-32" />
        <SkeletonBox className="h-14 w-3/4" />
        <SkeletonBox className="h-10 w-1/2" />
        <SkeletonText lines={2} className="max-w-md" />
        <div className="flex gap-4">
          <SkeletonBox className="h-12 w-36 rounded-full" />
          <SkeletonBox className="h-12 w-36 rounded-full" />
        </div>
      </div>
      <SkeletonBox className="hidden md:block h-64 w-64 rounded-full flex-shrink-0" />
    </div>
  )
}

export function SkeletonTimeline({ count = 3 }) {
  return (
    <div className="space-y-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-6">
          <div className="flex flex-col items-center">
            <SkeletonBox className="h-4 w-4 rounded-full flex-shrink-0" />
            {i < count - 1 && <div className="skeleton w-0.5 flex-1 mt-2" />}
          </div>
          <div className="flex-1 pb-8 space-y-3">
            <SkeletonBox className="h-5 w-1/2" />
            <SkeletonBox className="h-4 w-1/3" />
            <SkeletonText lines={3} />
          </div>
        </div>
      ))}
    </div>
  )
}

export function SkeletonGrid({ count = 6, cols = 3 }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${cols} gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
