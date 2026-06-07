import { useRef, useState } from 'react';
import { Images, Loader2, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { GalleryPickerDialog } from '@/components/media/gallery-picker-dialog';
import { useAddToGallery } from '@/hooks/api/admin/use-gallery';
import { useUploadMedia, validateImageFile } from '@/hooks/api/admin/use-media';
import { ApiError } from '@/lib/api-client';

type GalleryItem = {
  id: string;
  url: string;
};

type ImageGalleryUploadProps = {
  value: GalleryItem[];
  onChange: (items: GalleryItem[]) => void;
  label?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
  allowGalleryPick?: boolean;
  showSaveToGallery?: boolean;
};

export function ImageGalleryUpload({
  value,
  onChange,
  label = 'Gallery images',
  maxSizeMB = 8,
  disabled = false,
  className,
  allowGalleryPick = true,
  showSaveToGallery = true,
}: ImageGalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [saveToGallery, setSaveToGallery] = useState(false);
  const { mutateAsync: upload } = useUploadMedia();
  const { mutateAsync: addToGallery } = useAddToGallery();

  const mergeItems = (incoming: GalleryItem[]) => {
    const map = new Map(value.map((item) => [item.id, item]));
    for (const item of incoming) {
      map.set(item.id, item);
    }
    onChange(Array.from(map.values()));
  };

  const maybeSaveToGallery = async (mediaId: string) => {
    if (!saveToGallery) return;
    try {
      await addToGallery(mediaId);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to save to gallery';
      toast.error(message);
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;

    setIsUploading(true);
    const next = [...value];

    try {
      for (const file of Array.from(files)) {
        const validationError = validateImageFile(file, maxSizeMB);
        if (validationError) {
          toast.error(validationError);
          continue;
        }

        const media = await upload(file);
        if (!next.some((item) => item.id === media.id)) {
          next.push({ id: media.id, url: media.url });
          await maybeSaveToGallery(media.id);
        }
      }
      onChange(next);
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Upload failed';
      toast.error(message);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const removeItem = (id: string) => {
    onChange(value.filter((item) => item.id !== id));
  };

  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        {value.map((item) => (
          <div key={item.id} className="relative">
            <img
              src={item.url}
              alt="Gallery item"
              className="h-24 w-24 rounded-sm object-cover ring-1 ring-primary/10"
            />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="icon-xs"
                className="absolute -top-2 -right-2"
                onClick={() => removeItem(item.id)}
              >
                <X className="size-3" />
              </Button>
            )}
          </div>
        ))}

        <button
          type="button"
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-sm bg-primary/5 ring-1 ring-primary/10 transition-colors hover:bg-primary/10 disabled:opacity-50"
        >
          {isUploading ? (
            <Loader2 className="size-5 animate-spin text-primary" />
          ) : (
            <>
              <Plus className="size-5 text-muted-foreground" />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Upload
              </span>
            </>
          )}
        </button>

        {allowGalleryPick && (
          <button
            type="button"
            disabled={disabled || isUploading}
            onClick={() => setGalleryOpen(true)}
            className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-sm bg-primary/5 ring-1 ring-primary/10 transition-colors hover:bg-primary/10 disabled:opacity-50"
          >
            <Images className="size-5 text-muted-foreground" />
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              From gallery
            </span>
          </button>
        )}
      </div>

      {showSaveToGallery && (
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={saveToGallery}
            onCheckedChange={(checked) => setSaveToGallery(checked === true)}
            disabled={disabled || isUploading}
          />
          <Label className="font-normal">Save uploads to gallery</Label>
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={disabled || isUploading}
        onChange={(e) => void handleFiles(e.target.files)}
      />

      {allowGalleryPick && (
        <GalleryPickerDialog
          open={galleryOpen}
          onOpenChange={setGalleryOpen}
          mode="multiple"
          selectedIds={value.map((item) => item.id)}
          onConfirm={(items) => mergeItems(items)}
        />
      )}
    </div>
  );
}
