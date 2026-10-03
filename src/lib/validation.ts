import { digitsOnly } from './format';

/*
 * Egyptian national ID (الرقم القومي) — 14 digits:
 *   [0] century (2 = 1900s, 3 = 2000s) · [1-6] YYMMDD birth date ·
 *   [7-8] governorate of birth · [9-12] serial (13th digit odd = male) · [13] check digit.
 * The check-digit algorithm is not officially published, so we validate structure only;
 * the production system should verify identity against the original card at intake.
 */

export const GOVERNORATES: Record<string, string> = {
  '01': 'القاهرة',
  '02': 'الإسكندرية',
  '03': 'بورسعيد',
  '04': 'السويس',
  '11': 'دمياط',
  '12': 'الدقهلية',
  '13': 'الشرقية',
  '14': 'القليوبية',
  '15': 'كفر الشيخ',
  '16': 'الغربية',
  '17': 'المنوفية',
  '18': 'البحيرة',
  '19': 'الإسماعيلية',
  '21': 'الجيزة',
  '22': 'بني سويف',
  '23': 'الفيوم',
  '24': 'المنيا',
  '25': 'أسيوط',
  '26': 'سوهاج',
  '27': 'قنا',
  '28': 'أسوان',
  '29': 'الأقصر',
  '31': 'البحر الأحمر',
  '32': 'الوادي الجديد',
  '33': 'مطروح',
  '34': 'شمال سيناء',
  '35': 'جنوب سيناء',
  '88': 'خارج الجمهورية',
};

export interface NationalIdInfo {
  birthDate: string;
  governorate: string;
  gender: 'ذكر' | 'أنثى';
}

export type NationalIdResult = { ok: true; value: string; info: NationalIdInfo } | { ok: false; error: string };

export function parseNationalId(input: string): NationalIdResult {
  const value = digitsOnly(input);
  if (value.length !== 14) return { ok: false, error: 'الرقم القومي يتكون من 14 رقمًا' };

  const century = value[0] === '2' ? 1900 : value[0] === '3' ? 2000 : null;
  if (!century) return { ok: false, error: 'أول رقم في الرقم القومي يجب أن يكون 2 أو 3' };

  const year = century + Number(value.slice(1, 3));
  const month = Number(value.slice(3, 5));
  const day = Number(value.slice(5, 7));
  const birth = new Date(year, month - 1, day);
  const validDate = birth.getFullYear() === year && birth.getMonth() === month - 1 && birth.getDate() === day;
  if (!validDate || birth > new Date()) return { ok: false, error: 'تاريخ الميلاد داخل الرقم القومي غير صحيح' };

  const governorate = GOVERNORATES[value.slice(7, 9)];
  if (!governorate) return { ok: false, error: 'كود المحافظة داخل الرقم القومي غير معروف' };

  const gender = Number(value[12]) % 2 === 1 ? 'ذكر' : 'أنثى';
  const birthDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return { ok: true, value, info: { birthDate, governorate, gender } };
}

/** Egyptian mobile: 010 / 011 / 012 / 015 + 8 digits. Accepts +20 / 0020 prefixes. */
export function parseMobile(input: string): { ok: true; value: string } | { ok: false; error: string } {
  let value = digitsOnly(input);
  if (value.startsWith('0020')) value = `0${value.slice(4)}`;
  else if (value.startsWith('20') && value.length === 12) value = `0${value.slice(2)}`;
  if (!/^01[0125]\d{8}$/.test(value)) return { ok: false, error: 'رقم الموبايل يجب أن يكون 11 رقمًا ويبدأ بـ 010 أو 011 أو 012 أو 015' };
  return { ok: true, value };
}
