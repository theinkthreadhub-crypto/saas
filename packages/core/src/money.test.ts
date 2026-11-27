import { describe, expect, it } from "vitest";
import {
  formatInr,
  gstOnTaxable,
  lineAmount,
  percentOf,
  roundOffToRupee,
  rupeesToPaise,
  sum,
} from "./money.js";

describe("rupeesToPaise", () => {
  it("parses plain, decimal, symbol and comma amounts", () => {
    expect(rupeesToPaise("10")).toBe(1000);
    expect(rupeesToPaise("10.5")).toBe(1050);
    expect(rupeesToPaise("₹1,23,456.78")).toBe(12345678);
    expect(rupeesToPaise("-2.05")).toBe(-205);
  });
  it("rejects bad input and more than 2 decimals", () => {
    expect(() => rupeesToPaise("abc")).toThrow();
    expect(() => rupeesToPaise("1.234")).toThrow();
    expect(() => rupeesToPaise("")).toThrow();
  });
});

describe("lineAmount", () => {
  it("multiplies rate by whole and decimal quantity", () => {
    expect(lineAmount(4550, 3)).toBe(13650);
    expect(lineAmount(6000, 1.25)).toBe(7500);
    expect(lineAmount(3333, 0.333)).toBe(1110); // 1109.889 → 1110
  });
  it("rejects more than 3 decimals and float rates", () => {
    expect(() => lineAmount(100, 1.2345)).toThrow();
    expect(() => lineAmount(10.5, 1)).toThrow();
  });
});

describe("percentOf", () => {
  it("rounds half away from zero", () => {
    expect(percentOf(10000, 18)).toBe(1800);
    expect(percentOf(105, 10)).toBe(11); // 10.5 → 11
    expect(percentOf(-105, 10)).toBe(-11);
    expect(percentOf(999, 2.5)).toBe(25); // 24.975 → 25
  });
});

describe("gstOnTaxable", () => {
  it("splits intra-state GST into equal CGST and SGST", () => {
    const g = gstOnTaxable(10001, 18, false);
    expect(g.cgst).toBe(g.sgst);
    expect(g.igst).toBe(0);
    expect(g.total).toBe(10001 + g.cgst * 2);
  });
  it("uses IGST for inter-state", () => {
    const g = gstOnTaxable(10000, 12, true);
    expect(g).toEqual({ taxable: 10000, cgst: 0, sgst: 0, igst: 1200, total: 11200 });
  });
  it("handles 0% and 5% slabs", () => {
    expect(gstOnTaxable(5000, 0, false).total).toBe(5000);
    expect(gstOnTaxable(20000, 5, false)).toMatchObject({ cgst: 500, sgst: 500 });
  });
});

describe("roundOffToRupee", () => {
  it("rounds to nearest rupee and returns the difference", () => {
    expect(roundOffToRupee(12349)).toEqual({ rounded: 12300, roundOff: -49 });
    expect(roundOffToRupee(12350)).toEqual({ rounded: 12400, roundOff: 50 });
    expect(roundOffToRupee(12300)).toEqual({ rounded: 12300, roundOff: 0 });
  });
  it("rounded total minus round-off always equals the original", () => {
    for (let t = 0; t < 1000; t += 7) {
      const r = roundOffToRupee(t);
      expect(r.rounded - r.roundOff).toBe(t);
    }
  });
});

describe("sum and formatInr", () => {
  it("adds paise exactly (no 0.1 + 0.2 problem)", () => {
    expect(sum([10, 20])).toBe(30);
    expect(sum([])).toBe(0);
  });
  it("formats with Indian grouping", () => {
    expect(formatInr(12345678)).toBe("₹1,23,456.78");
    expect(formatInr(-5)).toBe("-₹0.05");
    expect(formatInr(0)).toBe("₹0.00");
  });
});
