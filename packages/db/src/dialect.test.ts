import { describe, expect, it } from "vitest";
import { rupeesToPaise } from "@setupro/core";
import { paiseToNumeric } from "./pg/dialect.js";

describe("paiseToNumeric", () => {
  it.each([
    [0, "0.00"],
    [5, "0.05"],
    [-40, "-0.40"],
    [100, "1.00"],
    [1234567, "12345.67"],
    [-99999999999999, "-999999999999.99"],
  ])("%i paise → %s", (paise, text) => {
    expect(paiseToNumeric(paise)).toBe(text);
    expect(rupeesToPaise(text)).toBe(paise);
  });

  it("rejects fractions of a paisa", () => {
    expect(() => paiseToNumeric(1.5)).toThrow(RangeError);
  });
});
