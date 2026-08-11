import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../store'
import { logout } from '../../store/slices/authSlice'

export const Header: React.FC = () => {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()
    const user = useAppSelector((state) => state.auth.user)

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <nav className="flex space-x-8">
                        <Link to="/purchase-orders" className="text-blue-600 font-semibold border-b-2 border-blue-600 pb-4 pt-4 text-sm">
                            Đơn mua hàng
                        </Link>
                        <Link to="/products" className="text-gray-500 hover:text-gray-700 pb-4 pt-4 text-sm font-medium">
                            Sản phẩm
                        </Link>
                        <Link to="/suppliers" className="text-gray-500 hover:text-gray-700 pb-4 pt-4 text-sm font-medium">
                            Nhà cung cấp
                        </Link>
                        <Link to="/inventory" className="text-gray-500 hover:text-gray-700 pb-4 pt-4 text-sm font-medium">
                            Tồn kho
                        </Link>
                    </nav>

                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-700">
                            Xin chào, <strong className="font-semibold">{user?.username || 'Nhân viên'}</strong>
                        </span>
                        <button
                            onClick={handleLogout}
                            className="text-sm font-medium text-red-600 hover:text-red-800 transition-colors"
                        >
                            Đăng xuất
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}