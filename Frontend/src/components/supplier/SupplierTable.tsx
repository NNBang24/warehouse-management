import React from "react";
import type { SupplierItem } from "../../api/suppliers"; 

export interface SupplierTableProps {
  suppliers: SupplierItem[];
  isLoading: boolean;
  isError: boolean;
  currentUser?: {
    id?: number;
    username?: string;
    email?: string;
    role?: string;
  };
  onRowClick?: (id: number) => void;
  onDeleteClick?: (id: number, name: string) => void;
}

export const SupplierTable: React.FC<SupplierTableProps> = ({
  suppliers,
  isLoading,
  isError,
  currentUser,
  onRowClick,
  onDeleteClick,
}) => {
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Đang tải danh sách nhà cung cấp...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Có lỗi xảy ra khi tải danh sách nhà cung cấp!</div>;
  }

  if (suppliers.length === 0) {
    return <div className="p-8 text-center text-gray-500">Không tìm thấy nhà cung cấp nào.</div>;
  }

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full border-collapse text-left text-sm text-gray-700">
        <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-600">
          <tr>
            <th className="p-3">Mã NCC</th>
            <th className="p-3">Tên nhà cung cấp</th>
            <th className="p-3">Số điện thoại</th>
            <th className="p-3">Email</th>
            <th className="p-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {suppliers.map((supplier) => {
            const canModify = isAdmin || Number((supplier as any).createdBy) === Number(currentUser?.id);

            return (
              <tr
                key={supplier.id}
                onClick={() => onRowClick && onRowClick(supplier.id)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="p-3 font-medium text-gray-900">{supplier.code}</td>
                <td className="p-3">{supplier.name}</td>
                <td className="p-3">{supplier.phone || "-"}</td>
                <td className="p-3">{supplier.email || "-"}</td>
                <td
                  className="p-3 text-center"
                  onClick={(e) => e.stopPropagation()} // Không kích hoạt onRowClick khi click vào nút hành động
                >
                  {canModify ? (
                    <div className="flex justify-center items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onRowClick && onRowClick(supplier.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Sửa
                      </button>
                      {onDeleteClick && (
                        <button
                          type="button"
                          onClick={() => onDeleteClick(supplier.id, supplier.name)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400 italic">Không có quyền</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};