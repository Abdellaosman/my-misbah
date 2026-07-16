/**
 * Formats a Prisma `Decimal` (or decimal-as-string) money value as a
 * fixed-2-decimal string for API responses / display, e.g. `60` -> `"60.00"`.
 * Never do float math on money — this only touches string formatting.
 */
export function formatMoney(amount: { toFixed: (digits: number) => string } | string | number): string {
  if (typeof amount === "object" && "toFixed" in amount) {
    return amount.toFixed(2);
  }
  return Number(amount).toFixed(2);
}
