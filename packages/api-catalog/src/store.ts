import { productCodesByTab, PRODUCT_NAME } from "./products";
import { buildSeedEndpoints } from "./seed";
import type {
  ApiEndpoint,
  ApiEndpointInput,
  ApiEndpointUpdate,
  ApiOnlineStatus,
  ApiServiceTab,
  ProductCode,
} from "./types";

const STORAGE_KEY = "ctp.api-catalog.v1";

function loadEndpoints(): ApiEndpoint[] {
  if (typeof window === "undefined") return buildSeedEndpoints();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildSeedEndpoints();
    const list = JSON.parse(raw) as ApiEndpoint[];
    if (!Array.isArray(list) || list.length === 0) return buildSeedEndpoints();
    return list;
  } catch {
    return buildSeedEndpoints();
  }
}

function persist(list: ApiEndpoint[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore quota */
  }
}

let endpoints: ApiEndpoint[] = loadEndpoints();
const listeners = new Set<() => void>();

function emit() {
  persist(endpoints);
  listeners.forEach((fn) => fn());
}

export function subscribeApiCatalog(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
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

export function listApiEndpointsByProduct(productCode: ProductCode): ApiEndpoint[] {
  return endpoints.filter((e) => e.productCode === productCode);
}

export function listOnlineByProduct(productCode: ProductCode): ApiEndpoint[] {
  return listApiEndpointsByProduct(productCode)
    .filter((e) => e.status === "online")
    .sort((a, b) => (b.updatedAt || b.createdAt).localeCompare(a.updatedAt || a.createdAt));
}

export function listApiEndpointsByTab(tab: ApiServiceTab): ApiEndpoint[] {
  const codes = productCodesByTab(tab);
  return endpoints
    .filter((e) => codes.includes(e.productCode))
    .sort((a, b) => {
      const ia = codes.indexOf(a.productCode);
      const ib = codes.indexOf(b.productCode);
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

export function createApiEndpoint(input: ApiEndpointInput): ApiEndpoint {
  const apiCode = input.apiCode.trim();
  if (!apiCode) throw new Error("apiCode 不能为空");
  if (endpoints.some((e) => e.apiCode === apiCode)) {
    throw new Error(`apiCode「${apiCode}」已存在`);
  }
  if (!input.path.startsWith("/")) {
    throw new Error("path 须以 / 开头");
  }
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
  const next: ApiEndpoint = {
    ...prev,
    ...patch,
    apiCode: prev.apiCode,
    createdAt: prev.createdAt,
    updatedAt: patch.updatedAt ?? nowStamp(),
    apiName: patch.apiName !== undefined ? patch.apiName.trim() : prev.apiName,
    path: patch.path !== undefined ? patch.path.trim() : prev.path,
    version: patch.version !== undefined ? patch.version.trim() || "v1" : prev.version,
    description: patch.description !== undefined ? patch.description.trim() : prev.description,
    owner: patch.owner !== undefined ? patch.owner.trim() : prev.owner,
    docFile: patch.docFile !== undefined ? patch.docFile : prev.docFile,
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
  return `${PRODUCT_NAME[ep.productCode]} - ${ep.apiName}`;
}

export function isApiCodeTaken(apiCode: string, exceptId?: string) {
  const code = apiCode.trim();
  return endpoints.some((e) => e.apiCode === code && e.id !== exceptId);
}
