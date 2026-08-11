import { type Request, type Response } from 'express'
import { prisma } from '../config/prisma.js';

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