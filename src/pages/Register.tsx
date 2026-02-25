import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../components/ui/Input'
import PasswordInput from '../components/ui/PasswordInput'
import Button from '../components/ui/Button'
import { useRegister } from '../hooks/useAuth'

const Register = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const registerMutation = useRegister()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (name.trim().length < 2) {
      setError('Nome deve ter no mínimo 2 caracteres')
      return
    }

    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres')
      return
    }

    try {
      await registerMutation.mutateAsync({
        email,
        password,
        name: name.trim(),
      })
      
      navigate('/home', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta. Tente novamente.')
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      <div className="flex-1 flex items-center justify-center px-6 lg:px-12 py-12 lg:py-0">
        <div className="w-full max-w-md">
          <div>
            <p className="text-base text-gray-400 mb-2 tracking-wide">Bem vindo</p>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-2">Criar conta</h1>
            <p className="text-base text-gray-400 tracking-wide">Preencha os dados para se cadastrar</p>
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
              label="Nome"
              type="text"
              placeholder="Seu nome completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? 'Criando conta...' : 'Criar conta'}
              </Button>
            </div>

            <div className="text-center text-sm text-gray-600 pt-2">
              <span>Já tem uma conta? </span>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  navigate('/login')
                }}
                className="font-bold text-gray-900 hover:text-gray-700 transition-colors"
              >
                Fazer login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
