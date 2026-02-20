export interface Expense {
  ID: string;
  SupplierId: string;
  SupplierName?: string;
  CategoryId: string;
  CategoryName?: string;
  Date: Date;
  DueDate: Date;
  Amount: number;
  TaxAmount: number;
  TotalAmount: number;
  Status: 'pending' | 'paid' | 'overdue';
  Reference?: string;
  Notes?: string;
  CreatedAt: Date;
}
