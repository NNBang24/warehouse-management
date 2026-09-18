import express ,{type Express} from 'express'
import {createPurchaseOrder, getPurchaseOrders , getPurchaseOrderById ,confirmedPurchaseOrder , importPurchaseOrder, updatePurchaseOrder} from '../controllers/purchaseOrderController.js'
import authenticateToken, { authorizeRoles } from '../middlewares/authenticateToken.js';
const router = express.Router() ;



router.get('/purchase-orders', authenticateToken ,getPurchaseOrders)
router.post('/purchase-orders', authenticateToken, createPurchaseOrder)
router.get('/purchase-orders/:id' , authenticateToken, getPurchaseOrderById)
router.patch('/purchase-orders/:id/confirm', authenticateToken, authorizeRoles('Admin'), confirmedPurchaseOrder)
router.patch('/purchase-orders/:id/import', authenticateToken, authorizeRoles('Admin'), importPurchaseOrder)
router.put('/purchase-orders/:id', authenticateToken, updatePurchaseOrder)
export default router  ;