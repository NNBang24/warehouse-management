import { type Request, type Response } from 'express'
import { prisma } from '../config/prisma.js';
import {type authenticatedRequest} from "../middlewares/authenticateToken.js"
interface OrderDetailInput {
    productId: number
    quantity: number
    unitPrice: number
}

interface CreateOrderBody {
    supplierId: number
    note?: string
    items: OrderDetailInput[]
}
export const getPurchaseOrders = async(req : Request , res : Response) => {

    try {
        const {orderCode , supplierName} = req.query ;
        const whereCondition : any = {} ;
        if ( orderCode && typeof orderCode === 'string') {
            whereCondition.code = {
                contains : orderCode.trim() ,
            }
        }

        const orders = await prisma.purchaseOrder.findMany({
            where : whereCondition ,
            select : {
                id : true ,
                code : true ,
                issueDate : true ,
                totalAmount: true ,
                status : true ,
                supplier : {
                    select : {
                        name : true ,
                    },

                } ,
                user : {
                    select : {
                        username : true ,
                    },
                },
            },
            orderBy: {
                issueDate: 'desc',
            },
        }) ; 
        const formatOrders = orders.map((order) => ({
            id : order.id ,
            orderCode : order.code ,
            supplierName : order.supplier.name ,
            purchaseDate : order.issueDate ,
            createdByName : order.user.username ,
            totalAmount : Number(order.totalAmount) ,
            status : order.status
        }))

        return res.status(200).json(formatOrders) ;

    } catch (error) {
        console.error('Lỗi khi lấy danh sách đơn mua hàng:', error) ;
        return res.status(500).json({ message: 'Lỗi hệ thống phía Server!' })
    }
}

export const createPurchaseOrder = async (req : authenticatedRequest , res : Response) => {
    try {
        const {supplierId , note , items} = req.body as CreateOrderBody ;
        const userId = req.user?.id 
        if (!supplierId || !items || !Array.isArray(items) || items.length === 0 ) {
            return res.status(400).json({
                message: 'Vui lòng chọn Nhà cung cấp và nhập ít nhất một sản phẩm!'
            })
        }
        if (!userId) {
            return res.status(401).json({ message: 'Không tìm thấy thông tin người tạo đơn!' })
        }
        const parsedSupplierId = Number(supplierId)

        const existingSupplier = await prisma.supplier.findUnique({
            where: { id: parsedSupplierId },
        })

        if (!existingSupplier) {
            return res.status(400).json({
                message: `Nhà cung cấp ID ${supplierId} không tồn tại trong hệ thống!`,
            })
        }
        const generatedCode = `PO-${Date.now()}`
        let calculatedTotalAmount = 0 
        const preparedDetails = items.map((item) => {
            const subtotal = item.quantity * item.unitPrice 
            calculatedTotalAmount += subtotal
            return {
                productId: Number(item.productId),
                quantity: Number(item.quantity),
                unitPrice: item.unitPrice,
                subtotal: subtotal,
            }
        }) 
        const newOrder = await prisma.$transaction(async(item) => {
            const order = await item.purchaseOrder.create({
                data:{
                    code : generatedCode ,
                    supplierId : Number(supplierId) ,
                    createdBy : userId ,
                    note: note || '',
                    totalAmount: calculatedTotalAmount,
                    status: 'Draft',
                    purchaseOrderDetails : {
                        create: preparedDetails ,
                    },
                },
                include : {
                    supplier : {
                        select : {
                            name : true
                        } ,
                    } ,
                    purchaseOrderDetails : {
                        include : {
                            product : {
                                select : {
                                    name : true ,
                                    code : true 
                                }
                            }
                        }
                    },
                },
            })
            return order ;
        })
        return res.status(201).json({
            message: 'Tạo mới đơn mua hàng thành công!',
            order: {
                id: newOrder.id,
                orderCode: newOrder.code,
                supplierName: newOrder.supplier.name,
                purchaseDate: newOrder.issueDate,
                totalAmount: Number(newOrder.totalAmount),
                status: newOrder.status,
                note: newOrder.note,
                items: newOrder.purchaseOrderDetails.map((detail) => ({
                    id: detail.id,
                    productId: detail.productId,
                    productName: detail.product.name,
                    productCode: detail.product.code,
                    quantity: detail.quantity,
                    unitPrice: Number(detail.unitPrice),
                    subtotal: Number(detail.subtotal),
                })),
            },
        })
    } catch (error:any) {
        console.error('Lỗi khi tạo mới đơn mua hàng:', error) ;
        if (error.code === 'P2003') {
            return res.status(400).json({
                message: 'Sản phẩm đã chọn không tồn tại trong hệ thống!',
            })
        }
        return res.status(500).json({ message: 'Lỗi hệ thống phía Server khi tạo đơn hàng!' })
    }
}