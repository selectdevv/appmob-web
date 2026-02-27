import { useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BackIconButton from '../components/ui/BackIconButton'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { useCompany } from '../hooks/useCompanies'
import { useCreateCampaign } from '../hooks/useCampaigns'
import { convertImageFileToDataUrl } from '../lib/imageStorage'

interface CampaignFormData {
  campaignName: string
  campaignStartDate: string
  monthlyInsertions: string
  screensNumber: string
  insertionsPerHour: string
}

const initialFormData: CampaignFormData = {
  campaignName: '',
  campaignStartDate: '',
  monthlyInsertions: '',
  screensNumber: '',
  insertionsPerHour: '',
}

const NewCampaign = () => {
  const navigate = useNavigate()
  const { companyId } = useParams<{ companyId: string }>()
  const { data: company, isLoading: isLoadingCompany } = useCompany(companyId)
  const createCampaignMutation = useCreateCampaign()

  const [formData, setFormData] = useState<CampaignFormData>(initialFormData)
  const [error, setError] = useState<string | null>(null)
  const [campaignImageDataUrl, setCampaignImageDataUrl] = useState<string | null>(null)
  const [campaignImageName, setCampaignImageName] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigateToCampaignList = (state?: { status: 'created' }) => {
    const targetPath = companyId ? `/empresas/${companyId}/agenda` : '/empresas'
    navigate(targetPath, { replace: true, state })

    window.setTimeout(() => {
      const isStillOnCreateCampaignScreen = Boolean(document.querySelector('[data-page="new-campaign"]'))
      if (isStillOnCreateCampaignScreen) {
        window.location.assign(targetPath)
      }
    }, 0)
  }

  const handleBackToCampaignList = () => {
    navigateToCampaignList()
  }

  const handleInputChange =
    (field: keyof CampaignFormData) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }))
    }

  const handlePositiveIntegerChange = (field: 'monthlyInsertions' | 'screensNumber' | 'insertionsPerHour') => {
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

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Selecione apenas arquivos de imagem.')
      return
    }

    try {
      const imageDataUrl = await convertImageFileToDataUrl(file)
      setCampaignImageDataUrl(imageDataUrl)
      setCampaignImageName(file.name)
      setError(null)
    } catch {
      setError('Nao foi possivel carregar a imagem.')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const { campaignName, campaignStartDate, monthlyInsertions, screensNumber, insertionsPerHour } = formData

      if (!campaignName || !campaignStartDate || !monthlyInsertions || !screensNumber || !insertionsPerHour) {
        setError('Preencha todos os campos obrigatorios.')
        setIsSubmitting(false)
        return
      }

      const monthly = Number(monthlyInsertions)
      const screens = Number(screensNumber)
      const perHour = Number(insertionsPerHour)

      if (!Number.isInteger(monthly) || monthly <= 0) {
        setError('INSERCOES MENSAIS deve ser um numero inteiro positivo.')
        setIsSubmitting(false)
        return
      }

      if (!Number.isInteger(screens) || screens <= 0) {
        setError('NUMERO DE TELAS deve ser um numero inteiro positivo.')
        setIsSubmitting(false)
        return
      }

      if (!Number.isInteger(perHour) || perHour <= 0) {
        setError('INSERCOES POR HORA deve ser um numero inteiro positivo.')
        setIsSubmitting(false)
        return
      }

      if (!companyId) {
        setError('Empresa invalida para cadastro de campanha.')
        setIsSubmitting(false)
        return
      }

      const campaignData = {
        campaignName: campaignName.trim(),
        campaignStartDate,
        monthlyInsertions: monthly,
        screensNumber: screens,
        insertionsPerHour: perHour,
        scheduleSlots: {},
        campaignImage: campaignImageDataUrl ?? undefined,
        campaignImageName: campaignImageName ?? undefined,
      }

      await createCampaignMutation.mutateAsync({ companyId, data: campaignData })
      setFormData(initialFormData)
      setCampaignImageDataUrl(null)
      setCampaignImageName(null)
      navigateToCampaignList({ status: 'created' })
    } catch (err: any) {
      if (err.code === 'CAMPAIGN_LIMIT_REACHED' || err.message?.includes('Limite de campanhas')) {
        setError(err.message || 'Limite de campanhas atingido. Para criar mais campanhas, edite o plano da empresa.')
      } else {
        setError(err.message || 'Nao foi possivel salvar a campanha. Tente novamente.')
      }
      setIsSubmitting(false)
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
          <p className="mt-2 text-sm text-gray-500">Nao foi possivel abrir o cadastro de campanha.</p>
          <div className="mt-6 max-w-44">
            <BackIconButton onClick={handleBackToCampaignList} />
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
            <h1 className="text-3xl font-bold text-gray-900">Nova Campanha</h1>
            <p className="mt-2 text-sm text-gray-500">
              Empresa: {company.clientName} - {company.email}
            </p>
          </div>
          <BackIconButton onClick={handleBackToCampaignList} />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" data-page="new-campaign">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              label="Nome da campanha"
              type="text"
              value={formData.campaignName}
              onChange={handleInputChange('campaignName')}
              required
            />

            <Input
              label="Inicio da campanha"
              type="date"
              value={formData.campaignStartDate}
              onChange={handleInputChange('campaignStartDate')}
              required
            />

            <Input
              label="Insercoes mensais"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={formData.monthlyInsertions}
              onChange={handlePositiveIntegerChange('monthlyInsertions')}
              onKeyDown={blockInvalidNumberKeys}
              required
            />

            <Input
              label="Numero de telas"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={formData.screensNumber}
              onChange={handlePositiveIntegerChange('screensNumber')}
              onKeyDown={blockInvalidNumberKeys}
              required
            />

            <Input
              label="Insercoes por hora"
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              value={formData.insertionsPerHour}
              onChange={handlePositiveIntegerChange('insertionsPerHour')}
              onKeyDown={blockInvalidNumberKeys}
              required
            />

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium text-gray-700">Imagem da campanha</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 transition-colors file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
              />
              {campaignImageName && (
                <p className="mt-2 text-xs font-medium text-emerald-700">Arquivo selecionado: {campaignImageName}</p>
              )}
            </div>
          </div>

          <div className="max-w-xs">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Cadastrando...' : 'Cadastrar campanha'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default NewCampaign
