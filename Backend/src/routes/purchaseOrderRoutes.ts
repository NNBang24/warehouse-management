import express ,{type Express} from 'express'
import {createPurchaseOrder, getPurchaseOrders} from '../controllers/purchaseOrderController.js'
import authenticateToken from '../middlewares/authenticateToken.js';
const router = express.Router() ;



router.get('/purchase-orders' , getPurchaseOrders)
router.post('/purchase-orders', authenticateToken, createPurchaseOrder)
export default router  ;