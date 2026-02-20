export enum AccountClass {
  Activo = 1,
  Pasivo = 2,
  Patrimonio = 3,
  Ingresos = 4,
  Gastos = 5,
  CostosDeVentas = 6,
  CostosDeProduccion = 7,
  CuentasDeOrdenDeudoras = 8,
  CuentasDeOrdenAcreedoras = 9,
}

export enum AccountNature {
  Debito = "Débito",
  Credito = "Crédito",
}

export interface Account {
  ID: string;
  Code: string; // Ej: 110505 (6 dígitos para subcuenta)
  Name: string;
  Class: AccountClass;
  Nature: AccountNature;
  Level: 1 | 2 | 3 | 4; // 1: Clase, 2: Grupo, 3: Cuenta, 4: Subcuenta
  ParentID?: string;
  IsActive: boolean;
  CreatedAt: string;
}
