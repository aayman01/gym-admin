import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeaderSkeleton } from '@/components/skeletons/page-header-skeleton';

type FormPageSkeletonProps = {
  layout?: 'single' | 'two-column';
  sections?: number;
  showBreadcrumb?: boolean;
  className?: string;
};

function FormSectionSkeleton() {
  return (
    <div className="space-y-4 rounded-sm border border-primary/10 p-4">
      <Skeleton className="h-4 w-28 rounded-sm" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-9 rounded-sm sm:col-span-2" />
        <Skeleton className="h-9 rounded-sm" />
        <Skeleton className="h-9 rounded-sm" />
      </div>
    </div>
  );
}

function FormSidebarSkeleton() {
  return (
    <aside className="space-y-4 lg:w-80 lg:shrink-0">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="space-y-3 rounded-sm border border-primary/10 p-4"
        >
          <Skeleton className="h-4 w-24 rounded-sm" />
          <Skeleton className="h-9 w-full rounded-sm" />
          {i === 1 && (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 6 }).map((_, j) => (
                <Skeleton key={j} className="aspect-square rounded-sm" />
              ))}
            </div>
          )}
        </div>
      ))}
    </aside>
  );
}

export function FormPageSkeleton({
  layout = 'two-column',
  sections = 4,
  showBreadcrumb = true,
  className,
}: FormPageSkeletonProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {showBreadcrumb && (
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16 rounded-sm" />
          <Skeleton className="size-3 rounded-sm" />
          <Skeleton className="h-4 w-24 rounded-sm" />
        </div>
      )}

      <PageHeaderSkeleton />

      {layout === 'two-column' ? (
        <div className="flex flex-col gap-6 lg:flex-row-reverse">
          <FormSidebarSkeleton />
          <div className="min-w-0 flex-1 space-y-4">
            {Array.from({ length: sections }).map((_, i) => (
              <FormSectionSkeleton key={i} />
            ))}
            <div className="flex justify-end gap-3">
              <Skeleton className="h-9 w-24 rounded-sm" />
              <Skeleton className="h-9 w-32 rounded-sm" />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {Array.from({ length: sections }).map((_, i) => (
            <FormSectionSkeleton key={i} />
          ))}
          <div className="flex justify-end gap-3">
            <Skeleton className="h-9 w-24 rounded-sm" />
            <Skeleton className="h-9 w-32 rounded-sm" />
          </div>
        </div>
      )}
    </div>
  );
}
