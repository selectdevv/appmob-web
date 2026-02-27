import { useEffect, useMemo, useState, type MouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import {
  deleteStoredCompany,
  getStoredCompanies,
  type Company,
  type PlanType,
  type ProfileType,
} from '../lib/companyStorage'

interface CompaniesLocationState {
  status?: 'created' | 'updated'
}

const Companies = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [companies, setCompanies] = useState<Company[]>(() => getStoredCompanies())
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState<PlanType | ''>('')
  const [profileFilter, setProfileFilter] = useState<ProfileType | ''>('')
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null)
  const [menuCompanyId, setMenuCompanyId] = useState<string | null>(null)

  useEffect(() => {
    const state = location.state as CompaniesLocationState | null
    if (state?.status === 'created') {
      setSuccessMessage('Empresa cadastrada com sucesso.')
      navigate(location.pathname, { replace: true, state: null })
      return
    }

    if (state?.status === 'updated') {
      setSuccessMessage('Empresa atualizada com sucesso.')
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [location.pathname, location.state, navigate])

  const filteredCompanies = useMemo(() => {
    const searchTerm = search.trim().toLowerCase()

    return companies.filter((company) => {
      const matchesPlan = !planFilter || company.plan === planFilter
      const matchesProfile = !profileFilter || company.profile === profileFilter
      const matchesSearch =
        !searchTerm ||
        company.clientName.toLowerCase().includes(searchTerm) ||
        company.email.toLowerCase().includes(searchTerm) ||
        company.responsible.toLowerCase().includes(searchTerm)

      return matchesPlan && matchesProfile && matchesSearch
    })
  }, [companies, planFilter, profileFilter, search])

  const handleAddCompany = () => {
    navigate('/empresas/nova')
  }

  const handleDeleteCompany = (companyId: string) => {
    setCompanies(deleteStoredCompany(companyId))
    setMenuAnchorEl(null)
    setMenuCompanyId(null)
  }

  const handleEditCompany = (companyId: string) => {
    navigate(`/empresas/${companyId}/editar`)
    setMenuAnchorEl(null)
    setMenuCompanyId(null)
  }

  const handleEnterCompany = (companyId: string) => {
    navigate(`/empresas/${companyId}/agenda`)
    setMenuAnchorEl(null)
    setMenuCompanyId(null)
  }

  const openActionMenu = (event: MouseEvent<HTMLButtonElement>, companyId: string) => {
    setMenuAnchorEl(event.currentTarget)
    setMenuCompanyId(companyId)
  }

  const closeActionMenu = () => {
    setMenuAnchorEl(null)
    setMenuCompanyId(null)
  }

  return (
    <DashboardLayout activeItem="empresas">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
              <p className="mt-2 text-sm text-gray-500">Lista local com filtros e busca, pronta para integrar API.</p>
            </div>
            <div className="w-full sm:w-52">
              <Button type="button" variant="primary" onClick={handleAddCompany}>
                Adicionar Empresa
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Input
              label="Pesquisar"
              type="text"
              placeholder="Buscar por nome, email ou responsavel"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-gray-700">Filtro por Plano</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-400"
                value={planFilter}
                onChange={(event) => setPlanFilter(event.target.value as PlanType | '')}
              >
                <option value="">Todos</option>
                <option value="Start">Start</option>
                <option value="Enterprise">Enterprise</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-gray-700">Filtro por Perfil</label>
              <select
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-gray-400"
                value={profileFilter}
                onChange={(event) => setProfileFilter(event.target.value as ProfileType | '')}
              >
                <option value="">Todos</option>
                <option value="Administrador">Administrador</option>
                <option value="Empresa">Empresa</option>
              </select>
            </div>
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
                  <th className="px-4 py-3 font-semibold">Nome do cliente</th>
                  <th className="px-4 py-3 font-semibold">Responsavel</th>
                  <th className="px-4 py-3 font-semibold">E-mail</th>
                  <th className="px-4 py-3 font-semibold">Telefone</th>
                  <th className="px-4 py-3 font-semibold">Validade do plano</th>
                  <th className="px-4 py-3 font-semibold">Campanhas</th>
                  <th className="px-4 py-3 font-semibold">Plano</th>
                  <th className="px-4 py-3 font-semibold">Perfil</th>
                  <th className="px-4 py-3 font-semibold">Acoes</th>
                </tr>
              </thead>
              <tbody>
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="border-b border-gray-100 align-top text-gray-700">
                    <td className="px-4 py-3">{company.clientName}</td>
                    <td className="px-4 py-3">{company.responsible}</td>
                    <td className="px-4 py-3">{company.email}</td>
                    <td className="px-4 py-3">{company.phone}</td>
                    <td className="px-4 py-3">{company.planValidity}</td>
                    <td className="px-4 py-3">{company.campaigns}</td>
                    <td className="px-4 py-3">{company.plan}</td>
                    <td className="px-4 py-3">{company.profile}</td>
                    <td className="px-4 py-3">
                      <IconButton aria-label="Abrir acoes" size="small" onClick={(event) => openActionMenu(event, company.id)}>
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </td>
                  </tr>
                ))}
                {filteredCompanies.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-center text-sm text-gray-500" colSpan={9}>
                      Nenhuma empresa encontrada para os filtros atuais.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={closeActionMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem
              onClick={() => {
                if (menuCompanyId) {
                  handleEnterCompany(menuCompanyId)
                } else {
                  closeActionMenu()
                }
              }}
            >
              Entrar
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (menuCompanyId) {
                  handleEditCompany(menuCompanyId)
                } else {
                  closeActionMenu()
                }
              }}
            >
              Editar
            </MenuItem>
            <MenuItem
              onClick={() => {
                if (menuCompanyId) {
                  handleDeleteCompany(menuCompanyId)
                } else {
                  closeActionMenu()
                }
              }}
              sx={{ color: '#dc2626' }}
            >
              Excluir
            </MenuItem>
          </Menu>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Companies
