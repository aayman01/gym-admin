import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetGallery } from '@/hooks/api/admin/use-gallery';

export type GalleryPickerItem = {
  id: string;
  url: string;
};

type GalleryPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'single' | 'multiple';
  selectedIds?: string[];
  excludeIds?: string[];
  onConfirm: (items: GalleryPickerItem[]) => void;
};

export function GalleryPickerDialog({
  open,
  onOpenChange,
  mode,
  selectedIds = [],
  excludeIds = [],
  onConfirm,
}: GalleryPickerDialogProps) {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pendingSelection, setPendingSelection] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    if (open) {
      setPendingSelection(selectedIds);
      setSearchInput('');
      setDebouncedSearch('');
      setPage(1);
    }
  }, [open, selectedIds]);

  const { data, isLoading, isError } = useGetGallery(
    { page, limit: 24, search: debouncedSearch || undefined },
    { enabled: open },
  );

  const items = useMemo(
    () =>
      (data?.data ?? [])
        .map((row) => ({
          id: row.media.id,
          url: row.media.url,
        }))
        .filter((item) => !excludeIds.includes(item.id)),
    [data?.data, excludeIds],
  );

  const toggleItem = (item: GalleryPickerItem) => {
    if (mode === 'single') {
      setPendingSelection([item.id]);
      return;
    }

    setPendingSelection((current) =>
      current.includes(item.id)
        ? current.filter((id) => id !== item.id)
        : [...current, item.id],
    );
  };

  const handleConfirm = () => {
    const selected = items.filter((item) => pendingSelection.includes(item.id));
    onConfirm(selected);
    onOpenChange(false);
  };

  const totalPages = data?.meta.totalPages ?? 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'single' ? 'Choose image' : 'Choose images'}
          </DialogTitle>
          <DialogDescription>
            Select from your admin gallery. Upload new images first if the
            gallery is empty.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search gallery..."
            className="rounded-sm border-0 bg-primary/5 pl-8 focus-visible:ring-primary/50"
          />
        </div>

        <div className="min-h-[280px] flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-sm" />
              ))}
            </div>
          ) : isError ? (
            <p className="py-12 text-center text-sm text-destructive">
              Failed to load gallery images.
            </p>
          ) : items.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No images in gallery — upload one first.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.map((item) => {
                const isSelected = pendingSelection.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item)}
                    className={cn(
                      'relative aspect-square overflow-hidden rounded-sm ring-2 transition-all',
                      isSelected
                        ? 'ring-primary'
                        : 'ring-primary/10 hover:ring-primary/40',
                    )}
                  >
                    <img
                      src={item.url}
                      alt="Gallery"
                      className="size-full object-cover"
                    />
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center bg-primary/30">
                        <Check className="size-6 text-primary-foreground" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={pendingSelection.length === 0}
          >
            Confirm selection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
