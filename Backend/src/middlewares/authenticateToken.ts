import jwt from 'jsonwebtoken' ;
import {type Request ,type Response ,type NextFunction} from 'express'
import { prisma } from '../config/prisma.js';

interface DecodePayload {
    id : number ;
    username : string ;
    role : string ; 
}
export interface authenticatedRequest extends Request {
    user?:{
        id : number ;
        username: string
        role : string ;
    }
}
const authenticateToken = async(req :authenticatedRequest, res : Response ,next: NextFunction) => {
    const  authHeader = req.headers['authorization'] ;
    const token = authHeader && authHeader.split(' ')[1] ;
    if(!token) {
        res.status(401).json({ message: 'Yêu cầu token xác thực không hợp lệ!'}) ;
        return ;
    }
    const secretKey = process.env.JWT_SECRET || 'default_secret'
    jwt.verify(token , secretKey , async(err , decodePayload)=> {
        if(err) {
            if(err instanceof jwt.TokenExpiredError) {
                res.status(401).json({ message:'Token đã hết hạn!'});
                return ;
            }
            res.status(403).json({ message: "Token không hợp lệ!" });
            return;
        }

        const payload = decodePayload as DecodePayload ;
        const userId = payload.id ;
        if (!userId) {
            res.status(403).json({ message: 'Token không hợp lệ !' });
            return;
        }

        try {
            const user = await prisma.user.findUnique({
                where:{
                    id : Number(userId) ,
                }
            });
            if (!user) {
                res.status(401).json({ message: "Xác thực thất bại !" });
                return;
            }
            req.user = { id: user.id, role: user.role };
            next();
        } catch (error) {
            console.error("Lỗi truy vấn người dùng trong Authenticate Token:", error);
            res.status(500).json({ message: "Lỗi hệ thống khi xác thực!" });
        }
    })
}

export default authenticateToken ;