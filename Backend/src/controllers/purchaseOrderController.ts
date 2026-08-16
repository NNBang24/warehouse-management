import { type Request, type Response } from 'express'
import { prisma } from '../config/prisma.js';
import {type authenticatedRequest} from "../middlewares/authenticateToken.js"
import { assert } from 'node:console';

import { it } from 'node:test';
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
// get lay danh sach don mua hang 
export const getPurchaseOrders = async(req : Request , res : Response) => {

    try {
        const {orderCode , supplierName} = req.query ;
        const whereCondition : any = {} ;
        if ( orderCode && typeof orderCode === 'string') {
            whereCondition.code = {
                contains : orderCode.trim() ,
            }
        }
        if (supplierName && typeof supplierName === 'string' && supplierName.trim() !== '') {
            whereCondition.supplier = {
                name: {
                    contains: supplierName.trim(),
                },
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

// Get lay chi tiet 1 don hang 
export const getPurchaseOrderById = async ( req : Request , res : Response) => {
    try {
        const orderId = Number(req.params.id) ;
        if(isNaN(orderId)) {
            return res.status(400) .json({message : 'Mã đơn hàng không hợp lệ ! '}) ;
        }
        const order = await prisma.purchaseOrder.findUnique({
            where : {id : orderId} ,
            include : {
                supplier : {
                    select : {
                        id : true , name : true , code : true 
                    } ,
                } ,
                user : {
                    select : {
                        id : true , username : true 
                    }
                } ,
                purchaseOrderDetails : {
                    include: {
                        product : {
                            select : {
                                id : true , name : true , code : true , price : true
                            } ,
                        },
                    },
                },
            },
        }) ;
        if( !order) {
            return res.status(404).json({message : 'Không tìm thấy đoen mua hàng .'}) ;
        }
        return  res.status(200).json({
            id : order.id ,
            orderCode : order.code ,
            supplierId : order.supplierId ,
            supplierName : order.supplier.name ,
            createByName : order.user.username ,
            purchaseDate : order.issueDate ,
            note : order.note || '' ,
            status : order.status ,
            totalAmount : Number(order.totalAmount) ,
            items : order.purchaseOrderDetails.map((detail)=>({
                id: detail.id ,
                productId : detail.productId ,
                productName : detail.product.name ,
                productCode : detail.product.code ,
                quantity : detail.quantity ,
                unitPrice : Number(detail.unitPrice) ,
                subtotal : Number(detail.subtotal) ,
            }))
        })
    } catch (error) {
        console.error('Lỗi khi lấy chi tiết đơn hàng:', error)
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

// patch : xac nhan don hang tu (draft -> confirmed ) 
export const confirmedPurchaseOrder = async (req : Request  , res : Response) => {
    try {
        const orderId = Number(req.params.id) ;
        if (isNaN(orderId)) {
            return res.status(400).json({ message: 'ID đơn hàng không hợp lệ!' })
        }
        const order = await prisma.purchaseOrder.findUnique({
            where : {id : orderId} 
        }) ;
        if(!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng!' })
        }
        if(order.status !== 'Draft') {
            return res.status(400).json( {message: 'Chỉ đơn hàng ở trạng thái "Bản nháp" mới có thể xác nhận!' }) ;
        }
        const updatedOrder = await prisma.purchaseOrder.update({
            where : {
                id : orderId
            } ,
            data : {status :'Confirmed'} ,
        })
        return res.status(200).json({
            message: 'Xác nhận đơn hàng thành công!',
            order: updatedOrder,
        })
    } catch (error) {
        console.error('Lỗi khi xác nhận đơn hàng:', error)
        return res.status(500).json({ message: 'Lỗi hệ thống phía Server!' })
    }
}

// patch : xac nhan nhap kho (confirmed -> imported)
export const importPurchaseOrder = async ( req : authenticatedRequest , res : Response) => {
    try {
        const orderId = Number(req.params.id) ;
        const userId = req.user?.id ;
        if (isNaN(orderId)) {
            return res.status(400).json({ message: 'ID đơn hàng không hợp lệ!' })
        }
        if (!userId) {
            return res.status(401).json({ message: 'Không tìm thấy thông tin người thực hiện!' })
        }
        const order = await prisma.purchaseOrder.findUnique({
            where : {id : orderId} ,
            include : {
                purchaseOrderDetails : true
            } ,

        })
        if (!order) {
            return res.status(404).json({ message: 'Không tìm thấy đơn hàng!' })
        }
        if ( order.status !== 'Confirmed') {
            return res.status(400).json({
                message: 'Chỉ đơn hàng ở trạng thái "Đã xác nhận" mới có thể nhập kho!',
            })
        }

        await prisma.$transaction(async(tx) => {
            await tx.purchaseOrder.update({
                where : {id : orderId} ,
                data : {status : 'Imported'} 
            })
            for (const item of order.purchaseOrderDetails) {
                await tx.inventory.upsert({
                    where :{productId : item.productId} ,
                    update : {
                        quantity : {increment : item.quantity} ,
                    },
                    create : {
                        productId : item.productId ,
                        quantity : item.quantity ,
                        committedQuantity : 0
                    },
                })

                await tx.inventoryTransaction.create({
                    data : {
                        productId : item.productId ,
                        orderId : order.id ,
                        userId : Number(userId) ,
                        transactionType : 'IN' ,
                        quantityChanged : item.quantity 
                    }
                })
            }
            
        })
        return res.status(200).json({
            message: 'Xác nhận nhập kho thành công và đã cập nhật số lượng tồn kho!',
        })
    } catch (error) {
        console.error('Lỗi khi nhập kho:', error)
        return res.status(500).json({ message: 'Lỗi hệ thống khi thực hiện nhập kho!' })
    }
}