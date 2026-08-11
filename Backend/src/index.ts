import express, {type Request, type Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import authRouter from './routes/authRouter.js'
import purchaseOrderRoutes from './routes/purchaseOrderRoutes.js'
import productRoutes from './routes/productRoutes.js'
import supplierRoutes from './routes/supplierRoutes.js'
import { prisma } from './config/prisma.js'
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors({
    origin: 'http://localhost:5173', // URL của Frontend React Vite
    credentials: true
}))
app.use(express.json()) ;

app.use('/api/auth' ,authRouter) ;
app.use('/api/purchase' , purchaseOrderRoutes)
app.use('/api/product', productRoutes)
app.use('/api/supplier', supplierRoutes)
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({message :' Backend Node.js + TypeScript '});
});


async function startServer() {
    try {
        await prisma.$connect();
        console.log('Kết nối Database MySQL thành công !');

        app.listen(PORT, () => {
            console.log(`Server đang chạy tại http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Lỗi kết nối Database:', error);
        process.exit(1);
    }
}

startServer();