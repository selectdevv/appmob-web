import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import VisibilityIcon from '@mui/icons-material/Visibility'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import DashboardLayout from '../components/layout/DashboardLayout'
import WeeklyScheduleTable from '../components/schedule/WeeklyScheduleTable'
import BackIconButton from '../components/ui/BackIconButton'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { getStoredCampaignById, updateStoredCampaign, type Campaign } from '../lib/campaignStorage'
import { getStoredCompanyById } from '../lib/companyStorage'
import { convertImageFileToDataUrl, isStorageQuotaExceededError } from '../lib/imageStorage'

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

const areSlotsEqual = (a: Record<string, boolean>, b: Record<string, boolean>): boolean => {
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) {
    return false
  }

  return keysA.every((key) => a[key] === b[key])
}

const getCampaignImageName = (campaign: Campaign): string | null => {
  if (campaign.campaignImageName) {
    return campaign.campaignImageName
  }

  if (campaign.campaignImage) {
    return 'imagem-campanha.jpg'
  }

  return null
}

const EditCampaign = () => {
  const navigate = useNavigate()
  const { companyId, campaignId } = useParams<{ companyId: string; campaignId: string }>()

  const company = useMemo(() => (companyId ? getStoredCompanyById(companyId) : null), [companyId])
  const campaign = useMemo(() => (campaignId ? getStoredCampaignById(campaignId) : null), [campaignId])
  const isValidCampaign = Boolean(campaign && companyId && campaign.companyId === companyId)

  const [isEditingInfo, setIsEditingInfo] = useState(false)
  const [formData, setFormData] = useState<CampaignFormData>(initialFormData)
  const [initialDataSnapshot, setInitialDataSnapshot] = useState<CampaignFormData>(initialFormData)
  const [checkedSlots, setCheckedSlots] = useState<Record<string, boolean>>({})
  const [initialCheckedSlotsSnapshot, setInitialCheckedSlotsSnapshot] = useState<Record<string, boolean>>({})
  const [campaignImageDataUrl, setCampaignImageDataUrl] = useState<string | null>(null)
  const [initialCampaignImageSnapshot, setInitialCampaignImageSnapshot] = useState<string | null>(null)
  const [campaignImageName, setCampaignImageName] = useState<string | null>(null)
  const [initialCampaignImageNameSnapshot, setInitialCampaignImageNameSnapshot] = useState<string | null>(null)
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleBackToCampaignList = () => {
    const targetPath = companyId ? `/empresas/${companyId}/agenda` : '/empresas'
    navigate(targetPath, { replace: true })

    window.setTimeout(() => {
      const isStillOnEditScreen = Boolean(document.querySelector('[data-page="edit-campaign"]'))
      if (isStillOnEditScreen) {
        window.location.assign(targetPath)
      }
    }, 0)
  }

  useEffect(() => {
    if (!campaign || !isValidCampaign) {
      return
    }

    const mappedData: CampaignFormData = {
      campaignName: campaign.campaignName,
      campaignStartDate: campaign.campaignStartDate,
      monthlyInsertions: String(campaign.monthlyInsertions),
      screensNumber: String(campaign.screensNumber),
      insertionsPerHour: String(campaign.insertionsPerHour),
    }

    const mappedSlots = campaign.scheduleSlots ?? {}

    setFormData(mappedData)
    setInitialDataSnapshot(mappedData)
    setCheckedSlots(mappedSlots)
    setInitialCheckedSlotsSnapshot(mappedSlots)
    setCampaignImageDataUrl(campaign.campaignImage ?? null)
    setInitialCampaignImageSnapshot(campaign.campaignImage ?? null)
    setCampaignImageName(getCampaignImageName(campaign))
    setInitialCampaignImageNameSnapshot(getCampaignImageName(campaign))
  }, [campaign, isValidCampaign])

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

  const handleOpenImagePreview = () => {
    if (!campaignImageDataUrl) {
      return
    }

    setError(null)
    setIsImagePreviewOpen(true)
  }

  const hasFormChanges =
    formData.campaignName !== initialDataSnapshot.campaignName ||
    formData.campaignStartDate !== initialDataSnapshot.campaignStartDate ||
    formData.monthlyInsertions !== initialDataSnapshot.monthlyInsertions ||
    formData.screensNumber !== initialDataSnapshot.screensNumber ||
    formData.insertionsPerHour !== initialDataSnapshot.insertionsPerHour

  const hasScheduleChanges = !areSlotsEqual(checkedSlots, initialCheckedSlotsSnapshot)
  const hasImageChanges = campaignImageDataUrl !== initialCampaignImageSnapshot
  const hasImageNameChanges = campaignImageName !== initialCampaignImageNameSnapshot
  const canSaveChanges = hasFormChanges || hasScheduleChanges || hasImageChanges || hasImageNameChanges

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!campaign || !isValidCampaign) {
      setError('Campanha invalida para edicao.')
      return
    }

    if (!canSaveChanges) {
      return
    }

    const { campaignName, campaignStartDate, monthlyInsertions, screensNumber, insertionsPerHour } = formData

    if (!campaignName || !campaignStartDate || !monthlyInsertions || !screensNumber || !insertionsPerHour) {
      setError('Preencha todos os campos obrigatorios.')
      return
    }

    const monthly = Number(monthlyInsertions)
    const screens = Number(screensNumber)
    const perHour = Number(insertionsPerHour)

    if (!Number.isInteger(monthly) || monthly <= 0) {
      setError('Insercoes mensais deve ser um numero inteiro positivo.')
      return
    }

    if (!Number.isInteger(screens) || screens <= 0) {
      setError('Numero de telas deve ser um numero inteiro positivo.')
      return
    }

    if (!Number.isInteger(perHour) || perHour <= 0) {
      setError('Insercoes por hora deve ser um numero inteiro positivo.')
      return
    }

    const updatedCampaign: Campaign = {
      ...campaign,
      campaignName: campaignName.trim(),
      campaignStartDate,
      monthlyInsertions: monthly,
      screensNumber: screens,
      insertionsPerHour: perHour,
      scheduleSlots: checkedSlots,
      campaignImage: campaignImageDataUrl ?? undefined,
      campaignImageName: campaignImageName ?? undefined,
    }

    try {
      updateStoredCampaign(updatedCampaign)
      setInitialDataSnapshot(formData)
      setInitialCheckedSlotsSnapshot(checkedSlots)
      setInitialCampaignImageSnapshot(campaignImageDataUrl)
      setInitialCampaignImageNameSnapshot(campaignImageName)
      setIsEditingInfo(false)
      setSuccessMessage('Campanha atualizada com sucesso.')
    } catch (saveError) {
      if (isStorageQuotaExceededError(saveError)) {
        setError('Nao foi possivel salvar. A imagem e muito grande para armazenamento local.')
        return
      }

      setError('Nao foi possivel salvar as alteracoes da campanha.')
    }
  }

  if (!company || !campaign || !isValidCampaign) {
    return (
      <DashboardLayout activeItem="empresas">
        <div className="mx-auto w-full max-w-4xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900">Campanha nao encontrada</h1>
          <p className="mt-2 text-sm text-gray-500">Nao foi possivel abrir esta campanha para edicao.</p>
          <div className="mt-6 max-w-44">
            <BackIconButton onClick={handleBackToCampaignList} />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout activeItem="empresas">
      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-7xl space-y-6" data-page="edit-campaign">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Editar Campanha</h1>
              <p className="mt-2 text-sm text-gray-500">
                Empresa: {company.clientName} - {company.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <IconButton
                type="button"
                aria-label="Habilitar edicao"
                onClick={() => setIsEditingInfo(true)}
                sx={{ border: '1px solid #c7d2fe', borderRadius: '10px', width: 42, height: 42 }}
              >
                <EditIcon />
              </IconButton>
              <BackIconButton onClick={handleBackToCampaignList} />
            </div>
          </div>

          <div className="space-y-6">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            {successMessage && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {successMessage}
              </div>
            )}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="Nome da campanha"
                type="text"
                value={formData.campaignName}
                onChange={handleInputChange('campaignName')}
                disabled={!isEditingInfo}
                required
              />

              <Input
                label="Inicio da campanha"
                type="date"
                value={formData.campaignStartDate}
                onChange={handleInputChange('campaignStartDate')}
                disabled={!isEditingInfo}
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
                disabled={!isEditingInfo}
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
                disabled={!isEditingInfo}
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
                disabled={!isEditingInfo}
                required
              />

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-700">Imagem da campanha</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={!isEditingInfo}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm text-gray-700 transition-colors disabled:bg-gray-100 disabled:text-gray-400 file:mr-4 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
                  />
                  <IconButton
                    type="button"
                    aria-label="Visualizar imagem"
                    onClick={handleOpenImagePreview}
                    disabled={!campaignImageDataUrl}
                    sx={{ border: '1px solid #c7d2fe', borderRadius: '10px', width: 42, height: 42 }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </div>
                {campaignImageName && (
                  <p className="mt-2 text-xs font-medium text-gray-600">Arquivo atual: {campaignImageName}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <WeeklyScheduleTable checkedSlots={checkedSlots} onCheckedSlotsChange={setCheckedSlots} />

        <div className="mx-auto w-full max-w-xs">
          <Button type="submit" variant="primary" disabled={!canSaveChanges}>
            Salvar alteracoes
          </Button>
        </div>
      </form>

      {isImagePreviewOpen && campaignImageDataUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-5xl rounded-xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="truncate text-sm font-semibold text-gray-800">
                {campaignImageName ?? 'Imagem da campanha'}
              </p>
              <IconButton
                type="button"
                aria-label="Fechar visualizacao"
                onClick={() => setIsImagePreviewOpen(false)}
                sx={{ border: '1px solid #e2e8f0', borderRadius: '10px', width: 36, height: 36 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </div>
            <div className="max-h-[75vh] overflow-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
              <img
                src={campaignImageDataUrl}
                alt={campaignImageName ?? 'Imagem da campanha'}
                className="mx-auto h-auto max-h-[70vh] w-auto"
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default EditCampaign
