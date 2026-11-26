import type { Setting } from "@/lib/api/settings.api";

/**
 * How the Settings page groups and words the server's settings (DEC-301). The server owns
 * the values, limits and descriptions; this only adds a group and a unit per key. A key not
 * listed here goes to "Other" with no unit, so a new server setting still shows.
 */

export const SETTING_GROUPS = [
  { id: "login", title: "Login (OTP)" },
  { id: "sessions", title: "Sessions" },
  { id: "payouts", title: "Payouts" },
  { id: "partners", title: "Partners & sign-up" },
  { id: "qr", title: "QR codes" },
  { id: "other", title: "Other" },
] as const;

export type SettingGroupId = (typeof SETTING_GROUPS)[number]["id"];

const KEYS: Record<string, { group: SettingGroupId; unit: string; unitOne?: string }> = {
  "otp.length": { group: "login", unit: "digits", unitOne: "digit" },
  "otp.expiry_minutes": { group: "login", unit: "minutes", unitOne: "minute" },
  "otp.max_attempts": { group: "login", unit: "tries", unitOne: "try" },
  "otp.resend_wait_seconds": { group: "login", unit: "seconds", unitOne: "second" },
  "session.web_days": { group: "sessions", unit: "days", unitOne: "day" },
  "session.app_days": { group: "sessions", unit: "days", unitOne: "day" },
  "payout.min_points": { group: "payouts", unit: "points", unitOne: "point" },
  "onboarding.draft_days": { group: "partners", unit: "days", unitOne: "day" },
  "partners.dormant_days": { group: "partners", unit: "days", unitOne: "day" },
  "qr.max_batch_size": { group: "qr", unit: "codes", unitOne: "code" },
  "qr.max_points_per_code": { group: "qr", unit: "points", unitOne: "point" },
};

export function settingGroup(key: string): SettingGroupId {
  return KEYS[key]?.group ?? "other";
}

/** "5 minutes", "1 day", "10,000 codes" (Indian digit grouping); plain number if no unit. */
export function withUnit(key: string, value: unknown): string {
  if (typeof value !== "number") return value === null || value === undefined ? "—" : String(value);
  const text = value.toLocaleString("en-IN");
  const info = KEYS[key];
  if (!info) return text;
  return `${text} ${value === 1 && info.unitOne ? info.unitOne : info.unit}`;
}

/** The settings of each group, in the server's order; empty groups are left out. */
export function groupSettings(settings: Setting[]) {
  return SETTING_GROUPS.map((group) => ({
    ...group,
    settings: settings.filter((setting) => settingGroup(setting.key) === group.id),
  })).filter((group) => group.settings.length > 0);
}
