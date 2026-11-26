export interface Customer {
  id: number;
  nit: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
}

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 101,
    nit: "890.900.050-1",
    name: "Postobón S.A.",
    email: "compras@postobon.com.co",
    phone: "(604) 2655555",
    city: "Medellín",
  },
  {
    id: 102,
    nit: "860.005.224-3",
    name: "PuroPollo S.A.",
    email: "facturacion@puropollo.com.co",
    phone: "(601) 4123300",
    city: "Bogotá",
  },
  {
    id: 103,
    nit: "890.300.120-8",
    name: "Ingenio Manuelita S.A.",
    email: "proveedores@manuelita.com",
    phone: "(602) 2715000",
    city: "Palmira",
  },
  {
    id: 104,
    nit: "800.198.445-5",
    name: "Industria Harinera del Valle",
    email: "compras@ihv.com.co",
    phone: "(602) 6852000",
    city: "Cali",
  },
];
