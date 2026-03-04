export interface Product {
  ID: number;
  Code: string;
  Name: string;
  Description: string;
  Price: number;
  Unit: number;
  Category: string;
  IsService: boolean;
  InitialStock: number;
  MinStock: number;
  CreatedAt: Date;
}