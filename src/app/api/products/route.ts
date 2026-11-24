import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const godown = searchParams.get('godown');
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.toLowerCase();

    let products = store.getProducts();

    if (category && category !== 'all') {
      products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }
    if (godown && godown !== 'all') {
      products = products.filter((p) => p.godown.toLowerCase() === godown.toLowerCase());
    }
    if (status && status !== 'all') {
      products = products.filter((p) => p.status === status);
    }
    if (search) {
      products = products.filter(
        (p) =>
          p.sku.toLowerCase().includes(search) ||
          p.name.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search) ||
          p.godown.toLowerCase().includes(search)
      );
    }

    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.sku || !body.name || body.unitPrice === undefined || body.costPrice === undefined) {
      return NextResponse.json({ error: 'Missing required fields (sku, name, unitPrice, costPrice)' }, { status: 400 });
    }

    const existing = store.getProductBySku(body.sku);
    if (existing) {
      return NextResponse.json({ error: `SKU '${body.sku}' already exists` }, { status: 409 });
    }

    const product = store.createProduct({
      sku: body.sku.toUpperCase(),
      name: body.name,
      description: body.description || '',
      category: body.category || 'General',
      godown: body.godown || 'Main Hub',
      availableQty: Number(body.availableQty) || 0,
      minLevel: Number(body.minLevel) || 10,
      unitPrice: Number(body.unitPrice),
      costPrice: Number(body.costPrice),
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
