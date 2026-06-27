import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  useCreateProductAttribute,
  useDeleteProductAttributeOption,
  useGetProductAttribute,
  useUpdateProductAttribute,
} from '@/hooks/api/admin/use-product-attributes';
import { ApiError } from '@/lib/api-client';

export function AddAttributePage() {
  return <AttributeForm mode="create" />;
}

export function EditAttributePage() {
  const { attributeId = '' } = useParams();
  const { data, isLoading, isError } = useGetProductAttribute(attributeId, {
    enabled: Boolean(attributeId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-10 text-muted-foreground">
        <RefreshCw className="size-4 animate-spin" />
        Loading attribute...
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Attribute not found or could not be loaded.
        </p>
        <Button render={<Link to="/attributes" />}>Back to attributes</Button>
      </div>
    );
  }

  return <AttributeForm mode="edit" attributeId={attributeId} defaultName={data.name} existingOptions={data.options} />;
}

type Option = { id?: string; value: string };

type AttributeFormProps =
  | { mode: 'create' }
  | {
      mode: 'edit';
      attributeId: string;
      defaultName: string;
      existingOptions: { id: string; value: string; order: number }[];
    };

function AttributeForm(props: AttributeFormProps) {
  const navigate = useNavigate();
  const isEdit = props.mode === 'edit';

  const [name, setName] = useState(isEdit ? props.defaultName : '');
  const [options, setOptions] = useState<Option[]>(
    isEdit ? props.existingOptions.map((o) => ({ id: o.id, value: o.value })) : [],
  );
  const [newOptionValue, setNewOptionValue] = useState('');
  const [deleteOptionId, setDeleteOptionId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const createAttr = useCreateProductAttribute();
  const updateAttr = useUpdateProductAttribute();
  const deleteOption = useDeleteProductAttributeOption();

  function addOption() {
    const trimmed = newOptionValue.trim();
    if (!trimmed) return;
    if (options.some((o) => o.value.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Option already exists');
      return;
    }
    setOptions((prev) => [...prev, { value: trimmed }]);
    setNewOptionValue('');
  }

  function removeLocalOption(index: number) {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleDeleteExistingOption(optionId: string) {
    if (!isEdit) return;
    try {
      await deleteOption.mutateAsync({
        attributeId: props.attributeId,
        optionId,
      });
      setOptions((prev) => prev.filter((o) => o.id !== optionId));
      toast.success('Option deleted');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to delete option';
      toast.error(msg);
    } finally {
      setDeleteOptionId(null);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      toast.error('Attribute name is required');
      return;
    }
    setIsSaving(true);
    try {
      const newOptions = options
        .filter((o) => !o.id)
        .map((o) => ({ value: o.value }));

      if (isEdit) {
        await updateAttr.mutateAsync({
          attributeId: props.attributeId,
          payload: { name: name.trim(), options: newOptions.length ? newOptions : undefined },
        });
        toast.success('Attribute updated');
      } else {
        await createAttr.mutateAsync({
          name: name.trim(),
          options: options.map((o) => ({ value: o.value })),
        });
        toast.success('Attribute created');
        navigate('/attributes');
      }
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to save attribute';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/attributes" />}>
              Attributes
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{isEdit ? 'Edit' : 'New'} Attribute</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? 'Edit Attribute' : 'New Attribute'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Update name and manage option values.' : 'Create a new product attribute.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/attributes')}>
            Cancel
          </Button>
          <Button
            className="rounded-sm shadow-lg shadow-primary/20"
            onClick={() => void handleSave()}
            disabled={isSaving}
          >
            {isSaving ? <RefreshCw className="size-4 animate-spin" /> : null}
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-sm ring-primary/10">
          <CardHeader>
            <CardTitle>Attribute name</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="attr-name">Name</Label>
              <Input
                id="attr-name"
                placeholder="e.g. Size, Flavor, Weight"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm ring-primary/10">
          <CardHeader>
            <CardTitle>Option values</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Add option value..."
                value={newOptionValue}
                onChange={(e) => setNewOptionValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addOption();
                  }
                }}
              />
              <Button variant="outline" size="sm" onClick={addOption}>
                <Plus className="size-4" />
                Add
              </Button>
            </div>

            {options.length > 0 ? (
              <ul className="divide-y divide-border rounded-md border">
                {options.map((opt, index) => (
                  <li
                    key={opt.id ?? index}
                    className="flex items-center justify-between px-3 py-2 text-sm"
                  >
                    <span>{opt.value}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        if (opt.id) {
                          setDeleteOptionId(opt.id);
                        } else {
                          removeLocalOption(index);
                        }
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No options yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog
        open={Boolean(deleteOptionId)}
        onOpenChange={() => setDeleteOptionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete option?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the option. Existing product variants
              using this option may be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                deleteOptionId && void handleDeleteExistingOption(deleteOptionId)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
