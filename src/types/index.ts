export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  godown: string; // e.g. "Main Hub" | "West Warehouse"
  availableQty: number;
  minLevel: number;
  unitPrice: number; // selling price
  costPrice: number; // procurement price
  status: StockStatus;
  updatedAt: string;
}

export interface Godown {
  id: string;
  name: string;
  code: string;
  location: string;
  capacityAlert: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  category: string;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  city: string;
}

export type POStatus = 'pending' | 'received' | 'cancelled';

export interface POLineItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDate: string;
  status: POStatus;
  items: POLineItem[];
  totalAmount: number;
  notes?: string;
  receivedAt?: string;
}

export type SalesStatus = 'draft' | 'confirmed' | 'paid';

export interface SalesLineItem {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SalesOrder {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  orderDate: string;
  status: SalesStatus;
  items: SalesLineItem[];
  totalAmount: number;
  notes?: string;
  confirmedAt?: string;
  paidAt?: string;
}

export type MovementType =
  | 'inbound_po'
  | 'outbound_sale'
  | 'adjustment_in'
  | 'adjustment_out'
  | 'initial';

export interface StockMovement {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  type: MovementType;
  referenceId?: string;
  referenceNumber?: string; // e.g. PO-2026-001 or INV-2026-004
  quantityChanged: number; // positive or negative
  previousQty: number;
  newQty: number;
  godown: string;
  reason: string;
  timestamp: string;
}

export interface DashboardKPIs {
  totalStockValue: number;
  totalSKUs: number;
  pendingPurchaseOrders: number;
  monthlyRevenue: number;
  lowStockCount: number;
  healthyStockCount: number;
  outOfStockCount: number;
  stockValueTrend: number;
  revenueTrend: number;
  skuTrend: number;
  pendingPoTrend: number;
}

export interface StockValuationReportItem {
  sku: string;
  name: string;
  category: string;
  godown: string;
  availableQty: number;
  costPrice: number;
  unitPrice: number;
  totalCostValue: number;
  totalSalesValue: number;
  potentialMargin: number;
  status: StockStatus;
}

export interface SalesReportSummary {
  totalOrders: number;
  totalRevenue: number;
  paidRevenue: number;
  pendingPaymentRevenue: number;
  topSellingProducts: { sku: string; name: string; quantity: number; revenue: number }[];
  byCustomer: { customerName: string; orderCount: number; totalSpent: number }[];
}

export interface PurchaseReportSummary {
  totalOrders: number;
  totalSpend: number;
  receivedSpend: number;
  pendingSpend: number;
  bySupplier: { supplierName: string; orderCount: number; totalPurchased: number }[];
  byCategory: { category: string; spend: number }[];
}
