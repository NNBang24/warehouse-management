import { apiClient} from "./apiClient"


export interface PurchaseOrder {
    id: string
    orderCode: string
    supplierName: string
    purchaseDate: string
    createdByName: string
    totalAmount: number
    status: 'DRAFT' | 'CONFIRMED' | 'IMPORTED'
} ;

export interface OrderFilterParams {
    orderCode?: string
    supplierName?: string
}
export const getPurchaseOrders = async (params?: OrderFilterParams): Promise<PurchaseOrder[]> => {
    const response = await apiClient.get<PurchaseOrder[]>('/purchase/purchase-orders', { params })

    return response.data
}
