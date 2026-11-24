import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const result = store.markSalePaid(params.id);
    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
