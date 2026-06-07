import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-sm" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Skeleton className="h-[360px] rounded-sm xl:col-span-2" />
        <Skeleton className="h-[360px] rounded-sm" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Skeleton className="h-[360px] rounded-sm" />
        <Skeleton className="h-[360px] rounded-sm" />
      </div>
    </div>
  );
}
