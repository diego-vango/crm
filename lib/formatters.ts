/**
 * Chilean Peso (CLP) currency formatter
 */
export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Calculates financial breakdown for a budget quote
 */
export function calculateBudgetFinancials(
  items: { netAmount: number }[],
  appliesIva: boolean = true,
  nicChileFee: number = 9990
) {
  const totalNet = items.reduce((acc, item) => acc + (Number(item.netAmount) || 0), 0);
  const ivaAmount = appliesIva ? Math.round(totalNet * 0.19) : 0;
  const totalAmount = totalNet + ivaAmount;
  const anticipo50 = Math.round(totalAmount / 2);
  const totalPayToStart = anticipo50 + nicChileFee;

  return {
    totalNet,
    ivaAmount,
    totalAmount,
    anticipo50,
    nicChileFee,
    totalPayToStart,
  };
}

/**
 * Calculate warranty end date (+90 days from start)
 */
export function calculateWarrantyDates(startDateStr?: string) {
  const start = startDateStr ? new Date(startDateStr) : new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 90);

  return {
    warrantyStartDate: start.toISOString().split('T')[0],
    warrantyEndDate: end.toISOString().split('T')[0],
  };
}

/**
 * Format ISO date string to Chilean friendly format
 */
export function formatDateCL(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}
