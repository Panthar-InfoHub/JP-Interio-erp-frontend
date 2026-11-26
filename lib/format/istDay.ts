/**
 * India-day helpers for filters. A date picker gives a calendar day ("2026-11-21");
 * list endpoints want moments with the India offset (docs/api: "from" / "to" are
 * "at or after" / "at or before"); CSV reports want the plain day.
 */
const IST_OFFSET = "+05:30";
const DAY = /^\d{4}-\d{2}-\d{2}$/;

/** "2026-11-21" → "2026-11-21T00:00:00.000+05:30" (start of that India day). */
export function istDayStart(day: string): string {
  if (!DAY.test(day)) throw new Error(`Not a day: ${day}`);
  return `${day}T00:00:00.000${IST_OFFSET}`;
}

/** "2026-11-21" → "2026-11-21T23:59:59.999+05:30" (end of that India day). */
export function istDayEnd(day: string): string {
  if (!DAY.test(day)) throw new Error(`Not a day: ${day}`);
  return `${day}T23:59:59.999${IST_OFFSET}`;
}

/**
 * A list query whose `from` / `to` are plain days (as kept in the page address) → the
 * same query with India-time moments for the API. A bad day (hand-edited address) is
 * left out rather than breaking the page.
 */
export function withIstMoments(
  query: Record<string, string | number>,
): Record<string, string | number> {
  const result = { ...query };
  for (const [key, toMoment] of [
    ["from", istDayStart],
    ["to", istDayEnd],
  ] as const) {
    const value = result[key];
    if (typeof value !== "string") continue;
    if (DAY.test(value)) result[key] = toMoment(value);
    else delete result[key];
  }
  return result;
}

/** Today's date in India as "YYYY-MM-DD" (whatever the computer's own time zone). */
export function todayInIndia(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

/** "2026-11-22" + 7 → "2026-11-29" (calendar days, no time-zone shift). */
export function addDays(day: string, days: number): string {
  if (!DAY.test(day)) throw new Error(`Not a day: ${day}`);
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year!, month! - 1, date! + days)).toISOString().slice(0, 10);
}

/** A local calendar Date (from the date picker) → "YYYY-MM-DD", no time-zone shift. */
export function toDayString(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** "YYYY-MM-DD" → a local calendar Date for the date picker. */
export function fromDayString(day: string): Date | undefined {
  if (!DAY.test(day)) return undefined;
  const [year, month, date] = day.split("-").map(Number);
  return new Date(year!, month! - 1, date);
}
