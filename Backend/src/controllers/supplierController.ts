import { type Request, type Response } from 'express'
import { prisma } from '../config/prisma.js'
import { type AuthenticatedRequest } from '../middlewares/authenticateToken.js'

export const getSuppliers = async (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const whereCondition: any = {};

    if (keyword && typeof keyword === 'string' && keyword.trim() !== '') {
      const search = keyword.trim();
      whereCondition.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { phone: { contains: search } },
      ];
    }
    const [totalItems, suppliers] = await Promise.all([
      prisma.supplier.count({ where: whereCondition }),
      prisma.supplier.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      data: suppliers,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách nhà cung cấp:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi lấy danh sách!' });
  }
};

export const getSupplierById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID nhà cung cấp không hợp lệ!' });
    }

    const supplier = await prisma.supplier.findUnique({
      where: { id },
    });

    if (!supplier) {
      return res.status(404).json({ message: 'Không tìm thấy nhà cung cấp!' });
    }

    return res.status(200).json(supplier);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết nhà cung cấp:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống phía Server!' });
  }
};

export const createSupplier = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Không tìm thấy thông tin xác thực người dùng!' });
    }

    const { name, code, phone, email, address, note } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Tên nhà cung cấp không được để trống!' });
    }

    let finalCode = code ? String(code).trim().toUpperCase() : '';

    if (!finalCode) {
      const lastSupplier = await prisma.supplier.findFirst({
        orderBy: { id: 'desc' },
      });
      const nextId = (lastSupplier?.id || 0) + 1;
      finalCode = `NCC-${String(nextId).padStart(3, '0')}`;
    } else {
      const existingSupplier = await prisma.supplier.findUnique({
        where: { code: finalCode },
      });
      if (existingSupplier) {
        return res.status(400).json({ message: `Mã nhà cung cấp "${finalCode}" đã tồn tại!` });
      }
    }

    const newSupplier = await prisma.supplier.create({
      data: {
        name: String(name).trim(),
        code: finalCode,
        phone: phone && String(phone).trim() ? String(phone).trim() : null,
        email: email && String(email).trim() ? String(email).trim() : null,
        address: address && String(address).trim() ? String(address).trim() : null,
        note: note && String(note).trim() ? String(note).trim() : null,
        createdBy: Number(userId), // Lưu ID người tạo
      } as any,
    });

    return res.status(201).json({
      message: 'Tạo nhà cung cấp thành công!',
      supplier: newSupplier,
    });
  } catch (error) {
    console.error('Lỗi khi tạo nhà cung cấp:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi tạo nhà cung cấp!' });
  }
};


export const updateSupplier = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const user = req.user;
    const { name, code, phone, email, address, note } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID nhà cung cấp không hợp lệ!' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Không tìm thấy thông tin xác thực!' });
    }

    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy nhà cung cấp để cập nhật!' });
    }


    const isAdmin = user.role?.toLowerCase() === 'admin';
    const isOwner = Number((existing as any).createdBy) === Number(user.id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        message: 'Bạn chỉ có quyền chỉnh sửa nhà cung cấp do chính mình tạo ra!',
      });
    }

    if (code) {
      const trimmedCode = String(code).trim().toUpperCase();
      const duplicateCode = await prisma.supplier.findFirst({
        where: {
          code: trimmedCode,
          NOT: { id },
        },
      });

      if (duplicateCode) {
        return res.status(400).json({ message: `Mã nhà cung cấp "${trimmedCode}" đã được sử dụng!` });
      }
    }

    const updatedSupplier = await prisma.supplier.update({
      where: { id },
      data: {
        name: name ? String(name).trim() : existing.name,
        code: code ? String(code).trim().toUpperCase() : existing.code,
        phone: phone !== undefined ? (phone ? String(phone).trim() : null) : existing.phone,
        email: email !== undefined ? (email ? String(email).trim() : null) : existing.email,
        address: address !== undefined ? (address ? String(address).trim() : null) : existing.address,
        note: note !== undefined ? (note ? String(note).trim() : null) : existing.note,
      },
    });

    return res.status(200).json({
      message: 'Cập nhật nhà cung cấp thành công!',
      supplier: updatedSupplier,
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật nhà cung cấp:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi cập nhật!' });
  }
};


export const deleteSupplier = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Number(req.params.id);
    const user = req.user;

    if (isNaN(id)) {
      return res.status(400).json({ message: 'ID nhà cung cấp không hợp lệ!' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Không tìm thấy thông tin xác thực!' });
    }

    const existing = await prisma.supplier.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ message: 'Không tìm thấy nhà cung cấp!' });
    }

    // Phân quyền BUG_001
    const isAdmin = user.role?.toLowerCase() === 'admin';
    const isOwner = Number((existing as any).createdBy) === Number(user.id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        message: 'Bạn chỉ có quyền xóa nhà cung cấp do chính mình tạo ra!',
      });
    }

    const hasOrders = await prisma.purchaseOrder.findFirst({
      where: { supplierId: id },
    });

    if (hasOrders) {
      return res.status(400).json({
        message: 'Không thể xóa nhà cung cấp đã có phát sinh Đơn mua hàng trong hệ thống!',
      });
    }

    await prisma.supplier.delete({ where: { id } });

    return res.status(200).json({ message: 'Xóa nhà cung cấp thành công!' });
  } catch (error) {
    console.error('Lỗi khi xóa nhà cung cấp:', error);
    return res.status(500).json({ message: 'Lỗi hệ thống khi xóa nhà cung cấp!' });
  }
};