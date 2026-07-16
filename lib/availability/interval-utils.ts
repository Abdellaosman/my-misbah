/**
 * Generic half-open interval algebra: every interval here is `[start, end)`
 * on some numeric axis (minutes-of-day, or epoch milliseconds — the caller
 * decides). Used by the availability engine to union/subtract windows.
 */
export type Interval = [number, number];

/** Merges overlapping/adjacent intervals and sorts by start. Drops empty/invalid ranges. */
export function unionIntervals(intervals: Interval[]): Interval[] {
  const valid = intervals.filter(([s, e]) => e > s).sort((a, b) => a[0] - b[0]);
  const merged: Interval[] = [];
  for (const [start, end] of valid) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1]) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }
  return merged;
}

/** Subtracts `remove` intervals from `base` intervals. Both are first unioned internally. */
export function subtractIntervals(base: Interval[], remove: Interval[]): Interval[] {
  const baseMerged = unionIntervals(base);
  const removeMerged = unionIntervals(remove);
  if (removeMerged.length === 0) return baseMerged;

  const result: Interval[] = [];
  for (const [bStart, bEnd] of baseMerged) {
    let segments: Interval[] = [[bStart, bEnd]];
    for (const [rStart, rEnd] of removeMerged) {
      const next: Interval[] = [];
      for (const [sStart, sEnd] of segments) {
        if (rEnd <= sStart || rStart >= sEnd) {
          // No overlap with this removal window.
          next.push([sStart, sEnd]);
          continue;
        }
        if (rStart > sStart) next.push([sStart, Math.min(rStart, sEnd)]);
        if (rEnd < sEnd) next.push([Math.max(rEnd, sStart), sEnd]);
      }
      segments = next.filter(([s, e]) => e > s);
    }
    result.push(...segments);
  }
  return unionIntervals(result);
}

export function intervalsOverlap(a: Interval, b: Interval): boolean {
  return a[0] < b[1] && b[0] < a[1];
}

export function overlapsAny(candidate: Interval, blocked: Interval[]): boolean {
  return blocked.some((b) => intervalsOverlap(candidate, b));
}

/** True if `candidate` is fully contained within at least one of `free` intervals. */
export function isFullyWithinAny(candidate: Interval, free: Interval[]): boolean {
  return free.some(([s, e]) => candidate[0] >= s && candidate[1] <= e);
}
