import { API_BASE_URL, getFetchOptions, parseResponseJson } from "./apiConfig";
import { ServiceCategory, AddServiceCategoryReq, UpdateServiceCategoryReq } from "@/entities/ServiceCategory";

export const getServiceCategories = async (companyId?: number): Promise<ServiceCategory[]> => {
  const response = await fetch(`${API_BASE_URL}/service-categories`, getFetchOptions(companyId));
  const data = await parseResponseJson(response);
  return Array.isArray(data) ? data : [];
};

export const getServiceCategoryById = async (id: number, companyId?: number): Promise<ServiceCategory> => {
  const response = await fetch(`${API_BASE_URL}/service-categories/${id}`, getFetchOptions(companyId));
  return parseResponseJson(response);
};

export const createServiceCategory = async (req: AddServiceCategoryReq, companyId?: number): Promise<ServiceCategory> => {
  const response = await fetch(
    `${API_BASE_URL}/service-categories`,
    getFetchOptions(companyId, {
      method: "POST",
      body: JSON.stringify(req),
    })
  );
  return parseResponseJson(response);
};

export const updateServiceCategory = async (id: number, req: UpdateServiceCategoryReq, companyId?: number): Promise<ServiceCategory> => {
  const response = await fetch(
    `${API_BASE_URL}/service-categories/${id}`,
    getFetchOptions(companyId, {
      method: "PUT",
      body: JSON.stringify(req),
    })
  );
  return parseResponseJson(response);
};

export const deleteServiceCategory = async (id: number, companyId?: number): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/service-categories/${id}`,
    getFetchOptions(companyId, {
      method: "DELETE",
    })
  );
  await parseResponseJson(response);
};
