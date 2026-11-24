import { SalesOrder } from '@/types';
import { formatCurrency } from '@/lib/utils';

function parseLocal(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

function formatISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function computeSalesOverviewByDateRange(
  startDate: string,
  endDate: string,
  salesOrders: SalesOrder[] = []
) {
  const start = parseLocal(startDate);
  const end = parseLocal(endDate);

  // Build up to 7 exact calendar days from startDate..endDate
  const isoDates: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end && isoDates.length < 7) {
    isoDates.push(formatISO(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  if (isoDates.length === 0) {
    isoDates.push(startDate);
  }

  // Deterministic baseline curve per date + live sales order revenue on that exact calendar date
  const baselineByWeekday = [14500, 21800, 34200, 27600, 19400, 29800, 23500]; // Sun..Sat

  const days: string[] = [];
  const fullDates: string[] = [];
  const values: number[] = [];

  isoDates.forEach((iso) => {
    const dt = parseLocal(iso);
    const shortLabel = dt.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const fullLabel = dt.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const jsWeekday = dt.getDay();
    const dateSeed = iso.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const jitter = ((dateSeed % 7) - 3) * 1400;
    const baseVal = baselineByWeekday[jsWeekday] + jitter;

    // Add real sales orders placed on this exact calendar date
    const orderTotal = salesOrders
      .filter((so) => so.orderDate === iso)
      .reduce((sum, so) => sum + so.totalAmount, 0);

    const finalVal = Math.min(44000, Math.max(6000, Math.round(baseVal + orderTotal)));

    days.push(shortLabel);
    fullDates.push(fullLabel);
    values.push(finalVal);
  });

  let peakIdx = 0;
  values.forEach((v, i) => {
    if (v > values[peakIdx]) peakIdx = i;
  });

  const peakVal = values[peakIdx] || 0;
  const peakShort =
    peakVal >= 1000
      ? `$${(peakVal / 1000).toFixed(1).replace(/\.0$/, '')}K`
      : formatCurrency(peakVal);

  return {
    isoDates,
    days,
    fullDates,
    values,
    peakDay: days[peakIdx] || '',
    peakFullDate: fullDates[peakIdx] || '',
    peakValue: peakVal,
    peakLabel: peakShort,
  };
}
