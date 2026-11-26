export interface PriceListItem {
  id?: number;
  priceListId?: number;
  itemNumber: number;
  productId: number;
  product?: {
    id: number;
    code: string;
    name: string;
    unitCode: string;
    category?: string;
    basePrice: number;
  };
  productCode?: string;
  productName?: string;
  unitCode?: string;
  regularPrice: number;
  negotiatedPrice: number;
  discountPercentage?: number;
  deliveryDays?: number;
  comments?: string;
}

export interface PriceList {
  id: number;
  companyId?: number;
  customerId?: number;
  customerName: string;
  name: string;
  code: string;
  paymentTermsDays: number;
  validityMonths: number;
  isDefault: boolean;
  isActive: boolean;
  createdAt?: Date | string;
  items: PriceListItem[];
}
