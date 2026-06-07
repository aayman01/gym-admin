import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { GalleryItem } from '@/types/gallery-type';

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type GalleryPreviewDialogProps = {
  item: GalleryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function GalleryPreviewDialog({
  item,
  open,
  onOpenChange,
}: GalleryPreviewDialogProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopyUrl() {
    if (!item) return;
    try {
      await navigator.clipboard.writeText(item.media.url);
      setCopied(true);
      toast.success('URL copied to clipboard');
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy URL');
    }
  }

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Image preview</DialogTitle>
          <DialogDescription>
            {item.media.mimeType} · {formatFileSize(item.media.size)} ·{' '}
            {formatDate(item.media.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-sm bg-primary/5 ring-1 ring-primary/10">
          <img
            src={item.media.url}
            alt="Gallery preview"
            className="max-h-[50vh] max-w-full object-contain"
          />
        </div>

        <div className="space-y-2">
          <p className="truncate text-xs text-muted-foreground">
            {item.media.url}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-sm"
            onClick={() => void handleCopyUrl()}
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
            Copy URL
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
