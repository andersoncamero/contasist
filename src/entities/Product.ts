export type ItemType = 'PIECE' | 'SERVICE';

export interface Product {
  ID: number;
  id?: number;
  CompanyID?: number;
  UserID?: number;
  Code: string;
  code?: string;
  Name: string;
  name?: string;
  Description: string;
  ItemType: ItemType;
  Category: string;
  PackageQuantity?: number;
  PackageUnit?: string;
  BasePrice: number;
  Price: number;
  price?: number;
  TaxRate: number;
  TaxType: string;
  UnitCode: string;
  Unit: number;
  TrackInventory: boolean;
  StockQuantity: number;
  MinStock: number;
  InitialStock?: number;
  initialStock?: number;
  CustomAttributes: Record<string, any>;
  IsService: boolean;
  isService?: boolean;
  IsActive: boolean;
  CreatedAt?: Date | string;
}