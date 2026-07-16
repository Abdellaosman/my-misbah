import { describe, expect, it } from "vitest";
import { unionIntervals, subtractIntervals, overlapsAny, isFullyWithinAny } from "@/lib/availability/interval-utils";

describe("unionIntervals", () => {
  it("merges overlapping and adjacent intervals", () => {
    expect(unionIntervals([[0, 10], [10, 20], [30, 40], [5, 15]])).toEqual([
      [0, 20],
      [30, 40],
    ]);
  });

  it("drops empty/invalid intervals", () => {
    expect(unionIntervals([[5, 5], [10, 8], [0, 3]])).toEqual([[0, 3]]);
  });
});

describe("subtractIntervals", () => {
  it("splits a base interval when a removal falls in the middle", () => {
    expect(subtractIntervals([[0, 100]], [[40, 60]])).toEqual([
      [0, 40],
      [60, 100],
    ]);
  });

  it("removes an interval entirely when it fully covers the base", () => {
    expect(subtractIntervals([[10, 20]], [[0, 100]])).toEqual([]);
  });

  it("is a no-op when there is nothing to remove", () => {
    expect(subtractIntervals([[0, 10]], [])).toEqual([[0, 10]]);
  });

  it("handles multiple non-overlapping removals", () => {
    expect(subtractIntervals([[0, 100]], [[10, 20], [50, 60]])).toEqual([
      [0, 10],
      [20, 50],
      [60, 100],
    ]);
  });
});

describe("overlapsAny / isFullyWithinAny", () => {
  it("detects overlap correctly, including touching-but-not-overlapping", () => {
    expect(overlapsAny([10, 20], [[15, 25]])).toBe(true);
    expect(overlapsAny([10, 20], [[20, 30]])).toBe(false); // half-open: touching is not overlapping
  });

  it("requires full containment for isFullyWithinAny", () => {
    expect(isFullyWithinAny([10, 20], [[0, 30]])).toBe(true);
    expect(isFullyWithinAny([10, 20], [[15, 30]])).toBe(false);
  });
});
