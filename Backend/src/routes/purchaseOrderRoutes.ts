import express ,{type Express} from 'express'
import {getPurchaseOrders} from '../controllers/purchaseOrderController.js'
const router = express.Router() ;



router.get('/purchase-orders' , getPurchaseOrders)

export default router  ;