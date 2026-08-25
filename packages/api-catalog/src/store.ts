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

let endpoints: ApiEndpoint[] = buildSeedEndpoints();
const listeners = new Set<() => void>();

function emit() {
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
  return listApiEndpointsByProduct(productCode).filter((e) => e.status === "online");
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

export function createApiEndpoint(input: ApiEndpointInput): ApiEndpoint {
  const apiCode = input.apiCode.trim();
  if (!apiCode) throw new Error("apiCode 不能为空");
  if (endpoints.some((e) => e.apiCode === apiCode)) {
    throw new Error(`apiCode「${apiCode}」已存在`);
  }
  if (!input.path.startsWith("/")) {
    throw new Error("path 须以 / 开头");
  }
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
    apiName: patch.apiName !== undefined ? patch.apiName.trim() : prev.apiName,
    path: patch.path !== undefined ? patch.path.trim() : prev.path,
    version: patch.version !== undefined ? patch.version.trim() || "v1" : prev.version,
    description: patch.description !== undefined ? patch.description.trim() : prev.description,
    owner: patch.owner !== undefined ? patch.owner.trim() : prev.owner,
  };
  endpoints = endpoints.map((e, i) => (i === idx ? next : e));
  emit();
  return next;
}

export function setApiEndpointStatus(id: string, status: ApiOnlineStatus) {
  endpoints = endpoints.map((e) => (e.id === id ? { ...e, status } : e));
  emit();
}

export function apiEndpointTitle(ep: ApiEndpoint) {
  return `${PRODUCT_NAME[ep.productCode]} - ${ep.apiName}`;
}

export function isApiCodeTaken(apiCode: string, exceptId?: string) {
  const code = apiCode.trim();
  return endpoints.some((e) => e.apiCode === code && e.id !== exceptId);
}
