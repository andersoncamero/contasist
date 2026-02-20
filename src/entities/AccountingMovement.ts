export interface AccountingMovement {
  AccountID: string;
  AccountCode: string;
  AccountName: string;
  TerceroID?: string; // Soporte para terceros (Clientes/Proveedores)
  TerceroNombre?: string;
  Debit: number;
  Credit: number;
  Description?: string;
}
