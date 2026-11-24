import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const movements = store.getStockMovements(params.id);
    return NextResponse.json(movements);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
