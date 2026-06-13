import { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ImageUpload } from '@/components/media/image-upload';
import { productInputClassName } from '@/components/products/product-form.constants';
import { useUpdateSiteSettings } from '@/hooks/api/admin/use-site-settings';
import { ApiError } from '@/lib/api-client';
import {
  defaultSiteSettingsFormValues,
  formValuesToUpdatePayload,
  siteSettingsFormSchema,
  type SiteSettingsFormValues,
} from '@/lib/validators/site-settings.schema';

type SiteSettingsFormProps = {
  defaultValues?: SiteSettingsFormValues;
};

export function SiteSettingsForm({ defaultValues }: SiteSettingsFormProps) {
  const updateSiteSettings = useUpdateSiteSettings();
  const hydratedRef = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SiteSettingsFormValues>({
    resolver: zodResolver(siteSettingsFormSchema),
    defaultValues: defaultValues ?? defaultSiteSettingsFormValues,
    mode: 'onBlur',
  });

  const headerLogoId = watch('headerLogoId');
  const headerLogoUrl = watch('headerLogoUrl');
  const footerLogoId = watch('footerLogoId');
  const footerLogoUrl = watch('footerLogoUrl');
  const emailLogoId = watch('emailLogoId');
  const emailLogoUrl = watch('emailLogoUrl');

  useEffect(() => {
    if (defaultValues && !hydratedRef.current) {
      reset(defaultValues);
      hydratedRef.current = true;
    }
  }, [defaultValues, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateSiteSettings.mutateAsync(formValuesToUpdatePayload(values));
      toast.success('Site settings saved successfully');
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : 'Failed to save site settings';
      toast.error(message);
    }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Site settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage logos, SEO metadata, and theme colors for the storefront.
        </p>
      </div>

      <form onSubmit={onSubmit} className="w-full space-y-6">
        <div className="space-y-4 rounded-sm border border-primary/10 p-4">
          <h2 className="text-sm font-semibold">Logos</h2>
          <p className="text-xs text-muted-foreground">Suggested (200 x 50)</p>

          <ImageUpload
            label="Header logo"
            value={headerLogoId}
            previewUrl={headerLogoUrl}
            onChange={(mediaId, url) => {
              setValue('headerLogoId', mediaId, { shouldValidate: true });
              setValue('headerLogoUrl', url);
            }}
            onRemove={() => {
              setValue('headerLogoId', null, { shouldValidate: true });
              setValue('headerLogoUrl', '');
            }}
          />

          <ImageUpload
            label="Footer logo"
            value={footerLogoId}
            previewUrl={footerLogoUrl}
            onChange={(mediaId, url) => {
              setValue('footerLogoId', mediaId, { shouldValidate: true });
              setValue('footerLogoUrl', url);
            }}
            onRemove={() => {
              setValue('footerLogoId', null, { shouldValidate: true });
              setValue('footerLogoUrl', '');
            }}
          />

          <ImageUpload
            label="Logo in email"
            value={emailLogoId}
            previewUrl={emailLogoUrl}
            onChange={(mediaId, url) => {
              setValue('emailLogoId', mediaId, { shouldValidate: true });
              setValue('emailLogoUrl', url);
            }}
            onRemove={() => {
              setValue('emailLogoId', null, { shouldValidate: true });
              setValue('emailLogoUrl', '');
            }}
          />
        </div>

        <div className="space-y-4 rounded-sm border border-primary/10 p-4">
          <h2 className="text-sm font-semibold">Site identity</h2>

          <div className="space-y-2">
            <Label htmlFor="siteName">Site name</Label>
            <Input
              id="siteName"
              className={productInputClassName}
              {...register('siteName')}
            />
            {errors.siteName && (
              <p className="text-xs text-destructive">
                {errors.siteName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteUrl">Site Url</Label>
            <Input
              id="siteUrl"
              className={productInputClassName}
              placeholder="https://example.com"
              {...register('siteUrl')}
            />
          </div>
        </div>

        <div className="space-y-4 rounded-sm border border-primary/10 p-4">
          <h2 className="text-sm font-semibold">SEO</h2>

          <div className="space-y-2">
            <Label htmlFor="metaTitle">Meta title</Label>
            <Input
              id="metaTitle"
              className={productInputClassName}
              {...register('metaTitle')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta description</Label>
            <Textarea
              id="metaDescription"
              className={productInputClassName}
              rows={4}
              {...register('metaDescription')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaKeywords">Meta keywords (Comma separated)</Label>
            <Textarea
              id="metaKeywords"
              className={productInputClassName}
              rows={3}
              placeholder="Meta keywords"
              {...register('metaKeywords')}
            />
          </div>
        </div>

        <div className="space-y-4 rounded-sm border border-primary/10 p-4">
          <h2 className="text-sm font-semibold">Theme and footer</h2>

          <div className="space-y-2">
            <Label htmlFor="copyrightText">Copyright text</Label>
            <Input
              id="copyrightText"
              className={productInputClassName}
              placeholder="© 2025 Your Brand. All rights reserved."
              {...register('copyrightText')}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary color</Label>
              <Input
                id="primaryColor"
                className={productInputClassName}
                placeholder="Primary color"
                {...register('primaryColor')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="primaryHoverColor">Primary hover color</Label>
              <Input
                id="primaryHoverColor"
                className={productInputClassName}
                placeholder="Primary hover color"
                {...register('primaryHoverColor')}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateSiteSettings.isPending}>
            {updateSiteSettings.isPending ? 'Saving...' : 'Save settings'}
          </Button>
        </div>
      </form>
    </div>
  );
}
