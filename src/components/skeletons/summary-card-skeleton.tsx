import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type SummaryCardSkeletonProps = {
  className?: string;
};

export function SummaryCardSkeleton({ className }: SummaryCardSkeletonProps) {
  return (
    <div
      className={cn(
        'rounded-sm bg-card p-4 ring-1 ring-primary/10 shadow-sm',
        className,
      )}
    >
      <Skeleton className="h-3 w-24 rounded-sm" />
      <Skeleton className="mt-3 h-8 w-32 rounded-sm" />
      <div className="mt-3 flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-3 w-20 rounded-sm" />
      </div>
    </div>
  );
}

type SummaryCardsSkeletonProps = {
  count?: number;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
};

const columnClass: Record<NonNullable<SummaryCardsSkeletonProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 md:grid-cols-2',
  3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
  4: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4',
};

export function SummaryCardsSkeleton({
  count = 4,
  columns = 4,
  className,
}: SummaryCardsSkeletonProps) {
  return (
    <div className={cn('grid gap-4', columnClass[columns], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SummaryCardSkeleton key={i} />
      ))}
    </div>
  );
}
