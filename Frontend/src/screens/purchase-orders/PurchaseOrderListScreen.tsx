import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getPurchaseOrders, type OrderFilterParams } from '../../api/purchaseOrders';
import type { useQuery } from '@tanstack/react-query';
import { Header } from '../../components/layout/Header';
// import { useNavigate } from 'react-router-dom'
// import { useQuery } from '@tanstack/react-query'
// import { getPurchaseOrders, OrderFilterParams } from '../../api/purchaseOrders'


export const PurchaseOrderListScreen: React.FC = () => {
    // const navigate = useNavigate()
    // const [appliedFilter, setAppliedFilter] = useState<OrderFilterParams>({})

    // const { data: orders = [], isLoading, isError } = useQuery({
    //     queryKey: ['purchaseOrders', appliedFilter],
    //     queryFn: () => getPurchaseOrders(appliedFilter),
    // })

    return (
        <>
            <Header/>
        </>
    )
}