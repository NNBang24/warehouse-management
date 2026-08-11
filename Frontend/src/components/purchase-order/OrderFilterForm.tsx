import React, { useState } from 'react'
import {type OrderFilterParams } from '../../api/purchaseOrders'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'

interface OrderFilterFormProps {
    onSearch: (filter: OrderFilterParams) => void
    isLoading?: boolean
}

export const OrderFilterForm: React.FC<OrderFilterFormProps> = ({ onSearch , isLoading }) => {

    const [filterInput, setFilterInput] = useState<OrderFilterParams>({
        orderCode: '',
        supplierName: '',
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault() ;
        onSearch(filterInput) ;
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <form onSubmit={handleSubmit}  className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <Input
                    id="orderCode"
                    label="Mã đơn hàng"
                    placeholder="Nhập mã đơn..."
                    value={filterInput.orderCode} 
                    onChange={(e) => setFilterInput({...filterInput , orderCode: e.target.value})}
                 
                />
                <Input
                    id="supplierName"
                    label="Nhà cung cấp"
                    placeholder="Nhập tên nhà cung cấp..."
                    value={filterInput.supplierName}
                    onChange={(e) => setFilterInput({ ...filterInput, supplierName: e.target.value })}
                />
                <div className="flex space-x-2">
                    <Button type="submit" isLoading={isLoading}>
                        Tìm kiếm
                    </Button>
                </div>
            </form>
        </div>
    )
}