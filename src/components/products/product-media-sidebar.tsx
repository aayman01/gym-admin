import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { ChevronLeft, ChevronRight, Loader2, Search, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { PickedImageChips } from '@/components/products/picked-image-chips';
import { useAddToGallery, useGetGallery } from '@/hooks/api/admin/use-gallery';
import { useUploadMedia, validateImageFile } from '@/hooks/api/admin/use-media';
import { ApiError } from '@/lib/api-client';
import {
  GALLERY_PICK_BASE,
  GALLERY_PICK_SHARED,
  GALLERY_PICK_THUMBNAIL,
  getGalleryPickTargetLabel,
  getVariantKey,
  type GalleryPickTarget,
} from '@/lib/product-variant-utils';
import type { CreateProductFormValues } from '@/lib/validators/create-product.schema';

type ProductMediaSidebarProps = {
  form: UseFormReturn<CreateProductFormValues>;
  pickTarget: GalleryPickTarget;
  onPickTargetChange: (target: GalleryPickTarget) => void;
  variantLabels?: Record<string, string>;
};

export function assignGalleryImageToTarget(
  form: UseFormReturn<CreateProductFormValues>,
  target: GalleryPickTarget,
  image: { id: string; url: string },
) {
  if (target === GALLERY_PICK_THUMBNAIL) {
    form.setValue('thumbnailId', image.id, { shouldValidate: true });
    form.setValue('thumbnailUrl', image.url);
    return;
  }

  if (target === GALLERY_PICK_SHARED) {
    const ids = form.getValues('productGalleryImageIds');
    if (ids.includes(image.id)) return;
    form.setValue('productGalleryImageIds', [...ids, image.id], {
      shouldValidate: true,
    });
    form.setValue('productGalleryPreviewUrls', {
      ...form.getValues('productGalleryPreviewUrls'),
      [image.id]: image.url,
    });
    return;
  }

  if (target === GALLERY_PICK_BASE) {
    const bv = form.getValues('baseVariant');
    if (!bv) return;
    const galleryIds = bv.galleryImageIds ?? [];
    if (galleryIds.includes(image.id)) return;
    form.setValue(
      'baseVariant',
      {
        ...bv,
        galleryImageIds: [...galleryIds, image.id],
        galleryPreviewUrls: {
          ...(bv.galleryPreviewUrls ?? {}),
          [image.id]: image.url,
        },
        displayImageId: bv.displayImageId ?? image.id,
        displayImageUrl: bv.displayImageUrl || image.url,
      },
      { shouldValidate: true },
    );
    return;
  }

  const variants = form.getValues('variants');
  const index = variants.findIndex(
    (v) => getVariantKey(v.optionIds) === target,
  );
  if (index === -1) return;

  const variant = variants[index];
  const galleryIds = variant.galleryImageIds ?? [];
  if (galleryIds.includes(image.id)) return;

  const next = [...variants];
  next[index] = {
    ...variant,
    galleryImageIds: [...galleryIds, image.id],
    galleryPreviewUrls: {
      ...(variant.galleryPreviewUrls ?? {}),
      [image.id]: image.url,
    },
    displayImageId: variant.displayImageId ?? image.id,
    displayImageUrl: variant.displayImageUrl || image.url,
  };
  form.setValue('variants', next, { shouldValidate: true });
}

export function ProductMediaSidebar({
  form,
  pickTarget,
  onPickTargetChange,
  variantLabels,
}: ProductMediaSidebarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [saveToGallery, setSaveToGallery] = useState(true);
  const [uploading, setUploading] = useState(false);

  const { mutateAsync: upload } = useUploadMedia();
  const { mutateAsync: addToGallery } = useAddToGallery();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError } = useGetGallery({
    page,
    limit: 24,
    search: debouncedSearch || undefined,
  });

  const items = useMemo(
    () =>
      (data?.data ?? []).map((row) => ({
        id: row.media.id,
        url: row.media.url,
      })),
    [data?.data],
  );

  const thumbnailId = form.watch('thumbnailId');
  const thumbnailUrl = form.watch('thumbnailUrl');
  const sharedIds = form.watch('productGalleryImageIds');
  const sharedUrls = form.watch('productGalleryPreviewUrls');

  const handlePick = useCallback(
    (item: { id: string; url: string }) => {
      assignGalleryImageToTarget(form, pickTarget, item);
    },
    [form, pickTarget],
  );

  const handleUpload = async (file: File) => {
    const validationError = validateImageFile(file, 8);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setUploading(true);
    try {
      const media = await upload(file);
      if (saveToGallery) {
        try {
          await addToGallery(media.id);
        } catch (error) {
          const message =
            error instanceof ApiError
              ? error.message
              : 'Failed to save to gallery';
          toast.error(message);
        }
      }
      assignGalleryImageToTarget(form, pickTarget, {
        id: media.id,
        url: media.url,
      });
      toast.success('Image uploaded');
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Upload failed';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const totalPages = data?.meta.totalPages ?? 0;
  const targetLabel = getGalleryPickTargetLabel(pickTarget, variantLabels);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Thumbnail
        </p>
        <div className="flex items-start gap-3">
          {thumbnailId && thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt="Thumbnail"
              className="size-20 rounded-sm object-cover ring-1 ring-primary/10"
            />
          ) : (
            <div className="flex size-20 items-center justify-center rounded-sm bg-primary/5 ring-1 ring-primary/10">
              <span className="text-[10px] text-muted-foreground">None</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => onPickTargetChange(GALLERY_PICK_THUMBNAIL)}
            className={cn(
              'text-xs font-medium',
              pickTarget === GALLERY_PICK_THUMBNAIL
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary',
            )}
          >
            {pickTarget === GALLERY_PICK_THUMBNAIL
              ? 'Picking thumbnail'
              : 'Set as target →'}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Shared gallery
          </p>
          <button
            type="button"
            onClick={() => onPickTargetChange(GALLERY_PICK_SHARED)}
            className={cn(
              'text-xs font-medium',
              pickTarget === GALLERY_PICK_SHARED
                ? 'text-primary'
                : 'text-muted-foreground hover:text-primary',
            )}
          >
            Add →
          </button>
        </div>
        <PickedImageChips
          items={sharedIds.map((id) => ({
            id,
            url: sharedUrls[id] ?? '',
          }))}
          size="sm"
          onRemove={(id) => {
            form.setValue(
              'productGalleryImageIds',
              form.getValues('productGalleryImageIds').filter((i) => i !== id),
              { shouldValidate: true },
            );
            const urls = { ...form.getValues('productGalleryPreviewUrls') };
            delete urls[id];
            form.setValue('productGalleryPreviewUrls', urls);
          }}
        />
      </div>

      <div className="rounded-sm bg-primary/5 p-3 ring-1 ring-primary/10">
        <p className="text-xs text-muted-foreground">Adding images for:</p>
        <p className="text-sm font-medium">{targetLabel}</p>
      </div>

      <div className="relative">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search gallery..."
          className="rounded-sm border-0 bg-primary/5 pl-8 focus-visible:ring-primary/50"
        />
      </div>

      <div className="max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-sm" />
            ))}
          </div>
        ) : isError ? (
          <p className="py-8 text-center text-xs text-destructive">
            Failed to load gallery.
          </p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            No images — upload below.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePick(item)}
                className="aspect-square overflow-hidden rounded-sm ring-1 ring-primary/10 transition-all hover:ring-primary/40"
              >
                <img
                  src={item.url}
                  alt="Gallery"
                  className="size-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="size-3" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="size-3" />
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2 border-t border-primary/10 pt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <>
              <Upload className="size-4" />
              Upload to library
            </>
          )}
        </Button>
        <label className="flex items-center gap-2 text-xs">
          <Checkbox
            checked={saveToGallery}
            onCheckedChange={(checked) => setSaveToGallery(checked === true)}
            disabled={uploading}
          />
          <Label className="font-normal">Save upload to gallery</Label>
        </label>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
            e.target.value = '';
          }}
        />
      </div>
    </div>
  );
}
