import {type Request,  type Response } from 'express'
import { prisma } from '../config/prisma.js'


export const getProducts = async (req: Request, res: Response) => {
    try {
        const { keyword } = req.query
        const whereCondition: any = {}

        if (keyword && typeof keyword === 'string') {
            whereCondition.OR = [
                { name: { contains: keyword.trim() } },
                { code: { contains: keyword.trim() } },
            ]
        }

        const products = await prisma.product.findMany({
            where: whereCondition,
            include: {
                size: {
                    select: { sizeName: true },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        const formattedProducts = products.map((item) => ({
            id: item.id,
            name: item.name,
            code: item.code,
            price: Number(item.price),
            description: item.description,
            sizeName: item.size?.sizeName || null,
            imageUrl: item.imageUrl,
        }))

        return res.status(200).json(formattedProducts)
    } catch (error) {
        console.error('Lỗi lấy danh sách sản phẩm:', error)
        return res.status(500).json({ message: 'Lỗi hệ thống phía Server!' })
    }
}


export const createProduct = async (req: Request, res: Response) => {
    try {
        const { name, code, price, description, sizeId, imageUrl } = req.body

  
        if (!name || !code) {
            return res.status(400).json({ message: 'Tên và Mã sản phẩm không được để trống!' })
        }

        const trimmedCode = String(code).trim()

        const existingProduct = await prisma.product.findUnique({
            where: { code: trimmedCode },
        })

        if (existingProduct) {
            return res.status(400).json({ message: `Mã sản phẩm "${trimmedCode}" đã tồn tại!` })
        }

        const newProduct = await prisma.product.create({
            data: {
                name: String(name).trim(),
                code: trimmedCode,
                price: price ? Number(price) : 0,
                description: description || '',
                sizeId: sizeId ? Number(sizeId) : null,
                imageUrl: imageUrl || '',
            },
        })

        return res.status(201).json({
            message: 'Tạo sản phẩm thành công!',
            product: {
                ...newProduct,
                price: Number(newProduct.price),
            },
        })
    } catch (error) {
        console.error('Lỗi khi tạo sản phẩm:', error)
        return res.status(500).json({ message: 'Lỗi hệ thống khi tạo sản phẩm!' })
    }
}