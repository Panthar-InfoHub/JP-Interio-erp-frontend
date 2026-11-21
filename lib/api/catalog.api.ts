import { apiClient } from "@/lib/api/client";
import { getPage, type ListQuery } from "@/lib/api/paged";
import type { ApiSuccess } from "@/types/api-response";
import type { components } from "@/types/api/catalog";

type Schemas = components["schemas"];

export type Brand = Schemas["Brand"];
export type BrandCreate = Schemas["BrandCreate"];
/** Send only what changes (the generated type marks every field as required). */
export type BrandUpdate = Partial<Schemas["BrandUpdate"]>;

export interface ListBrandsParams {
  page?: number;
  limit?: number;
  sort?: string;
  status?: "active" | "inactive";
  search?: string;
}

export type CategoryTreeNode = Schemas["CategoryTreeNode"];
export type Category = Schemas["Category"];
export type CategoryCreate = Schemas["CategoryCreate"];
/** Send only what changes (the generated type marks every field as required). */
export type CategoryUpdate = Partial<Schemas["CategoryUpdate"]>;

export type Product = Schemas["Product"];
export type ProductCreate = Schemas["ProductCreate"];
/** Send only what changes (the generated type marks fields as required). */
export type ProductUpdate = Partial<Schemas["ProductUpdate"]>;

/** The app catalog's light shapes (what partners see). */
export type CatalogProduct = Schemas["CatalogProduct"];
export type CatalogCategory = Schemas["CatalogCategory"];
export interface CatalogBrand {
  id: string;
  name: string;
}

export interface ListProductsParams {
  page?: number;
  limit?: number;
  sort?: string;
  brandId?: string;
  /** Includes every category below it. */
  categoryId?: string;
  thickness?: string;
  grade?: string;
  status?: "active" | "inactive";
  search?: string;
}

const brand = (id: string) => `/brands/${encodeURIComponent(id)}`;
const product = (id: string) => `/products/${encodeURIComponent(id)}`;
const category = (id: string) => `/categories/${encodeURIComponent(id)}`;

/**
 * Brands (docs/api/catalog.openapi.yaml). Admin and the Products & Catalog Sub-Admin
 * (`products.manage`). Nothing is deleted, only switched off; every change is audited.
 */
export const brandsApi = {
  list: (params: ListBrandsParams | ListQuery) => getPage<Brand>("/brands", { ...params }),

  /** Every brand, on and off, A → Z, for filters and pickers (one page of the server's max). */
  options: async () => (await getPage<Brand>("/brands", { sort: "name", limit: 100 })).items,

  /** Name unique (any case, extra spaces ignored); code optional, saved in CAPITALS (409 CONFLICT). */
  create: async (input: BrandCreate) =>
    (await apiClient.post<ApiSuccess<Brand>>("/brands", input)).data,

  /** Send only what changes. `code: null` removes the code. */
  update: async (id: string, changes: BrandUpdate) =>
    (await apiClient.patch<ApiSuccess<Brand>>(brand(id), changes)).data,

  /** Its products leave the app catalog and can't be requested; QR batches still allowed. */
  deactivate: async (id: string) =>
    (await apiClient.post<ApiSuccess<Brand>>(`${brand(id)}/deactivate`)).data,

  reactivate: async (id: string) =>
    (await apiClient.post<ApiSuccess<Brand>>(`${brand(id)}/reactivate`)).data,
};

/**
 * Categories (docs/api/catalog.openapi.yaml), `products.manage`. One tree of any depth;
 * a category is really on only when it and every category above it are on.
 */
export const categoriesApi = {
  /** The whole tree, nested, on and off, with counts. Not paged. */
  tree: async () =>
    (await apiClient.get<ApiSuccess<CategoryTreeNode[]>>("/categories/tree")).data.data,

  /** No `parentId` = top level. The parent must be really on; names unique among siblings (409). */
  create: async (input: CategoryCreate) =>
    (await apiClient.post<ApiSuccess<Category>>("/categories", input)).data,

  /** Rename and / or move (`parentId: null` = top level). Everything below moves with it. */
  update: async (id: string, changes: CategoryUpdate) =>
    (await apiClient.patch<ApiSuccess<Category>>(category(id), changes)).data,

  /** Everything below goes off too; the message says how many. */
  deactivate: async (id: string) =>
    (await apiClient.post<ApiSuccess<Category>>(`${category(id)}/deactivate`)).data,

  /** Turns on its own switch; the message says if a category above keeps it off. */
  reactivate: async (id: string) =>
    (await apiClient.post<ApiSuccess<Category>>(`${category(id)}/reactivate`)).data,
};

/**
 * Products for staff (docs/api/catalog.openapi.yaml), `products.manage`. Each shows
 * `visibleInApp` and `hiddenBecause`, and `skuLocked` once it has a QR batch (DEC-122).
 */
export const productsApi = {
  list: (params: ListProductsParams | ListQuery) => getPage<Product>("/products", { ...params }),

  /** Brand on, category really on, SKU unique (capitals / spaces ignored), image from `product_image`. */
  create: async (input: ProductCreate) =>
    (await apiClient.post<ApiSuccess<Product>>("/products", input)).data,

  /** Send only what changes; `null` clears thickness / size / grade. SKU locked → 409. */
  update: async (id: string, changes: ProductUpdate) =>
    (await apiClient.patch<ApiSuccess<Product>>(product(id), changes)).data,

  /** Hidden from the apps; no new requests and no new QR batches. */
  deactivate: async (id: string) =>
    (await apiClient.post<ApiSuccess<Product>>(`${product(id)}/deactivate`)).data,

  reactivate: async (id: string) =>
    (await apiClient.post<ApiSuccess<Product>>(`${product(id)}/reactivate`)).data,
};

/**
 * The read-only app catalog (`catalog.view`, every staff role): only products whose
 * product, brand and category chain are on; light fields only (DEC-115).
 */
export const appCatalogApi = {
  /** Paged. `categoryId` includes everything below; sort name / mrp. */
  products: (params: ListQuery) => getPage<CatalogProduct>("/catalog/products", { ...params }),

  /** Switched-on categories, nested. Not paged. */
  categories: async () =>
    (await apiClient.get<ApiSuccess<CatalogCategory[]>>("/catalog/categories")).data.data,

  /** Switched-on brands, A → Z. Not paged. */
  brands: async () =>
    (await apiClient.get<ApiSuccess<CatalogBrand[]>>("/catalog/brands")).data.data,
};
