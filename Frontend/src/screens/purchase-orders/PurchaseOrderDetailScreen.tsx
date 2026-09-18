import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import type { AxiosError } from 'axios'

import { Header } from '../../components/layout/Header'
import { OrderInfoForm, type SupplierOption } from '../../components/purchase-order/OrderInfoForm'
import { OrderDetailTable, type OrderRowItem, type ProductOption } from '../../components/purchase-order/OrderDetailTable'

import { getSuppliers } from '../../api/suppliers'
import { getProducts } from '../../api/products'
import {
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  confirmPurchaseOrder,
  importPurchaseOrder,
} from '../../api/purchaseOrders'

interface RootState {
  auth?: {
    user?: {
      id?: number
      username?: string
      email?: string
      role?: string
    }
  }
}

interface ApiErrorResponse {
  message?: string
}

interface OrderFormData {
  supplierId: number | ''
  staffName: string
  issueDate: string
  note: string
  status: string
  items: OrderRowItem[]
}

interface FormViewProps {
  id?: string
  isEditMode: boolean
  defaultData: OrderFormData
  suppliers: SupplierOption[]
  products: ProductOption[]
  orderCode?: string
  currentUserId?: number
}

const FormView: React.FC<FormViewProps> = ({
  id,
  isEditMode,
  defaultData,
  suppliers,
  products,
  orderCode,
  currentUserId,
}) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<OrderFormData>(defaultData)
  // Quản lý trạng thái: Nếu mở đơn có sẵn thì mặc định coi như đã lưu
  const [isSaved, setIsSaved] = useState<boolean>(isEditMode)

  const isDraft = !formData.status || formData.status.toLowerCase() === 'draft'
  const isConfirmed = formData.status?.toLowerCase() === 'confirmed'
  const isReadOnly = isEditMode && !isDraft

  const handleAddItem = () => {
    setIsSaved(false)
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { productId: 0, productCode: '', productName: '', quantity: 1, unitPrice: 0, subtotal: 0 },
      ],
    }))
  }

  const handleRemoveItem = (index: number) => {
    setIsSaved(false)
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  const handleItemChange = (
    index: number,
    field: keyof OrderRowItem,
    value: string | number
  ) => {
    setIsSaved(false)
    setFormData((prev) => {
      const updatedItems = [...prev.items]
      if (field === 'productId') {
        const selected = products.find((p) => p.id === Number(value))
        if (selected) {
          updatedItems[index].productId = selected.id
          updatedItems[index].productCode = selected.code
          updatedItems[index].productName = selected.name
          updatedItems[index].unitPrice = Number(selected.price) || 0
          updatedItems[index].subtotal = updatedItems[index].quantity * (Number(selected.price) || 0)
        }
      } else if (field === 'quantity' || field === 'unitPrice') {
        const numVal = Math.max(0, Number(value) || 0)
        updatedItems[index][field] = numVal
        updatedItems[index].subtotal = updatedItems[index].quantity * updatedItems[index].unitPrice
      }
      return { ...prev, items: updatedItems }
    })
  }

  const totalAmount = formData.items.reduce((sum, item) => sum + (item.subtotal || 0), 0)

  const saveMutation = useMutation({
    mutationFn: async () => {
      const validItems = formData.items
        .filter((i) => Number(i.productId) > 0 && Number(i.quantity) > 0)
        .map((i) => ({
          productId: Number(i.productId),
          quantity: Number(i.quantity),
          unitPrice: Number(i.unitPrice),
        }))

      const payload = {
        supplierId: Number(formData.supplierId),
        note: formData.note,
        issueDate: formData.issueDate,
        userId: currentUserId,
        items: validItems,
      }

      return isEditMode ? await updatePurchaseOrder(id!, payload) : await createPurchaseOrder(payload)
    },
    onSuccess: (data) => {
      alert(isEditMode ? 'Cập nhật thành công!' : 'Tạo mới đơn hàng bản nháp thành công!')
      setIsSaved(true)

      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ['purchaseOrder', id] })
      }
      const targetId = isEditMode ? id : data?.order?.id || data?.id || data?.orderId
      navigate(`/purchase-orders/${targetId}`)
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      alert(err.response?.data?.message || 'Có lỗi khi lưu đơn hàng!')
    },
  })

  const confirmMutation = useMutation({
    mutationFn: () => confirmPurchaseOrder(id!),
    onSuccess: () => {
      alert('Đã xác nhận đơn hàng!')
      setFormData((prev) => ({ ...prev, status: 'Confirmed' }))
      queryClient.invalidateQueries({ queryKey: ['purchaseOrder', id] })
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      alert(err.response?.data?.message || 'Lỗi khi xác nhận đơn hàng!')
    },
  })

  const importMutation = useMutation({
    mutationFn: () => importPurchaseOrder(id!),
    onSuccess: () => {
      alert('Nhập kho thành công và đã cộng tồn kho!')
      setFormData((prev) => ({ ...prev, status: 'Imported' }))
      queryClient.invalidateQueries({ queryKey: ['purchaseOrder', id] })
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] })
    },
    onError: (err: AxiosError<ApiErrorResponse>) => {
      alert(err.response?.data?.message || 'Lỗi khi nhập kho!')
    },
  })

  const handleSave = () => {
    if (!formData.supplierId) return alert('Vui lòng chọn Nhà cung cấp!')
    
    const validItems = formData.items.filter((i) => Number(i.productId) > 0 && Number(i.quantity) > 0)
    if (validItems.length === 0) {
      return alert('Vui lòng chọn ít nhất một sản phẩm và nhập số lượng hợp lệ!')
    }
    saveMutation.mutate()
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
      <div className="flex justify-between items-center pb-6 mb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? `Đơn mua hàng: ${orderCode || `#${id}`}` : 'Tạo mới Đơn mua hàng'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditMode ? 'Xem chi tiết và cập nhật trạng thái đơn hàng' : 'Nhập thông tin nhà cung cấp và danh sách mặt hàng nhập'}
          </p>
        </div>

        {isEditMode && (
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              isDraft
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                : isConfirmed
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-green-100 text-green-800 border border-green-200'
            }`}
          >
            {isDraft ? 'Bản nháp' : isConfirmed ? 'Đã xác nhận' : 'Đã nhập kho'}
          </span>
        )}
      </div>

      <OrderInfoForm
        supplierId={formData.supplierId}
        setSupplierId={(supId) => {
          setIsSaved(false)
          setFormData((prev) => ({ ...prev, supplierId: supId }))
        }}
        staffName={formData.staffName}
        issueDate={formData.issueDate}
        setIssueDate={(date) => {
          setIsSaved(false)
          setFormData((prev) => ({ ...prev, issueDate: date }))
        }}
        note={formData.note}
        setNote={(noteText) => {
          setIsSaved(false)
          setFormData((prev) => ({ ...prev, note: noteText }))
        }}
        suppliers={suppliers}
        isReadOnly={isReadOnly}
      />

      <OrderDetailTable
        items={formData.items}
        products={products}
        isReadOnly={isReadOnly}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onItemChange={handleItemChange}
      />

      <div className="flex justify-end p-4 bg-gray-50 rounded-xl border border-gray-200 mb-8">
        <div className="flex items-center gap-6">
          <span className="text-gray-600 font-semibold">Tổng tiền đơn hàng:</span>
          <span className="text-2xl font-black text-blue-600">
            {totalAmount.toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {/* Khu vực nút hành động: Tự động ẩn nút Lưu khi isSaved = true */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={() => navigate('/purchase-orders')}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
        >
          Quay lại
        </button>

        <div className="flex items-center gap-3">
          {/* NÚT LƯU: Ẩn khi đã lưu thành công (isSaved = true) */}
          {isDraft && !isSaved && (
            <button
              type="button"
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm disabled:opacity-50"
            >
              {saveMutation.isPending ? 'Đang lưu...' : isEditMode ? 'Lưu thay đổi' : 'Tạo đơn hàng'}
            </button>
          )}

          {/* NÚT XÁC NHẬN: Chỉ hiển thị khi đã lưu thành công (isSaved = true) */}
          {isDraft && isSaved && isEditMode && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Xác nhận đơn hàng? Sau khi xác nhận sẽ khóa sửa đổi.')) {
                  confirmMutation.mutate()
                }
              }}
              disabled={confirmMutation.isPending}
              className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium shadow-sm disabled:opacity-50"
            >
              {confirmMutation.isPending ? 'Đang xác nhận...' : 'Xác nhận đơn hàng'}
            </button>
          )}

          {/* Nút Nhập kho */}
          {isEditMode && isConfirmed && (
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Xác nhận nhập kho và cộng tồn kho?')) {
                  importMutation.mutate()
                }
              }}
              disabled={importMutation.isPending}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm disabled:opacity-50"
            >
              {importMutation.isPending ? 'Đang nhập kho...' : 'Nhập kho'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export const PurchaseOrderDetailScreen: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const isEditMode = Boolean(id && id !== 'create')
  const currentUser = useSelector((state: RootState) => state.auth?.user)

  const { data: supplierResponse } = useQuery({
    queryKey: ['suppliers', 'all'],
    queryFn: () => getSuppliers(undefined, 1, 100),
  })
  const suppliers: SupplierOption[] = Array.isArray(supplierResponse)
    ? supplierResponse
    : ((supplierResponse?.data || []) as unknown as SupplierOption[])

  const { data: productResponse } = useQuery({
    queryKey: ['products', 'all'],
    queryFn: () => getProducts(undefined, 1, 100),
  })
  const products: ProductOption[] = Array.isArray(productResponse)
    ? productResponse
    : ((productResponse?.data || []) as unknown as ProductOption[])

  const { data: orderDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['purchaseOrder', id],
    queryFn: () => getPurchaseOrderById(id!),
    enabled: isEditMode,
  })

  if (isEditMode && isLoadingDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto py-12 text-center text-gray-500">
          Đang tải thông tin đơn hàng...
        </div>
      </div>
    )
  }

  const defaultData: OrderFormData = isEditMode && orderDetail
    ? {
        supplierId: orderDetail.supplierId ?? '',
        staffName: orderDetail.createdByName || '',
        issueDate: orderDetail.purchaseDate ? orderDetail.purchaseDate.split('T')[0] : '',
        note: orderDetail.note || '',
        status: orderDetail.status || 'Draft',
        items: (orderDetail.items as OrderRowItem[]) || [],
      }
    : {
        supplierId: '',
        staffName: currentUser?.username || 'Nhân viên',
        issueDate: new Date().toISOString().split('T')[0],
        note: '',
        status: 'Draft',
        items: [],
      }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FormView
          key={isEditMode ? `edit-${id}-${orderDetail?.orderCode || 'ready'}` : 'new'}
          id={id}
          isEditMode={isEditMode}
          defaultData={defaultData}
          suppliers={suppliers}
          products={products}
          orderCode={orderDetail?.orderCode}
          currentUserId={currentUser?.id}
        />
      </main>
    </div>
  )
}