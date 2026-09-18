import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Header } from '../../components/layout/Header';
import { InventorySearchBar } from '../../components/inventory/InventorySearchBar';
import { InventoryTable } from '../../components/inventory/InventoryTable';
import { Pagination } from '../../components/ui/Pagination';

import { checkInventory, type InventoryItem } from '../../api/inventory';

export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface InventoryApiResponse {
  data: InventoryItem[];
  pagination: PaginationMeta;
}

export const InventoryCheckScreen: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeKeyword, setActiveKeyword] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery<InventoryApiResponse>({
    queryKey: ['inventoryCheck', activeKeyword, page],
    queryFn: async (): Promise<InventoryApiResponse> => {
      const res = await checkInventory(activeKeyword, page, limit);
      return res as InventoryApiResponse;
    },
    placeholderData: (prev) => prev,
  });

  const inventoryList = response?.data || [];
  const pagination = response?.pagination || {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1,
    limit,
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveKeyword(searchTerm.trim());
    setPage(1);
  };

  const handleReset = () => {
    setSearchTerm('');
    setActiveKeyword('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tra cứu Tồn kho</h1>
          </div>
          <div className="text-sm text-gray-500">
            Tổng số: <span className="font-semibold text-gray-900">{pagination.totalItems}</span> sản phẩm
          </div>
        </div>

 
        <InventorySearchBar
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onSubmit={handleSearchSubmit}
          onReset={handleReset}
          isLoading={isLoading}
        />

  
        <InventoryTable
          items={inventoryList}
          isLoading={isLoading}
          isError={isError}
          activeKeyword={activeKeyword}
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