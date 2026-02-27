import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import HomeIcon from '@mui/icons-material/Home'
import BusinessIcon from '@mui/icons-material/Business'

type MenuKey = 'home' | 'empresas'

interface DashboardLayoutProps {
  activeItem: MenuKey
  children: ReactNode
}

interface StoredUser {
  name?: string
}

const DashboardLayout = ({ activeItem, children }: DashboardLayoutProps) => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<StoredUser | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    const isAuthenticated = Boolean(token || userStr)

    if (!isAuthenticated) {
      navigate('/login', { replace: true })
      return
    }

    if (!userStr) {
      setUser(null)
      return
    }

    try {
      const parsedUser = JSON.parse(userStr) as { name?: unknown }
      setUser({
        name: typeof parsedUser?.name === 'string' ? parsedUser.name : undefined,
      })
    } catch {
      setUser(null)
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev)
  }

  const navigateFromMenu = (path: string) => {
    navigate(path)
    setIsMenuOpen(false)
  }

  const menuItemClass = (isActive: boolean) =>
    `w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-all duration-200 border-none cursor-pointer font-medium ${
      isActive
        ? 'bg-indigo-50 text-indigo-600'
        : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600 bg-transparent'
    }`

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 flex flex-col`}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Menu</h2>
          <button
            onClick={toggleMenu}
            className="text-gray-400 hover:text-gray-600 focus:outline-none bg-transparent border-none p-1 cursor-pointer rounded-md hover:bg-gray-100 transition-colors"
            style={{ background: 'transparent' }}
            aria-label="Fechar menu"
          >
            <CloseIcon />
          </button>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => navigateFromMenu('/home')}
                className={menuItemClass(activeItem === 'home')}
                style={{ background: activeItem === 'home' ? '#eef2ff' : 'transparent' }}
              >
                <HomeIcon className={activeItem === 'home' ? 'text-indigo-600' : 'text-gray-500'} />
                <span>Home</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => navigateFromMenu('/empresas')}
                className={menuItemClass(activeItem === 'empresas')}
                style={{ background: activeItem === 'empresas' ? '#eef2ff' : 'transparent' }}
              >
                <BusinessIcon className={activeItem === 'empresas' ? 'text-indigo-600' : 'text-gray-500'} />
                <span>Empresas</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={toggleMenu}
        />
      )}

      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <button
              onClick={toggleMenu}
              className="text-gray-500 hover:text-gray-700 focus:outline-none bg-transparent border-none p-2 cursor-pointer"
              style={{ background: 'transparent', border: 'none' }}
              aria-label="Abrir menu"
            >
              <MenuIcon />
            </button>
            <div className="flex items-center gap-6">
              {user?.name && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name[0]?.toUpperCase() ?? ''}
                    </span>
                  </div>
                  <span className="text-gray-800 font-semibold text-base tracking-wide">
                    {user.name}
                  </span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 text-sm font-semibold text-red-600 hover:text-red-700 bg-transparent border-2 border-red-300 hover:border-red-600 rounded-lg transition-all duration-200 cursor-pointer tracking-wide shadow-sm hover:shadow-md"
                style={{ background: 'transparent' }}
              >
                Sair
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 lg:p-12">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
