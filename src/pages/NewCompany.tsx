import { useEffect, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BackIconButton from '../components/ui/BackIconButton'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useCompany, useCreateCompany, useUpdateCompany } from '../hooks/useCompanies'
import { useCheckCampaignLimit } from '../hooks/useCampaigns'
import type { PlanType, ProfileType } from '../lib/companyStorage'

interface CompanyFormData {
  clientName: string
  responsible: string
  email: string
  phone: string
  planValidity: string
  campaigns: string
  plan: PlanType | ''
  profile: ProfileType | ''
}

const initialFormData: CompanyFormData = {
  clientName: '',
  responsible: '',
  email: '',
  phone: '',
  planValidity: '',
  campaigns: '',
  plan: '',
  profile: '',
}

const NewCompany = () => {
  const navigate = useNavigate()
  const { companyId } = useParams<{ companyId: string }>()
  const isEditMode = Boolean(companyId)

  const { data: existingCompany, isLoading: isLoadingCompany, error: companyError } = useCompany(companyId)
  const { data: limitCheck } = useCheckCampaignLimit(companyId)
  const createCompanyMutation = useCreateCompany()
  const updateCompanyMutation = useUpdateCompany()

  const [formData, setFormData] = useState<CompanyFormData>(initialFormData)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isEditMode || !existingCompany) {
      return
    }

    setFormData({
      clientName: existingCompany.clientName,
      responsible: existingCompany.responsible,
      email: existingCompany.email,
      phone: existingCompany.phone,
      planValidity: String(existingCompany.planValidity),
      campaigns: String(existingCompany.campaigns),
      plan: existingCompany.plan,
      profile: existingCompany.profile,
    })
  }, [existingCompany, isEditMode])

  const handleInputChange =
    (field: keyof CompanyFormData) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handlePositiveIntegerChange = (field: 'planValidity' | 'campaigns') => {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target
      if (/^\d*$/.test(value)) {
        setFormData((prev) => ({ ...prev, [field]: value }))
      }
    }
  }

  const blockInvalidNumberKeys = (event: KeyboardEvent<HTMLInputElement>) => {
    if (['e', 'E', '+', '-', '.', ','].includes(event.key)) {
      event.preventDefault()
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const { clientName, responsible, email, phone, planValidity, campaigns, plan, profile } = formData

      if (!clientName || !responsible || !email || !phone || !planValidity || !campaigns || !plan || !profile) {
        setError('Preencha todos os campos obrigatorios.')
        setIsSubmitting(false)
        return
      }

      const parsedPlanValidity = Number(planValidity)
      const parsedCampaigns = Number(campaigns)

      if (!Number.isInteger(parsedPlanValidity) || parsedPlanValidity <= 0) {
        setError('Validade do plano deve ser um numero inteiro positivo.')
        setIsSubmitting(false)
        return
      }

      if (!Number.isInteger(parsedCampaigns) || parsedCampaigns <= 0) {
        setError('Campanhas deve ser um numero inteiro positivo.')
        setIsSubmitting(false)
        return
      }

      if (isEditMode && limitCheck) {
        const currentCampaignsCount = limitCheck.current
        if (parsedCampaigns < currentCampaignsCount) {
          setError(`Voce tem ${currentCampaignsCount} campanha(s) cadastrada(s). O limite nao pode ser menor que o numero atual de campanhas. Exclua algumas campanhas antes de reduzir o limite.`)
          setIsSubmitting(false)
          return
        }
      }

      const companyData: {
        clientName: string
        responsible: string
        email: string
        phone: string
        planValidity: number
        campaigns?: number
        plan: PlanType
        profile: ProfileType
      } = {
        clientName: clientName.trim(),
        responsible: responsible.trim(),
        email: email.trim(),
        phone: phone.trim(),
        planValidity: parsedPlanValidity,
        plan,
        profile,
      }

      companyData.campaigns = parsedCampaigns

      if (isEditMode && companyId) {
        await updateCompanyMutation.mutateAsync({ companyId, data: companyData })
        navigate('/empresas', { state: { status: 'updated' } })
      } else {
        await createCompanyMutation.mutateAsync(companyData)
        navigate('/empresas', { state: { status: 'created' } })
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar empresa. Tente novamente.')
      setIsSubmitting(false)
    }
  }

  if (isEditMode && isLoadingCompany) {
    return (
      <DashboardLayout activeItem="empresas">
        <div className="mx-auto w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900">Carregando...</h1>
        </div>
      </DashboardLayout>
    )
  }

  if (isEditMode && (companyError || !existingCompany)) {
    return (
      <DashboardLayout activeItem="empresas">
        <div className="mx-auto w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900">Empresa nao encontrada</h1>
          <p className="mt-2 text-sm text-gray-500">O registro selecionado nao existe mais para edicao.</p>
          <div className="mt-6 max-w-44">
            <BackIconButton onClick={() => navigate('/empresas')} />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeItem="empresas">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{isEditMode ? 'Editar Empresa' : 'Nova Empresa'}</h1>
            <p className="mt-2 text-sm text-gray-500">
              {isEditMode
                ? 'Atualize os dados da empresa selecionada.'
                : 'Preencha os dados para cadastrar uma empresa.'}
            </p>
          </div>
          <BackIconButton onClick={() => navigate('/empresas')} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label="Nome do cliente"
              type="text"
              value={formData.clientName}
              onChange={handleInputChange('clientName')}
              required
            />
            <Input
              label="Responsavel"
              type="text"
              value={formData.responsible}
              onChange={handleInputChange('responsible')}
              required
            />
            <Input
              label="E-mail"
              type="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              required
            />
            <Input
              label="Telefone"
              type="text"
              value={formData.phone}
              onChange={handleInputChange('phone')}
              required
            />

            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-gray-700">Perfil</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-400"
                value={formData.profile}
                onChange={handleInputChange('profile')}
                required
              >
                <option value="" disabled>
                  Selecione
                </option>
                <option value="Administrador">Administrador</option>
                <option value="Empresa">Empresa</option>
              </select>
            </div>

            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-gray-700">Plano</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-400"
                value={formData.plan}
                onChange={handleInputChange('plan')}
                required
              >
                <option value="" disabled>
                  Selecione
                </option>
                <option value="Start">Start</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <Input
              label="Validade do plano"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={formData.planValidity}
              onChange={handlePositiveIntegerChange('planValidity')}
              onKeyDown={blockInvalidNumberKeys}
              required
            />
            <Input
              label="Campanhas"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={formData.campaigns}
              onChange={handlePositiveIntegerChange('campaigns')}
              onKeyDown={blockInvalidNumberKeys}
              required
            />
          </div>

          <div className="max-w-xs">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : isEditMode ? 'Salvar alteracoes' : 'Cadastrar empresa'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default NewCompany
