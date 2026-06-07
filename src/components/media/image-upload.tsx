import { useCallback, useRef, useState } from 'react';
import { Images, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { GalleryPickerDialog } from '@/components/media/gallery-picker-dialog';
import { useAddToGallery } from '@/hooks/api/admin/use-gallery';
import { useUploadMedia, validateImageFile } from '@/hooks/api/admin/use-media';
import { ApiError } from '@/lib/api-client';

type ImageUploadProps = {
  value?: string | null;
  previewUrl?: string | null;
  onChange: (mediaId: string, url: string) => void;
  onRemove: () => void;
  label?: string;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  className?: string;
  allowGalleryPick?: boolean;
  showSaveToGallery?: boolean;
};

export function ImageUpload({
  value,
  previewUrl,
  onChange,
  onRemove,
  label = 'Upload image',
  accept = 'image/*',
  maxSizeMB = 8,
  disabled = false,
  className,
  allowGalleryPick = true,
  showSaveToGallery = true,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [saveToGallery, setSaveToGallery] = useState(false);
  const { mutateAsync: upload, isPending } = useUploadMedia();
  const { mutateAsync: addToGallery } = useAddToGallery();

  const maybeSaveToGallery = useCallback(
    async (mediaId: string) => {
      if (!saveToGallery) return;
      try {
        await addToGallery(mediaId);
        toast.success('Image saved to gallery');
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Failed to save to gallery';
        toast.error(message);
      }
    },
    [addToGallery, saveToGallery],
  );

  const handleFile = useCallback(
    async (file: File) => {
      setLocalError(null);
      const validationError = validateImageFile(file, maxSizeMB);
      if (validationError) {
        setLocalError(validationError);
        toast.error(validationError);
        return;
      }

      try {
        const media = await upload(file);
        onChange(media.id, media.url);
        await maybeSaveToGallery(media.id);
      } catch (error) {
        const message =
          error instanceof ApiError ? error.message : 'Upload failed';
        setLocalError(message);
        toast.error(message);
      }
    },
    [maxSizeMB, maybeSaveToGallery, onChange, upload],
  );

  const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void handleFile(file);
    event.target.value = '';
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    if (disabled || isPending) return;
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      )}

      {value && previewUrl ? (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Upload preview"
            className="h-32 w-32 rounded-sm object-cover ring-1 ring-primary/10"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon-xs"
              className="absolute -top-2 -right-2"
              onClick={onRemove}
            >
              <X className="size-3" />
            </Button>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={cn(
            'flex min-h-32 flex-col items-center justify-center gap-2 rounded-sm bg-primary/5 p-4 ring-1 ring-primary/10 transition-colors',
            dragOver && 'bg-primary/10 ring-primary/30',
            disabled && 'opacity-50',
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-xs text-muted-foreground">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="size-5 text-muted-foreground" />
              <p className="text-xs text-muted-foreground">
                Drag & drop or click to upload
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={disabled}
                  onClick={() => inputRef.current?.click()}
                >
                  Choose file
                </Button>
                {allowGalleryPick && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    onClick={() => setGalleryOpen(true)}
                  >
                    <Images className="size-4" />
                    Choose from gallery
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {!value && showSaveToGallery && (
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={saveToGallery}
            onCheckedChange={(checked) => setSaveToGallery(checked === true)}
            disabled={disabled || isPending}
          />
          <Label className="font-normal">Save upload to gallery</Label>
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || isPending}
        onChange={onInputChange}
      />

      {localError && (
        <p className="text-xs text-destructive">{localError}</p>
      )}

      {allowGalleryPick && (
        <GalleryPickerDialog
          open={galleryOpen}
          onOpenChange={setGalleryOpen}
          mode="single"
          selectedIds={value ? [value] : []}
          onConfirm={(items) => {
            const item = items[0];
            if (item) onChange(item.id, item.url);
          }}
        />
      )}
    </div>
  );
}
