import { FormPageSkeleton } from '@/components/skeletons';
import { SiteSettingsForm } from '@/components/settings/site-settings-form';
import { useGetSiteSettings } from '@/hooks/api/admin/use-site-settings';
import { mapSiteSettingsToFormValues } from '@/lib/site-settings-form-mapper';

export function SettingsPage() {
  const { data, isLoading, isError } = useGetSiteSettings();

  if (isLoading) {
    return (
      <FormPageSkeleton
        layout="single"
        sections={4}
        showBreadcrumb={false}
      />
    );
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-destructive">
        Failed to load site settings. Please try again.
      </p>
    );
  }

  return <SiteSettingsForm defaultValues={mapSiteSettingsToFormValues(data)} />;
}
