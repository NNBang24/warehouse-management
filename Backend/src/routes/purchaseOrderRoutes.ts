import express ,{type Express} from 'express'
import {createPurchaseOrder, getPurchaseOrders , getPurchaseOrderById ,confirmedPurchaseOrder , importPurchaseOrder} from '../controllers/purchaseOrderController.js'
import authenticateToken from '../middlewares/authenticateToken.js';
const router = express.Router() ;



router.get('/purchase-orders', authenticateToken ,getPurchaseOrders)
router.post('/purchase-orders', authenticateToken, createPurchaseOrder)
router.get('/purchase-orders/:id' , authenticateToken, getPurchaseOrderById)
router.patch('/purchase-orders/:id/confirm', authenticateToken, confirmedPurchaseOrder)
router.patch('/purchase-orders/:id/import', authenticateToken, importPurchaseOrder)
export default router  ;