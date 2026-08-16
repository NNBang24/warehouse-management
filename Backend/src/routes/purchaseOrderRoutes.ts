import express ,{type Express} from 'express'
import {createPurchaseOrder, getPurchaseOrders , getPurchaseOrderById} from '../controllers/purchaseOrderController.js'
import authenticateToken from '../middlewares/authenticateToken.js';
const router = express.Router() ;



router.get('/purchase-orders', authenticateToken ,getPurchaseOrders)
router.post('/purchase-orders', authenticateToken, createPurchaseOrder)
router.get('/purchase-orders/:id' , authenticateToken, getPurchaseOrderById)
export default router  ;