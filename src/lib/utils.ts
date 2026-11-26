import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return "-";
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parsedDate);
}

export function formatShortDate(date: Date | string | null | undefined): string {
  if (!date) return "-";
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) return "-";
  return new Intl.DateTimeFormat('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(parsedDate);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function generateQuotationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `COT-${year}-${random}`;
}
