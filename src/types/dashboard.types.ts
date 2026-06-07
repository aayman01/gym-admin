export type DashboardPeriod = '7d' | '30d' | '90d';

export interface DashboardStats {
  totalRevenue: string;
  revenueChangePercent: number | null;
  totalOrders: number;
  ordersChangePercent: number | null;
  totalProducts: number;
  productsChangePercent: number | null;
  totalCustomers: number;
  customersChangePercent: number | null;
}

export interface RevenueChartPoint {
  date: string;
  revenue: string;
  orders: number;
}

export interface OrderStatusCount {
  status: string;
  count: number;
}

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  status: string;
  paymentStatus: string;
  totalAmount: string;
  createdAt: string;
}

export interface LowStockAlert {
  productId: string;
  productTitle: string;
  variantSku: string;
  availableStock: number;
  lowStockThreshold: number;
}

export interface DashboardData {
  stats: DashboardStats;
  revenueChart: RevenueChartPoint[];
  ordersByStatus: OrderStatusCount[];
  recentOrders: RecentOrder[];
  lowStockAlerts: LowStockAlert[];
}
