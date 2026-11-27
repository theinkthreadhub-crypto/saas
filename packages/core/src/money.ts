/**
 * Money helpers. All money is an integer number of paise (1 rupee = 100 paise).
 * Golden rule 4: never use floats for money.
 */

export type Paise = number;

function assertPaise(value: Paise, name = "amount"): void {
  if (!Number.isSafeInteger(value)) {
    throw new RangeError(`${name} must be a whole number of paise, got ${value}`);
  }
}

/** Parse a rupee string like "123.45" or "₹1,234.5" into paise. Rejects more than 2 decimals. */
export function rupeesToPaise(input: string): Paise {
  const clean = input.replace(/[₹,\s]/g, "");
  const match = /^(-)?(\d+)(?:\.(\d{1,2}))?$/.exec(clean);
  if (!match) throw new RangeError(`Invalid rupee amount: "${input}"`);
  const [, sign, whole = "0", frac = ""] = match;
  const paise = Number(whole) * 100 + Number(frac.padEnd(2, "0"));
  assertPaise(paise);
  return sign ? -paise : paise;
}

/** Round half away from zero, on integers only. */
function divRound(numerator: number, denominator: number): number {
  const sign = Math.sign(numerator) * Math.sign(denominator) || 1;
  const n = Math.abs(numerator);
  const d = Math.abs(denominator);
  return sign * Math.floor((n * 2 + d) / (d * 2));
}

/** rate (paise) × quantity, where quantity has up to 3 decimals (e.g. 1.250 kg). */
export function lineAmount(rate: Paise, quantity: number): Paise {
  assertPaise(rate, "rate");
  const qtyMilli = Math.round(quantity * 1000);
  if (Math.abs(qtyMilli - quantity * 1000) > 1e-6) {
    throw new RangeError(`Quantity can have at most 3 decimals, got ${quantity}`);
  }
  return divRound(rate * qtyMilli, 1000);
}

/** Percentage of an amount. percent may have up to 2 decimals (e.g. 2.5, 18). */
export function percentOf(amount: Paise, percent: number): Paise {
  assertPaise(amount);
  const basisPoints = Math.round(percent * 100);
  return divRound(amount * basisPoints, 10000);
}

export interface GstSplit {
  taxable: Paise;
  cgst: Paise;
  sgst: Paise;
  igst: Paise;
  total: Paise;
}

/**
 * GST on a taxable amount. Intra-state → CGST + SGST (half each), inter-state → IGST.
 * CGST and SGST are computed once and copied, so they are always equal.
 */
export function gstOnTaxable(taxable: Paise, ratePercent: number, interState: boolean): GstSplit {
  assertPaise(taxable, "taxable");
  if (interState) {
    const igst = percentOf(taxable, ratePercent);
    return { taxable, cgst: 0, sgst: 0, igst, total: taxable + igst };
  }
  const half = percentOf(taxable, ratePercent / 2);
  return { taxable, cgst: half, sgst: half, igst: 0, total: taxable + half * 2 };
}

/** Round a bill total to the nearest rupee. Returns the rounded total and the round-off entry. */
export function roundOffToRupee(total: Paise): { rounded: Paise; roundOff: Paise } {
  assertPaise(total);
  const rounded = divRound(total, 100) * 100;
  return { rounded, roundOff: rounded - total };
}

/** Sum a list of paise values safely. */
export function sum(values: readonly Paise[]): Paise {
  let total = 0;
  for (const v of values) {
    assertPaise(v);
    total += v;
  }
  assertPaise(total, "total");
  return total;
}

const inrFormat = new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Format paise as "₹1,23,456.78" (Indian grouping). */
export function formatInr(amount: Paise): string {
  assertPaise(amount);
  const sign = amount < 0 ? "-" : "";
  const abs = Math.abs(amount);
  const whole = Math.floor(abs / 100);
  const frac = abs % 100;
  return `${sign}₹${inrFormat.format(whole + frac / 100)}`;
}
