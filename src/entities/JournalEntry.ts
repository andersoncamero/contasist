import { AccountingMovement } from "./AccountingMovement";

export interface JournalEntry {
  ID: string;
  Date: string;
  Description: string;
  Reference?: string; // Nro de factura o comprobante (Documento Soporte)
  Movements: AccountingMovement[];
  CreatedBy: string;
  CreatedAt: string;
}
