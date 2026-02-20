import { create } from "zustand";
import { persist } from "zustand/middleware";
import { API_BASE_URL, getAuthHeader } from "@/services/apiConfig";
import { BusinessInfo } from "@/entities/BusinessInfo";

interface BusinessState {
  businessInfo: BusinessInfo;
  isLoading: boolean;
  error: string | null;

  fetchBusinessInfo: () => Promise<void>;
  updateBusinessInfo: (
    info: Partial<BusinessInfo>,
  ) => Promise<{ success: boolean; error?: string }>;
}

interface ApiPdfHeaderConfig {
  header_image?: string;
  show_border?: boolean;
}

interface ApiBusinessResponse {
  name: string;
  logo?: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  website?: string;
  default_tax_rate: string;
  pdf_header?: ApiPdfHeaderConfig;
}

const defaultBusinessInfo: BusinessInfo = {
  name: "Mi Empresa",
  email: "contacto@miempresa.com",
  phone: "+52 55 1234 5678",
  address: "Ciudad de México, México",
  taxId: "RFC123456789",
  defaultTaxRate: "16",
};

const mapApiBusinessInfo = (apiData: ApiBusinessResponse): BusinessInfo => ({
  name: apiData.name,
  logo: apiData.logo,
  email: apiData.email,
  phone: apiData.phone,
  address: apiData.address,
  taxId: apiData.tax_id,
  website: apiData.website,
  defaultTaxRate: apiData.default_tax_rate,
  pdfHeader: apiData.pdf_header
    ? {
        headerImage: apiData.pdf_header.header_image,
        showBorder: apiData.pdf_header.show_border,
      }
    : undefined,
});

export const useBusiness = create<BusinessState>()(
  persist(
    (set) => ({
      businessInfo: defaultBusinessInfo,
      isLoading: false,
      error: null,

      fetchBusinessInfo: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/business`, {
            headers: getAuthHeader(),
          });

          if (!response.ok) {
            throw new Error("Error al obtener información del negocio");
          }

          const data: ApiBusinessResponse = await response.json();
          set({ businessInfo: mapApiBusinessInfo(data), isLoading: false });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      updateBusinessInfo: async (info) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(`${API_BASE_URL}/business`, {
            method: "PUT",
            headers: getAuthHeader(),
            body: JSON.stringify({
              name: info.name,
              logo: info.logo,
              email: info.email,
              phone: info.phone,
              address: info.address,
              tax_id: info.taxId,
              website: info.website,
              default_tax_rate: info.defaultTaxRate,
              pdf_header: info.pdfHeader
                ? {
                    header_image: info.pdfHeader.headerImage,
                    show_border: info.pdfHeader.showBorder,
                  }
                : undefined,
            }),
          });
          
          if (!response.ok) {
            set({ isLoading: false });
            return {
              success: false,
              error:  "Error al actualizar información",
            };
          }

          set((state) => ({
            businessInfo: { ...state.businessInfo, ...info },
            isLoading: false,
          }));
          return { success: true };
        } catch (error) {
          set((state) => ({
            businessInfo: { ...state.businessInfo, ...info },
            isLoading: false,
          }));
          return { success: true };
        }
      },
    }),
    {
      name: "ContAsist-business",
    },
  ),
);
