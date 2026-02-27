import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Companies from './pages/Companies'
import NewCompany from './pages/NewCompany'
import CompanyAgenda from './pages/CompanyAgenda'
import NewCampaign from './pages/NewCampaign'
import EditCampaign from './pages/EditCampaign'

const AppRoutes = () => {
  const location = useLocation()

  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<Home />} />
      <Route path="/empresas" element={<Companies />} />
      <Route path="/empresas/nova" element={<NewCompany />} />
      <Route path="/empresas/:companyId/editar" element={<NewCompany />} />
      <Route path="/empresas/:companyId/agenda" element={<CompanyAgenda />} />
      <Route path="/empresas/:companyId/campanhas/nova" element={<NewCampaign />} />
      <Route path="/empresas/:companyId/campanhas/:campaignId/editar" element={<EditCampaign />} />
      <Route path="/nova-empresa" element={<Navigate to="/empresas/nova" replace />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
