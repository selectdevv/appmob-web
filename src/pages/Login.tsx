import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import PasswordInput from '../components/ui/PasswordInput'
import Button from '../components/ui/Button'
import { useLogin } from '../hooks/useAuth'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const loginMutation = useLogin()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    try {
      await loginMutation.mutateAsync({
        email,
        password,
      })

      navigate('/home', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center px-6 lg:px-12 py-12 lg:py-0">
        <div className="w-full max-w-md">
          <div>
            <p className="text-base text-gray-400 mb-2 tracking-wide">Bem vindo</p>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-2">Login</h1>
            <p className="text-base text-gray-400 tracking-wide">Entre com suas credenciais</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 lg:px-12 py-12 lg:py-0 bg-white">
        <div className="w-full max-w-md">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <PasswordInput
              label="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
