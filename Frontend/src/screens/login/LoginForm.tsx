import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { useAppDispatch } from '../../store'
import { loginRequest } from '../../api/auth'
import { setAuthSuccess } from '../../store/slices/authSlice'

import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Alert } from '../../components/ui/Alert'

export const LoginForm: React.FC = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [successMessage , setSuccessMessage] = useState('') 

    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    // Cấu hình TanStack Query Mutation để gọi Axios API
    const loginMutation = useMutation({
        mutationFn: loginRequest,
        onSuccess: (data) => {
            dispatch(setAuthSuccess({ user: data.user, token: data.token }))
            setSuccessMessage('Đăng nhập thành công!') ;
            setTimeout(() => {
                navigate('/purchase-orders')
            }, 1500)
        }
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Gửi data với key 'emailOrName' trùng khớp với destructuring ở Backend
        loginMutation.mutate({ emailOrName: username, password })
    }

    // Hàm bóc tách lỗi an toàn từ Axios trả về
    const getErrorMessage = (): string => {
        if (!loginMutation.isError) return ''

        if (axios.isAxiosError(loginMutation.error)) {
            const serverMessage = (loginMutation.error.response?.data as { message?: string })?.message
            return serverMessage || 'Tên đăng nhập hoặc mật khẩu không chính xác.'
        }
        return 'Không thể kết nối đến máy chủ!'
    }
    const isProcessing = loginMutation.isPending || loginMutation.isSuccess
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input
                id="username"
                label="Tên đăng nhập"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                disabled={isProcessing}
                required
            />

            <Input
                id="password"
                label="Mật khẩu"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loginMutation.isPending}
                required
            />

            {loginMutation.isError && <Alert message={getErrorMessage()} type="error" />}
            {successMessage && <Alert message={successMessage} type="success" />}
            <Button type="submit" isLoading={loginMutation.isPending}>
                Đăng nhập
            </Button>
        </form>
    )
}