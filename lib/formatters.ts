// lib/formatters.ts

export const formatCLP = (amount: number): string => {
  if (amount === undefined || amount === null) return '$0';
  return `$ ${Math.round(amount).toLocaleString('es-CL')}`;
};

// Formateo exacto de fecha sin desfase de zona horaria (YYYY-MM-DD -> DD-MM-YYYY)
export const formatDateCL = (dateStr: string): string => {
  if (!dateStr) return '';
  
  // Extraer solo la parte YYYY-MM-DD
  const cleanStr = String(dateStr).split('T')[0].trim();
  const parts = cleanStr.split('-');
  
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
  }
  
  return cleanStr;
};

export const calculateWarrantyDates = (startDate?: string) => {
  const start = startDate ? new Date(startDate + 'T12:00:00') : new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 90);

  return {
    warrantyStartDate: start.toISOString().split('T')[0],
    warrantyEndDate: end.toISOString().split('T')[0],
  };
};

export const calculateBudgetFinancials = (
  items: { netAmount: number }[],
  appliesIva: boolean,
  nicChileFee: number = 0
) => {
  const totalNet = (items || []).reduce((sum, item) => sum + (Number(item.netAmount) || 0), 0);
  const ivaAmount = appliesIva ? Math.round(totalNet * 0.19) : 0;
  const totalAmount = totalNet + ivaAmount;
  const anticipo50 = Math.round(totalAmount / 2);

  return {
    totalNet,
    ivaAmount,
    totalAmount,
    anticipo50,
    totalPayToStart: anticipo50 + (nicChileFee || 0),
  };
};
