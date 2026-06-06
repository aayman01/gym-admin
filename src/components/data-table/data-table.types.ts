import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  SortingState,
  Table as TanStackTable,
} from '@tanstack/react-table';

export type DataTableFilterOption = {
  label: string;
  value: string;
};

export type DataTableSearchFilter = {
  key: string;
  type: 'search';
  label: string;
  placeholder?: string;
};

export type DataTableSelectFilter = {
  key: string;
  type: 'select';
  label: string;
  placeholder?: string;
  options: DataTableFilterOption[];
};

export type DataTableTextFilter = {
  key: string;
  type: 'text';
  label: string;
  placeholder?: string;
};

export type DataTableFilterConfig =
  | DataTableSearchFilter
  | DataTableSelectFilter
  | DataTableTextFilter;

export type DataTableProps<TData> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  filters?: DataTableFilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;
  onFiltersReset?: () => void;
  isLoading?: boolean;
  emptyMessage?: string;
  manualPagination?: boolean;
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  manualSorting?: boolean;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
};

export type { ColumnDef, TanStackTable, PaginationState, SortingState };
