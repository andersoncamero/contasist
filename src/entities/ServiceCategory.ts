export interface ServiceCategory {
  id: number;
  companyId: number;
  name: string;
  description?: string;
  industryType?: string;
  attributeSchema?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddServiceCategoryReq {
  companyId?: number;
  name: string;
  description?: string;
  industryType?: string;
  attributeSchema?: string;
}

export interface UpdateServiceCategoryReq {
  name?: string;
  description?: string;
  industryType?: string;
  attributeSchema?: string;
  isActive?: boolean;
}
