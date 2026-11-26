import { API_BASE_URL, getFetchOptions } from "./apiConfig";
import { Product, ItemType } from "@/entities/Product";

export interface ApiProductDto {
  ID?: number;
  id?: number;
  companyId?: number;
  userId?: number;
  code?: string;
  name?: string;
  description?: string;
  itemType?: ItemType;
  category?: string;
  basePrice?: number;
  price?: number;
  taxRate?: number;
  taxType?: string;
  unitCode?: string;
  unit?: number;
  trackInventory?: boolean;
  stockQuantity?: number;
  minStock?: number;
  customAttributes?: string | Record<string, any>;
  isService?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

export const mapApiProductToEntity = (dto: ApiProductDto): Product => {
  let parsedCustomAttributes: Record<string, any> = {};
  if (typeof dto.customAttributes === "string" && dto.customAttributes.trim() !== "") {
    try {
      parsedCustomAttributes = JSON.parse(dto.customAttributes);
    } catch {
      parsedCustomAttributes = {};
    }
  } else if (typeof dto.customAttributes === "object" && dto.customAttributes !== null) {
    parsedCustomAttributes = dto.customAttributes;
  }

  const basePriceVal = dto.basePrice ?? dto.price ?? 0;
  const itemTypeVal = dto.itemType || (dto.isService ? "SERVICE" : "PIECE");

  return {
    ID: dto.ID ?? dto.id ?? 0,
    CompanyID: dto.companyId,
    UserID: dto.userId,
    Code: dto.code || "",
    Name: dto.name || "",
    Description: dto.description || "",
    ItemType: itemTypeVal,
    Category: dto.category || "",
    BasePrice: basePriceVal,
    Price: basePriceVal,
    TaxRate: dto.taxRate ?? 0,
    TaxType: dto.taxType || "IVA",
    UnitCode: dto.unitCode || "NIU",
    Unit: dto.unit ?? 1,
    TrackInventory: dto.trackInventory ?? !dto.isService,
    StockQuantity: dto.stockQuantity ?? 0,
    MinStock: dto.minStock ?? 0,
    InitialStock: dto.stockQuantity ?? 0,
    CustomAttributes: parsedCustomAttributes,
    IsService: itemTypeVal === "SERVICE",
    IsActive: dto.isActive ?? true,
    CreatedAt: dto.createdAt,
  };
};

export const mapEntityToApiPayload = (product: Partial<Product>, companyId?: number) => {
  const customAttrString = typeof product.CustomAttributes === "object"
    ? JSON.stringify(product.CustomAttributes || {})
    : (product.CustomAttributes || "{}");

  const itemTypeVal = product.ItemType || (product.IsService ? "SERVICE" : "PIECE");
  const basePriceVal = product.BasePrice ?? product.Price ?? 0;

  return {
    companyId: product.CompanyID || companyId,
    code: product.Code,
    name: product.Name,
    description: product.Description,
    itemType: itemTypeVal,
    category: product.Category,
    basePrice: basePriceVal,
    taxRate: product.TaxRate ?? 0,
    taxType: product.TaxType || "IVA",
    unitCode: product.UnitCode || "NIU",
    trackInventory: product.TrackInventory ?? (itemTypeVal === "PIECE"),
    stockQuantity: product.StockQuantity ?? product.InitialStock ?? 0,
    minStock: product.MinStock ?? 0,
    customAttributes: customAttrString,
    isService: itemTypeVal === "SERVICE",
  };
};

export const productService = {
  async getProducts(companyId?: number): Promise<Product[]> {
    const response = await fetch(`${API_BASE_URL}/products${companyId ? `?companyId=${companyId}` : ""}`, getFetchOptions(companyId));
    if (!response.ok) {
      throw new Error("Error al consultar la lista de productos");
    }
    const dtos: ApiProductDto[] = await response.json();
    return dtos.map(mapApiProductToEntity);
  },

  async getProductById(id: number, companyId?: number): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, getFetchOptions(companyId));
    if (!response.ok) {
      throw new Error("Error al obtener el producto");
    }
    const dto: ApiProductDto = await response.json();
    return mapApiProductToEntity(dto);
  },

  async createProduct(productData: Partial<Product>, companyId?: number): Promise<Product> {
    const payload = mapEntityToApiPayload(productData, companyId);
    const response = await fetch(`${API_BASE_URL}/products`, getFetchOptions(companyId, {
      method: "POST",
      body: JSON.stringify(payload),
    }));
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al crear el producto");
    }
    const dto: ApiProductDto = await response.json();
    return mapApiProductToEntity(dto);
  },

  async updateProduct(id: number, productData: Partial<Product>, companyId?: number): Promise<Product> {
    const payload = mapEntityToApiPayload(productData, companyId);
    const response = await fetch(`${API_BASE_URL}/products/${id}`, getFetchOptions(companyId, {
      method: "PUT",
      body: JSON.stringify(payload),
    }));
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al actualizar el producto");
    }
    if (response.status === 204) {
      return { ...productData, ID: id } as Product;
    }
    const text = await response.text();
    if (!text || text.trim() === "") {
      return { ...productData, ID: id } as Product;
    }
    const dto: ApiProductDto = JSON.parse(text);
    return mapApiProductToEntity(dto);
  },

  async deleteProduct(id: number, companyId?: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, getFetchOptions(companyId, {
      method: "DELETE",
    }));
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Error al eliminar el producto");
    }
  },
};
