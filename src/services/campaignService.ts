import { api } from './api'
import type { Campaign } from '../lib/campaignStorage'

export interface CreateCampaignRequest {
  campaignName: string
  campaignStartDate: string
  monthlyInsertions: number
  screensNumber: number
  insertionsPerHour: number
  scheduleSlots?: Record<string, boolean>
  campaignImage?: string
  campaignImageName?: string
}

export interface UpdateCampaignRequest extends CreateCampaignRequest {}

export interface CampaignResponse extends Campaign {
  createdAt: string
  updatedAt: string
}

export interface CampaignLimitResponse {
  canCreate: boolean
  current: number
  limit: number
  message: string
}

export const campaignService = {
  getByCompanyId: async (companyId: string): Promise<CampaignResponse[]> => {
    return api.get<CampaignResponse[]>(`/api/companies/${companyId}/campaigns`)
  },

  getById: async (campaignId: string): Promise<CampaignResponse> => {
    return api.get<CampaignResponse>(`/api/campaigns/${campaignId}`)
  },

  create: async (companyId: string, data: CreateCampaignRequest): Promise<CampaignResponse> => {
    return api.post<CampaignResponse>(`/api/companies/${companyId}/campaigns`, data)
  },

  update: async (campaignId: string, data: UpdateCampaignRequest): Promise<CampaignResponse> => {
    return api.put<CampaignResponse>(`/api/campaigns/${campaignId}`, data)
  },

  delete: async (campaignId: string): Promise<{ message: string }> => {
    return api.delete<{ message: string }>(`/api/campaigns/${campaignId}`)
  },

  checkLimit: async (companyId: string): Promise<CampaignLimitResponse> => {
    return api.get<CampaignLimitResponse>(`/api/companies/${companyId}/campaigns/check-limit`)
  },
}
