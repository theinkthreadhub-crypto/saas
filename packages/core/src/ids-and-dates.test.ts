import { describe, expect, it } from "vitest";
import { isUuidV7, uuidv7, uuidv7Time } from "./uuid.js";
import { finYearOf, formatBillNo, isInFinYear, parseBillNo } from "./finyear.js";

describe("uuidv7", () => {
  it("creates valid v7 ids that carry their time", () => {
    const now = Date.UTC(2026, 10, 27, 6, 51);
    const id = uuidv7(now);
    expect(isUuidV7(id)).toBe(true);
    expect(uuidv7Time(id)).toBe(now);
  });
  it("is unique and sorted even in the same millisecond", () => {
    const now = Date.now();
    const ids = Array.from({ length: 2000 }, () => uuidv7(now));
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(ids);
  });
});

describe("finYearOf", () => {
  it("April starts a new year, March ends it", () => {
    expect(finYearOf("2026-04-01").code).toBe("2026-27");
    expect(finYearOf("2027-03-31").code).toBe("2026-27");
    expect(finYearOf("2026-03-31").code).toBe("2025-26");
    expect(finYearOf("2099-12-01").code).toBe("2099-00");
  });
  it("checks membership and rejects bad dates", () => {
    const fy = finYearOf("2026-11-27");
    expect(isInFinYear("2027-02-28", fy)).toBe(true);
    expect(isInFinYear("2027-04-01", fy)).toBe(false);
    expect(() => finYearOf("2026-02-30")).toThrow();
    expect(() => finYearOf("27/11/2026")).toThrow();
  });
});

describe("bill numbers", () => {
  it("formats and parses per-device series", () => {
    expect(formatBillNo("A", 1)).toBe("A-0001");
    expect(formatBillNo("W", 12345)).toBe("W-12345");
    expect(parseBillNo("B-0042")).toEqual({ series: "B", number: 42 });
  });
  it("rejects bad series and numbers", () => {
    expect(() => formatBillNo("a", 1)).toThrow();
    expect(() => formatBillNo("A", 0)).toThrow();
    expect(() => parseBillNo("A0001")).toThrow();
  });
});
