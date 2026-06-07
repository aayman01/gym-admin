import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type PageHeaderSkeletonProps = {
  showAction?: boolean;
  className?: string;
};

export function PageHeaderSkeleton({
  showAction = false,
  className,
}: PageHeaderSkeletonProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-sm" />
        <Skeleton className="h-4 w-72 max-w-full rounded-sm" />
      </div>
      {showAction && <Skeleton className="h-9 w-32 rounded-sm" />}
    </div>
  );
}
