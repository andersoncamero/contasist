import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { formatCurrency, formatDate } from './utils';
import { Quotation } from '@/entities/Quotation';
import { Client } from '@/entities/Client';
import { PriceList } from '@/entities/PriceList';
import { Invoice } from '@/entities/Invoice';

async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generatePDF(
  quotation: Quotation,
  client: Client | undefined | null,
  businessInfo: any
) {
  const doc = new jsPDF();
  const pdfHeader = businessInfo?.pdfHeader;

  doc.setLineWidth(0.3);
  doc.setDrawColor(100, 100, 100);

  doc.roundedRect(10, 10, 110, 32, 1, 1, 'S');

  let textX = 14;
  const logoUrl = pdfHeader?.headerImage || businessInfo?.logo;
  if (logoUrl) {
    const logoImg = await loadImageAsBase64(logoUrl);
    if (logoImg) {
      doc.addImage(logoImg, 'PNG', 13, 13, 22, 22);
      textX = 38;
    }
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(businessInfo?.name || 'Taller Refreembobinado', textX, 16);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`R.I.F. / NIT: ${businessInfo?.taxId || '8753720'}`, textX, 21);
  const splitAddress = doc.splitTextToSize(`Dirección: ${businessInfo?.address || 'calle 18 #50-05 Soledad-Atlantico'}`, 116 - textX);
  doc.text(splitAddress, textX, 26);
  doc.text(`Tel: ${businessInfo?.phone || '3108408564'} | Email: ${businessInfo?.email || 'hiroldo-camero@hotmail.com'}`, textX, 37);

  doc.roundedRect(124, 10, 76, 32, 1, 1, 'S');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('COTIZACIÓN', 162, 16, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.line(124, 19, 200, 19);

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  doc.text('Fecha Impresión:', 127, 24);
  doc.text(formatDate(now), 197, 24, { align: 'right' });

  doc.text('Hora Impresión:', 127, 28);
  doc.text(timeStr, 197, 28, { align: 'right' });

  doc.text('Fecha Emisión:', 127, 33);
  doc.text(formatDate(quotation.CreatedAt), 197, 33, { align: 'right' });

  doc.line(124, 35, 200, 35);
  doc.setFont('helvetica', 'bold');
  doc.text('Cotización No:', 127, 39);
  doc.text(quotation.Number || '0000000446', 197, 39, { align: 'right' });

  doc.roundedRect(10, 45, 190, 30, 1, 1, 'S');

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Cliente:', 13, 50);
  doc.setFont('helvetica', 'normal');
  const clientNameStr = `${client?.ID || quotation.ClientID || ''} - ${client?.Name || quotation.ClientName || 'Cliente'}`;
  doc.text(clientNameStr, 30, 50);

  doc.setFont('helvetica', 'bold');
  doc.text('N.I.T. / R.I.F.:', 135, 50);
  doc.setFont('helvetica', 'normal');
  doc.text(client?.TaxID || 'El NIT', 160, 50);

  doc.setFont('helvetica', 'bold');
  doc.text('Dirección:', 13, 56);
  doc.setFont('helvetica', 'normal');
  doc.text(client?.Address || quotation.ClientAddress || 'La dirección, Calle, Avenida, CC, Oficina', 30, 56);

  doc.setFont('helvetica', 'bold');
  doc.text('Teléfonos:', 13, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(client?.Phone || quotation.ClientPhone || 'Numero Telf', 30, 62);

  doc.setFont('helvetica', 'bold');
  doc.text('Email:', 135, 62);
  doc.setFont('helvetica', 'normal');
  doc.text(client?.Email || quotation.ClientEmail || 'santiago.torres.co@ajegroup.com', 150, 62);

  doc.line(10, 65, 200, 65);

  doc.setFont('helvetica', 'bold');
  doc.text('Condición de Pago:', 13, 71);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.PaymentTerms || 'CONTADO', 42, 71);

  doc.setFont('helvetica', 'bold');
  doc.text('Vencimiento:', 85, 71);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(quotation.ValidUntil), 108, 71);

  doc.setFont('helvetica', 'bold');
  doc.text('Asesor:', 150, 71);
  doc.setFont('helvetica', 'normal');
  doc.text(businessInfo?.name || 'Vendedor', 165, 71);

  const tableData = quotation.Items.map((item, index) => [
    `PT00${index + 1}10`,
    item.ProductName + (item.Description ? ` - ${item.Description}` : ''),
    'UND',
    item.Quantity.toString(),
    formatCurrency(item.UnitPrice),
    item.Discount > 0 ? `${item.Discount}%` : '0,00',
    `${quotation.TaxRate || 19}%`,
    formatCurrency(item.Subtotal),
  ]);

  autoTable(doc, {
    startY: 78,
    head: [['Código', 'Descripción', 'Unidad', 'Cantidad', 'Precio Unit.', '% DES', '% IMP', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [240, 240, 240],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [30, 30, 30],
    },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 65 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 15, halign: 'center' },
      6: { cellWidth: 13, halign: 'center' },
      7: { cellWidth: 25, halign: 'right' },
    },
    styles: {
      lineColor: [150, 150, 150],
      lineWidth: 0.2,
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 3;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text(`${quotation.Items.length} Registros`, 10, finalY);

  const boxY = finalY + 4;
  doc.roundedRect(10, boxY, 110, 35, 1, 1, 'S');
  doc.setFont('helvetica', 'bold');
  doc.text('Observaciones:', 13, boxY + 6);
  doc.setFont('helvetica', 'normal');
  const splitNotes = doc.splitTextToSize(quotation.Note || quotation.Notes || 'Precios sujetos a cambio según el acuerdo comercial.', 104);
  doc.text(splitNotes, 13, boxY + 11);

  doc.roundedRect(124, boxY, 76, 35, 1, 1, 'S');

  doc.text('Subtotal:', 127, boxY + 6);
  doc.text(formatCurrency(quotation.Subtotal), 197, boxY + 6, { align: 'right' });

  doc.text('Descuentos:', 127, boxY + 11);
  doc.text('0,00', 197, boxY + 11, { align: 'right' });

  doc.text('Recargos:', 127, boxY + 16);
  doc.text('0,00', 197, boxY + 16, { align: 'right' });

  doc.text(`I.V.A. (${quotation.TaxRate || 19}%):`, 127, boxY + 21);
  doc.text(formatCurrency(quotation.TaxAmount), 197, boxY + 21, { align: 'right' });

  doc.line(124, boxY + 24, 200, boxY + 24);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('TOTAL:', 127, boxY + 30);
  doc.text(formatCurrency(quotation.Total), 197, boxY + 30, { align: 'right' });

  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('https://efactoryerp.com    eFactory Administrativo | Contasist ERP', 105, pageHeight - 8, { align: 'center' });

  doc.save(`${quotation.Number || 'Cotizacion'}.pdf`);
}

export async function generatePriceListPDF(priceList: PriceList, businessInfo?: any) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  doc.setFillColor(2, 132, 199);
  doc.rect(0, 0, pageWidth, 16, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Lista de precios', 14, 11);

  doc.setFontSize(10);
  doc.text(businessInfo?.name || 'Contasist ERP', pageWidth - 14, 11, { align: 'right' });

  doc.setTextColor(2, 132, 199);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(priceList.name || 'Lista de Precios', 14, 28);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);

  const startY = 35;
  const labelX = 20;
  const valueX = 65;

  doc.text('Empresa:', labelX, startY);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'bold');
  doc.text(priceList.customerName || businessInfo?.name || 'General', valueX, startY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Teléfono:', labelX, startY + 6);
  doc.setTextColor(50, 50, 50);
  doc.text(businessInfo?.phone || 'N/A', valueX, startY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Correo electrónico:', labelX, startY + 12);
  doc.setTextColor(50, 50, 50);
  doc.text(businessInfo?.email || 'N/A', valueX, startY + 12);

  const validityDate = new Date();
  validityDate.setMonth(validityDate.getMonth() + (priceList.validityMonths || 12));

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('Válido hasta:', labelX, startY + 18);
  doc.setTextColor(50, 50, 50);
  doc.text(formatDate(validityDate), valueX, startY + 18);

  const tableData = (priceList.items || []).map((item) => {
    const code = item.productCode || item.product?.code || 'S/C';
    let name = item.productName || item.product?.name || 'Producto / Servicio';
    const categoryStr = item.product?.category || '';
    if (categoryStr.includes('Preventivo') && !name.toLowerCase().includes('preventivo')) {
      name = `${name} (Preventivo)`;
    } else if (categoryStr.includes('Correctivo') && !name.toLowerCase().includes('correctivo')) {
      name = `${name} (Correctivo)`;
    }
    const description = item.comments || '';
    const price = item.negotiatedPrice || item.regularPrice || 0;
    return [code, name, description, formatCurrency(price)];
  });

  autoTable(doc, {
    startY: startY + 26,
    head: [['CÓDIGO', 'NOMBRE DEL PRODUCTO', 'DESCRIPCIÓN', 'PRECIO UNITARIO']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [186, 230, 253],
      textColor: [2, 132, 199],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [50, 50, 50],
    },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 50 },
      2: { cellWidth: 65 },
      3: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
    },
    styles: {
      lineColor: [220, 220, 220],
      lineWidth: 0.2,
      cellPadding: 3,
    },
    margin: { left: 10, right: 10 },
  });

  doc.save(`Lista_de_Precios_${priceList.code || priceList.id}.pdf`);
}

export async function generateInvoicePDF(
  invoice: Invoice,
  client: Client | undefined | null,
  businessInfo: any
) {
  const doc = new jsPDF();
  const pdfHeader = businessInfo?.pdfHeader;

  doc.setLineWidth(0.3);
  doc.setDrawColor(100, 100, 100);
  doc.roundedRect(10, 10, 110, 32, 1, 1, 'S');

  let textX = 14;
  const logoUrl = pdfHeader?.headerImage || businessInfo?.logo;
  if (logoUrl) {
    const logoImg = await loadImageAsBase64(logoUrl);
    if (logoImg) {
      doc.addImage(logoImg, 'PNG', 13, 13, 22, 22);
      textX = 38;
    }
  }

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(businessInfo?.name || 'Contasist SAS', textX, 16);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`NIT: ${businessInfo?.taxId || '901.234.567-8'}`, textX, 21);
  const splitAddress = doc.splitTextToSize(`Dirección: ${businessInfo?.address || 'Calle 100 # 15-20'}`, 116 - textX);
  doc.text(splitAddress, textX, 26);
  doc.text(`Tel: ${businessInfo?.phone || '3001234567'} | Email: ${businessInfo?.email || 'contacto@empresa.com'}`, textX, 37);

  doc.roundedRect(124, 10, 76, 32, 1, 1, 'S');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA DE VENTA', 162, 18, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(220, 38, 38);
  doc.text(invoice.number || invoice.Number || 'FAC-0001', 162, 24, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Fecha Emisión: ${formatDate(invoice.issueDate || invoice.IssueDate || new Date())}`, 128, 30);
  doc.text(`Fecha Vencimiento: ${formatDate(invoice.dueDate || invoice.DueDate || new Date())}`, 128, 35);
  doc.text(`Forma de Pago: ${(invoice.paymentMethod || invoice.PaymentMethod || 'Contado').toUpperCase()}`, 128, 40);

  const clientName = client?.Name || client?.name || invoice.client?.name || invoice.client?.Name || 'Cliente General';
  const clientNit = client?.TaxID || client?.taxId || '222222222222';
  const clientPhone = client?.Phone || client?.phone || '';
  const clientAddress = client?.Address || client?.address || '';

  doc.roundedRect(10, 46, 190, 22, 1, 1, 'S');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL CLIENTE', 14, 52);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Razón Social / Nombre: ${clientName}`, 14, 58);
  doc.text(`NIT / C.C.: ${clientNit}`, 14, 63);
  doc.text(`Teléfono: ${clientPhone}`, 120, 58);
  doc.text(`Dirección: ${clientAddress}`, 120, 63);

  const items = invoice.items || invoice.InvoiceItems || [];
  const tableData = items.map((it: any, index: number) => {
    const desc = it.description || it.Description || `Ítem #${index + 1}`;
    const qty = it.quantity ?? it.Quantity ?? 1;
    const unitPrice = it.unitPrice ?? it.UnitPrice ?? 0;
    const discount = it.discount ?? it.Discount ?? 0;
    const subtotal = it.subtotal ?? it.Subtotal ?? ((qty * unitPrice) - discount);
    return [
      (index + 1).toString(),
      desc,
      qty.toString(),
      formatCurrency(unitPrice),
      formatCurrency(discount),
      formatCurrency(subtotal),
    ];
  });

  autoTable(doc, {
    startY: 72,
    head: [['#', 'DESCRIPCIÓN', 'CANT.', 'VALOR UNIT.', 'DESC.', 'SUBTOTAL']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [16, 185, 129],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [40, 40, 40],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 80 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 26, halign: 'right' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
    },
    styles: {
      cellPadding: 2.5,
    },
    margin: { left: 10, right: 10 },
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 150;

  const subtotal = invoice.subtotal ?? invoice.Subtotal ?? 0;
  const taxAmount = invoice.taxAmount ?? invoice.TaxAmount ?? 0;
  const total = invoice.total ?? invoice.Total ?? 0;
  const balance = invoice.balance ?? invoice.Balance ?? total;

  doc.roundedRect(120, finalY + 5, 80, 32, 1, 1, 'S');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', 124, finalY + 11);
  doc.text(formatCurrency(subtotal), 195, finalY + 11, { align: 'right' });

  doc.text('IVA (19%):', 124, finalY + 17);
  doc.text(formatCurrency(taxAmount), 195, finalY + 17, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL A PAGAR:', 124, finalY + 24);
  doc.text(formatCurrency(total), 195, finalY + 24, { align: 'right' });

  doc.setTextColor(220, 38, 38);
  doc.text('SALDO PENDIENTE:', 124, finalY + 31);
  doc.text(formatCurrency(balance), 195, finalY + 31, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  if (invoice.notes || invoice.Notes) {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text(`Observaciones: ${invoice.notes || invoice.Notes}`, 10, finalY + 12);
  }

  doc.save(`Factura_${invoice.number || invoice.Number || 'FAC'}.pdf`);
}
