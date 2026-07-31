import React from 'react'
interface AlertProps {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info'; // Thêm dòng này (dùng ? để không bắt buộc)
}
export const Alert: React.FC<AlertProps> = ({ message }) => (
    <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">{message}</div>
)
