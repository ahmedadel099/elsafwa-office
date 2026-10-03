/*
 * Formatting helpers. Design decision: the UI is Arabic but uses Western
 * digits (0-9) everywhere — they match what staff type and what appears on
 * printed government receipts' reference numbers, and they keep tables
 * scannable. Input fields accept Arabic-Indic digits and normalise them.
 */

const LOCALE = 'ar-EG-u-nu-latn';

const moneyFormatter = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });
const numberFormatter = new Intl.NumberFormat('en-US');
const dateFormatter = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });
const shortDateFormatter = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });
const timeFormatter = new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit' });
const weekdayFormatter = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const relativeFormatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });

const DAY_MS = 86_400_000;

export function formatMoney(amount: number): string {
  return `${moneyFormatter.format(Math.round(amount))} ج.م`;
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

export function formatDate(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
}

export function formatShortDate(iso?: string): string {
  if (!iso) return '—';
  return shortDateFormatter.format(new Date(iso));
}

export function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const date = new Date(iso);
  return `${dateFormatter.format(date)}، ${timeFormatter.format(date)}`;
}

export function formatToday(): string {
  return weekdayFormatter.format(new Date());
}

/** "قبل 3 أيام" / "بعد يومين" / "اليوم" */
export function formatRelative(iso?: string): string {
  if (!iso) return '—';
  const diffMs = new Date(iso).getTime() - Date.now();
  const minutes = Math.round(diffMs / 60_000);
  if (Math.abs(minutes) < 60) return relativeFormatter.format(minutes, 'minute');
  const hours = Math.round(diffMs / 3_600_000);
  if (Math.abs(hours) < 24) return relativeFormatter.format(hours, 'hour');
  return relativeFormatter.format(Math.round(diffMs / DAY_MS), 'day');
}

/** Whole calendar days from today until the given date (negative = past). */
export function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

/** Add business days, skipping Friday and Saturday (the government weekend). */
export function addBusinessDays(fromIso: string, days: number): string {
  const date = new Date(fromIso);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    const day = date.getDay();
    if (day !== 5 && day !== 6) added++;
  }
  return date.toISOString();
}

export function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Convert Arabic-Indic (٠-٩) and Persian (۰-۹) digits to ASCII 0-9. */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/** Keep digits only (after normalising Arabic-Indic digits). */
export function digitsOnly(value: string): string {
  return normalizeDigits(value).replace(/\D/g, '');
}

/** "01012345678" → "010 1234 5678" */
export function formatPhone(phone: string): string {
  return phone.length === 11 ? `${phone.slice(0, 3)} ${phone.slice(3, 7)} ${phone.slice(7)}` : phone;
}

export function maskNationalId(nid: string): string {
  if (nid.length < 4) return '••••';
  return `${'•'.repeat(Math.max(0, nid.length - 4))}${nid.slice(-4)}`;
}

export function maskPhone(phone: string): string {
  if (phone.length < 6) return phone;
  return `${phone.slice(0, 3)}${'•'.repeat(phone.length - 6)}${phone.slice(-3)}`;
}

export function initials(fullName: string): string {
  const parts = fullName
    .replace(/^(الحاج|د\.|م\.|أ\.|الأستاذة?|المهندس|الدكتور)\s+/u, '')
    .split(/\s+/)
    .filter(Boolean);
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join(' ');
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} بايت`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} ك.ب`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
}

/* ------------------------------------------------------------------
   تفقيط — amount in Arabic words for receipts:
   "فقط ألف وخمسمائة جنيه مصري لا غير"
   ------------------------------------------------------------------ */

const ONES = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
const TEENS = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
const TENS = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
const HUNDREDS = ['', 'مائة', 'مائتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];

/** `beforeNoun`: the counted noun follows directly, so 200 takes the construct form "مائتا". */
function belowThousand(n: number, beforeNoun = false): string {
  const parts: string[] = [];
  const h = Math.floor(n / 100);
  const rest = n % 100;
  if (h) parts.push(h === 2 && rest === 0 && beforeNoun ? 'مائتا' : HUNDREDS[h]);
  if (rest >= 10 && rest < 20) parts.push(TEENS[rest - 10]);
  else {
    const t = Math.floor(rest / 10);
    const o = rest % 10;
    if (o && t) parts.push(`${ONES[o]} و${TENS[t]}`);
    else if (o) parts.push(ONES[o]);
    else if (t) parts.push(TENS[t]);
  }
  return parts.join(' و');
}

interface ScaleWords {
  one: string;
  two: string;
  twoBeforeNoun: string;
  few: string;
  many: string;
}

/** e.g. 12 thousand → "اثنا عشر ألفًا" (followed by more parts) or "اثنا عشر ألف" (directly before the noun). */
function scaled(n: number, words: ScaleWords, beforeNoun: boolean): string {
  if (n === 1) return words.one;
  if (n === 2) return beforeNoun ? words.twoBeforeNoun : words.two;
  if (n >= 3 && n <= 10) return `${belowThousand(n)} ${words.few}`;
  const unit = n % 100 >= 11 && !beforeNoun ? words.many : words.one;
  return `${belowThousand(n)} ${unit}`;
}

const MILLION: ScaleWords = { one: 'مليون', two: 'مليونان', twoBeforeNoun: 'مليونا', few: 'ملايين', many: 'مليونًا' };
const THOUSAND: ScaleWords = { one: 'ألف', two: 'ألفان', twoBeforeNoun: 'ألفا', few: 'آلاف', many: 'ألفًا' };

function integerToWords(n: number): string {
  if (n === 0) return 'صفر';
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;
  const parts: string[] = [];
  if (millions) parts.push(scaled(millions, MILLION, !thousands && !rest));
  if (thousands) parts.push(scaled(thousands, THOUSAND, !rest));
  if (rest) parts.push(belowThousand(rest, true));
  return parts.join(' و');
}

export function amountInWords(amount: number): string {
  const n = Math.round(Math.abs(amount));
  const lastTwo = n % 100;
  let currency = 'جنيه مصري';
  if (n === 2) currency = 'جنيهان مصريان';
  else if (lastTwo >= 3 && lastTwo <= 10) currency = 'جنيهات مصرية';
  else if (lastTwo >= 11) currency = 'جنيهًا مصريًا';
  const words = n === 1 ? 'جنيه مصري واحد' : n === 2 ? currency : `${integerToWords(n)} ${currency}`;
  return `فقط ${words} لا غير`;
}
