import { Router } from 'express'
import { getProducts, createProduct } from '../controllers/productController.js'
import authenticateToken  from '../middlewares/authenticateToken.js'

const router = Router()


router.get('/products', authenticateToken, getProducts)


router.post('/products', authenticateToken, createProduct)

export default router