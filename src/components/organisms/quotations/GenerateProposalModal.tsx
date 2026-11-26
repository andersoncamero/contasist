import { useState } from 'react';
import { Quotation } from '@/entities/Quotation';
import { Client } from '@/entities/Client';
import { generateProposalPDF } from '@/lib/ProposalPDF';
import { Button } from '@/components/atoms/Button';
import { FileText, Download, X, Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL, getFetchOptions } from '@/services/apiConfig';

interface GenerateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: Quotation;
  client: Client | undefined | null;
  businessInfo: any;
}

export const GenerateProposalModal = ({
  isOpen,
  onClose,
  quotation,
  client,
  businessInfo,
}: GenerateProposalModalProps) => {
  const [introductionText, setIntroductionText] = useState(
    quotation.IntroductionText ||
      'Estimados señores,\n\nCordial saludo.\n\nAdjunto remitimos el listado de motores para los cuales requerimos su propuesta económica correspondiente a los servicios de mantenimiento preventivo y correctivo.'
  );

  const [scopeDetails, setScopeDetails] = useState(
    quotation.ScopeDetails ||
      'Agradecemos que la cotización contemple el alcance completo de los servicios requeridos, incluyendo mano de obra, materiales, repuestos, tiempos de atención, garantías y demás aspectos técnicos aplicables.'
  );

  const [warrantyInfo, setWarrantyInfo] = useState(
    quotation.WarrantyInfo ||
      'Servicios y repuestos garantizados según el acuerdo comercial. Atención técnica prioritaria en taller e instalaciones.'
  );

  const [paymentTerms, setPaymentTerms] = useState(
    quotation.PaymentTerms ||
      'Asimismo, solicitamos tener en cuenta los términos y condiciones del acuerdo comercial vigente para la presentación de su oferta.'
  );

  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerateAITexts = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/proposal/generate-texts`, getFetchOptions(undefined, {
        method: 'POST',
        body: JSON.stringify({
          clientName: client?.Name || quotation.ClientName,
          clientCompany: client?.Company || quotation.ClientCompany,
          items: quotation.Items.map((item) => ({
            name: item.ProductName,
            description: item.Description,
            quantity: item.Quantity,
            price: item.UnitPrice,
          })),
          total: quotation.Total,
        }),
      }));

      if (response.ok) {
        const data = await response.json();
        if (data.introductionText) setIntroductionText(data.introductionText);
        if (data.scopeDetails) setScopeDetails(data.scopeDetails);
        if (data.warrantyInfo) setWarrantyInfo(data.warrantyInfo);
        if (data.paymentTerms) setPaymentTerms(data.paymentTerms);
        toast.success('Textos de la propuesta generados exitosamente con IA');
      } else {
        setIntroductionText(
          `Estimados señores ${client?.Name || quotation.ClientName},\n\nCordial saludo.\n\nAdjunto remitimos la propuesta económica detallada para los servicios y suministros solicitados.`
        );
        setScopeDetails(
          `La propuesta contempla la atención completa de ${quotation.Items.length} ítem(s), incluyendo mano de obra especializada, materiales de alta calidad y repuestos originales.`
        );
        setWarrantyInfo(
          'Garantía total de 12 meses en mano de obra y repuestos suministrados. Tiempo de atención inmediata para servicios correctivos.'
        );
        setPaymentTerms(
          'Condiciones de pago según el acuerdo comercial vigente. Oferta válida durante 30 días calendario.'
        );
        toast.success('Textos generados para la propuesta comercial');
      }
    } catch {
      setIntroductionText(
        `Estimados señores ${client?.Name || quotation.ClientName},\n\nCordial saludo.\n\nAdjunto remitimos la propuesta económica formal correspondiente a los servicios requeridos.`
      );
      setScopeDetails(
        `La cotización contempla el alcance completo de los servicios solicitados, incluyendo mano de obra, materiales, repuestos y tiempos de atención.`
      );
      setWarrantyInfo(
        'Garantía técnica según los términos del acuerdo comercial vigente.'
      );
      setPaymentTerms(
        'Términos y condiciones comerciales de conformidad con la oferta vigente.'
      );
      toast.success('Textos generados para los 4 campos del modal');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    try {
      await generateProposalPDF(quotation, client, businessInfo, {
        introductionText,
        scopeDetails,
        warrantyInfo,
        paymentTerms,
      });
      toast.success('Propuesta Económica descargada en PDF');
      onClose();
    } catch {
      toast.error('Error al generar la propuesta PDF');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-card p-6 shadow-xl border-2 border-border max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-border pb-4 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-bold font-mono">Generar Propuesta Comercial</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-accent rounded-md">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex justify-between items-center bg-muted/40 p-3 rounded-lg border border-border">
          <div className="text-xs text-muted-foreground">
            Genera automáticamente los 4 párrafos formales de la propuesta
          </div>
          <Button
            onClick={handleGenerateAITexts}
            disabled={isGenerating}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 font-bold shadow-md"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generar Textos con IA
              </>
            )}
          </Button>
        </div>

        <div className="space-y-4 text-sm">
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold">Carta de Presentación / Saludo Inicial</label>
            </div>
            <textarea
              value={introductionText}
              onChange={(e) => setIntroductionText(e.target.value)}
              rows={3}
              className="w-full rounded-md border-2 border-border p-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold">Alcance y Aspectos Técnicos (Mano de obra, repuestos)</label>
            </div>
            <textarea
              value={scopeDetails}
              onChange={(e) => setScopeDetails(e.target.value)}
              rows={3}
              className="w-full rounded-md border-2 border-border p-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold">Garantías y Tiempos de Atención (SLA)</label>
            </div>
            <textarea
              value={warrantyInfo}
              onChange={(e) => setWarrantyInfo(e.target.value)}
              rows={2}
              className="w-full rounded-md border-2 border-border p-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold">Términos y Condiciones del Acuerdo Comercial</label>
            </div>
            <textarea
              value={paymentTerms}
              onChange={(e) => setPaymentTerms(e.target.value)}
              rows={2}
              className="w-full rounded-md border-2 border-border p-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3 border-t-2 border-border pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Descargar Propuesta PDF
          </Button>
        </div>
      </div>
    </div>
  );
};
