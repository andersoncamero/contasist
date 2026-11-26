import { useEffect, useState } from "react";
import { Building2, Plus } from "lucide-react";
import { useCompany } from "@/useCases/useCompany";
import { useQueryClient } from "@tanstack/react-query";
import { CompanyDialog } from "./CompanyDialog";
import { Button } from "@/components/atoms/Button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/molecules/Select";

export function CompanySwitcher() {
  const queryClient = useQueryClient();
  const { companies, hasCompanies, activeCompany, activeCompanyId, fetchBusinessInfo } = useCompany();
  const [activeId, setActiveId] = useState<string>(activeCompanyId);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    setActiveId(activeCompanyId);
  }, [activeCompanyId]);

  const handleCompanyChange = (val: string) => {
    if (val === "NEW_COMPANY") {
      setOpenDialog(true);
      return;
    }

    setActiveId(val);
    localStorage.setItem("active_company_id", val);
    queryClient.invalidateQueries();
    window.location.reload();
  };

  const selectedCompany = companies.find(
    (c) => (c.id || c.ID)?.toString() === activeId
  );
  const displayName = selectedCompany?.name || activeCompany?.name || "Sin empresa";

  return (
    <>
      {hasCompanies ? (
        <Select value={activeId} onValueChange={handleCompanyChange}>
          <SelectTrigger className="w-full h-9 px-3 border border-border/80 bg-muted/40 hover:bg-accent transition-colors rounded-lg text-xs font-medium gap-2 flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <Building2 className="h-4 w-4 text-primary shrink-0" />
              <SelectValue placeholder="Empresa">
                <span className="font-semibold text-foreground truncate max-w-[140px] inline-block">
                  {displayName}
                </span>
              </SelectValue>
            </div>
          </SelectTrigger>
          <SelectContent align="start" className="w-56">
            {companies.map((c) => {
              const compId = (c.id || c.ID || "").toString();
              return (
                <SelectItem key={compId} value={compId}>
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-xs">{c.name}</span>
                    <span className="text-[10px] text-muted-foreground">NIT: {c.nit}</span>
                  </div>
                </SelectItem>
              );
            })}

            <div
              onClick={(e) => {
                e.stopPropagation();
                setOpenDialog(true);
              }}
              className="flex items-center gap-2 p-2 border-t border-border mt-1 text-xs text-primary font-semibold hover:bg-accent cursor-pointer rounded-b-md"
            >
              <Plus className="h-3.5 w-3.5" /> Registrar Nueva Empresa
            </div>
          </SelectContent>
        </Select>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setOpenDialog(true)}
          className="w-full h-9 justify-start gap-2 border-dashed border-primary/50 text-xs font-semibold text-primary hover:bg-primary/5"
        >
          <Plus className="h-4 w-4 shrink-0" />
          <span className="truncate">Registrar mi empresa</span>
        </Button>
      )}

      <CompanyDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        onSuccess={(newCompanyId) => {
          const strId = newCompanyId.toString();
          setActiveId(strId);
          localStorage.setItem("active_company_id", strId);
          queryClient.invalidateQueries();
          fetchBusinessInfo();
          window.location.reload();
        }}
      />
    </>
  );
}
