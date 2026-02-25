import { BACKEND_URL } from '../config/env'

export interface ApiConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
}

const defaultHeaders = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
}

export const api = {
  request: async <T>(endpoint: string, config: ApiConfig = {}): Promise<T> => {
    const { method = 'GET', headers = {}, body, timeout = 60000 } = config
    
    const token = localStorage.getItem('token')
    const requestHeaders: Record<string, string> = {
      ...defaultHeaders,
      ...headers,
    }
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }))
        const error = {
          message: errorData.message || 'Erro na requisição',
          status: response.status,
        }
        throw error
      }
      
      return response.json()
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw { 
          message: 'Timeout na requisição. O servidor pode estar iniciando. Tente novamente em alguns segundos.', 
          status: 408 
        }
      }
      if (error.message && error.status) {
        throw error
      }
      throw { 
        message: error.message || 'Erro de conexão. Verifique sua internet e tente novamente.', 
        status: 0 
      }
    }
  },
  
  get: <T>(endpoint: string, config?: Omit<ApiConfig, 'method' | 'body'>): Promise<T> => {
    return api.request<T>(endpoint, { ...config, method: 'GET' })
  },
  
  post: <T>(endpoint: string, body?: unknown, config?: Omit<ApiConfig, 'method' | 'body'>): Promise<T> => {
    return api.request<T>(endpoint, { ...config, method: 'POST', body })
  },
  
  put: <T>(endpoint: string, body?: unknown, config?: Omit<ApiConfig, 'method' | 'body'>): Promise<T> => {
    return api.request<T>(endpoint, { ...config, method: 'PUT', body })
  },
  
  delete: <T>(endpoint: string, config?: Omit<ApiConfig, 'method' | 'body'>): Promise<T> => {
    return api.request<T>(endpoint, { ...config, method: 'DELETE' })
  },
}
