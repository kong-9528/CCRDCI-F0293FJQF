import { useEffect, useState } from "react";
import { PRODUCTS, productName, type ProductCode } from "@/lib/catalog";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
export type ApiOnlineStatus = "online" | "offline";

export type ApiParam = {
  name: string;
  type: string;
  required: boolean;
  desc: string;
};

export type ProductApiEndpoint = {
  id: string;
  productCode: ProductCode;
  /** 接口短名，如「单个调用」 */
  name: string;
  path: string;
  method: HttpMethod;
  requestParams: ApiParam[];
  responseParams: ApiParam[];
  status: ApiOnlineStatus;
};

export type ApiServiceTab = "verify" | "audit";

export const API_TAB_LABEL: Record<ApiServiceTab, string> = {
  verify: "版权核验接口管理",
  audit: "智能审核接口管理",
};

export const API_STATUS_LABEL: Record<ApiOnlineStatus, string> = {
  online: "上线",
  offline: "下线",
};

const commonAuth: ApiParam[] = [
  { name: "X-Api-Key", type: "string", required: true, desc: "客户 API Key（请求头）" },
];

const commonResponse: ApiParam[] = [
  { name: "code", type: "number", required: true, desc: "业务状态码，0 表示成功" },
  { name: "message", type: "string", required: true, desc: "提示信息" },
  { name: "data", type: "object", required: false, desc: "业务数据" },
  { name: "requestId", type: "string", required: true, desc: "请求追踪 ID" },
];

function singleBody(field: string, desc: string): ApiParam[] {
  return [
    ...commonAuth,
    { name: field, type: "string", required: true, desc },
    { name: "callbackUrl", type: "string", required: false, desc: "异步回调地址（可选）" },
  ];
}

function batchBody(field: string, desc: string): ApiParam[] {
  return [
    ...commonAuth,
    { name: "items", type: "array", required: true, desc: `批量条目，每项含 ${field}（${desc}）` },
    { name: "callbackUrl", type: "string", required: false, desc: "异步回调地址（可选）" },
  ];
}

function buildEndpoints(): ProductApiEndpoint[] {
  const list: ProductApiEndpoint[] = [];

  for (const p of PRODUCTS.filter((x) => x.category === "verify")) {
    const base = `/v1/verify/${p.code}`;
    list.push(
      {
        id: `${p.code}-single`,
        productCode: p.code,
        name: "单个调用",
        path: `${base}/single`,
        method: "POST",
        requestParams: singleBody("payload", "待核验内容标识或原文"),
        responseParams: commonResponse,
        status: "online",
      },
      {
        id: `${p.code}-batch`,
        productCode: p.code,
        name: "批量调用",
        path: `${base}/batch`,
        method: "POST",
        requestParams: batchBody("payload", "待核验内容标识或原文"),
        responseParams: commonResponse,
        status: p.code === "certificate" ? "offline" : "online",
      },
    );
  }

  for (const p of PRODUCTS.filter((x) => x.category === "audit")) {
    const base = `/v1/audit/${p.code}`;
    list.push(
      {
        id: `${p.code}-single`,
        productCode: p.code,
        name: "单个调用",
        path: `${base}/single`,
        method: "POST",
        requestParams: singleBody("content", "待审核内容或资源地址"),
        responseParams: commonResponse,
        status: p.code === "infringement" ? "offline" : "online",
      },
      {
        id: `${p.code}-batch`,
        productCode: p.code,
        name: "批量调用",
        path: `${base}/batch`,
        method: "POST",
        requestParams: batchBody("content", "待审核内容或资源地址"),
        responseParams: commonResponse,
        status: "offline",
      },
    );
  }

  return list;
}

let endpoints: ProductApiEndpoint[] = buildEndpoints();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getApiEndpoints(): ProductApiEndpoint[] {
  return endpoints;
}

/** 按产品顺序平铺：产品 > 接口 */
export function getApiEndpointsByTab(tab: ApiServiceTab): ProductApiEndpoint[] {
  const codes = PRODUCTS.filter((p) => p.category === tab).map((p) => p.code);
  return endpoints
    .filter((e) => codes.includes(e.productCode))
    .sort((a, b) => {
      const ia = codes.indexOf(a.productCode);
      const ib = codes.indexOf(b.productCode);
      if (ia !== ib) return ia - ib;
      return a.name.localeCompare(b.name, "zh");
    });
}

export function setApiEndpointStatus(id: string, status: ApiOnlineStatus) {
  endpoints = endpoints.map((e) => (e.id === id ? { ...e, status } : e));
  emit();
}

export function apiEndpointTitle(ep: ProductApiEndpoint) {
  return `${productName(ep.productCode)} - ${ep.name}`;
}

export function useApiServicesStore() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const onChange = () => setTick((n) => n + 1);
    return subscribe(onChange);
  }, []);
  return {
    getByTab: getApiEndpointsByTab,
    setStatus: setApiEndpointStatus,
    titleOf: apiEndpointTitle,
  };
}
