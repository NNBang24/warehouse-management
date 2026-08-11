import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getPurchaseOrders, type OrderFilterParams} from '../../api/purchaseOrders'

import { Header } from '../../components/layout/Header'
import { OrderFilterForm } from '../../components/purchase-order/OrderFilterForm'

import { Button } from '../../components/ui/Button'
import { OrderTable } from '../../components/purchase-order/OrderTable'


export const PurchaseOrderListScreen: React.FC = () => {
    const navigate = useNavigate()
    const [appliedFilter, setAppliedFilter] = useState<OrderFilterParams>({})

    const { data: orders = [], isLoading, isError } = useQuery({
        queryKey: ['purchaseOrders', appliedFilter],
        queryFn: () => getPurchaseOrders(appliedFilter),
    })

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Danh sách Đơn mua hàng</h1>
                    <div className='max-w-5xl'>
                        <Button onClick={() => navigate('/purchase-orders/create')}>
                            + Tạo mới
                        </Button>
                    </div>
                   
                </div>

                <OrderFilterForm onSearch={(filter) => setAppliedFilter(filter)} isLoading={isLoading} />

                <OrderTable orders={orders} isLoading={isLoading} isError={isError} />
            </main>
        </div>
    )
}