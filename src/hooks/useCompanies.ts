import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { companyService, type CreateCompanyRequest, type UpdateCompanyRequest } from '../services/companyService'

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: () => companyService.getAll(),
  })
}

export const useCompany = (companyId: string | undefined) => {
  return useQuery({
    queryKey: ['companies', companyId],
    queryFn: () => companyService.getById(companyId!),
    enabled: !!companyId,
  })
}

export const useCreateCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCompanyRequest) => companyService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}

export const useUpdateCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ companyId, data }: { companyId: string; data: UpdateCompanyRequest }) =>
      companyService.update(companyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      queryClient.invalidateQueries({ queryKey: ['companies', variables.companyId] })
    },
  })
}

export const useDeleteCompany = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (companyId: string) => companyService.delete(companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
    },
  })
}
