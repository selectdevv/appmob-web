import { api } from './api'
import type { Company, PlanType, ProfileType } from '../lib/companyStorage'

export interface CreateCompanyRequest {
  clientName: string
  responsible: string
  email: string
  phone: string
  planValidity: number
  campaigns?: number
  plan: PlanType
  profile: ProfileType
}

export interface UpdateCompanyRequest extends CreateCompanyRequest {}

export interface CompanyResponse extends Company {
  createdAt: string
  updatedAt: string
}

export const companyService = {
  getAll: async (): Promise<CompanyResponse[]> => {
    return api.get<CompanyResponse[]>('/api/companies')
  },

  getById: async (companyId: string): Promise<CompanyResponse> => {
    return api.get<CompanyResponse>(`/api/companies/${companyId}`)
  },

  create: async (data: CreateCompanyRequest): Promise<CompanyResponse> => {
    return api.post<CompanyResponse>('/api/companies', data)
  },

  update: async (companyId: string, data: UpdateCompanyRequest): Promise<CompanyResponse> => {
    return api.put<CompanyResponse>(`/api/companies/${companyId}`, data)
  },

  delete: async (companyId: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/api/companies/${companyId}`)
  },
}
