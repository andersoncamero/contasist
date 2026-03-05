export const AccountClass = {
  Activo: 1,
  Pasivo: 2,
  Patrimonio: 3,
  Ingresos: 4,
  Gastos: 5,
  CostosDeVentas: 6,
  CostosDeProduccion: 7,
  CuentasDeOrdenDeudoras: 8,
  CuentasDeOrdenAcreedoras: 9,
}

export const AccountNature = {
  Debito: "Débito",
  Credito: "Crédito",
}

export type AccountClassType = typeof AccountClass[keyof typeof AccountClass];
export type AccountNatureType = typeof AccountNature[keyof typeof AccountNature];

export interface Account {
  id: string;
  business_id: string;
  code: string;
  name: string;
  class: AccountClassType;
  nature: AccountNatureType;
  level: 1 | 2 | 3 | 4;
  description: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
}
