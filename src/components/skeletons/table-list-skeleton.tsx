import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type TableListSkeletonProps = {
  rows?: number;
  columns?: number;
  showToolbar?: boolean;
  showPagination?: boolean;
  className?: string;
};

export function TableListSkeleton({
  rows = 10,
  columns = 5,
  showToolbar = true,
  showPagination = true,
  className,
}: TableListSkeletonProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {showToolbar && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-wrap gap-2">
            <Skeleton className="h-9 w-full max-w-xs rounded-sm" />
            <Skeleton className="h-9 w-32 rounded-sm" />
            <Skeleton className="h-9 w-32 rounded-sm" />
          </div>
          <Skeleton className="h-9 w-24 rounded-sm" />
        </div>
      )}

      <div className="overflow-hidden rounded-sm bg-card ring-1 ring-primary/10">
        <Table>
          <TableHeader>
            <TableRow className="border-primary/10 hover:bg-transparent">
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i} className="h-11 px-3">
                  <Skeleton className="h-3 w-20 rounded-sm" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, row) => (
              <TableRow key={row} className="border-primary/10">
                {Array.from({ length: columns }).map((_, cell) => (
                  <TableCell key={cell} className="px-3 py-3">
                    <Skeleton
                      className={cn(
                        'h-4 rounded-sm',
                        cell === 0 ? 'w-10' : 'w-full max-w-40',
                      )}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {showPagination && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32 rounded-sm" />
          <div className="flex gap-2">
            <Skeleton className="size-8 rounded-sm" />
            <Skeleton className="size-8 rounded-sm" />
            <Skeleton className="size-8 rounded-sm" />
          </div>
        </div>
      )}
    </div>
  );
}
