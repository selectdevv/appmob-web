import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import BackIconButton from '../components/ui/BackIconButton'
import DashboardLayout from '../components/layout/DashboardLayout'
import Input from '../components/ui/Input'
import { useCompany } from '../hooks/useCompanies'
import { useCampaigns, useDeleteCampaign, useCheckCampaignLimit } from '../hooks/useCampaigns'

interface AgendaLocationState {
  status?: 'created'
}

const CompanyAgenda = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { companyId } = useParams<{ companyId: string }>()
  const { data: company, isLoading: isLoadingCompany } = useCompany(companyId)
  const { data: campaigns = [], isLoading: isLoadingCampaigns } = useCampaigns(companyId)
  const { data: limitCheck, isLoading: isLoadingLimit, error: limitError } = useCheckCampaignLimit(companyId)
  const deleteCampaignMutation = useDeleteCampaign()

  const [search, setSearch] = useState('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  useEffect(() => {
    const state = location.state as AgendaLocationState | null
    if (state?.status === 'created') {
      setSuccessMessage('Campanha cadastrada com sucesso.')
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  const filteredCampaigns = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()
    if (!searchTerm) {
      return campaigns
    }

    return campaigns.filter((campaign) => {
      return (
        campaign.campaignName.toLowerCase().includes(searchTerm) ||
        campaign.campaignStartDate.toLowerCase().includes(searchTerm)
      )
    })
  }, [campaigns, search])

  const handleDeleteCampaign = async (campaignIdToDelete: string) => {
    try {
      await deleteCampaignMutation.mutateAsync(campaignIdToDelete)
    } catch (err: any) {
      console.error('Erro ao deletar campanha:', err)
    }
  }

  if (isLoadingCompany) {
    return (
      <DashboardLayout activeItem="empresas">
        <div className="mx-auto w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900">Carregando...</h1>
        </div>
      </DashboardLayout>
    )
  }

  if (!company) {
    return (
      <DashboardLayout activeItem="empresas">
        <div className="mx-auto w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900">Empresa nao encontrada</h1>
          <p className="mt-2 text-sm text-gray-500">Nao foi possivel abrir a agenda desta empresa.</p>
          <div className="mt-6 max-w-44">
            <BackIconButton onClick={() => navigate('/empresas')} />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeItem="empresas">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Empresa</h1>
              <p className="mt-2 text-sm text-gray-500">
                {company.clientName} - {company.email}
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  if (limitCheck && !limitCheck.canCreate) {
                    return
                  }
                  navigate(`/empresas/${company.id}/campanhas/nova`)
                }}
                disabled={isLoadingLimit || (limitCheck && !limitCheck.canCreate)}
                className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed relative"
                title={limitCheck && !limitCheck.canCreate ? limitCheck.message : undefined}
              >
                {isLoadingLimit ? 'Verificando...' : 'Nova Campanha'}
              </button>
              <button
                type="button"
                onClick={() => setInfoMessage('Modulo de Pagamentos sera integrado em seguida.')}
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Pagamentos
              </button>
              <BackIconButton onClick={() => navigate('/empresas')} />
            </div>
          </div>

          {infoMessage && (
            <div className="mt-5 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              {infoMessage}
            </div>
          )}

          {limitError && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Erro ao verificar limite de campanhas. Tente novamente.
            </div>
          )}

          {limitCheck && !limitCheck.canCreate && (
            <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
              {limitCheck.message}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Input
              label="Pesquisar"
              type="text"
              placeholder="Buscar por nome da campanha ou data"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          {successMessage && (
            <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 text-gray-700">
                  <th className="px-4 py-3 font-semibold">Nome da campanha</th>
                  <th className="px-4 py-3 font-semibold">Inicio da campanha</th>
                  <th className="px-4 py-3 font-semibold">Insercoes mensais</th>
                  <th className="px-4 py-3 font-semibold">Numero de telas</th>
                  <th className="px-4 py-3 font-semibold">Insercoes por hora</th>
                  <th className="px-4 py-3 font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingCampaigns && (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={6}>
                      Carregando campanhas...
                    </td>
                  </tr>
                )}
                {!isLoadingCampaigns && filteredCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-100 align-top text-gray-700">
                    <td className="px-4 py-3">{campaign.campaignName}</td>
                    <td className="px-4 py-3">{campaign.campaignStartDate}</td>
                    <td className="px-4 py-3">{campaign.monthlyInsertions}</td>
                    <td className="px-4 py-3">{campaign.screensNumber}</td>
                    <td className="px-4 py-3">{campaign.insertionsPerHour}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`/empresas/${company.id}/campanhas/${campaign.id}/editar`)}
                          className="rounded-md border border-indigo-200 px-3 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCampaign(campaign.id)}
                          className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-50"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoadingCampaigns && filteredCampaigns.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={6}>
                      Nenhuma campanha cadastrada para esta empresa.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default CompanyAgenda
