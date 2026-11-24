import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST() {
  try {
    store.resetDemoData();
    return NextResponse.json({ message: 'Demo data successfully reset to initial state' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
