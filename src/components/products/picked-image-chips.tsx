import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type PickedImage = {
  id: string;
  url: string;
};

type PickedImageChipsProps = {
  items: PickedImage[];
  onRemove?: (id: string) => void;
  size?: 'sm' | 'md';
  className?: string;
};

export function PickedImageChips({
  items,
  onRemove,
  size = 'md',
  className,
}: PickedImageChipsProps) {
  if (!items.length) return null;

  const dim = size === 'sm' ? 'size-12' : 'size-16';

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {items.map((item) => (
        <div key={item.id} className="relative">
          <img
            src={item.url}
            alt=""
            className={cn(
              dim,
              'rounded-sm object-cover ring-1 ring-primary/10',
            )}
          />
          {onRemove && (
            <Button
              type="button"
              variant="destructive"
              size="icon-xs"
              className="absolute -top-1.5 -right-1.5"
              onClick={() => onRemove(item.id)}
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
