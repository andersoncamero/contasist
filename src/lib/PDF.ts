import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { formatCurrency, formatDate } from './utils';
import { Quotation } from '@/entities/Quotation';
import { Client } from '@/entities/Client';
import { BusinessInfo } from '@/entities/BusinessInfo';

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
  client: Client | undefined,
  businessInfo: BusinessInfo
) {
  const doc = new jsPDF();
  const pdfHeader = businessInfo.pdfHeader;
  
  let headerEndY = 15;


  if (pdfHeader?.headerImage) {
    const headerImg = await loadImageAsBase64(pdfHeader.headerImage);
    if (headerImg) {
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20; 
      const imgHeight = 40; 
      
      doc.addImage(headerImg, 'PNG', 10, 5, imgWidth, imgHeight);
      headerEndY = 50;
      
      if (pdfHeader.showBorder !== false) {
        doc.setLineWidth(0.5);
        doc.line(15, headerEndY, 195, headerEndY);
      }
      
      headerEndY += 5;
    }
  } else {
  
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(businessInfo.name, 20, 25);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(businessInfo.address, 20, 32);
    doc.text(`Tel: ${businessInfo.phone} | Email: ${businessInfo.email}`, 20, 38);
    doc.text(`RFC: ${businessInfo.taxId}`, 20, 44);
    
    headerEndY = 52;
  }


  doc.setFillColor(0, 0, 0);
  doc.rect(140, headerEndY - 2, 55, 20, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text('COTIZACIÓN', 167.5, headerEndY + 5, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(quotation.number, 167.5, headerEndY + 13, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  const infoStartY = headerEndY + 25;

  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE:', 20, infoStartY);
  doc.setFont('helvetica', 'normal');
  doc.text(client?.name || quotation.clientName, 20, infoStartY + 6);
  
  let clientY = infoStartY + 6;
  if (client?.company) {
    clientY += 6;
    doc.text(client.company, 20, clientY);
  }
  if (client?.email) {
    clientY += 6;
    doc.text(client.email, 20, clientY);
  }

  doc.setFont('helvetica', 'bold');
  doc.text('FECHA:', 140, infoStartY);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(quotation.createdAt), 160, infoStartY);

  doc.setFont('helvetica', 'bold');
  doc.text('VÁLIDA HASTA:', 140, infoStartY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(formatDate(quotation.validUntil), 170, infoStartY + 8);


  const tableStartY = Math.max(clientY, infoStartY + 16) + 10;
  
  const tableData = quotation.items.map((item) => [
    item.productName,
    item.description.substring(0, 40) + (item.description.length > 40 ? '...' : ''),
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    item.discount > 0 ? `${item.discount}%` : '-',
    formatCurrency(item.subtotal),
  ]);

  autoTable(doc, {
    startY: tableStartY,
    head: [['Concepto', 'Descripción', 'Cant.', 'Precio', 'Desc.', 'Subtotal']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [0, 0, 0],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 50 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 30, halign: 'right' },
    },
    styles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
    },
  });


  const finalY = (doc as any).lastAutoTable.finalY + 10;


  const totalsX = 140;
  doc.setFontSize(10);

  doc.text('Subtotal:', totalsX, finalY);
  doc.text(formatCurrency(quotation.subtotal), 190, finalY, { align: 'right' });

  doc.text(`IVA (${quotation.taxRate}%):`, totalsX, finalY + 7);
  doc.text(formatCurrency(quotation.taxAmount), 190, finalY + 7, { align: 'right' });

  doc.setLineWidth(0.5);
  doc.line(totalsX, finalY + 11, 190, finalY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', totalsX, finalY + 19);
  doc.text(formatCurrency(quotation.total), 190, finalY + 19, { align: 'right' });


  if (quotation.notes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Notas:', 20, finalY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitNotes = doc.splitTextToSize(quotation.notes, 100);
    doc.text(splitNotes, 20, finalY + 7);
  }


  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Esta cotización tiene una validez según la fecha indicada. Los precios están sujetos a cambio sin previo aviso.',
    105,
    pageHeight - 15,
    { align: 'center' }
  );

  
  doc.save(`${quotation.number}.pdf`);
}
