import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

import { Header } from "../../components/layout/Header";
import { Button } from "../../components/ui/Button";
import { ProductSearchBar } from "../../components/product/ProductSearchBar";
import { ProductTable } from "../../components/product/ProductTable";
import { Pagination } from "../../components/ui/Pagination";

import { getProducts } from "../../api/products";

interface RootState {
  auth?: {
    user?: {
      id?: number;
      username?: string;
      email?: string;
      role?: string;
    };
  };
}

export interface ProductItem {
  id: number;
  code: string;
  name: string;
  price: number;
  sizeId?: number | null;
  sizeName: string | null;
  description?: string;
  imageUrl?: string;
  createdBy?: number | null; // Cần thiết để kiểm tra quyền BUG_001
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

export const ProductListScreen: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth?.user);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(1);
  const limit = 5;

  const handleSearchChange = (kw: string) => {
    setSearchKeyword(kw);
    setPage(1);
  };

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<ProductApiResponse>({
    queryKey: ["products", searchKeyword, page],
    queryFn: async (): Promise<ProductApiResponse> => {
      const res = await getProducts(searchKeyword, page, limit);
      return res as ProductApiResponse;
    },
    placeholderData: (prev) => prev,
  });

  const products = response?.data || [];
  const pagination = response?.pagination || {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Danh sách Sản phẩm
          </h1>
          {/* Cả Admin và Nhân viên đều có nút tạo mới */}
          <div>
            <Button onClick={() => navigate("/products/create")}>
              + Tạo mới sản phẩm
            </Button>
          </div>
        </div>

        <ProductSearchBar
          value={searchKeyword}
          onChange={handleSearchChange}
          totalCount={pagination.totalItems}
        />

        <ProductTable
          products={products}
          isLoading={isLoading}
          isError={isError}
          currentUser={currentUser}
          onRowClick={(id) => navigate(`/products/${id}`)}
        />

        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          limit={pagination.limit}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </main>
    </div>
  );
};