import { DEFAULT_API_DOC_CATALOGS, catalogIdForProduct } from "./catalogs";
import { productCodesByTab, PRODUCT_NAME } from "./products";
import { buildSeedEndpoints } from "./seed";
import type {
  ApiDocCatalog,
  ApiEndpoint,
  ApiEndpointInput,
  ApiEndpointUpdate,
  ApiOnlineStatus,
  ApiServiceTab,
  ProductCode,
} from "./types";
import { PRODUCT_CODES } from "./types";

const STORAGE_KEY = "ctp.api-catalog.v1";
const CATALOG_STORAGE_KEY = "ctp.api-catalog.catalogs.v1";

function isProductCode(value: unknown): value is ProductCode {
  return typeof value === "string" && (PRODUCT_CODES as readonly string[]).includes(value);
}

function normalizeProductCodes(raw: Partial<ApiEndpoint>): ProductCode[] {
  const fromList = Array.isArray(raw.productCodes)
    ? raw.productCodes.filter(isProductCode)
    : [];
  if (fromList.length) return [...new Set(fromList)];
  if (isProductCode(raw.productCode)) return [raw.productCode];
  return [];
}

function resolvePrimaryProduct(codes: ProductCode[], fallback?: ProductCode): ProductCode {
  return codes[0] ?? fallback ?? "dci";
}

function normalizeCatalogIds(raw: Partial<ApiEndpoint>, productCode: ProductCode): string[] {
  const ids = Array.isArray(raw.catalogIds)
    ? raw.catalogIds.map((id) => String(id).trim()).filter(Boolean)
    : [];
  if (ids.length) return [...new Set(ids)];
  return [catalogIdForProduct(productCode)];
}

function normalizeEndpoint(raw: ApiEndpoint): ApiEndpoint {
  const productCodes = normalizeProductCodes(raw);
  const productCode = resolvePrimaryProduct(productCodes, raw.productCode);
  const catalogIds = normalizeCatalogIds(raw, productCode);
  return {
    ...raw,
    productCodes,
    productCode,
    catalogIds,
  };
}

function loadEndpoints(): ApiEndpoint[] {
  if (typeof window === "undefined") return buildSeedEndpoints().map(normalizeEndpoint);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildSeedEndpoints().map(normalizeEndpoint);
    const list = JSON.parse(raw) as ApiEndpoint[];
    if (!Array.isArray(list) || list.length === 0) return buildSeedEndpoints().map(normalizeEndpoint);
    return list.map(normalizeEndpoint);
  } catch {
    return buildSeedEndpoints().map(normalizeEndpoint);
  }
}

function loadCatalogs(): ApiDocCatalog[] {
  if (typeof window === "undefined") return DEFAULT_API_DOC_CATALOGS.map((c) => ({ ...c }));
  try {
    const raw = localStorage.getItem(CATALOG_STORAGE_KEY);
    if (!raw) return DEFAULT_API_DOC_CATALOGS.map((c) => ({ ...c }));
    const list = JSON.parse(raw) as ApiDocCatalog[];
    if (!Array.isArray(list) || list.length === 0) {
      return DEFAULT_API_DOC_CATALOGS.map((c) => ({ ...c }));
    }
    return list
      .map((c) => ({
        id: String(c.id),
        name: String(c.name || "").trim() || "未命名目录",
        sort: Number.isFinite(c.sort) ? Number(c.sort) : 0,
      }))
      .sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, "zh"));
  } catch {
    return DEFAULT_API_DOC_CATALOGS.map((c) => ({ ...c }));
  }
}

function persistEndpoints(list: ApiEndpoint[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore quota */
  }
}

function persistCatalogs(list: ApiDocCatalog[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CATALOG_STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore quota */
  }
}

let endpoints: ApiEndpoint[] = loadEndpoints();
let catalogs: ApiDocCatalog[] = loadCatalogs();
const listeners = new Set<() => void>();

function emit() {
  persistEndpoints(endpoints);
  persistCatalogs(catalogs);
  listeners.forEach((fn) => fn());
}

export function subscribeApiCatalog(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function listApiDocCatalogs(): ApiDocCatalog[] {
  return [...catalogs].sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name, "zh"));
}

export function getApiDocCatalog(id: string): ApiDocCatalog | undefined {
  return catalogs.find((c) => c.id === id);
}

export function countEndpointsInCatalog(catalogId: string): number {
  return endpoints.filter((e) => e.catalogIds.includes(catalogId)).length;
}

function newCatalogId() {
  let id = `cat_${Date.now().toString(36)}`;
  let n = 1;
  while (catalogs.some((c) => c.id === id)) {
    id = `cat_${Date.now().toString(36)}_${n++}`;
  }
  return id;
}

export function createApiDocCatalog(input: { name: string; sort?: number }): ApiDocCatalog {
  const name = input.name.trim();
  if (!name) throw new Error("目录名称不能为空");
  const maxSort = catalogs.reduce((m, c) => Math.max(m, c.sort), 0);
  const created: ApiDocCatalog = {
    id: newCatalogId(),
    name,
    sort: input.sort ?? maxSort + 10,
  };
  catalogs = [...catalogs, created];
  emit();
  return created;
}

export function updateApiDocCatalog(
  id: string,
  patch: { name?: string; sort?: number },
): ApiDocCatalog {
  const idx = catalogs.findIndex((c) => c.id === id);
  if (idx < 0) throw new Error("目录不存在");
  const prev = catalogs[idx];
  const next: ApiDocCatalog = {
    ...prev,
    name: patch.name !== undefined ? patch.name.trim() || prev.name : prev.name,
    sort: patch.sort !== undefined && Number.isFinite(patch.sort) ? Number(patch.sort) : prev.sort,
  };
  if (!next.name) throw new Error("目录名称不能为空");
  catalogs = catalogs.map((c, i) => (i === idx ? next : c));
  emit();
  return next;
}

export function deleteApiDocCatalog(id: string) {
  if (!catalogs.some((c) => c.id === id)) throw new Error("目录不存在");
  catalogs = catalogs.filter((c) => c.id !== id);
  endpoints = endpoints.map((e) => {
    const nextIds = e.catalogIds.filter((cid) => cid !== id);
    if (nextIds.length === e.catalogIds.length) return e;
    const catalogIds = nextIds.length ? nextIds : [catalogIdForProduct(e.productCode)];
    return { ...e, catalogIds };
  });
  emit();
}

export function listApiEndpoints(): ApiEndpoint[] {
  return endpoints;
}

export function getApiEndpointById(id: string): ApiEndpoint | undefined {
  return endpoints.find((e) => e.id === id);
}

export function getApiEndpointByCode(apiCode: string): ApiEndpoint | undefined {
  return endpoints.find((e) => e.apiCode === apiCode);
}

function endpointProducts(ep: ApiEndpoint): ProductCode[] {
  return ep.productCodes?.length ? ep.productCodes : ep.productCode ? [ep.productCode] : [];
}

export function listApiEndpointsByProduct(productCode: ProductCode): ApiEndpoint[] {
  return endpoints.filter((e) => endpointProducts(e).includes(productCode));
}

export function listOnlineByProduct(productCode: ProductCode): ApiEndpoint[] {
  return listApiEndpointsByProduct(productCode)
    .filter((e) => e.status === "online")
    .sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
}

export function listApiEndpointsByCatalog(catalogId: string): ApiEndpoint[] {
  return endpoints
    .filter((e) => e.catalogIds.includes(catalogId))
    .sort((a, b) => a.apiName.localeCompare(b.apiName, "zh"));
}

export function listOnlineByCatalog(catalogId: string): ApiEndpoint[] {
  return listApiEndpointsByCatalog(catalogId).filter((e) => e.status === "online");
}

export function listApiEndpointsByTab(tab: ApiServiceTab): ApiEndpoint[] {
  const codes = productCodesByTab(tab);
  return endpoints
    .filter((e) => endpointProducts(e).some((code) => codes.includes(code)))
    .sort((a, b) => {
      const ia = Math.min(...endpointProducts(a).map((c) => codes.indexOf(c)).filter((i) => i >= 0), 99);
      const ib = Math.min(...endpointProducts(b).map((c) => codes.indexOf(c)).filter((i) => i >= 0), 99);
      if (ia !== ib) return ia - ib;
      return a.apiName.localeCompare(b.apiName, "zh");
    });
}

function newId(apiCode: string) {
  const base = apiCode.trim().replace(/[^a-zA-Z0-9_-]/g, "_") || "api";
  let id = base;
  let n = 1;
  while (endpoints.some((e) => e.id === id)) {
    id = `${base}-${n++}`;
  }
  return id;
}

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function resolveAssociationFields(input: {
  productCode?: ProductCode;
  productCodes?: ProductCode[];
  catalogIds?: string[];
}) {
  const productCodes = normalizeProductCodes(input as Partial<ApiEndpoint>);
  const productCode = resolvePrimaryProduct(productCodes, input.productCode);
  const catalogIds = normalizeCatalogIds(input as Partial<ApiEndpoint>, productCode);
  if (!catalogIds.length) throw new Error("请至少选择一个文档目录");
  return { productCodes, productCode, catalogIds };
}

export function createApiEndpoint(input: ApiEndpointInput): ApiEndpoint {
  const apiCode = input.apiCode.trim();
  if (!apiCode) throw new Error("apiCode 不能为空");
  if (endpoints.some((e) => e.apiCode === apiCode)) {
    throw new Error(`apiCode「${apiCode}」已存在`);
  }
  if (!input.path.startsWith("/")) {
    throw new Error("path 须以 / 开头");
  }
  const { productCodes, productCode, catalogIds } = resolveAssociationFields(input);
  const stamp = nowStamp();
  const created: ApiEndpoint = {
    ...input,
    id: newId(apiCode),
    apiCode,
    apiName: input.apiName.trim(),
    path: input.path.trim(),
    version: input.version.trim() || "v1",
    description: input.description.trim(),
    owner: input.owner.trim(),
    productCodes,
    productCode,
    catalogIds,
    status: input.status ?? "offline",
    createdAt: input.createdAt ?? stamp,
    updatedAt: input.updatedAt ?? input.createdAt ?? stamp,
    docFile: input.docFile ?? null,
    requestParamsText: input.requestParamsText ?? "",
    responseFieldsText: input.responseFieldsText ?? "",
    pathParams: input.pathParams ?? [],
    queryParams: input.queryParams ?? [],
    headerParams: input.headerParams ?? [],
    bodyParams: input.bodyParams ?? [],
    responseParams: input.responseParams ?? [],
    errorCodes: input.errorCodes ?? [],
    exampleRequest: input.exampleRequest ?? "",
    exampleResponse: input.exampleResponse ?? "",
  };
  endpoints = [...endpoints, created];
  emit();
  return created;
}

export function updateApiEndpoint(id: string, patch: ApiEndpointUpdate): ApiEndpoint {
  const idx = endpoints.findIndex((e) => e.id === id);
  if (idx < 0) throw new Error("接口不存在");
  const prev = endpoints[idx];
  if (patch.path !== undefined && !patch.path.startsWith("/")) {
    throw new Error("path 须以 / 开头");
  }

  const nextRaw = { ...prev, ...patch };
  const { productCodes, productCode, catalogIds } = resolveAssociationFields({
    productCode: patch.productCode ?? prev.productCode,
    productCodes: patch.productCodes ?? prev.productCodes,
    catalogIds: patch.catalogIds ?? prev.catalogIds,
  });

  const next: ApiEndpoint = {
    ...nextRaw,
    apiCode: prev.apiCode,
    createdAt: prev.createdAt,
    updatedAt: patch.updatedAt ?? nowStamp(),
    apiName: patch.apiName !== undefined ? patch.apiName.trim() : prev.apiName,
    path: patch.path !== undefined ? patch.path.trim() : prev.path,
    version: patch.version !== undefined ? patch.version.trim() || "v1" : prev.version,
    description: patch.description !== undefined ? patch.description.trim() : prev.description,
    owner: patch.owner !== undefined ? patch.owner.trim() : prev.owner,
    docFile: patch.docFile !== undefined ? patch.docFile : prev.docFile,
    productCodes,
    productCode,
    catalogIds,
  };
  endpoints = endpoints.map((e, i) => (i === idx ? next : e));
  emit();
  return next;
}

export function setApiEndpointStatus(id: string, status: ApiOnlineStatus) {
  const stamp = nowStamp();
  endpoints = endpoints.map((e) =>
    e.id === id ? { ...e, status, updatedAt: stamp } : e,
  );
  emit();
}

export function deleteApiEndpoint(id: string) {
  const exists = endpoints.some((e) => e.id === id);
  if (!exists) throw new Error("接口不存在");
  endpoints = endpoints.filter((e) => e.id !== id);
  emit();
}

export function apiEndpointTitle(ep: ApiEndpoint) {
  const products = endpointProducts(ep);
  const label = products.length
    ? products.map((c) => PRODUCT_NAME[c]).join(" / ")
    : "未关联产品";
  return `${label} - ${ep.apiName}`;
}

export function isApiCodeTaken(apiCode: string, exceptId?: string) {
  const code = apiCode.trim();
  return endpoints.some((e) => e.apiCode === code && e.id !== exceptId);
}
