import { API_BASE_URL, getFetchOptions } from "./apiConfig";
import { PriceList, PriceListItem } from "@/entities/PriceList";

const parseResponseJson = async (response: Response) => {
  const text = await response.text();
  if (!response.ok) {
    let errorMessage = `Error en la petición (HTTP ${response.status})`;
    if (text) {
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.message || errorData.error || errorMessage;
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

const mapApiPriceListItem = (item: any): PriceListItem => ({
  id: item?.id ?? item?.ID,
  priceListId: item?.priceListId ?? item?.PriceListID ?? item?.price_list_id,
  itemNumber: item?.itemNumber ?? item?.ItemNumber ?? 0,
  productId: item?.productId ?? item?.ProductID ?? item?.product_id ?? 0,
  product: item?.product || item?.Product ? {
    id: item?.product?.id ?? item?.Product?.ID ?? 0,
    code: item?.product?.code ?? item?.Product?.Code ?? "",
    name: item?.product?.name ?? item?.Product?.Name ?? "",
    unitCode: item?.product?.unitCode ?? item?.Product?.UnitCode ?? "UND",
    category: item?.product?.category ?? item?.Product?.Category,
    basePrice: item?.product?.basePrice ?? item?.Product?.BasePrice ?? item?.product?.costPrice ?? item?.Product?.CostPrice ?? 0,
  } : undefined,
  productCode: item?.productCode ?? item?.ProductCode ?? item?.product?.code ?? item?.Product?.Code ?? "",
  productName: item?.productName ?? item?.ProductName ?? item?.product?.name ?? item?.Product?.Name ?? "",
  unitCode: item?.unitCode ?? item?.UnitCode ?? "UND",
  regularPrice: item?.regularPrice ?? item?.RegularPrice ?? item?.product?.salePrice ?? item?.Product?.SalePrice ?? 0,
  negotiatedPrice: item?.negotiatedPrice ?? item?.NegotiatedPrice ?? 0,
  discountPercentage: item?.discountPercentage ?? item?.DiscountPercentage ?? 0,
  deliveryDays: item?.deliveryDays ?? item?.DeliveryDays ?? 3,
  comments: item?.comments ?? item?.Comments ?? "",
});

const mapApiPriceListToEntity = (item: any): PriceList => ({
  id: item?.id ?? item?.ID ?? 0,
  companyId: item?.companyId ?? item?.CompanyID ?? item?.company_id,
  customerId: item?.customerId ?? item?.CustomerID ?? item?.customer_id,
  customerName: item?.customerName ?? item?.CustomerName ?? item?.customer_name ?? "",
  name: item?.name ?? item?.Name ?? "",
  code: item?.code ?? item?.Code ?? "",
  paymentTermsDays: item?.paymentTermsDays ?? item?.PaymentTermsDays ?? item?.payment_terms_days ?? 0,
  validityMonths: item?.validityMonths ?? item?.ValidityMonths ?? item?.validity_months ?? 0,
  isDefault: item?.isDefault ?? item?.IsDefault ?? item?.is_default ?? false,
  isActive: item?.isActive ?? item?.IsActive ?? item?.is_active ?? true,
  createdAt: item?.createdAt || item?.CreatedAt || item?.created_at,
  items: Array.isArray(item?.items)
    ? item.items.map(mapApiPriceListItem)
    : Array.isArray(item?.Items)
    ? item.Items.map(mapApiPriceListItem)
    : [],
});

export const priceListService = {
  async getPriceLists(companyId?: number, search = ""): Promise<PriceList[]> {
    const url = new URL(`${API_BASE_URL}/price-lists`);
    if (search) url.searchParams.append("search", search);

    const response = await fetch(url.toString(), getFetchOptions(companyId));

    const data = await parseResponseJson(response);
    if (!Array.isArray(data)) return [];
    return data.map(mapApiPriceListToEntity);
  },

  async getPriceListByCustomer(customerId?: number, companyId?: number): Promise<PriceList | undefined> {
    const url = `${API_BASE_URL}/price-lists/resolve${customerId ? `?customerId=${customerId}` : ""}`;
    const response = await fetch(url, getFetchOptions(companyId));

    if (response.status === 404) return undefined;
    const data = await parseResponseJson(response);
    const rawId = data?.id ?? data?.ID;
    return rawId ? mapApiPriceListToEntity(data) : undefined;
  },

  async createPriceList(data: Omit<PriceList, "id">, companyId?: number): Promise<PriceList> {
    const formattedData = {
      ...data,
      items: data.items.map((item) => ({
        productId: item.productId,
        regularPrice: item.regularPrice,
        negotiatedPrice: item.negotiatedPrice,
        deliveryDays: item.deliveryDays || 3,
        comments: item.comments || "",
      })),
    };

    const response = await fetch(`${API_BASE_URL}/price-lists`, getFetchOptions(companyId, {
      method: "POST",
      body: JSON.stringify(formattedData),
    }));

    const created = await parseResponseJson(response);
    return mapApiPriceListToEntity(created);
  },

  async updatePriceList(id: number, data: Partial<PriceList>, companyId?: number): Promise<PriceList> {
    const formattedData = {
      ...data,
      items: data.items
        ? data.items.map((item) => ({
            productId: item.productId,
            regularPrice: item.regularPrice,
            negotiatedPrice: item.negotiatedPrice,
            deliveryDays: item.deliveryDays || 3,
            comments: item.comments || "",
          }))
        : undefined,
    };

    const response = await fetch(`${API_BASE_URL}/price-lists/${id}`, getFetchOptions(companyId, {
      method: "PUT",
      body: JSON.stringify(formattedData),
    }));

    const updated = await parseResponseJson(response);
    return mapApiPriceListToEntity(updated);
  },

  async deletePriceList(id: number, companyId?: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/price-lists/${id}`, getFetchOptions(companyId, {
      method: "DELETE",
    }));

    await parseResponseJson(response);
  }
};
