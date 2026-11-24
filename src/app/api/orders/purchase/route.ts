import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase();

    let orders = store.getPurchaseOrders();

    if (status && status !== 'all') {
      orders = orders.filter((o) => o.status === status);
    }
    if (search) {
      orders = orders.filter(
        (o) =>
          o.poNumber.toLowerCase().includes(search) ||
          o.supplierName.toLowerCase().includes(search) ||
          o.items.some((i) => i.name.toLowerCase().includes(search) || i.sku.toLowerCase().includes(search))
      );
    }

    return NextResponse.json(orders);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.supplierId || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Supplier and at least one item are required' }, { status: 400 });
    }

    const result = store.createPurchaseOrder(body);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
