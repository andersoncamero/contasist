export interface QuotationItem {
  ID?: number;
  ProductID: string;
  ProductName: string;
  Description: string;
  Quantity: number;
  UnitPrice: number;
  Discount: number;
  Subtotal: number;
}