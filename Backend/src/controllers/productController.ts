import { type Request, type Response } from "express";
import { prisma } from "../config/prisma.js";
import { type AuthenticatedRequest } from "../middlewares/authenticateToken.js";

export const getProducts = async (req: Request, res: Response) => {
  try {
    const { keyword } = req.query;
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Number(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const whereCondition: any = {};

    if (keyword && typeof keyword === "string" && keyword.trim() !== "") {
      const search = keyword.trim();
      whereCondition.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
      ];
    }
    const [totalItems, products] = await Promise.all([
      prisma.product.count({ where: whereCondition }),
      prisma.product.findMany({
        where: whereCondition,
        skip,
        take: limit,
        include: {
          size: {
            select: { sizeName: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    const formattedProducts = products.map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      price: Number(item.price),
      description: item.description,
      sizeId: item.sizeId,
      sizeName: item.size?.sizeName || null,
      imageUrl: item.imageUrl,
      createdBy: item.createdBy,
    }));

    const totalPages = Math.ceil(totalItems / limit);

    return res.status(200).json({
      data: formattedProducts,
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi hệ thống phía Server!" });
  }
};

export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ!" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        size: {
          select: { id: true, sizeName: true },
        },
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm!" });
    }

    return res.status(200).json({
      ...product,
      price: Number(product.price),
      sizeName: product.size?.sizeName || null,
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi hệ thống phía Server!" });
  }
};

// CẢ ADMIN VÀ NHÂN VIÊN ĐỀU TẠO ĐƯỢC -> TỰ GÁN createdBy
export const createProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Không tìm thấy thông tin xác thực người dùng!" });
    }

    const { name, code, price, description, sizeId, imageUrl } = req.body;

    if (!name || !code) {
      return res
        .status(400)
        .json({ message: "Tên và Mã sản phẩm không được để trống!" });
    }

    const trimmedCode = String(code).trim();

    const existingProduct = await prisma.product.findUnique({
      where: { code: trimmedCode },
    });

    if (existingProduct) {
      return res
        .status(400)
        .json({ message: `Mã sản phẩm "${trimmedCode}" đã tồn tại!` });
    }

    const newProduct = await prisma.product.create({
      data: {
        name: String(name).trim(),
        code: trimmedCode,
        price: price ? Number(price) : 0,
        description: description || "",
        sizeId: sizeId ? Number(sizeId) : null,
        imageUrl: imageUrl || "",
        createdBy: Number(userId),
      },
    });

    return res.status(201).json({
      message: "Tạo sản phẩm thành công!",
      product: {
        ...newProduct,
        price: Number(newProduct.price),
      },
    });
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi tạo sản phẩm!" });
  }
};

// ADMIN SỬA TẤT CẢ - NHÂN VIÊN CHỈ SỬA SẢN PHẨM DO CHÍNH MÌNH TẠO
export const updateProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const productId = Number(id);
    const user = req.user;

    if (isNaN(productId)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ!" });
    }

    if (!user) {
      return res.status(401).json({ message: "Không tìm thấy thông tin xác thực!" });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy sản phẩm cần cập nhật!" });
    }

    // Kiểm tra quyền: Admin hoặc chính chủ
    const isAdmin = user.role?.toLowerCase() === "admin";
    const isOwner = Number(existingProduct.createdBy) === Number(user.id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        message: "Bạn chỉ có quyền chỉnh sửa sản phẩm do chính mình tạo ra!",
      });
    }

    const { name, code, price, description, sizeId, imageUrl } = req.body;

    if (code) {
      const trimmedCode = String(code).trim();
      const duplicateCode = await prisma.product.findFirst({
        where: {
          code: trimmedCode,
          NOT: { id: productId },
        },
      });

      if (duplicateCode) {
        return res
          .status(400)
          .json({ message: `Mã sản phẩm "${trimmedCode}" đã được sử dụng!` });
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name && { name: String(name).trim() }),
        ...(code && { code: String(code).trim() }),
        ...(price !== undefined && { price: Number(price) }),
        ...(description !== undefined && { description: String(description) }),
        ...(sizeId !== undefined && { sizeId: sizeId ? Number(sizeId) : null }),
        ...(imageUrl !== undefined && { imageUrl: String(imageUrl) }),
      },
      include: {
        size: {
          select: { sizeName: true },
        },
      },
    });

    return res.status(200).json({
      message: "Cập nhật sản phẩm thành công!",
      product: {
        ...updatedProduct,
        price: Number(updatedProduct.price),
        sizeName: updatedProduct.size?.sizeName || null,
      },
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    return res
      .status(500)
      .json({ message: "Lỗi hệ thống khi cập nhật sản phẩm!" });
  }
};

export const deleteProduct = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const productId = Number(id);
    const user = req.user;

    if (isNaN(productId)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ!" });
    }

    if (!user) {
      return res.status(401).json({ message: "Không tìm thấy thông tin xác thực!" });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm cần xóa!" });
    }

    // Kiểm tra quyền
    const isAdmin = user.role?.toLowerCase() === "admin";
    const isOwner = Number(existingProduct.createdBy) === Number(user.id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        message: "Bạn chỉ có quyền xóa sản phẩm do chính mình tạo ra!",
      });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    return res.status(200).json({ message: "Xóa sản phẩm thành công!" });
  } catch (error: any) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    if (error.code === "P2003") {
      return res.status(400).json({
        message: "Không thể xóa sản phẩm đã có trong các đơn mua hàng hoặc kho!",
      });
    }
    return res.status(500).json({ message: "Lỗi hệ thống khi xóa sản phẩm!" });
  }
};

export const getProductSizes = async (_req: Request, res: Response) => {
  try {
    const sizes = await prisma.productSize.findMany({
      orderBy: { id: "asc" },
    });
    return res.status(200).json(sizes);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách quy cách:", error);
    return res.status(500).json({ message: "Lỗi hệ thống phía Server!" });
  }
};

export const createProductSize = async (req: Request, res: Response) => {
  try {
    const { sizeName } = req.body;

    if (!sizeName || !String(sizeName).trim()) {
      return res.status(400).json({ message: "Tên quy cách không được để trống!" });
    }

    const newSize = await prisma.productSize.create({
      data: {
        sizeName: String(sizeName).trim(),
      },
    });

    return res.status(201).json({
      message: "Thêm quy cách thành công!",
      data: newSize,
    });
  } catch (error) {
    console.error("Lỗi khi tạo quy cách:", error);
    return res.status(500).json({ message: "Lỗi hệ thống khi tạo quy cách!" });
  }
};