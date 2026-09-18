import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { AxiosError } from "axios";

import { Header } from "../../components/layout/Header";
import { Button } from "../../components/ui/Button";
import { SupplierSearchBar } from "../../components/supplier/SupplierSearchBar";
import { SupplierTable } from "../../components/supplier/SupplierTable";
import { Pagination } from "../../components/ui/Pagination";
import {
  getSuppliers,
  deleteSupplier,
  type SupplierApiResponse,
} from "../../api/suppliers";

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

interface ApiErrorResponse {
  message?: string;
}

export const SupplierListScreen: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useSelector((state: RootState) => state.auth?.user);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [page, setPage] = useState(1);
  const limit = 4;

  const handleSearchChange = (kw: string) => {
    setSearchKeyword(kw);
    setPage(1);
  };

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<SupplierApiResponse>({
    queryKey: ["suppliers", searchKeyword, page],
    queryFn: () => getSuppliers(searchKeyword, page, limit),
    placeholderData: (prev) => prev,
  });

  const suppliers = response?.data || [];
  const pagination = response?.pagination || {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit,
  };

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteSupplier(id),
    onSuccess: () => {
      alert("Đã xóa nhà cung cấp thành công!");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      alert(err.response?.data?.message || "Lỗi khi xóa nhà cung cấp!");
    },
  });

  const handleDeleteSupplier = (id: number, name: string) => {
    if (
      window.confirm(
        `Bạn có chắc muốn xóa nhà cung cấp "${name}"? Thao tác này không thể hoàn tác.`,
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Danh sách Nhà cung cấp
          </h1>
          <div>
            <Button onClick={() => navigate("/suppliers/create")}>
              + Tạo mới nhà cung cấp
            </Button>
          </div>
        </div>

        <SupplierSearchBar
          value={searchKeyword}
          onChange={handleSearchChange}
          totalCount={pagination.totalItems}
        />

        <SupplierTable
          suppliers={suppliers}
          isLoading={isLoading}
          isError={isError}
          currentUser={currentUser}
          onRowClick={(id) => navigate(`/suppliers/${id}`)}
          onDeleteClick={handleDeleteSupplier}
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