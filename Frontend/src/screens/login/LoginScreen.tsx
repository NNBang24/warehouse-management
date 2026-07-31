import React from 'react'
import { LoginForm } from './LoginForm' // Import file vừa tạo ở bước 2

export const LoginScreen: React.FC = () => {
    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white border border-gray-200 p-8 rounded-2xl shadow-xl">
                <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">Đăng Nhập Hệ Thống</h2>
                <LoginForm />
            </div>
        </div>
    )
}