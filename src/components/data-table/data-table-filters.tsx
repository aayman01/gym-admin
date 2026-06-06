import { Search } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { DataTableFilterConfig } from '@/components/data-table/data-table.types';

type DataTableFiltersProps = {
  filters: DataTableFilterConfig[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
};

const inputClassName =
  'h-9 rounded-sm border-0 bg-primary/5 text-sm focus-visible:ring-primary/50';

export function DataTableFilters({
  filters,
  values,
  onChange,
}: DataTableFiltersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filters.map((filter) => {
        const value = values[filter.key] ?? '';

        if (filter.type === 'select') {
          return (
            <div key={filter.key} className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {filter.label}
              </Label>
              <Select
                value={value || null}
                onValueChange={(next) => onChange(filter.key, next ?? '')}
              >
                <SelectTrigger className="h-9 w-full rounded-sm border-0 bg-primary/5 focus-visible:ring-primary/50">
                  <SelectValue placeholder={filter.placeholder ?? `All ${filter.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        const isSearch = filter.type === 'search';

        return (
          <div key={filter.key} className="space-y-1.5">
            <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {filter.label}
            </Label>
            <div className="relative">
              {isSearch ? (
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-primary/70" />
              ) : null}
              <Input
                value={value}
                placeholder={filter.placeholder}
                onChange={(event) => onChange(filter.key, event.target.value)}
                className={isSearch ? `${inputClassName} pl-9` : inputClassName}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
