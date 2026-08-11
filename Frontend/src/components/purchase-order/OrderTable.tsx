import React from 'react'
import { useNavigate } from 'react-router-dom'
import { type PurchaseOrder } from '../../api/purchaseOrders'

interface OrderTableProps {
    orders: PurchaseOrder[]
    isLoading: boolean
    isError: boolean
}

export const OrderTable: React.FC<OrderTableProps> = ({ orders, isLoading, isError }) => {
    const navigate = useNavigate()

    const renderStatusBadge = (status: string) => {
        switch (status.toUpperCase()) {
            case 'DRAFT':
                return <span className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-full">Bản nháp</span>
            case 'CONFIRMED':
                return <span className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">Đã xác nhận</span>
            case 'IMPORTED':
                return <span className="px-2.5 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">Đã nhập kho</span>
            default:
                return <span className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-full">{status}</span>
        }
    }

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Đang tải danh sách đơn hàng...</div>
    }

    if (isError) {
        return <div className="p-8 text-center text-red-500">Có lỗi xảy ra khi tải dữ liệu!</div>
    }

    if (orders.length === 0) {
        return <div className="p-8 text-center text-gray-500">Không tìm thấy đơn mua hàng nào.</div>
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhà cung cấp</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày mua hàng</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nhân viên phụ trách</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                            <tr
                                key={order.id}
                                onClick={() => navigate(`/purchase-orders/${order.id}`)}
                                className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">{order.orderCode}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.supplierName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(order.purchaseDate).toLocaleDateString('vi-VN')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.createdByName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                    {order.totalAmount.toLocaleString('vi-VN')} đ
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(order.status)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}