import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { campaignService, type CreateCampaignRequest, type UpdateCampaignRequest } from '../services/campaignService'

export const useCampaigns = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ['campaigns', companyId],
    queryFn: () => campaignService.getByCompanyId(companyId!),
    enabled: !!companyId,
  })
}

export const useCampaign = (campaignId: string | undefined) => {
  return useQuery({
    queryKey: ['campaigns', campaignId],
    queryFn: () => campaignService.getById(campaignId!),
    enabled: !!campaignId,
  })
}

export const useCreateCampaign = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: CreateCampaignRequest }) =>
      campaignService.create(companyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.companyId] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'limit', variables.companyId] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

export const useUpdateCampaign = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ campaignId, data }: { campaignId: string; data: UpdateCampaignRequest }) =>
      campaignService.update(campaignId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', variables.campaignId] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', response.companyId] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (campaignId: string) => campaignService.delete(campaignId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] })
      queryClient.invalidateQueries({ queryKey: ['campaigns', 'limit'] })
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

export const useCheckCampaignLimit = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ['campaigns', 'limit', companyId],
    queryFn: async () => {
      const result = await campaignService.checkLimit(companyId!)
      console.log('Campaign limit check:', result)
      return result
    },
    enabled: !!companyId,
  })
}
