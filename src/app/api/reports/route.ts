import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function GET() {
  try {
    const valuation = store.getValuationReport();
    const sales = store.getSalesReport();
    const purchases = store.getPurchaseReport();

    return NextResponse.json({
      valuation,
      sales,
      purchases,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
