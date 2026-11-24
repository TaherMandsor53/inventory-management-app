import {
  Product,
  Godown,
  Supplier,
  Customer,
  PurchaseOrder,
  SalesOrder,
  StockMovement,
  DashboardKPIs,
  StockValuationReportItem,
  SalesReportSummary,
  PurchaseReportSummary,
} from '@/types';
import { calculateStockStatus } from '@/lib/utils';

const INITIAL_GODOWNS: Godown[] = [
  {
    id: 'godown-1',
    name: 'Main Hub',
    code: 'HUB-NORTH-01',
    location: 'Building A, Industrial Area, Sector 4',
    capacityAlert: 'Healthy (68% utilized)',
  },
  {
    id: 'godown-2',
    name: 'West Warehouse',
    code: 'WH-WEST-02',
    location: 'Logistics Park, Dock 14, West Coast',
    capacityAlert: 'Healthy (45% utilized)',
  },
];

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Apex Microelectronics Ltd',
    contactPerson: 'David Chen',
    email: 'orders@apexmicro.com',
    phone: '+1 (555) 234-8901',
    category: 'Electronics',
  },
  {
    id: 'sup-2',
    name: 'Nordic Ergonomics Corp',
    contactPerson: 'Astrid Lind',
    email: 'supply@nordic-ergo.com',
    phone: '+1 (555) 876-1234',
    category: 'Office Furniture',
  },
  {
    id: 'sup-3',
    name: 'OptiCable & Connectors Inc',
    contactPerson: 'Marcus Vance',
    email: 'sales@opticable.io',
    phone: '+1 (555) 432-6789',
    category: 'Accessories',
  },
  {
    id: 'sup-4',
    name: 'Titan Workspace Gear',
    contactPerson: 'Elena Rostov',
    email: 'contact@titangear.co',
    phone: '+1 (555) 987-5432',
    category: 'Office Furniture',
  },
  {
    id: 'sup-5',
    name: 'Silicon Valley Peripherals',
    contactPerson: 'Kenji Sato',
    email: 'b2b@svperipherals.com',
    phone: '+1 (555) 654-3210',
    category: 'Electronics',
  },
];

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Sarah Jenkins',
    company: 'Starlight Tech Solutions',
    email: 's.jenkins@starlighttech.io',
    phone: '+1 (555) 345-6780',
    city: 'San Francisco, CA',
  },
  {
    id: 'cust-2',
    name: 'Michael Torres',
    company: 'Vanguard Digital Agency',
    email: 'm.torres@vanguard.design',
    phone: '+1 (555) 789-0123',
    city: 'Austin, TX',
  },
  {
    id: 'cust-3',
    name: 'Rachel Adams',
    company: 'Fintech Innovations Corp',
    email: 'radams@fintechinnovations.com',
    phone: '+1 (555) 890-2345',
    city: 'New York, NY',
  },
  {
    id: 'cust-4',
    name: 'Alexander Lee',
    company: 'NextGen BioLabs',
    email: 'a.lee@nextgenbiolabs.org',
    phone: '+1 (555) 456-7890',
    city: 'Boston, MA',
  },
  {
    id: 'cust-5',
    name: 'Chloe DuPont',
    company: 'Horizon Media Partners',
    email: 'chloe@horizonmedia.com',
    phone: '+1 (555) 678-9012',
    city: 'Seattle, WA',
  },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    sku: 'EL-MON-4K27',
    name: 'UltraSharp 27" 4K USB-C Monitor',
    description: 'IPS panel with 99% sRGB, 90W Power Delivery, and ergonomic tilt/swivel stand.',
    category: 'Electronics',
    godown: 'Main Hub',
    availableQty: 42,
    minLevel: 15,
    unitPrice: 549,
    costPrice: 380,
    status: 'in_stock',
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'prod-2',
    sku: 'EL-KB-MECH01',
    name: 'Apex Pro Mechanical Keyboard',
    description: 'Hot-swappable tactile switches, aluminum chassis, PBT double-shot keycaps.',
    category: 'Electronics',
    godown: 'Main Hub',
    availableQty: 4, // Intentionally low stock (<= minLevel of 10)
    minLevel: 10,
    unitPrice: 179,
    costPrice: 110,
    status: 'low_stock',
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'prod-3',
    sku: 'OF-CHR-ERGO9',
    name: 'Ergonomic Mesh Task Chair X9',
    description: 'Breathable dual-zone mesh, 4D armrests, dynamic lumbar support, polished base.',
    category: 'Office Furniture',
    godown: 'West Warehouse',
    availableQty: 2, // Intentionally low stock (<= minLevel of 8)
    minLevel: 8,
    unitPrice: 489,
    costPrice: 310,
    status: 'low_stock',
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'prod-4',
    sku: 'OF-DSK-ELEC1',
    name: 'Dual-Motor Standing Desk (60x30)',
    description: 'Solid bamboo tabletop with memory keypad, cable tray, anti-collision sensor.',
    category: 'Office Furniture',
    godown: 'West Warehouse',
    availableQty: 18,
    minLevel: 5,
    unitPrice: 699,
    costPrice: 450,
    status: 'in_stock',
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'prod-5',
    sku: 'AC-DOCK-TB4',
    name: 'Thunderbolt 4 Pro Docking Station',
    description: 'Dual 4K@60Hz display support, 85W host charging, 2.5GbE Ethernet port.',
    category: 'Accessories',
    godown: 'Main Hub',
    availableQty: 28,
    minLevel: 10,
    unitPrice: 249,
    costPrice: 160,
    status: 'in_stock',
    updatedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },
  {
    id: 'prod-6',
    sku: 'AC-CBL-TB42M',
    name: 'Braided Thunderbolt 4 Cable (2m)',
    description: '40Gbps bandwidth, 100W PD charging, reinforced strain relief.',
    category: 'Accessories',
    godown: 'Main Hub',
    availableQty: 75,
    minLevel: 25,
    unitPrice: 39,
    costPrice: 18,
    status: 'in_stock',
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'prod-7',
    sku: 'EL-CAM-4KPRO',
    name: 'StudioStream 4K AI Webcam',
    description: 'Sony STARVIS 2 sensor, auto-framing, dual noise-canceling stereo mics.',
    category: 'Electronics',
    godown: 'Main Hub',
    availableQty: 0, // Intentionally Out of Stock
    minLevel: 12,
    unitPrice: 199,
    costPrice: 125,
    status: 'out_of_stock',
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },
  {
    id: 'prod-8',
    sku: 'OF-LMP-LED01',
    name: 'Architect Screen Bar LED Lamp',
    description: 'Asymmetric optical glare-free design, auto-dimming touch sensor, CRI > 95.',
    category: 'Office Furniture',
    godown: 'West Warehouse',
    availableQty: 34,
    minLevel: 10,
    unitPrice: 89,
    costPrice: 48,
    status: 'in_stock',
    updatedAt: new Date(Date.now() - 3600000 * 15).toISOString(),
  },
  {
    id: 'prod-9',
    sku: 'AC-MAT-FELT',
    name: 'Merino Wool Felt Desk Mat (Large)',
    description: 'Anti-slip natural rubber backing, water-repellent coating, 90x40cm.',
    category: 'Accessories',
    godown: 'West Warehouse',
    availableQty: 60,
    minLevel: 20,
    unitPrice: 49,
    costPrice: 22,
    status: 'in_stock',
    updatedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    id: 'prod-10',
    sku: 'EL-AUD-ANCPRO',
    name: 'AcousticPro Wireless ANC Headphones',
    description: 'Hybrid 40mm graphene drivers, LDAC high-res audio, 45-hour battery life.',
    category: 'Electronics',
    godown: 'Main Hub',
    availableQty: 22,
    minLevel: 8,
    unitPrice: 299,
    costPrice: 190,
    status: 'in_stock',
    updatedAt: new Date(Date.now() - 3600000 * 60).toISOString(),
  },
  {
    id: 'prod-11',
    sku: 'OF-DRW-PED3',
    name: 'Under-Desk Steel Mobile Pedestal',
    description: '3-drawer locking file cabinet with heavy-duty casters and pencil tray.',
    category: 'Office Furniture',
    godown: 'West Warehouse',
    availableQty: 14,
    minLevel: 6,
    unitPrice: 159,
    costPrice: 95,
    status: 'in_stock',
    updatedAt: new Date(Date.now() - 3600000 * 70).toISOString(),
  },
  {
    id: 'prod-12',
    sku: 'AC-HUB-USB7',
    name: 'Powered 7-Port USB 3.2 Gen 2 Hub',
    description: 'Individual on/off power switches, 36W external AC adapter, aluminum casing.',
    category: 'Accessories',
    godown: 'Main Hub',
    availableQty: 3, // Intentionally low stock (<= minLevel of 15)
    minLevel: 15,
    unitPrice: 65,
    costPrice: 35,
    status: 'low_stock',
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  },
];

const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'po-1',
    poNumber: 'PO-2026-001',
    supplierId: 'sup-1',
    supplierName: 'Apex Microelectronics Ltd',
    orderDate: '2026-11-10',
    expectedDate: '2026-11-20',
    status: 'received',
    items: [
      {
        productId: 'prod-1',
        sku: 'EL-MON-4K27',
        name: 'UltraSharp 27" 4K USB-C Monitor',
        quantity: 20,
        unitCost: 380,
        totalCost: 7600,
      },
      {
        productId: 'prod-2',
        sku: 'EL-KB-MECH01',
        name: 'Apex Pro Mechanical Keyboard',
        quantity: 15,
        unitCost: 110,
        totalCost: 1650,
      },
    ],
    totalAmount: 9250,
    notes: 'Q4 warehouse restock order',
    receivedAt: '2026-11-18T14:30:00Z',
  },
  {
    id: 'po-2',
    poNumber: 'PO-2026-002',
    supplierId: 'sup-2',
    supplierName: 'Nordic Ergonomics Corp',
    orderDate: '2026-11-14',
    expectedDate: '2026-11-26',
    status: 'pending',
    items: [
      {
        productId: 'prod-3',
        sku: 'OF-CHR-ERGO9',
        name: 'Ergonomic Mesh Task Chair X9',
        quantity: 20,
        unitCost: 310,
        totalCost: 6200,
      },
      {
        productId: 'prod-4',
        sku: 'OF-DSK-ELEC1',
        name: 'Dual-Motor Standing Desk (60x30)',
        quantity: 10,
        unitCost: 450,
        totalCost: 4500,
      },
    ],
    totalAmount: 10700,
    notes: 'Restocking popular ergonomic items for West Warehouse',
  },
  {
    id: 'po-3',
    poNumber: 'PO-2026-003',
    supplierId: 'sup-5',
    supplierName: 'Silicon Valley Peripherals',
    orderDate: '2026-11-18',
    expectedDate: '2026-11-28',
    status: 'pending',
    items: [
      {
        productId: 'prod-7',
        sku: 'EL-CAM-4KPRO',
        name: 'StudioStream 4K AI Webcam',
        quantity: 25,
        unitCost: 125,
        totalCost: 3125,
      },
      {
        productId: 'prod-12',
        sku: 'AC-HUB-USB7',
        name: 'Powered 7-Port USB 3.2 Gen 2 Hub',
        quantity: 30,
        unitCost: 35,
        totalCost: 1050,
      },
    ],
    totalAmount: 4175,
    notes: 'Urgent restock for zero stock webcam and low stock USB hub',
  },
  {
    id: 'po-4',
    poNumber: 'PO-2026-004',
    supplierId: 'sup-3',
    supplierName: 'OptiCable & Connectors Inc',
    orderDate: '2026-11-05',
    expectedDate: '2026-11-12',
    status: 'received',
    items: [
      {
        productId: 'prod-6',
        sku: 'AC-CBL-TB42M',
        name: 'Braided Thunderbolt 4 Cable (2m)',
        quantity: 50,
        unitCost: 18,
        totalCost: 900,
      },
      {
        productId: 'prod-5',
        sku: 'AC-DOCK-TB4',
        name: 'Thunderbolt 4 Pro Docking Station',
        quantity: 20,
        unitCost: 160,
        totalCost: 3200,
      },
    ],
    totalAmount: 4100,
    notes: 'High-speed cable & dock bundle shipment',
    receivedAt: '2026-11-11T10:15:00Z',
  },
  {
    id: 'po-5',
    poNumber: 'PO-2026-005',
    supplierId: 'sup-4',
    supplierName: 'Titan Workspace Gear',
    orderDate: '2026-10-28',
    expectedDate: '2026-11-04',
    status: 'received',
    items: [
      {
        productId: 'prod-8',
        sku: 'OF-LMP-LED01',
        name: 'Architect Screen Bar LED Lamp',
        quantity: 40,
        unitCost: 48,
        totalCost: 1920,
      },
      {
        productId: 'prod-9',
        sku: 'AC-MAT-FELT',
        name: 'Merino Wool Felt Desk Mat (Large)',
        quantity: 60,
        unitCost: 22,
        totalCost: 1320,
      },
    ],
    totalAmount: 3240,
    notes: 'West warehouse seasonal batch',
    receivedAt: '2026-11-03T16:00:00Z',
  },
];

const INITIAL_SALES_ORDERS: SalesOrder[] = [
  {
    id: 'so-1',
    invoiceNumber: 'INV-2026-001',
    customerId: 'cust-1',
    customerName: 'Sarah Jenkins (Starlight Tech)',
    orderDate: '2026-11-12',
    status: 'paid',
    items: [
      {
        productId: 'prod-1',
        sku: 'EL-MON-4K27',
        name: 'UltraSharp 27" 4K USB-C Monitor',
        quantity: 6,
        unitPrice: 549,
        totalPrice: 3294,
      },
      {
        productId: 'prod-5',
        sku: 'AC-DOCK-TB4',
        name: 'Thunderbolt 4 Pro Docking Station',
        quantity: 6,
        unitPrice: 249,
        totalPrice: 1494,
      },
    ],
    totalAmount: 4788,
    notes: 'Engineering team hardware refresh',
    confirmedAt: '2026-11-12T11:00:00Z',
    paidAt: '2026-11-15T09:20:00Z',
  },
  {
    id: 'so-2',
    invoiceNumber: 'INV-2026-002',
    customerId: 'cust-2',
    customerName: 'Michael Torres (Vanguard Digital)',
    orderDate: '2026-11-16',
    status: 'confirmed',
    items: [
      {
        productId: 'prod-4',
        sku: 'OF-DSK-ELEC1',
        name: 'Dual-Motor Standing Desk (60x30)',
        quantity: 4,
        unitPrice: 699,
        totalPrice: 2796,
      },
      {
        productId: 'prod-3',
        sku: 'OF-CHR-ERGO9',
        name: 'Ergonomic Mesh Task Chair X9',
        quantity: 4,
        unitPrice: 489,
        totalPrice: 1956,
      },
      {
        productId: 'prod-8',
        sku: 'OF-LMP-LED01',
        name: 'Architect Screen Bar LED Lamp',
        quantity: 4,
        unitPrice: 89,
        totalPrice: 356,
      },
    ],
    totalAmount: 5108,
    notes: 'New office satellite buildout',
    confirmedAt: '2026-11-16T15:45:00Z',
  },
  {
    id: 'so-3',
    invoiceNumber: 'INV-2026-003',
    customerId: 'cust-3',
    customerName: 'Rachel Adams (Fintech Innovations)',
    orderDate: '2026-11-19',
    status: 'confirmed',
    items: [
      {
        productId: 'prod-2',
        sku: 'EL-KB-MECH01',
        name: 'Apex Pro Mechanical Keyboard',
        quantity: 8,
        unitPrice: 179,
        totalPrice: 1432,
      },
      {
        productId: 'prod-6',
        sku: 'AC-CBL-TB42M',
        name: 'Braided Thunderbolt 4 Cable (2m)',
        quantity: 12,
        unitPrice: 39,
        totalPrice: 468,
      },
    ],
    totalAmount: 1900,
    notes: 'Developer peripherals allocation',
    confirmedAt: '2026-11-19T14:10:00Z',
  },
  {
    id: 'so-4',
    invoiceNumber: 'INV-2026-004',
    customerId: 'cust-4',
    customerName: 'Alexander Lee (NextGen BioLabs)',
    orderDate: '2026-11-21',
    status: 'paid',
    items: [
      {
        productId: 'prod-10',
        sku: 'EL-AUD-ANCPRO',
        name: 'AcousticPro Wireless ANC Headphones',
        quantity: 5,
        unitPrice: 299,
        totalPrice: 1495,
      },
      {
        productId: 'prod-9',
        sku: 'AC-MAT-FELT',
        name: 'Merino Wool Felt Desk Mat (Large)',
        quantity: 10,
        unitPrice: 49,
        totalPrice: 490,
      },
    ],
    totalAmount: 1985,
    notes: 'Lab workstation comfort upgrade',
    confirmedAt: '2026-11-21T10:00:00Z',
    paidAt: '2026-11-22T13:40:00Z',
  },
  {
    id: 'so-5',
    invoiceNumber: 'INV-2026-005',
    customerId: 'cust-5',
    customerName: 'Chloe DuPont (Horizon Media)',
    orderDate: '2026-11-23',
    status: 'draft',
    items: [
      {
        productId: 'prod-1',
        sku: 'EL-MON-4K27',
        name: 'UltraSharp 27" 4K USB-C Monitor',
        quantity: 2,
        unitPrice: 549,
        totalPrice: 1098,
      },
      {
        productId: 'prod-5',
        sku: 'AC-DOCK-TB4',
        name: 'Thunderbolt 4 Pro Docking Station',
        quantity: 2,
        unitPrice: 249,
        totalPrice: 498,
      },
    ],
    totalAmount: 1596,
    notes: 'Quote pending client finance signoff',
  },
];

const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'mov-1',
    productId: 'prod-1',
    sku: 'EL-MON-4K27',
    productName: 'UltraSharp 27" 4K USB-C Monitor',
    type: 'inbound_po',
    referenceId: 'po-1',
    referenceNumber: 'PO-2026-001',
    quantityChanged: 20,
    previousQty: 28,
    newQty: 48,
    godown: 'Main Hub',
    reason: 'Purchase order receipt from Apex Microelectronics Ltd',
    timestamp: '2026-11-18T14:30:00Z',
  },
  {
    id: 'mov-2',
    productId: 'prod-1',
    sku: 'EL-MON-4K27',
    productName: 'UltraSharp 27" 4K USB-C Monitor',
    type: 'outbound_sale',
    referenceId: 'so-1',
    referenceNumber: 'INV-2026-001',
    quantityChanged: -6,
    previousQty: 48,
    newQty: 42,
    godown: 'Main Hub',
    reason: 'Sales fulfillment for Sarah Jenkins (Starlight Tech)',
    timestamp: '2026-11-12T11:00:00Z',
  },
  {
    id: 'mov-3',
    productId: 'prod-2',
    sku: 'EL-KB-MECH01',
    productName: 'Apex Pro Mechanical Keyboard',
    type: 'outbound_sale',
    referenceId: 'so-3',
    referenceNumber: 'INV-2026-003',
    quantityChanged: -8,
    previousQty: 12,
    newQty: 4,
    godown: 'Main Hub',
    reason: 'Sales fulfillment for Rachel Adams (Fintech Innovations) - Triggered Low Stock Alert',
    timestamp: '2026-11-19T14:10:00Z',
  },
  {
    id: 'mov-4',
    productId: 'prod-3',
    sku: 'OF-CHR-ERGO9',
    productName: 'Ergonomic Mesh Task Chair X9',
    type: 'outbound_sale',
    referenceId: 'so-2',
    referenceNumber: 'INV-2026-002',
    quantityChanged: -4,
    previousQty: 6,
    newQty: 2,
    godown: 'West Warehouse',
    reason: 'Sales fulfillment for Vanguard Digital - Reached critical minimum stock level',
    timestamp: '2026-11-16T15:45:00Z',
  },
  {
    id: 'mov-5',
    productId: 'prod-7',
    sku: 'EL-CAM-4KPRO',
    productName: 'StudioStream 4K AI Webcam',
    type: 'adjustment_out',
    quantityChanged: -5,
    previousQty: 5,
    newQty: 0,
    godown: 'Main Hub',
    reason: 'Inventory audit: damaged packaging write-off',
    timestamp: '2026-11-20T09:15:00Z',
  },
  {
    id: 'mov-6',
    productId: 'prod-12',
    sku: 'AC-HUB-USB7',
    productName: 'Powered 7-Port USB 3.2 Gen 2 Hub',
    type: 'adjustment_out',
    quantityChanged: -7,
    previousQty: 10,
    newQty: 3,
    godown: 'Main Hub',
    reason: 'Internal tech bar transfer - Low stock triggered',
    timestamp: '2026-11-21T16:20:00Z',
  },
];

class InventoryStore {
  private godowns: Godown[] = [];
  private suppliers: Supplier[] = [];
  private customers: Customer[] = [];
  private products: Product[] = [];
  private purchaseOrders: PurchaseOrder[] = [];
  private salesOrders: SalesOrder[] = [];
  private stockMovements: StockMovement[] = [];

  constructor() {
    this.resetDemoData();
  }

  public resetDemoData() {
    this.godowns = JSON.parse(JSON.stringify(INITIAL_GODOWNS));
    this.suppliers = JSON.parse(JSON.stringify(INITIAL_SUPPLIERS));
    this.customers = JSON.parse(JSON.stringify(INITIAL_CUSTOMERS));
    this.products = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
    this.purchaseOrders = JSON.parse(JSON.stringify(INITIAL_PURCHASE_ORDERS));
    this.salesOrders = JSON.parse(JSON.stringify(INITIAL_SALES_ORDERS));
    this.stockMovements = JSON.parse(JSON.stringify(INITIAL_STOCK_MOVEMENTS));
  }

  // --- Products ---
  public getProducts(): Product[] {
    return [...this.products];
  }

  public getProductById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }

  public getProductBySku(sku: string): Product | undefined {
    return this.products.find((p) => p.sku.toLowerCase() === sku.toLowerCase());
  }

  public createProduct(data: Omit<Product, 'id' | 'status' | 'updatedAt'>): Product {
    const status = calculateStockStatus(data.availableQty, data.minLevel);
    const newProduct: Product = {
      ...data,
      id: `prod-${Date.now()}`,
      status,
      updatedAt: new Date().toISOString(),
    };
    this.products.unshift(newProduct);

    // Record initial movement
    this.stockMovements.unshift({
      id: `mov-${Date.now()}`,
      productId: newProduct.id,
      sku: newProduct.sku,
      productName: newProduct.name,
      type: 'initial',
      quantityChanged: newProduct.availableQty,
      previousQty: 0,
      newQty: newProduct.availableQty,
      godown: newProduct.godown,
      reason: 'Initial stock intake on SKU creation',
      timestamp: new Date().toISOString(),
    });

    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const current = this.products[index];
    const newQty = updates.availableQty !== undefined ? updates.availableQty : current.availableQty;
    const newMin = updates.minLevel !== undefined ? updates.minLevel : current.minLevel;
    const status = calculateStockStatus(newQty, newMin);

    const updated = {
      ...current,
      ...updates,
      status,
      updatedAt: new Date().toISOString(),
    };
    this.products[index] = updated;
    return updated;
  }

  public adjustStock(
    productId: string,
    adjustmentQty: number, // +ve or -ve
    reason: string
  ): { product: Product; movement: StockMovement } | { error: string } {
    const product = this.products.find((p) => p.id === productId);
    if (!product) return { error: 'Product not found' };

    const previousQty = product.availableQty;
    const newQty = previousQty + adjustmentQty;
    if (newQty < 0) {
      return { error: `Cannot adjust stock below 0. Current available: ${previousQty}` };
    }

    product.availableQty = newQty;
    product.status = calculateStockStatus(newQty, product.minLevel);
    product.updatedAt = new Date().toISOString();

    const movement: StockMovement = {
      id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      productId: product.id,
      sku: product.sku,
      productName: product.name,
      type: adjustmentQty >= 0 ? 'adjustment_in' : 'adjustment_out',
      quantityChanged: adjustmentQty,
      previousQty,
      newQty,
      godown: product.godown,
      reason: reason || (adjustmentQty >= 0 ? 'Manual Stock Inward' : 'Manual Stock Deduction'),
      timestamp: new Date().toISOString(),
    };

    this.stockMovements.unshift(movement);
    return { product, movement };
  }

  // --- Stock Movements / Audit Ledger ---
  public getStockMovements(productId?: string): StockMovement[] {
    if (productId) {
      return this.stockMovements.filter((m) => m.productId === productId);
    }
    return [...this.stockMovements];
  }

  // --- Godowns ---
  public getGodowns(): Godown[] {
    return [...this.godowns];
  }

  // --- Suppliers ---
  public getSuppliers(): Supplier[] {
    return [...this.suppliers];
  }

  public createSupplier(supplier: Omit<Supplier, 'id'>): Supplier {
    const newSup = { ...supplier, id: `sup-${Date.now()}` };
    this.suppliers.push(newSup);
    return newSup;
  }

  // --- Customers ---
  public getCustomers(): Customer[] {
    return [...this.customers];
  }

  public createCustomer(customer: Omit<Customer, 'id'>): Customer {
    const newCust = { ...customer, id: `cust-${Date.now()}` };
    this.customers.push(newCust);
    return newCust;
  }

  // --- Purchase Orders (Inbound Workflow) ---
  public getPurchaseOrders(): PurchaseOrder[] {
    return [...this.purchaseOrders];
  }

  public getPurchaseOrderById(id: string): PurchaseOrder | undefined {
    return this.purchaseOrders.find((po) => po.id === id);
  }

  public createPurchaseOrder(data: {
    supplierId: string;
    expectedDate: string;
    notes?: string;
    items: { productId: string; quantity: number; unitCost: number }[];
  }): PurchaseOrder | { error: string } {
    const supplier = this.suppliers.find((s) => s.id === data.supplierId);
    if (!supplier) return { error: 'Supplier not found' };

    let totalAmount = 0;
    const poItems = [];

    for (const item of data.items) {
      const prod = this.products.find((p) => p.id === item.productId);
      if (!prod) return { error: `Product ID ${item.productId} not found` };
      const totalCost = item.quantity * item.unitCost;
      totalAmount += totalCost;
      poItems.push({
        productId: prod.id,
        sku: prod.sku,
        name: prod.name,
        quantity: item.quantity,
        unitCost: item.unitCost,
        totalCost,
      });
    }

    const nextNum = this.purchaseOrders.length + 1;
    const poNumber = `PO-2026-${String(nextNum).padStart(3, '0')}`;
    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      supplierId: supplier.id,
      supplierName: supplier.name,
      orderDate: new Date().toISOString().split('T')[0],
      expectedDate: data.expectedDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      status: 'pending',
      items: poItems,
      totalAmount,
      notes: data.notes,
    };

    this.purchaseOrders.unshift(newPO);
    return newPO;
  }

  public markPOReceived(poId: string): { po: PurchaseOrder; movements: StockMovement[] } | { error: string } {
    const po = this.purchaseOrders.find((p) => p.id === poId);
    if (!po) return { error: 'Purchase Order not found' };
    if (po.status === 'received') return { error: 'Purchase Order is already marked as received' };
    if (po.status === 'cancelled') return { error: 'Cannot receive a cancelled Purchase Order' };

    po.status = 'received';
    po.receivedAt = new Date().toISOString();

    const movements: StockMovement[] = [];

    // Increment item quantities in stock and append inbound stock movement
    for (const item of po.items) {
      const prod = this.products.find((p) => p.id === item.productId);
      if (prod) {
        const prevQty = prod.availableQty;
        const newQty = prevQty + item.quantity;
        prod.availableQty = newQty;
        prod.status = calculateStockStatus(newQty, prod.minLevel);
        prod.updatedAt = new Date().toISOString();

        const mov: StockMovement = {
          id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          productId: prod.id,
          sku: prod.sku,
          productName: prod.name,
          type: 'inbound_po',
          referenceId: po.id,
          referenceNumber: po.poNumber,
          quantityChanged: item.quantity,
          previousQty: prevQty,
          newQty,
          godown: prod.godown,
          reason: `PO Received: ${po.poNumber} from ${po.supplierName}`,
          timestamp: new Date().toISOString(),
        };

        this.stockMovements.unshift(mov);
        movements.push(mov);
      }
    }

    return { po, movements };
  }

  public cancelPO(poId: string): PurchaseOrder | { error: string } {
    const po = this.purchaseOrders.find((p) => p.id === poId);
    if (!po) return { error: 'Purchase Order not found' };
    if (po.status === 'received') return { error: 'Cannot cancel an already received PO' };
    po.status = 'cancelled';
    return po;
  }

  // --- Sales Orders & Invoices (Outbound Workflow) ---
  public getSalesOrders(): SalesOrder[] {
    return [...this.salesOrders];
  }

  public getSalesOrderById(id: string): SalesOrder | undefined {
    return this.salesOrders.find((s) => s.id === id);
  }

  public createSalesOrder(data: {
    customerId: string;
    notes?: string;
    items: { productId: string; quantity: number; unitPrice: number }[];
    autoConfirm?: boolean;
  }): SalesOrder | { error: string } {
    const customer = this.customers.find((c) => c.id === data.customerId);
    if (!customer) return { error: 'Customer not found' };

    let totalAmount = 0;
    const saleItems = [];

    // Validate quantities
    for (const item of data.items) {
      const prod = this.products.find((p) => p.id === item.productId);
      if (!prod) return { error: `Product ID ${item.productId} not found` };
      
      // If auto-confirm is requested, prevent overselling
      if (data.autoConfirm && item.quantity > prod.availableQty) {
        return {
          error: `Insufficient stock for ${prod.name} (${prod.sku}). Requested: ${item.quantity}, Available: ${prod.availableQty}`,
        };
      }

      const totalPrice = item.quantity * item.unitPrice;
      totalAmount += totalPrice;
      saleItems.push({
        productId: prod.id,
        sku: prod.sku,
        name: prod.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
      });
    }

    const nextNum = this.salesOrders.length + 1;
    const invoiceNumber = `INV-2026-${String(nextNum).padStart(3, '0')}`;
    const newSO: SalesOrder = {
      id: `so-${Date.now()}`,
      invoiceNumber,
      customerId: customer.id,
      customerName: `${customer.name} (${customer.company})`,
      orderDate: new Date().toISOString().split('T')[0],
      status: 'draft',
      items: saleItems,
      totalAmount,
      notes: data.notes,
    };

    this.salesOrders.unshift(newSO);

    if (data.autoConfirm) {
      const confirmRes = this.confirmSale(newSO.id);
      if ('error' in confirmRes) {
        return confirmRes;
      }
      return confirmRes.sale;
    }

    return newSO;
  }

  public confirmSale(saleId: string): { sale: SalesOrder; movements: StockMovement[] } | { error: string } {
    const sale = this.salesOrders.find((s) => s.id === saleId);
    if (!sale) return { error: 'Sales Order not found' };
    if (sale.status === 'confirmed' || sale.status === 'paid') {
      return { error: 'Sales Order is already confirmed' };
    }

    // First pass: check stock availability for ALL items before deducting any (prevents partial deduction)
    for (const item of sale.items) {
      const prod = this.products.find((p) => p.id === item.productId);
      if (!prod) return { error: `Product ${item.sku} not found` };
      if (prod.availableQty < item.quantity) {
        return {
          error: `Insufficient stock for SKU ${prod.sku} (${prod.name}). Required: ${item.quantity}, Available: ${prod.availableQty}`,
        };
      }
    }

    // Second pass: deduct quantities from stock, append outbound stock movement
    const movements: StockMovement[] = [];
    for (const item of sale.items) {
      const prod = this.products.find((p) => p.id === item.productId)!;
      const prevQty = prod.availableQty;
      const newQty = prevQty - item.quantity;
      prod.availableQty = newQty;
      prod.status = calculateStockStatus(newQty, prod.minLevel);
      prod.updatedAt = new Date().toISOString();

      const mov: StockMovement = {
        id: `mov-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        productId: prod.id,
        sku: prod.sku,
        productName: prod.name,
        type: 'outbound_sale',
        referenceId: sale.id,
        referenceNumber: sale.invoiceNumber,
        quantityChanged: -item.quantity,
        previousQty: prevQty,
        newQty,
        godown: prod.godown,
        reason: `Sales Fulfillment: ${sale.invoiceNumber} for ${sale.customerName}`,
        timestamp: new Date().toISOString(),
      };

      this.stockMovements.unshift(mov);
      movements.push(mov);
    }

    sale.status = 'confirmed';
    sale.confirmedAt = new Date().toISOString();
    return { sale, movements };
  }

  public markSalePaid(saleId: string): SalesOrder | { error: string } {
    const sale = this.salesOrders.find((s) => s.id === saleId);
    if (!sale) return { error: 'Sales Order not found' };
    if (sale.status === 'draft') {
      // confirm first
      const confirmRes = this.confirmSale(saleId);
      if ('error' in confirmRes) return confirmRes;
    }
    sale.status = 'paid';
    sale.paidAt = new Date().toISOString();
    return sale;
  }

  // --- Dashboard KPIs ---
  public getDashboardKPIs(): {
    kpis: DashboardKPIs;
    lowStockItems: Product[];
    recentActivity: StockMovement[];
    godownStats: { name: string; count: number; totalQty: number; value: number }[];
  } {
    const totalSKUs = this.products.length;
    const totalStockValue = this.products.reduce((acc, p) => acc + p.availableQty * p.costPrice, 0);
    const pendingPurchaseOrders = this.purchaseOrders.filter((po) => po.status === 'pending').length;

    // Monthly revenue: sales with status confirmed or paid
    const monthlyRevenue = this.salesOrders
      .filter((so) => so.status === 'confirmed' || so.status === 'paid')
      .reduce((acc, so) => acc + so.totalAmount, 0);

    const lowStockItems = this.products.filter((p) => p.availableQty <= p.minLevel);
    const lowStockCount = lowStockItems.length;
    const outOfStockCount = this.products.filter((p) => p.availableQty === 0).length;
    const healthyStockCount = totalSKUs - lowStockCount;

    // Godown stats breakdown
    const godownStatsMap: Record<string, { count: number; totalQty: number; value: number }> = {};
    for (const g of this.godowns) {
      godownStatsMap[g.name] = { count: 0, totalQty: 0, value: 0 };
    }
    for (const p of this.products) {
      if (!godownStatsMap[p.godown]) {
        godownStatsMap[p.godown] = { count: 0, totalQty: 0, value: 0 };
      }
      godownStatsMap[p.godown].count += 1;
      godownStatsMap[p.godown].totalQty += p.availableQty;
      godownStatsMap[p.godown].value += p.availableQty * p.costPrice;
    }

    const godownStats = Object.entries(godownStatsMap).map(([name, stat]) => ({
      name,
      ...stat,
    }));

    const kpis: DashboardKPIs = {
      totalStockValue,
      totalSKUs,
      pendingPurchaseOrders,
      monthlyRevenue,
      lowStockCount,
      healthyStockCount,
      outOfStockCount,
      stockValueTrend: 12.4, // +12.4% vs last month
      revenueTrend: 8.7, // +8.7%
      skuTrend: 4.2,
      pendingPoTrend: -2.1,
    };

    return {
      kpis,
      lowStockItems,
      recentActivity: this.stockMovements.slice(0, 10),
      godownStats,
    };
  }

  // --- Reports & Analytics ---
  public getValuationReport(): StockValuationReportItem[] {
    return this.products.map((p) => {
      const totalCostValue = p.availableQty * p.costPrice;
      const totalSalesValue = p.availableQty * p.unitPrice;
      const potentialMargin = totalSalesValue - totalCostValue;
      return {
        sku: p.sku,
        name: p.name,
        category: p.category,
        godown: p.godown,
        availableQty: p.availableQty,
        costPrice: p.costPrice,
        unitPrice: p.unitPrice,
        totalCostValue,
        totalSalesValue,
        potentialMargin,
        status: p.status,
      };
    });
  }

  public getSalesReport(): SalesReportSummary {
    const totalOrders = this.salesOrders.length;
    const activeSales = this.salesOrders.filter((s) => s.status !== 'draft');
    const totalRevenue = activeSales.reduce((acc, s) => acc + s.totalAmount, 0);
    const paidRevenue = this.salesOrders
      .filter((s) => s.status === 'paid')
      .reduce((acc, s) => acc + s.totalAmount, 0);
    const pendingPaymentRevenue = this.salesOrders
      .filter((s) => s.status === 'confirmed')
      .reduce((acc, s) => acc + s.totalAmount, 0);

    // Group by product
    const productStats: Record<string, { sku: string; name: string; quantity: number; revenue: number }> = {};
    for (const order of activeSales) {
      for (const item of order.items) {
        if (!productStats[item.sku]) {
          productStats[item.sku] = {
            sku: item.sku,
            name: item.name,
            quantity: 0,
            revenue: 0,
          };
        }
        productStats[item.sku].quantity += item.quantity;
        productStats[item.sku].revenue += item.totalPrice;
      }
    }

    const topSellingProducts = Object.values(productStats).sort((a, b) => b.revenue - a.revenue);

    // Group by customer
    const customerStats: Record<string, { customerName: string; orderCount: number; totalSpent: number }> = {};
    for (const order of this.salesOrders) {
      if (!customerStats[order.customerName]) {
        customerStats[order.customerName] = {
          customerName: order.customerName,
          orderCount: 0,
          totalSpent: 0,
        };
      }
      customerStats[order.customerName].orderCount += 1;
      customerStats[order.customerName].totalSpent += order.totalAmount;
    }

    const byCustomer = Object.values(customerStats).sort((a, b) => b.totalSpent - a.totalSpent);

    return {
      totalOrders,
      totalRevenue,
      paidRevenue,
      pendingPaymentRevenue,
      topSellingProducts,
      byCustomer,
    };
  }

  public getPurchaseReport(): PurchaseReportSummary {
    const totalOrders = this.purchaseOrders.length;
    const totalSpend = this.purchaseOrders
      .filter((p) => p.status !== 'cancelled')
      .reduce((acc, p) => acc + p.totalAmount, 0);
    const receivedSpend = this.purchaseOrders
      .filter((p) => p.status === 'received')
      .reduce((acc, p) => acc + p.totalAmount, 0);
    const pendingSpend = this.purchaseOrders
      .filter((p) => p.status === 'pending')
      .reduce((acc, p) => acc + p.totalAmount, 0);

    // Group by supplier
    const supplierStats: Record<string, { supplierName: string; orderCount: number; totalPurchased: number }> = {};
    for (const po of this.purchaseOrders) {
      if (!supplierStats[po.supplierName]) {
        supplierStats[po.supplierName] = {
          supplierName: po.supplierName,
          orderCount: 0,
          totalPurchased: 0,
        };
      }
      supplierStats[po.supplierName].orderCount += 1;
      supplierStats[po.supplierName].totalPurchased += po.totalAmount;
    }

    const bySupplier = Object.values(supplierStats).sort((a, b) => b.totalPurchased - a.totalPurchased);

    // Category spend
    const categorySpend: Record<string, number> = {};
    for (const po of this.purchaseOrders) {
      for (const item of po.items) {
        const prod = this.products.find((p) => p.id === item.productId);
        const cat = prod?.category || 'General';
        categorySpend[cat] = (categorySpend[cat] || 0) + item.totalCost;
      }
    }

    const byCategory = Object.entries(categorySpend).map(([category, spend]) => ({
      category,
      spend,
    }));

    return {
      totalOrders,
      totalSpend,
      receivedSpend,
      pendingSpend,
      bySupplier,
      byCategory,
    };
  }
}

// Global singleton to persist across Next.js dev server reloads
const globalForStore = globalThis as unknown as {
  imsStore: InventoryStore | undefined;
};

export const store = globalForStore.imsStore ?? new InventoryStore();

if (process.env.NODE_ENV !== 'production') {
  globalForStore.imsStore = store;
}
