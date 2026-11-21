import type { components } from "@/types/api/reports";

type S = components["schemas"];

/**
 * `GET /dashboard` replies (docs/api/reports.openapi.yaml; backend dashboard.service.ts).
 * Written out here because the API file's `allOf` shapes generate loose types (cards
 * marked optional, Sub-Admin areas always present). Leaf shapes come from the
 * generated types.
 */
export type DashboardPeriodKey = S["Period"]["key"];
export type AsmRanking = S["Leaderboards"]["topAsms"]["rankedBy"];

export type PartnerCards = S["PartnerCards"];
export type ScanCards = S["ScanCards"];
export type CountAmount = S["CountAmount"];
export type PayoutCards = S["PayoutCards"];
export type LiabilityCards = S["Liability"];
export type RequestCards = S["RequestCards"];
export type TaskCards = S["TaskCards"];
export type Leaderboards = S["Leaderboards"];
export type TopPartner = Leaderboards["topPartners"][number];
export type TopAsm = Leaderboards["topAsms"]["items"][number];

type Head = S["DashboardHead"];

export interface AdminDashboard extends Head {
  role: "admin";
  cards: {
    staff: { total: number; byRole: Record<string, number> };
    partners: PartnerCards;
    scans: ScanCards;
    pointsLiability: LiabilityCards;
    payouts: PayoutCards;
    requests: RequestCards;
    tasks: TaskCards;
    tickets: { open: number; inProgress: number };
    leaderboards: Leaderboards;
  };
}

export interface RewardsCards {
  payouts: PayoutCards;
  pointsIssued: number;
  pointsIssuedRupees: string;
  pointsLiability: LiabilityCards;
  manualChanges: { count: number; pointsAdded: number; pointsTaken: number };
}

export interface ProductCards {
  active: number;
  inactive: number;
  topByScans: {
    rank: number;
    product: { id: string; sku: string; name: string; active: boolean };
    scans: number;
    points: number;
  }[];
}

export interface QrCards {
  batchesMade: number;
  batchesVoided: number;
  codes: { total: number; printed: number; scanned: number; notScanned: number; void: number };
}

export interface SubAdminTaskCards extends TaskCards {
  givenByMe: { open: number; overdue: number };
}

export type SubAdminArea = "partners" | "rewards" | "products" | "qr" | "tasks" | "requests";

export interface SubAdminDashboard extends Head {
  role: "sub_admin";
  areas: SubAdminArea[];
  /** Only the areas held. */
  cards: {
    partners?: PartnerCards;
    rewards?: RewardsCards;
    products?: ProductCards;
    qr?: QrCards;
    tasks?: SubAdminTaskCards;
    requests?: RequestCards;
  };
}

export interface AsmPerformanceRow {
  asm: { id: string; name: string; phone: string };
  partnersOnboarded: number;
  activePartners: number;
  dormantPartners: number;
  scans: number;
  points: number;
  pointsRupees: string;
  requests: { open: number; deliveredInPeriod: number; pipelineValue: string };
  tasks: { completed: number; onTime: number; overdue: number };
  salesExecutives: number;
}

export interface ZonalHeadDashboard extends Head {
  role: "zonal_head";
  /** null = not assigned to a zone yet (every number is then zero). */
  zoneId: string | null;
  cards: {
    partners: PartnerCards;
    scans: ScanCards;
    payouts: { toApprove: CountAmount; toPay: CountAmount };
    requests: RequestCards;
    tasks: { zone: TaskCards; mine: TaskCards };
    asmPerformance: AsmPerformanceRow[];
    leaderboards: Leaderboards;
  };
}

/** The web console shows these three; ASM / Sales Executive use the field app. */
export type Dashboard = AdminDashboard | SubAdminDashboard | ZonalHeadDashboard;
