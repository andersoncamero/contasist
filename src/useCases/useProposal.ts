import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Proposal, ProposalItem, ProposalStatus } from "@/entities/Proposal";
import { API_BASE_URL, getFetchOptions } from "@/services/apiConfig";
import { useCompany } from "./useCompany";

interface ApiProposalItem {
  id?: number;
  proposalId?: number;
  proposal_id?: number;
  productId?: number;
  product_id?: number;
  productName?: string;
  product_name?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  unit_price?: number;
  subtotal?: number;
}

interface ApiProposalResponse {
  id?: number;
  ID?: number;
  number?: string;
  title?: string;
  clientId?: number;
  client_id?: number;
  clientName?: string;
  client_name?: string;
  objective?: string;
  scope?: string;
  deliverables?: string;
  methodology?: string;
  executionTime?: string;
  execution_time?: string;
  validityDays?: number;
  validity_days?: number;
  commercialTerms?: string;
  commercial_terms?: string;
  subtotal?: number;
  taxAmount?: number;
  tax_amount?: number;
  total?: number;
  status?: ProposalStatus;
  items?: ApiProposalItem[];
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

const mapApiProposal = (api: ApiProposalResponse): Proposal => {
  const pId = api.id ?? api.ID ?? 0;
  const pNumber = api.number || `PROP-${pId}`;
  const pTitle = api.title || "Propuesta Comercial";
  const pClientId = api.clientId ?? api.client_id ?? 0;
  const pClientName = api.clientName || api.client_name || "Cliente General";
  const pSubtotal = api.subtotal ?? 0;
  const pTax = api.taxAmount ?? api.tax_amount ?? 0;
  const pTotal = api.total ?? 0;
  const pStatus: ProposalStatus = api.status || "draft";
  const pCreated = api.createdAt || api.created_at || new Date().toISOString();

  const mappedItems: ProposalItem[] = (api.items || []).map((it, idx) => ({
    id: it.id || idx + 1,
    proposalId: pId,
    productId: it.productId ?? it.product_id,
    productName: it.productName || it.product_name || "Ítem de propuesta",
    description: it.description || "",
    quantity: it.quantity ?? 1,
    unitPrice: it.unitPrice ?? it.unit_price ?? 0,
    subtotal: it.subtotal ?? 0,
  }));

  return {
    id: pId,
    number: pNumber,
    title: pTitle,
    clientId: pClientId,
    clientName: pClientName,
    objective: api.objective || "",
    scope: api.scope || "",
    deliverables: api.deliverables || "",
    methodology: api.methodology || "",
    executionTime: api.executionTime || api.execution_time || "15 días hábiles",
    validityDays: api.validityDays ?? api.validity_days ?? 30,
    commercialTerms: api.commercialTerms || api.commercial_terms || "",
    subtotal: pSubtotal,
    taxAmount: pTax,
    total: pTotal,
    status: pStatus,
    items: mappedItems,
    createdAt: pCreated,
    updatedAt: api.updatedAt || api.updated_at,
  };
};

const parseResponseJson = async (response: Response) => {
  const text = await response.text();
  if (!response.ok) {
    let errorMessage = `Error HTTP ${response.status}`;
    if (text) {
      try {
        const json = JSON.parse(text);
        errorMessage = json.message || json.error || errorMessage;
      } catch {
        errorMessage = text;
      }
    }
    throw new Error(errorMessage);
  }
  if (!text || text.trim() === "") return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

const fetchProposalsApi = async (companyId?: number): Promise<Proposal[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/proposals`, getFetchOptions(companyId));
    const data = await parseResponseJson(response);
    if (Array.isArray(data)) return data.map(mapApiProposal);
    if (data && Array.isArray(data.proposals)) return data.proposals.map(mapApiProposal);
    return [];
  } catch {
    return [];
  }
};

const createProposalApi = async (proposal: Partial<Proposal>) => {
  const payload = {
    number: proposal.number,
    title: proposal.title,
    clientId: proposal.clientId,
    clientName: proposal.clientName,
    objective: proposal.objective,
    scope: proposal.scope,
    deliverables: proposal.deliverables,
    methodology: proposal.methodology,
    executionTime: proposal.executionTime,
    validityDays: proposal.validityDays,
    commercialTerms: proposal.commercialTerms,
    subtotal: proposal.subtotal,
    taxAmount: proposal.taxAmount,
    total: proposal.total,
    status: proposal.status || "draft",
    items: proposal.items,
  };

  const response = await fetch(`${API_BASE_URL}/proposals`, getFetchOptions(undefined, {
    method: "POST",
    body: JSON.stringify(payload),
  }));
  return parseResponseJson(response);
};

const updateProposalApi = async ({ id, data }: { id: number; data: Partial<Proposal> }) => {
  const payload = {
    number: data.number,
    title: data.title,
    clientId: data.clientId,
    clientName: data.clientName,
    objective: data.objective,
    scope: data.scope,
    deliverables: data.deliverables,
    methodology: data.methodology,
    executionTime: data.executionTime,
    validityDays: data.validityDays,
    commercialTerms: data.commercialTerms,
    subtotal: data.subtotal,
    taxAmount: data.taxAmount,
    total: data.total,
    status: data.status,
    items: data.items,
  };

  const response = await fetch(`${API_BASE_URL}/proposals/${id}`, getFetchOptions(undefined, {
    method: "PUT",
    body: JSON.stringify(payload),
  }));
  return parseResponseJson(response);
};

const deleteProposalApi = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/proposals/${id}`, getFetchOptions(undefined, {
    method: "DELETE",
  }));
  return parseResponseJson(response);
};

export const useProposal = () => {
  const queryClient = useQueryClient();
  const { activeCompanyId } = useCompany();
  const numericCompanyId = activeCompanyId ? Number(activeCompanyId) : undefined;

  const query = useQuery({
    queryKey: ["proposals", activeCompanyId],
    queryFn: () => fetchProposalsApi(numericCompanyId),
    enabled: Boolean(numericCompanyId),
  });

  const createMutation = useMutation({
    mutationFn: createProposalApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateProposalApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProposalApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
    },
  });

  const addProposal = async (proposal: Partial<Proposal>) => {
    try {
      await createMutation.mutateAsync(proposal);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const updateProposal = async (id: number, data: Partial<Proposal>) => {
    try {
      await updateMutation.mutateAsync({ id, data });
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  const deleteProposal = async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  };

  return {
    proposals: query.data || [],
    isLoading: query.isLoading || createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
    error: query.error ? (query.error as Error).message : null,
    fetchProposals: async () => { await query.refetch(); },
    addProposal,
    updateProposal,
    deleteProposal,
  };
};
