import { Router } from 'express'
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from '../controllers/supplierController.js'
import authenticateToken from '../middlewares/authenticateToken.js'

const router = Router()


router.get('/suppliers', authenticateToken, getSuppliers)
router.get('/suppliers/:id', authenticateToken, getSupplierById)
router.post('/suppliers', authenticateToken, createSupplier)
router.put('/suppliers/:id', authenticateToken, updateSupplier)
router.patch('/suppliers/:id', authenticateToken, updateSupplier) 
router.delete('/suppliers/:id', authenticateToken, deleteSupplier)

export default router