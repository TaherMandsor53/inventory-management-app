import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase();

    let sales = store.getSalesOrders();

    if (status && status !== 'all') {
      sales = sales.filter((s) => s.status === status);
    }
    if (search) {
      sales = sales.filter(
        (s) =>
          s.invoiceNumber.toLowerCase().includes(search) ||
          s.customerName.toLowerCase().includes(search) ||
          s.items.some((i) => i.name.toLowerCase().includes(search) || i.sku.toLowerCase().includes(search))
      );
    }

    return NextResponse.json(sales);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.customerId || !body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Customer and at least one item are required' }, { status: 400 });
    }

    const result = store.createSalesOrder(body);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
