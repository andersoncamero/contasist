import { useCallback, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Company, CreateCompanyReq } from "@/entities/Company";
import { API_BASE_URL, getFetchOptions } from "@/services/apiConfig";

interface ApiCompanyResponse {
  id?: number;
  ID?: number;
  name: string;
  nit: string;
  economicActivity?: string;
  economic_activity?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  pdfHeaderImage?: string;
  pdf_header_image?: string;
  pdfShowBorder?: boolean;
  pdf_show_border?: boolean;
  website?: string;
  defaultTaxRate?: string | number;
  default_tax_rate?: string | number;
  tax_id?: string;
  status?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

const mapApiCompany = (apiComp: ApiCompanyResponse): Company => ({
  id: apiComp.id ?? apiComp.ID,
  ID: apiComp.id ?? apiComp.ID,
  name: apiComp.name || "Mi Empresa",
  nit: apiComp.nit || apiComp.tax_id || "",
  economicActivity: apiComp.economicActivity || apiComp.economic_activity || "",
  email: apiComp.email || "",
  phone: apiComp.phone || "",
  address: apiComp.address || "",
  logo: apiComp.logo || "",
  pdfHeaderImage: apiComp.pdfHeaderImage ?? apiComp.pdf_header_image ?? "",
  pdfShowBorder: apiComp.pdfShowBorder ?? apiComp.pdf_show_border ?? true,
  website: apiComp.website || "",
  defaultTaxRate: apiComp.defaultTaxRate !== undefined ? String(apiComp.defaultTaxRate) : (apiComp.default_tax_rate !== undefined ? String(apiComp.default_tax_rate) : "19"),
  status: apiComp.status || "ACTIVE",
  createdAt: apiComp.createdAt || apiComp.created_at,
  updatedAt: apiComp.updatedAt || apiComp.updated_at,
});

const parseResponseJson = async (response: Response) => {
  const text = await response.text();
  if (!response.ok) {
    let errorMessage = "Error en la petición";
    if (text) {
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = text;
      }
    }
    throw new Error(errorMessage);
  }
  if (!text || text.trim() === "") return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

const fetchCompaniesApi = async (): Promise<Company[]> => {
  const response = await fetch(`${API_BASE_URL}/companies`, getFetchOptions());
  const data: ApiCompanyResponse[] = await parseResponseJson(response);
  return Array.isArray(data) ? data.map(mapApiCompany) : [];
};

const createCompanyApi = async (req: CreateCompanyReq): Promise<Company> => {
  const payload = {
    ...req,
    defaultTaxRate: req.defaultTaxRate !== undefined ? Number(req.defaultTaxRate) : undefined,
  };
  const response = await fetch(`${API_BASE_URL}/companies`, getFetchOptions(undefined, {
    method: "POST",
    body: JSON.stringify(payload),
  }));
  const created: ApiCompanyResponse = await parseResponseJson(response);
  return mapApiCompany(created);
};

const updateCompanyApi = async ({ id, data }: { id: number; data: Partial<CreateCompanyReq> }) => {
  const payload = {
    ...data,
    defaultTaxRate: data.defaultTaxRate !== undefined ? Number(data.defaultTaxRate) : undefined,
  };
  const response = await fetch(`${API_BASE_URL}/companies/${id}`, getFetchOptions(undefined, {
    method: "PUT",
    body: JSON.stringify(payload),
  }));
  return parseResponseJson(response);
};

const deleteCompanyApi = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/companies/${id}`, getFetchOptions(undefined, {
    method: "DELETE",
  }));
  return parseResponseJson(response);
};

const DEFAULT_FALLBACK_COMPANY: Company = {
  id: 0,
  ID: 0,
  name: "Sin empresa",
  nit: "",
  email: "",
  phone: "",
  address: "",
  pdfHeaderImage: "",
  pdfShowBorder: true,
  defaultTaxRate: "19",
};

export const useCompany = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompaniesApi,
  });

  const createMutation = useMutation({
    mutationFn: createCompanyApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCompanyApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCompanyApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  const addCompany = async (req: CreateCompanyReq) => {
    try {
      const company = await createMutation.mutateAsync(req);
      return { success: true, data: company };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const companies = useMemo(() => query.data ?? [], [query.data]);
  const storedId = typeof window !== "undefined" ? localStorage.getItem("active_company_id") : null;

  const activeCompanyRecord = useMemo(() => {
    if (companies.length === 0) {
      return null;
    }
    return (
      companies.find((c) => (c.id || c.ID)?.toString() === storedId) ?? companies[0]
    );
  }, [companies, storedId]);

  const activeCompanyId = activeCompanyRecord
    ? String(activeCompanyRecord.id ?? activeCompanyRecord.ID ?? "")
    : "";

  useEffect(() => {
    if (!query.isSuccess || typeof window === "undefined") {
      return;
    }
    if (companies.length === 0) {
      localStorage.removeItem("active_company_id");
      return;
    }
    if (activeCompanyId && storedId !== activeCompanyId) {
      localStorage.setItem("active_company_id", activeCompanyId);
    }
  }, [query.isSuccess, companies.length, activeCompanyId, storedId]);

  const activeCompany = activeCompanyRecord ?? DEFAULT_FALLBACK_COMPANY;

  const businessInfo = useMemo(() => ({
    name: activeCompany.name,
    email: activeCompany.email || "",
    phone: activeCompany.phone || "",
    address: activeCompany.address || "",
    taxId: activeCompany.nit,
    logo: activeCompany.logo,
    pdfHeaderImage: activeCompany.pdfHeaderImage || "",
    pdfShowBorder: activeCompany.pdfShowBorder ?? true,
    website: activeCompany.website,
    defaultTaxRate: activeCompany.defaultTaxRate || "19",
  }), [activeCompany]);

  const refetch = useCallback(async () => {
    await query.refetch();
  }, [query]);

  return {
    companies,
    hasCompanies: companies.length > 0,
    activeCompany,
    activeCompanyId,
    businessInfo,
    isLoading: query.isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: query.error ? (query.error as Error).message : null,
    refetch,
    fetchBusinessInfo: refetch,
    addCompany,
    createCompany: createMutation.mutateAsync,
    updateCompany: updateMutation.mutateAsync,
    deleteCompany: deleteMutation.mutateAsync,
  };
};
