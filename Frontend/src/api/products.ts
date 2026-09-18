import { apiClient } from "./apiClient";
import type { ProductItem } from "../screens/product/ProductListScreen";

export interface ProductSizeOption {
  id: number;
  sizeName: string;
}

export interface ProductPayload {
  name: string;
  code: string;
  price: number;
  description?: string;
  sizeId?: number | null;
  imageUrl?: string;
}

export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface ProductApiResponse {
  data: ProductItem[];
  pagination: PaginationMeta;
}

export const getProducts = async (
  keyword?: string,
  page: number = 1,
  limit: number = 10,
): Promise<ProductApiResponse> => {
  const res = await apiClient.get("/product/products", {
    params: {
      keyword: keyword || undefined,
      page,
      limit,
    },
  });
  return res.data;
};

export const getProductById = async (
  id: string | number,
): Promise<ProductItem> => {
  const res = await apiClient.get(`/product/products/${id}`);
  return res.data;
};

export const createProduct = async (payload: ProductPayload) => {
  const res = await apiClient.post("/product/products", payload);
  return res.data;
};

export const updateProduct = async (
  id: string | number,
  payload: ProductPayload,
) => {
  const res = await apiClient.put(`/product/products/${id}`, payload);
  return res.data;
};


export const deleteProduct = async (id: string | number) => {
  const res = await apiClient.delete(`/product/products/${id}`);
  return res.data;
};

export const getProductSizes = async (): Promise<ProductSizeOption[]> => {
  const res = await apiClient.get("/product/products/sizes");
  return Array.isArray(res.data) ? res.data : [];
};

export const createProductSize = async (
  sizeName: string,
): Promise<ProductSizeOption> => {
  const res = await apiClient.post("/product/sizes", { sizeName });
  return res.data?.data || res.data;
};