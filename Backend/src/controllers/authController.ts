import {type Request , type Response } from 'express'
import { prisma } from '../config/prisma.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
interface RegisterBody {
    username: string;
    email: string;
    password: string;
    role : string
}
interface LoginBody {
    emailOrName: string;
    password: string;
}
export const postRegister =async(req : Request , res :Response) =>{
   try {
       const { username, email, password ,role} = req.body as RegisterBody;
       if (!username || !email || !password ) {
           res.status(400).json({ message: 'Vui lòng điền đầy đủ tất cả các trường!' });
           return;
       }

       const existingUser = await prisma.user.findUnique({
           where: { email }
       })
       if (existingUser) {
           res.status(400).json({ message: 'Email này đã tồn tại trên hệ thống!' });
           return;
       }

       const salt = await bcrypt.genSalt(10);
       const hashPassword = await bcrypt.hash(password, salt);
       const newUser = await prisma.user.create({
           data: {
               username,
               email,
               password: hashPassword ,
               role: role || 'Staff'
           }
       });
       res.status(201).json({
           message: 'Đăng ký thành công tài khoản mới!',
           user: {
               id: newUser.id,
               username: newUser.username,
               email: newUser.email ,
               role: newUser.role
           }
       });
   } catch (error) {
       console.error('Lỗi register:', error);
       res.status(500).json({ message: 'Lỗi hệ thống phía Server!' });
   }
}



export const postLogin = async(req : Request , res : Response) => {
    try {
        const { emailOrName, password } = req.body as LoginBody;
        if (!emailOrName || !password) {
            res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin đăng nhập và mật khẩu !' });
            return;
        }
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: emailOrName },
                    { username: emailOrName },
                ]
            }
        });
        if (!user) {
            res.status(401).json({ message: 'Thông tin đăng nhập không chính xác' });
            return;
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Thông tin đăng nhập không chính xác' });
            return;
        }
        const payload = {
            id: user.id,
            username: user.username,
            role : user.role 
        };
        const secretKey = process.env.JWT_SECRET || 'default_secret';
        const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
        const token = jwt.sign(payload, secretKey, { expiresIn: expiresIn as any });
        res.status(200).json({
            message: "Đăng nhập thành công",
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role
            }
            
        })
    } catch (error) {
        console.error('Lỗi login:', error);
        res.status(500).json({ message: 'Lỗi hệ thống phía Server!' });
    }
}