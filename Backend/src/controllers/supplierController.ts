import {type Request, type Response } from 'express'
import { prisma } from '../config/prisma.js'


export const createSupplier = async (req: Request, res: Response) => {
    try {
        const { name, code, phone, email, address } = req.body

        if (!name || !String(name).trim()) {
            return res.status(400).json({ message: 'Tên nhà cung cấp không được để trống!' })
        }

        let finalCode = code ? String(code).trim() : ''

     
        if (!finalCode) {
            const count = await prisma.supplier.count()
            finalCode = `NCC-${String(count + 1).padStart(3, '0')}` 
        } else {

            const existingSupplier = await prisma.supplier.findUnique({
                where: { code: finalCode },
            })
            if (existingSupplier) {
                return res.status(400).json({ message: `Mã nhà cung cấp "${finalCode}" đã tồn tại!` })
            }
        }

        const newSupplier = await prisma.supplier.create({
            data: {
                name: String(name).trim(),
                code: finalCode,
                phone: phone ? String(phone).trim() : '',
                email: email ? String(email).trim() : '',
                address: address ? String(address).trim() : '',
            },
        })

        return res.status(201).json({
            message: 'Tạo nhà cung cấp thành công!',
            supplier: newSupplier,
        })
    } catch (error) {
        console.error('Lỗi khi tạo nhà cung cấp:', error)
        return res.status(500).json({ message: 'Lỗi hệ thống khi tạo nhà cung cấp!' })
    }
}