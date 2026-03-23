/**
 * مرافق منطق منظومة مزايا - Mzaya Utils
 * الهدف: توحيد الحسابات والتنسيقات في كل التروس
 */

// تنسيق العملة بشكل احترافي (أرقام عربية + ج.م)
export function formatPrice(price: number): string {
  if (price === undefined || price === null) return '0 ج.م';
  return `${new Intl.NumberFormat('en-US').format(price)} ج.م`;
}

// حساب الأرباح والهامش (Core Business Logic)
export function calcProfit(price: number, cost: number, shipping = 0): {
  profit: number, 
  margin: number
} {
  const profit = price - cost - shipping;
  const margin = price > 0 ? (profit / price) * 100 : 0;
  return { 
    profit: parseFloat(profit.toFixed(2)), 
    margin: parseFloat(margin.toFixed(2)) 
  };
}

// توليد رقم فاتورة فريد ومعبر
export function generateInvoiceId(): string {
  const timestamp = Date.now().toString().slice(-4);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `MZ-${timestamp}-${random}`;
}

// توحيد تنسيق أرقام الموبايل للواتساب
export function normalizePhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '2' + cleaned;
  }
  return cleaned.startsWith('2') ? `+${cleaned}` : `+2${cleaned}`;
}

// اختصار النصوص الطويلة (للمنتجات في الكاشير)
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}
