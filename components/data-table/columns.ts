import {
  createColumnHelper,
  metaHelper,
  type RowData,
  tableFeatures,
  type ColumnDef,
} from "@tanstack/react-table";

/** Extra column settings the panel's DataTable understands. */
export interface DataColumnMeta {
  /** The server's sort field for this column (e.g. "createdAt"). Leave out = not sortable. */
  sortField?: string;
  /** Direction of the first click on the header. Default: "asc" (A → Z / oldest first). */
  firstSort?: "asc" | "desc";
  /** Right-align numbers and amounts. */
  align?: "start" | "end";
  /** Label on phone cards when `header` is not plain text. */
  label?: string;
  /** Leave this column out of the phone cards. */
  hideOnMobile?: boolean;
  /** Shown big at the top of the phone card (usually the name). */
  primary?: boolean;
}

/**
 * Lists are paged, sorted and filtered by the server (R13), so the table needs no
 * client row models; it only lays out the page the server sent.
 */
export const dataTableFeatures = tableFeatures({ columnMeta: metaHelper<DataColumnMeta>() });

export type DataTableFeatures = typeof dataTableFeatures;

// The `any` is the column's value type; it varies per column (TanStack's own pattern).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataColumns<T extends RowData> = ColumnDef<DataTableFeatures, T, any>[];

/**
 * Column helper for a list's rows. Define columns once at module level (or in
 * useMemo), never inline in render: new column arrays make the table redo its work.
 *
 *   const col = createColumns<Zone>();
 *   const columns = col.columns([
 *     col.accessor("name", { header: "Name", meta: { sortField: "name", primary: true } }),
 *   ]);
 */
export function createColumns<T extends RowData>() {
  return createColumnHelper<DataTableFeatures, T>();
}
