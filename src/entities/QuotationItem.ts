export interface QuotationItem {
  ID?: number;
  ProductID: number;
  ProductName: string;
  Description: string;
  Quantity: number;
  UnitPrice: number;
  Discount: number;
  Subtotal: number;
}