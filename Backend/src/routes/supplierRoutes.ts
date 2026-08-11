import { Router } from 'express'
import { createSupplier } from '../controllers/supplierController.js'
import authenticateToken from '../middlewares/authenticateToken.js'

const router = Router()



router.post('/suppliers', authenticateToken, createSupplier)

export default router