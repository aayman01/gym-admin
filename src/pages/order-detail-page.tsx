import { Link, useParams } from 'react-router-dom';
import { OrderDetail } from '@/components/orders/order-detail';
import { FormPageSkeleton } from '@/components/skeletons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useGetOrder } from '@/hooks/api/admin/use-orders';

export function OrderDetailPage() {
  const { orderId = '' } = useParams();
  const { data, isLoading, isError } = useGetOrder(orderId);

  if (isLoading) {
    return <FormPageSkeleton layout="two-column" sections={4} />;
  }

  if (isError || !data) {
    return (
      <div className="space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link to="/orders" />}>
                Orders
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Order not found</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <p className="text-sm text-muted-foreground">
          This order does not exist or could not be loaded.
        </p>
        <Button render={<Link to="/orders" />}>Back to orders</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink render={<Link to="/orders" />}>
              Orders
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{data.orderNumber}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <OrderDetail order={data} />
    </div>
  );
}
