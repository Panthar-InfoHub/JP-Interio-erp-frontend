/** Indian digit grouping everywhere: 1,25,000. */
const countFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

const rupeeFormat = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function toNumber(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

/**
 * Rupees are Decimal(12,2) on the server and usually arrive as text ("1250.50").
 * Shown as "₹1,250.50".
 */
export function formatRupees(value: string | number | null | undefined): string {
  const number = toNumber(value);
  return number === null ? "—" : rupeeFormat.format(number);
}

/** Points are whole numbers (1 point = ₹1). Shown as "1,25,000 pts". */
export function formatPoints(value: number | null | undefined): string {
  const number = toNumber(value);
  return number === null ? "—" : `${countFormat.format(number)} pts`;
}

/** A plain count: "1,25,000". */
export function formatCount(value: number | null | undefined): string {
  const number = toNumber(value);
  return number === null ? "—" : countFormat.format(number);
}
