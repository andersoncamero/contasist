export interface BusinessInfo {
    name: string;
    logo?: string;
    email: string;
    phone: string;
    address: string;
    taxId: string;
    website?: string;
    defaultTaxRate: string;
    pdfHeader?: PdfHeaderConfig;
  }

  export interface PdfHeaderConfig {
  headerImage?: string;
  showBorder?: boolean;
}