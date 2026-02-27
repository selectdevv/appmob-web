export interface Campaign {
  id: string
  companyId: string
  campaignName: string
  campaignStartDate: string
  monthlyInsertions: number
  screensNumber: number
  insertionsPerHour: number
  scheduleSlots?: Record<string, boolean>
  campaignImage?: string
  campaignImageName?: string
}

const STORAGE_KEY = 'campaigns'

const isCampaign = (value: unknown): value is Campaign => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const campaign = value as Partial<Campaign>

  return (
    typeof campaign.id === 'string' &&
    typeof campaign.companyId === 'string' &&
    typeof campaign.campaignName === 'string' &&
    typeof campaign.campaignStartDate === 'string' &&
    typeof campaign.monthlyInsertions === 'number' &&
    typeof campaign.screensNumber === 'number' &&
    typeof campaign.insertionsPerHour === 'number' &&
    (campaign.campaignImage === undefined || typeof campaign.campaignImage === 'string') &&
    (campaign.campaignImageName === undefined || typeof campaign.campaignImageName === 'string') &&
    (campaign.scheduleSlots === undefined ||
      (typeof campaign.scheduleSlots === 'object' &&
        campaign.scheduleSlots !== null &&
        Object.values(campaign.scheduleSlots).every((value) => typeof value === 'boolean')))
  )
}

export const getStoredCampaigns = (): Campaign[] => {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isCampaign)
  } catch {
    return []
  }
}

export const setStoredCampaigns = (campaigns: Campaign[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns))
}

export const getStoredCampaignsByCompanyId = (companyId: string): Campaign[] => {
  return getStoredCampaigns().filter((campaign) => campaign.companyId === companyId)
}

export const addStoredCampaign = (campaign: Campaign): Campaign[] => {
  const current = getStoredCampaigns()
  const next = [campaign, ...current]
  setStoredCampaigns(next)
  return next
}

export const getStoredCampaignById = (campaignId: string): Campaign | null => {
  const campaigns = getStoredCampaigns()
  return campaigns.find((campaign) => campaign.id === campaignId) ?? null
}

export const updateStoredCampaign = (updatedCampaign: Campaign): Campaign[] => {
  const current = getStoredCampaigns()
  const next = current.map((campaign) => (campaign.id === updatedCampaign.id ? updatedCampaign : campaign))
  setStoredCampaigns(next)
  return next
}

export const deleteStoredCampaign = (campaignId: string): Campaign[] => {
  const current = getStoredCampaigns()
  const next = current.filter((campaign) => campaign.id !== campaignId)
  setStoredCampaigns(next)
  return next
}
