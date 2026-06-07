import { PageHeaderSkeleton, SummaryCardsSkeleton } from '@/components/skeletons';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton showAction />

      <SummaryCardsSkeleton count={4} columns={4} />

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
