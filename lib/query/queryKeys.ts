/** Every TanStack Query key in one place, so screens refresh the right data. */
export const queryKeys = {
  auth: {
    sessions: ["auth", "sessions"] as const,
  },
  zones: {
    all: ["zones"] as const,
    /** Active zones for pickers and filters. */
    options: ["zones", "options"] as const,
    list: (query: Record<string, string | number>) => ["zones", "list", query] as const,
  },
  users: {
    all: ["users"] as const,
    /** Active Zonal Heads with no zone: the ones who can be put in charge of a zone. */
    spareZonalHeads: ["users", "spare-zonal-heads"] as const,
    list: (query: Record<string, string | number>) => ["users", "list", query] as const,
    detail: (id: string) => ["users", "detail", id] as const,
    orgTree: ["users", "org-tree"] as const,
    /** Active ASMs for pickers and filters (optionally one zone). */
    asmOptions: (zoneId: string | null) => ["users", "asm-options", zoneId] as const,
    /** Admins, Sub-Admins and Zonal Heads: the staff who make ledger lines. */
    lineMakerOptions: ["users", "line-maker-options"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    view: (period: string, rankAsmsBy: string) => ["dashboard", period, rankAsmsBy] as const,
  },
  kyc: {
    all: ["kyc"] as const,
    queue: (query: Record<string, string | number>) => ["kyc", "queue", query] as const,
    detail: (id: string) => ["kyc", "detail", id] as const,
  },
  partners: {
    all: ["partners"] as const,
    list: (query: Record<string, string | number>) => ["partners", "list", query] as const,
    detail: (id: string) => ["partners", "detail", id] as const,
  },
  ledger: {
    all: ["ledger"] as const,
    list: (query: Record<string, string | number>) => ["ledger", "list", query] as const,
    partnerWallet: (id: string) => ["ledger", "wallet", id] as const,
    partnerLines: (id: string, query: Record<string, string | number>) =>
      ["ledger", "partner-lines", id, query] as const,
    partnerScans: (id: string, query: Record<string, string | number>) =>
      ["ledger", "partner-scans", id, query] as const,
    liability: (asOf: string | null) => ["ledger", "liability", asOf] as const,
  },
  payouts: {
    all: ["payouts"] as const,
    list: (query: Record<string, string | number>) => ["payouts", "list", query] as const,
    detail: (id: string) => ["payouts", "detail", id] as const,
  },
  /** Brands, categories and products share one root: a change to one can change the others' counts. */
  catalog: {
    all: ["catalog"] as const,
    brands: (query: Record<string, string | number>) => ["catalog", "brands", query] as const,
    categoryTree: ["catalog", "category-tree"] as const,
    /** Every brand (on and off) for filters and pickers. */
    brandOptions: ["catalog", "brand-options"] as const,
    products: (query: Record<string, string | number>) => ["catalog", "products", query] as const,
    /** The app catalog preview (what partners see). */
    app: {
      products: (query: Record<string, string | number>) =>
        ["catalog", "app", "products", query] as const,
      categories: ["catalog", "app", "categories"] as const,
      brands: ["catalog", "app", "brands"] as const,
    },
  },
};
