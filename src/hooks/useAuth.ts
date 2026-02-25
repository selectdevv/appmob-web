import { useMutation } from '@tanstack/react-query'
import { login, register, type LoginRequest, type RegisterRequest, type AuthResponse } from '../lib/api'

export const useLogin = () => {
  return useMutation<AuthResponse, Error, LoginRequest>({
    mutationFn: login,
  })
}

export const useRegister = () => {
  return useMutation<AuthResponse, Error, RegisterRequest>({
    mutationFn: register,
  })
}
