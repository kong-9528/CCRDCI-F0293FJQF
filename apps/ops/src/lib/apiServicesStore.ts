import { useEffect, useState } from "react";
import {
  apiEndpointTitle,
  createApiEndpoint,
  getApiEndpointById,
  isApiCodeTaken,
  listApiEndpointsByTab,
  setApiEndpointStatus,
  subscribeApiCatalog,
  updateApiEndpoint,
  API_STATUS_LABEL,
  API_TAB_LABEL,
  PRODUCT_CODES,
  PRODUCT_NAME,
  type ApiEndpoint,
  type ApiEndpointInput,
  type ApiEndpointUpdate,
  type ApiErrorCode,
  type ApiOnlineStatus,
  type ApiParam,
  type ApiServiceTab,
  type HttpMethod,
  type ProductCode,
} from "@ctp/api-catalog";

export type {
  ApiEndpoint as ProductApiEndpoint,
  ApiEndpoint,
  ApiErrorCode,
  ApiOnlineStatus,
  ApiParam,
  ApiServiceTab,
  HttpMethod,
  ProductCode,
};

export {
  API_STATUS_LABEL,
  API_TAB_LABEL,
  PRODUCT_CODES,
  PRODUCT_NAME,
  apiEndpointTitle,
  createApiEndpoint,
  getApiEndpointById,
  isApiCodeTaken,
  setApiEndpointStatus,
  updateApiEndpoint,
};

export function getApiEndpointsByTab(tab: ApiServiceTab): ApiEndpoint[] {
  return listApiEndpointsByTab(tab);
}

export function useApiServicesStore() {
  const [, setTick] = useState(0);
  useEffect(() => {
    return subscribeApiCatalog(() => setTick((n) => n + 1));
  }, []);
  return {
    getByTab: listApiEndpointsByTab,
    getById: getApiEndpointById,
    setStatus: setApiEndpointStatus,
    create: createApiEndpoint,
    update: updateApiEndpoint,
    isCodeTaken: isApiCodeTaken,
    titleOf: apiEndpointTitle,
  };
}

export type { ApiEndpointInput, ApiEndpointUpdate };
