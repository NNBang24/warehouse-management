import { Router } from "express";
import {
  getProducts,
  createProduct,
  getProductSizes,
  getProductById,
  updateProduct,
  deleteProduct,
  createProductSize,
} from "../controllers/productController.js";
import authenticateToken, {
  authorizeRoles,
} from "../middlewares/authenticateToken.js";

const router = Router();

router.get("/products", authenticateToken, getProducts);
router.get("/products/sizes", authenticateToken, getProductSizes);
router.get("/products/:id", authenticateToken, getProductById);

router.post("/products", authenticateToken, createProduct);
router.put("/products/:id", authenticateToken, updateProduct);
router.delete("/products/:id", authenticateToken, deleteProduct);

router.post(
  "/sizes",
  authenticateToken,
  authorizeRoles("Admin"),
  createProductSize,
);

export default router;
