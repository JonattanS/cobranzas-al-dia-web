
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-CO').format(value);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

export const getCurrencyClass = (value: number): string => {
  if (value > 0) return 'currency-positive';
  if (value < 0) return 'currency-negative';
  return 'currency-zero';
};
