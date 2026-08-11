import React from 'react'
export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { isLoading?: boolean }> = ({ children, isLoading, ...props }) => (
    <button {...props} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg p-10">
        {isLoading ? 'Đang tải...' : children}
    </button>
)