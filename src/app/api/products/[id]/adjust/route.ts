import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { adjustmentQty, reason } = body;

    if (adjustmentQty === undefined || isNaN(Number(adjustmentQty))) {
      return NextResponse.json({ error: 'Adjustment quantity is required and must be a number' }, { status: 400 });
    }

    const result = store.adjustStock(params.id, Number(adjustmentQty), reason);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
