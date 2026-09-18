import { apiClient } from './apiClient'

export interface LoginPayload {
  emailOrName?: string
  username?: string
  email?: string
  password: string
}

export interface AuthUserData {
  id: number
  username: string
  email: string
  role: string
}

export interface LoginResponse {
  token: string
  user: AuthUserData
  message?: string
}

export const loginRequest = async (credentials: LoginPayload): Promise<LoginResponse> => {
  const accountIdentifier = (
    credentials.emailOrName ||
    credentials.username ||
    credentials.email ||
    ''
  ).trim()

  const payload = {
    emailOrName: accountIdentifier,
    username: accountIdentifier,
    email: accountIdentifier,
    password: credentials.password,
  }

  const response = await apiClient.post<LoginResponse>('/auth/login', payload)
  return response.data
}