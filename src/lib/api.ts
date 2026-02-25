import { api } from '../services/api'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
    name: string
  }
}

export interface ApiError {
  message: string
  status: number
}

export const login = async (credentials: LoginRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', credentials)
  
  if (response.token) {
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
  }
  
  return response
}

export const register = async (credentials: RegisterRequest): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/api/auth/register', credentials)
  
  if (response.token) {
    localStorage.setItem('token', response.token)
    localStorage.setItem('user', JSON.stringify(response.user))
  }
  
  return response
}

export const verifyToken = async (token?: string): Promise<{ valid: boolean; user: AuthResponse['user'] }> => {
  if (token) {
    localStorage.setItem('token', token)
  }
  
  const tokenToUse = token || localStorage.getItem('token')
  
  if (!tokenToUse) {
    throw { message: 'Token não fornecido', status: 401 }
  }
  
  return api.get<{ valid: boolean; user: AuthResponse['user'] }>('/api/auth/verify', {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
}
