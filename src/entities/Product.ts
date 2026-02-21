export interface Product {
    id: string;
    code: string;
    name: string;
    description: string;
    price: number;
    unit: string;
    category: string;
    isService: boolean;
    initialStock: number;
    minStock: number;
  }