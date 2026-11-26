import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { formatCurrency, formatDate } from './utils';
import { Quotation } from '@/entities/Quotation';
import { Client } from '@/entities/Client';

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

export interface ProposalPDFOptions {
  introductionText?: string;
  scopeDetails?: string;
  warrantyInfo?: string;
  paymentTerms?: string;
}

export async function generateProposalPDF(
  quotation: Quotation,
  client: Client | undefined | null,
  businessInfo: any,
  options?: ProposalPDFOptions
) {
  const doc = new jsPDF();
  const pdfHeader = businessInfo?.pdfHeader;

  let currentY = 15;

  if (pdfHeader?.headerImage) {
    const headerImg = await loadImageAsBase64(pdfHeader.headerImage);
    if (headerImg) {
      const pageWidth = doc.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      doc.addImage(headerImg, 'PNG', 10, 5, imgWidth, 35);
      currentY = 45;
      if (pdfHeader.showBorder !== false) {
        doc.setLineWidth(0.5);
        doc.line(15, currentY, 195, currentY);
      }
      currentY += 10;
    }
  } else {
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(businessInfo?.name || 'CONTASIST', 20, 20);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    if (businessInfo?.address) doc.text(businessInfo.address, 20, 26);
    if (businessInfo?.phone || businessInfo?.email) {
      doc.text(`Tel: ${businessInfo?.phone || ''} | Email: ${businessInfo?.email || ''}`, 20, 31);
    }
    if (businessInfo?.taxId) doc.text(`NIT / RFC: ${businessInfo.taxId}`, 20, 36);

    currentY = 45;
  }

  doc.setFillColor(0, 130, 166);
  doc.rect(130, currentY - 5, 65, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PROPUESTA ECONÓMICA', 162.5, currentY + 3, { align: 'center' });
  doc.setFontSize(11);
  doc.text(`N° ${quotation.Number}`, 162.5, currentY + 11, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  currentY += 28;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Estimados señores,', 20, currentY);
  currentY += 6;

  const clientName = client?.Name || quotation.ClientName || 'Cliente';
  const clientCompany = client?.Company || quotation.ClientCompany;
  doc.setFont('helvetica', 'bold');
  doc.text(`${clientName}${clientCompany ? ` - ${clientCompany}` : ''}`, 20, currentY);
  currentY += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Cordial saludo.', 20, currentY);
  currentY += 8;

  const defaultIntro =
    options?.introductionText ||
    quotation.IntroductionText ||
    'Adjunto remitimos el listado de motores/equipos para los cuales requerimos presentar nuestra propuesta económica correspondiente a los servicios de mantenimiento preventivo y correctivo.';

  const splitIntro = doc.splitTextToSize(defaultIntro, 170);
  doc.text(splitIntro, 20, currentY);
  currentY += splitIntro.length * 5 + 6;

  const tableData = quotation.Items.map((item) => [
    item.ProductName,
    item.Description ? item.Description.substring(0, 50) : '',
    item.Quantity.toString(),
    formatCurrency(item.UnitPrice),
    item.Discount > 0 ? `${item.Discount}%` : '-',
    formatCurrency(item.Subtotal),
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Concepto / Equipo', 'Descripción Técnica', 'Cant.', 'Precio Negociado', 'Desc.', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [0, 130, 166],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 40 },
      1: { cellWidth: 50 },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 30, halign: 'right' },
    },
    styles: {
      lineColor: [200, 200, 200],
      lineWidth: 0.2,
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 8;

  const totalsX = 135;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', totalsX, currentY);
  doc.text(formatCurrency(quotation.Subtotal), 195, currentY, { align: 'right' });

  currentY += 6;
  doc.text(`IVA (${quotation.TaxRate}%):`, totalsX, currentY);
  doc.text(formatCurrency(quotation.TaxAmount), 195, currentY, { align: 'right' });

  currentY += 4;
  doc.setLineWidth(0.4);
  doc.line(totalsX, currentY, 195, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('TOTAL PROPUESTA:', totalsX, currentY);
  doc.text(formatCurrency(quotation.Total), 195, currentY, { align: 'right' });

  currentY += 14;

  const scope =
    options?.scopeDetails ||
    quotation.ScopeDetails ||
    'La propuesta contemple el alcance completo de los servicios requeridos, incluyendo mano de obra, materiales, repuestos, tiempos de atención, garantías y demás aspectos técnicos aplicables.';

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('ALCANCE Y ASPECTOS TÉCNICOS:', 20, currentY);
  currentY += 5;
  doc.setFont('helvetica', 'normal');
  const splitScope = doc.splitTextToSize(scope, 170);
  doc.text(splitScope, 20, currentY);
  currentY += splitScope.length * 4.5 + 6;

  const warranty =
    options?.warrantyInfo ||
    quotation.WarrantyInfo ||
    'Garantías y SLA: Mano de obra y repuestos garantizados según el acuerdo comercial. Tiempos de atención inmediata para urgencias.';

  doc.setFont('helvetica', 'bold');
  doc.text('GARANTÍA Y TIEMPOS DE ATENCIÓN:', 20, currentY);
  currentY += 5;
  doc.setFont('helvetica', 'normal');
  const splitWarranty = doc.splitTextToSize(warranty, 170);
  doc.text(splitWarranty, 20, currentY);
  currentY += splitWarranty.length * 4.5 + 6;

  const terms =
    options?.paymentTerms ||
    quotation.PaymentTerms ||
    'Asimismo, solicitamos tener en cuenta los términos y condiciones del acuerdo comercial vigente para la presentación de su oferta.';

  doc.setFont('helvetica', 'bold');
  doc.text('TÉRMINOS DEL ACUERDO COMERCIAL:', 20, currentY);
  currentY += 5;
  doc.setFont('helvetica', 'normal');
  const splitTerms = doc.splitTextToSize(terms, 170);
  doc.text(splitTerms, 20, currentY);
  currentY += splitTerms.length * 4.5 + 10;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Quedamos atentos a sus comentarios y al envío de la propuesta dentro de los tiempos establecidos.', 20, currentY);

  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Propuesta Válida hasta: ${formatDate(quotation.ValidUntil)} | Generado por Contasist`,
    105,
    pageHeight - 10,
    { align: 'center' }
  );

  doc.save(`Propuesta_${quotation.Number}.pdf`);
}
