import React from "react";
import type { ProductItem } from "../../screens/product/ProductListScreen"; // hoặc đường dẫn import ProductItem tương ứng

export interface ProductTableProps {
  products: ProductItem[];
  isLoading: boolean;
  isError: boolean;
  currentUser?: {
    id?: number;
    username?: string;
    email?: string;
    role?: string;
  };
  onRowClick?: (id: number) => void;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  isLoading,
  isError,
  currentUser,
  onRowClick,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu sản phẩm...</div>;
  }

  if (isError) {
    return <div className="p-8 text-center text-red-500">Có lỗi xảy ra khi tải danh sách sản phẩm!</div>;
  }

  if (products.length === 0) {
    return <div className="p-8 text-center text-gray-500">Không tìm thấy sản phẩm nào.</div>;
  }

  const isAdmin = currentUser?.role?.toLowerCase() === "admin";

  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm">
      <table className="w-full border-collapse text-left text-sm text-gray-700">
        <thead className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-600">
          <tr>
            <th className="p-3">Mã SP</th>
            <th className="p-3">Tên sản phẩm</th>
            <th className="p-3">Quy cách</th>
            <th className="p-3">Giá</th>
            <th className="p-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((item) => {
            const canModify = isAdmin || Number(item.createdBy) === Number(currentUser?.id);

            return (
              <tr
                key={item.id}
                onClick={() => onRowClick && onRowClick(item.id)}
                className="hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <td className="p-3 font-medium text-gray-900">{item.code}</td>
                <td className="p-3">{item.name}</td>
                <td className="p-3">{item.sizeName || "-"}</td>
                <td className="p-3 font-medium text-blue-600">
                  {item.price.toLocaleString("vi-VN")} đ
                </td>
                <td
                  className="p-3 text-center"
                  onClick={(e) => e.stopPropagation()} // Chặn trigger onRowClick khi bấm nút thao tác
                >
                  {canModify ? (
                    <div className="flex justify-center items-center gap-3">
                      {onEdit && (
                        <button
                          type="button"
                          onClick={() => onEdit(item.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Sửa
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(item.id)}
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