import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import HomeIcon from '@mui/icons-material/Home'

const Home = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login', { replace: true })
      return
    }

    const userStr = localStorage.getItem('user')
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login', { replace: true })
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 flex flex-col`}
        style={{ background: '#ffffff' }}
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
                onClick={() => {
                  setIsMenuOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-indigo-600 rounded-lg transition-all duration-200 bg-transparent border-none cursor-pointer font-medium"
                style={{ background: 'transparent' }}
              >
                <HomeIcon className="text-gray-500 group-hover:text-indigo-600" />
                <span>Home</span>
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
            >
              <MenuIcon />
            </button>
            <div className="flex items-center gap-6">
              {user && (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {user.name.charAt(0).toUpperCase()}
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

        <main className="flex-1 p-6 sm:p-8 lg:p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%)] animate-pulse"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.1),transparent_50%)] animate-pulse" style={{ animationDelay: '1s' }}></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(139,92,246,0.1),transparent_50%)] animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>
          <div className="relative h-full flex items-start justify-center pt-20 md:pt-32">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">Bem vindo</h1>
              {user && (
                <p className="text-xl md:text-2xl text-gray-700 font-medium">
                  Olá, <span className="text-indigo-600 font-semibold">{user.name}</span>! Você está logado.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Home
