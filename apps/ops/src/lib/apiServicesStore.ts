import { useEffect, useState } from "react";
import {
  apiEndpointTitle,
  countEndpointsInCatalog,
  createApiDocCatalog,
  createApiEndpoint,
  deleteApiDocCatalog,
  deleteApiEndpoint,
  getApiDocCatalog,
  getApiEndpointById,
  isApiCodeTaken,
  listApiDocCatalogs,
  listApiEndpoints,
  listApiEndpointsByCatalog,
  listApiEndpointsByTab,
  listOnlineByCatalog,
  setApiEndpointStatus,
  subscribeApiCatalog,
  updateApiDocCatalog,
  updateApiEndpoint,
  API_STATUS_LABEL,
  API_TAB_LABEL,
  PRODUCT_CODES,
  PRODUCT_NAME,
  type ApiDocCatalog,
  type ApiDocFile,
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
  ApiDocCatalog,
  ApiDocFile,
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
  countEndpointsInCatalog,
  createApiDocCatalog,
  createApiEndpoint,
  deleteApiDocCatalog,
  deleteApiEndpoint,
  getApiDocCatalog,
  getApiEndpointById,
  isApiCodeTaken,
  listApiDocCatalogs,
  listApiEndpoints,
  listApiEndpointsByCatalog,
  listOnlineByCatalog,
  setApiEndpointStatus,
  subscribeApiCatalog,
  updateApiDocCatalog,
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
    list: listApiEndpoints,
    getByTab: listApiEndpointsByTab,
    getById: getApiEndpointById,
    setStatus: setApiEndpointStatus,
    create: createApiEndpoint,
    update: updateApiEndpoint,
    remove: deleteApiEndpoint,
    isCodeTaken: isApiCodeTaken,
    titleOf: apiEndpointTitle,
    listCatalogs: listApiDocCatalogs,
    createCatalog: createApiDocCatalog,
    updateCatalog: updateApiDocCatalog,
    removeCatalog: deleteApiDocCatalog,
    countInCatalog: countEndpointsInCatalog,
  };
}

export type { ApiEndpointInput, ApiEndpointUpdate };
