import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { GalleryImageCard } from '@/components/gallery/gallery-image-card';
import { GalleryPreviewDialog } from '@/components/gallery/gallery-preview-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAddToGallery,
  useGetGallery,
  useRemoveFromGallery,
  useSwapGalleryOrder,
} from '@/hooks/api/admin/use-gallery';
import { useUploadMedia, validateImageFile } from '@/hooks/api/admin/use-media';
import { ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { GalleryItem } from '@/types/gallery-type';

const PAGE_LIMIT = 24;

export function GalleryPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewItem, setPreviewItem] = useState<GalleryItem | null>(null);
  const [removeTarget, setRemoveTarget] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const { data, isLoading, isError, refetch, isFetching } = useGetGallery({
    page,
    limit: PAGE_LIMIT,
    search: debouncedSearch || undefined,
  });

  const uploadMedia = useUploadMedia();
  const addToGallery = useAddToGallery();
  const removeFromGallery = useRemoveFromGallery();
  const swapGalleryOrder = useSwapGalleryOrder();

  const items = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 0;
  const isBusy =
    isUploading ||
    removeFromGallery.isPending ||
    swapGalleryOrder.isPending;

  const handleUploadFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length) return;

      setIsUploading(true);
      let uploaded = 0;
      let failed = 0;

      try {
        for (const file of Array.from(files)) {
          const validationError = validateImageFile(file);
          if (validationError) {
            toast.error(validationError);
            failed += 1;
            continue;
          }

          try {
            const media = await uploadMedia.mutateAsync(file);
            try {
              await addToGallery.mutateAsync(media.id);
              uploaded += 1;
            } catch (error) {
              if (
                error instanceof ApiError &&
                error.status === 409
              ) {
                uploaded += 1;
              } else {
                const message =
                  error instanceof ApiError
                    ? error.message
                    : 'Failed to add to gallery';
                toast.error(message);
                failed += 1;
              }
            }
          } catch (error) {
            const message =
              error instanceof ApiError ? error.message : 'Upload failed';
            toast.error(message);
            failed += 1;
          }
        }

        if (uploaded > 0) {
          toast.success(
            uploaded === 1
              ? 'Image uploaded to gallery'
              : `${uploaded} images uploaded to gallery`,
          );
        }
        if (failed > 0 && uploaded === 0) {
          toast.error('No images were uploaded');
        }
      } finally {
        setIsUploading(false);
        if (inputRef.current) inputRef.current.value = '';
      }
    },
    [addToGallery, uploadMedia],
  );

  async function handleRemove() {
    if (!removeTarget) return;
    try {
      await removeFromGallery.mutateAsync(removeTarget.media.id);
      toast.success('Image removed from gallery');
      setRemoveTarget(null);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to remove from gallery';
      toast.error(message);
    }
  }

  async function handleMoveLeft(item: GalleryItem) {
    const index = items.findIndex((i) => i.id === item.id);
    if (index <= 0) return;
    const neighbor = items[index - 1];
    try {
      await swapGalleryOrder.mutateAsync({
        mediaId1: item.media.id,
        mediaId2: neighbor.media.id,
      });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to reorder';
      toast.error(message);
    }
  }

  async function handleMoveRight(item: GalleryItem) {
    const index = items.findIndex((i) => i.id === item.id);
    if (index < 0 || index >= items.length - 1) return;
    const neighbor = items[index + 1];
    try {
      await swapGalleryOrder.mutateAsync({
        mediaId1: item.media.id,
        mediaId2: neighbor.media.id,
      });
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Failed to reorder';
      toast.error(message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gallery</h1>
          <p className="text-sm text-muted-foreground">
            Manage images used across products, categories, and brands.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFetching && !isLoading && (
            <RefreshCw className="size-4 animate-spin text-muted-foreground" />
          )}
          <Button
            className="rounded-sm shadow-lg shadow-primary/20"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="size-4" />
            {isUploading ? 'Uploading...' : 'Upload images'}
          </Button>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (!isUploading) void handleUploadFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed border-primary/20 bg-primary/5 p-8 transition-colors',
          dragOver && 'border-primary/40 bg-primary/10',
          isUploading && 'opacity-60',
        )}
      >
        <Upload className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Drag and drop images here, or use the upload button
        </p>
        <p className="text-xs text-muted-foreground">
          PNG, JPG, WebP up to 8MB each
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        disabled={isUploading}
        onChange={(e) => void handleUploadFiles(e.target.files)}
      />

      <Card className="rounded-sm ring-primary/10">
        <CardHeader className="gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>All images</CardTitle>
            <CardDescription>
              {data?.meta.total ?? 0} images in gallery
            </CardDescription>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by media id or key..."
              className="rounded-sm border-0 bg-primary/5 pl-8 focus-visible:ring-primary/50"
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isError ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <p className="text-sm text-muted-foreground">
                Failed to load gallery. Please try again.
              </p>
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw className="size-4" />
                Retry
              </Button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-sm" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <p className="text-sm text-muted-foreground">
                {debouncedSearch
                  ? 'No images match your search.'
                  : 'No images in gallery yet — upload your first image.'}
              </p>
              {!debouncedSearch && (
                <Button
                  variant="outline"
                  disabled={isUploading}
                  onClick={() => inputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  Upload image
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {items.map((item, index) => (
                  <GalleryImageCard
                    key={item.id}
                    item={item}
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                    disabled={isBusy}
                    onView={setPreviewItem}
                    onRemove={setRemoveTarget}
                    onMoveLeft={handleMoveLeft}
                    onMoveRight={handleMoveRight}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page <= 1 || isBusy}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="size-4" />
                      Previous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages || isBusy}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <GalleryPreviewDialog
        item={previewItem}
        open={Boolean(previewItem)}
        onOpenChange={(open) => !open && setPreviewItem(null)}
      />

      <AlertDialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove from gallery?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the image from the gallery library. It will not
              delete the file if it is still used on products or categories.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleRemove()}
              disabled={removeFromGallery.isPending}
            >
              {removeFromGallery.isPending ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
