/**
 * Indian financial year (1 April – 31 March) and bill number helpers.
 * Dates are plain "YYYY-MM-DD" strings in shop local time, so time zones never shift a bill to another day.
 */

export interface FinYear {
  /** e.g. "2026-27" */
  code: string;
  start: string;
  end: string;
}

function parseDate(date: string): { y: number; m: number; d: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new RangeError(`Date must be YYYY-MM-DD, got "${date}"`);
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  const check = new Date(Date.UTC(y, m - 1, d));
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== m - 1 || check.getUTCDate() !== d) {
    throw new RangeError(`Not a real date: "${date}"`);
  }
  return { y, m, d };
}

export function finYearOf(date: string): FinYear {
  const { y, m } = parseDate(date);
  const startYear = m >= 4 ? y : y - 1;
  const endShort = String((startYear + 1) % 100).padStart(2, "0");
  return {
    code: `${startYear}-${endShort}`,
    start: `${startYear}-04-01`,
    end: `${startYear + 1}-03-31`,
  };
}

export function isInFinYear(date: string, fy: FinYear): boolean {
  parseDate(date);
  return date >= fy.start && date <= fy.end;
}

/**
 * Bill number text. Series is per device/outlet (A, B, W for web, H/R/B/C for hotel outlets).
 * The numeric part is assigned inside the save transaction (golden rule 7), never before.
 */
export function formatBillNo(series: string, number: number, width = 4): string {
  if (!/^[A-Z][A-Z0-9]{0,4}$/.test(series)) {
    throw new RangeError(`Series must be 1–5 capital letters/digits starting with a letter, got "${series}"`);
  }
  if (!Number.isSafeInteger(number) || number < 1) {
    throw new RangeError(`Bill number must be a positive whole number, got ${number}`);
  }
  return `${series}-${String(number).padStart(width, "0")}`;
}

export function parseBillNo(text: string): { series: string; number: number } {
  const match = /^([A-Z][A-Z0-9]{0,4})-(\d+)$/.exec(text);
  if (!match) throw new RangeError(`Invalid bill number: "${text}"`);
  return { series: match[1] ?? "", number: Number(match[2]) };
}
