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
};

export const AccountNature = {
  Debito: "Débito",
  Credito: "Crédito",
};

export type AccountClassType = typeof AccountClass[keyof typeof AccountClass];
export type AccountNatureType = typeof AccountNature[keyof typeof AccountNature];

export interface Account {
  id: number;
  class: AccountClassType;
  code: string;
  name: string;
  description: string;
  nature: AccountNatureType;
  level: number;
  parent_id?: number | null;
  is_active: boolean;
}

export interface CreateAccountReq {
  code: string;
  name: string;
  description?: string;
  nature?: AccountNatureType;
  parentId: number;
}

export interface UpdateAccountReq {
  name: string;
  description?: string;
  isActive?: boolean;
}