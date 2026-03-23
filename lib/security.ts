/**
 * مكتبة الأمان الموحدة - Mzaya Security
 * حماية المدخلات ومنع الاختراقات في كل تروس المنظومة
 */

// ── Sanitize input (Anti-XSS) ──
export function sanitize(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

// ── Detect SQL injection patterns ──
const SQL_PATTERNS = [
  /(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bCREATE\b|\bALTER\b)/i,
  /(-{2}|\/\*|\*\/|;)/,
  /(\bOR\b|\bAND\b)\s+\d+\s*=\s*\d+/i,
  /(UNION\s+SELECT)/i,
];

export function isSQLInjection(input: string): boolean {
  return SQL_PATTERNS.some(pattern => pattern.test(input));
}

// ── Validate & sanitize form data ──
export function validateInput(value: string, maxLength = 500): { safe: boolean; value: string; error?: string } {
  if (!value || typeof value !== 'string') return { safe: false, value: '', error: 'قيمة غير صالحة' };
  if (value.length > maxLength) return { safe: false, value: '', error: `الحد الأقصى ${maxLength} حرف` };
  if (isSQLInjection(value)) return { safe: false, value: '', error: 'محتوى غير مسموح به' };
  return { safe: true, value: sanitize(value) };
}

// ── Validate Phone (Egyptian focus) ──
export function validatePhone(phone: string): boolean {
  // تنظيف الرقم من أي مسافات أو رموز قبل الفحص
  const cleaned = phone.replace(/[\s\+\-]/g, '');
  return /^(20|0)?1[0-2,5]\d{8}$/.test(cleaned);
}

// ── Validate Username (Store Link) ──
export function validateUsername(username: string): boolean {
  // يسمح فقط بالحروف الصغيرة، الأرقام، والشرطة السفلية (احترافي للروابط)
  return /^[a-z0-9_]{3,20}$/.test(username);
}

// ── Validate Price ──
export function validatePrice(price: any): boolean {
  const n = Number(price);
  // السعر لازم يكون رقم موجب، ومعاه بحد أقصى قرشين (decimal places)
  return !isNaN(n) && n >= 0 && n <= 1000000 && Number.isFinite(n);
}

// ── Rate limit check (In-Memory Client Side) ──
const attemptMap = new Map<string, { count: number; lastAttempt: number }>();

export function checkClientRateLimit(key: string, maxAttempts = 5, windowMs = 5 * 60 * 1000): boolean {
  const now = Date.now();
  const record = attemptMap.get(key);
  
  if (!record || now - record.lastAttempt > windowMs) {
    attemptMap.set(key, { count: 1, lastAttempt: now });
    return true;
  }
  
  if (record.count >= maxAttempts) return false;
  
  record.count++;
  record.lastAttempt = now;
  return true;
}

// ── Log security event ──
export async function logSecurityEvent(supabase: any, action: string, details?: string, severity: 'info'|'warning'|'critical' = 'info') {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('system_logs').insert({
      user_id: user?.id,
      action,
      details: sanitize(details || ''),
      severity,
      created_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Security Logging Failed:', error);
  }
}
