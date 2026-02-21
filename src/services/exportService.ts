import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency } from "@/lib/utils";

/**
 * Servicio para la exportación de reportes contables.
 */
export const exportService = {
  /**
   * Exporta datos a un archivo PDF estructurado con tabla.
   */
  exportToPDF: (options: {
    title: string;
    subtitle?: string;
    filename: string;
    headers: string[];
    data: any[][];
    columnStyles?: any;
  }) => {
    const doc = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Estilos de cabecera
    doc.setFontSize(20);
    doc.setTextColor(30, 90, 125); // Color #1E5A7D (Primario)
    doc.text("CONTASIST", pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(options.title, pageWidth / 2, 25, { align: "center" });

    if (options.subtitle) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(options.subtitle, pageWidth / 2, 32, { align: "center" });
    }

    // Línea divisoria
    doc.setDrawColor(200);
    doc.line(10, 35, pageWidth - 10, 35);

    // Tabla de movimientos/datos
    autoTable(doc, {
      startY: 40,
      head: [options.headers],
      body: options.data,
      theme: "striped",
      headStyles: { fillColor: [30, 90, 125], textColor: 255 },
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: options.columnStyles || {},
      margin: { top: 40 },
      didDrawPage: (data) => {
        // Pie de página
        const str = "Página " + doc.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(str, pageWidth - 20, doc.internal.pageSize.getHeight() - 10);
      },
    });

    doc.save(`${options.filename}.pdf`);
  },

  /**
   * Exporta datos a un archivo CSV (abrible en Excel).
   */
  exportToCSV: (options: {
    filename: string;
    headers: string[];
    data: any[][];
  }) => {
    const csvContent = [
      options.headers.join(","),
      ...options.data.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${options.filename}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
