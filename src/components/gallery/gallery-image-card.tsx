import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { GalleryItem } from '@/types/gallery-type';

type GalleryImageCardProps = {
  item: GalleryItem;
  isFirst: boolean;
  isLast: boolean;
  disabled?: boolean;
  onView: (item: GalleryItem) => void;
  onRemove: (item: GalleryItem) => void;
  onMoveLeft: (item: GalleryItem) => void;
  onMoveRight: (item: GalleryItem) => void;
};

export function GalleryImageCard({
  item,
  isFirst,
  isLast,
  disabled = false,
  onView,
  onRemove,
  onMoveLeft,
  onMoveRight,
}: GalleryImageCardProps) {
  return (
    <div
      className={cn(
        'group relative aspect-square overflow-hidden rounded-sm ring-1 ring-primary/10',
        disabled && 'opacity-60',
      )}
    >
      <img
        src={item.media.url}
        alt="Gallery"
        className="size-full object-cover"
      />

      <div className="absolute inset-0 flex flex-col justify-between bg-black/0 p-2 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="secondary"
            size="icon-xs"
            disabled={disabled}
            onClick={() => onView(item)}
            aria-label="View image"
          >
            <Eye className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon-xs"
            disabled={disabled}
            onClick={() => onRemove(item)}
            aria-label="Remove from gallery"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>

        <div className="flex justify-center gap-1">
          <Button
            type="button"
            variant="secondary"
            size="icon-xs"
            disabled={disabled || isFirst}
            onClick={() => onMoveLeft(item)}
            aria-label="Move left"
          >
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="icon-xs"
            disabled={disabled || isLast}
            onClick={() => onMoveRight(item)}
            aria-label="Move right"
          >
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
