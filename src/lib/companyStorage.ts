export type PlanType = 'Start' | 'Enterprise' | 'Advanced'
export type ProfileType = 'Administrador' | 'Empresa'

export interface Company {
  id: string
  clientName: string
  responsible: string
  email: string
  phone: string
  planValidity: number
  campaigns: number
  plan: PlanType
  profile: ProfileType
}

const STORAGE_KEY = 'companies'

const isCompany = (value: unknown): value is Company => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const company = value as Partial<Company>

  return (
    typeof company.id === 'string' &&
    typeof company.clientName === 'string' &&
    typeof company.responsible === 'string' &&
    typeof company.email === 'string' &&
    typeof company.phone === 'string' &&
    typeof company.planValidity === 'number' &&
    typeof company.campaigns === 'number' &&
    (company.plan === 'Start' || company.plan === 'Enterprise' || company.plan === 'Advanced') &&
    (company.profile === 'Administrador' || company.profile === 'Empresa')
  )
}

export const getStoredCompanies = (): Company[] => {
  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return []
  }

  try {
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter(isCompany)
  } catch {
    return []
  }
}

export const setStoredCompanies = (companies: Company[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(companies))
}

export const addStoredCompany = (company: Company): Company[] => {
  const current = getStoredCompanies()
  const next = [company, ...current]
  setStoredCompanies(next)
  return next
}

export const getStoredCompanyById = (companyId: string): Company | null => {
  const companies = getStoredCompanies()
  return companies.find((company) => company.id === companyId) ?? null
}

export const updateStoredCompany = (updatedCompany: Company): Company[] => {
  const current = getStoredCompanies()
  const next = current.map((company) => (company.id === updatedCompany.id ? updatedCompany : company))
  setStoredCompanies(next)
  return next
}

export const deleteStoredCompany = (companyId: string): Company[] => {
  const current = getStoredCompanies()
  const next = current.filter((company) => company.id !== companyId)
  setStoredCompanies(next)
  return next
}
