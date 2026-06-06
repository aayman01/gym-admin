import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTableFilters } from '@/components/data-table/data-table-filters';
import type { DataTableFilterConfig } from '@/components/data-table/data-table.types';

type DataTableToolbarProps = {
  filters?: DataTableFilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onFiltersReset?: () => void;
};

export function DataTableToolbar({
  filters,
  filterValues = {},
  onFilterChange,
  onFiltersReset,
}: DataTableToolbarProps) {
  if (!filters?.length || !onFilterChange) {
    return null;
  }

  const hasActiveFilters = Object.values(filterValues).some(Boolean);

  return (
    <div className="space-y-3 rounded-sm bg-card p-4 ring-1 ring-primary/10">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Filters
        </p>
        {hasActiveFilters && onFiltersReset ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 rounded-sm text-primary hover:bg-primary/10"
            onClick={onFiltersReset}
          >
            <X className="size-3.5" />
            Reset
          </Button>
        ) : null}
      </div>

      <DataTableFilters
        filters={filters}
        values={filterValues}
        onChange={onFilterChange}
      />
    </div>
  );
}
