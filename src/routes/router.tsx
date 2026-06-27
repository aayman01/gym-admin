import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { AdminLayout } from '@/components/layout/admin-layout';
import { LoginPage } from '@/pages/login-page';
import { DashboardPage } from '@/pages/dashboard-page';
import { ProductsPage } from '@/pages/products-page';
import { AddProductPage } from '@/pages/add-product-page';
import { EditProductPage } from '@/pages/edit-product-page';
import { CategoriesPage } from '@/pages/categories-page';
import { AddCategoryPage } from '@/pages/add-category-page';
import { EditCategoryPage } from '@/pages/edit-category-page';
import { TaxesPage } from '@/pages/taxes-page';
import { AddTaxPage } from '@/pages/add-tax-page';
import { EditTaxPage } from '@/pages/edit-tax-page';
import { BrandsPage } from '@/pages/brands-page';
import { AddBrandPage } from '@/pages/add-brand-page';
import { EditBrandPage } from '@/pages/edit-brand-page';
import { ShippingPage } from '@/pages/shipping-page';
import { AddShippingPage } from '@/pages/add-shipping-page';
import { EditShippingPage } from '@/pages/edit-shipping-page';
import { OrdersPage } from '@/pages/orders-page';
import { OrderDetailPage } from '@/pages/order-detail-page';
import { GalleryPage } from '@/pages/gallery-page';
import { SettingsPage } from '@/pages/settings-page';
import { AttributesPage } from '@/pages/attributes-page';
import { AddAttributePage, EditAttributePage } from '@/pages/attribute-pages';
import { InventoryPage } from '@/pages/inventory-page';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="products/new" element={<AddProductPage />} />
          <Route path="products/:productId/edit" element={<EditProductPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="categories/new" element={<AddCategoryPage />} />
          <Route
            path="categories/:categoryId/edit"
            element={<EditCategoryPage />}
          />
          <Route path="taxes" element={<TaxesPage />} />
          <Route path="taxes/new" element={<AddTaxPage />} />
          <Route path="taxes/:taxId/edit" element={<EditTaxPage />} />
          <Route path="brands" element={<BrandsPage />} />
          <Route path="brands/new" element={<AddBrandPage />} />
          <Route path="brands/:brandId/edit" element={<EditBrandPage />} />
          <Route path="shipping" element={<ShippingPage />} />
          <Route path="shipping/new" element={<AddShippingPage />} />
          <Route
            path="shipping/:shippingMethodId/edit"
            element={<EditShippingPage />}
          />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="orders/:orderId" element={<OrderDetailPage />} />
          <Route path="gallery" element={<GalleryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="attributes" element={<AttributesPage />} />
          <Route path="attributes/new" element={<AddAttributePage />} />
          <Route path="attributes/:attributeId/edit" element={<EditAttributePage />} />
          <Route path="inventory" element={<InventoryPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
