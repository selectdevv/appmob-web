import { useState, forwardRef, type InputHTMLAttributes } from 'react'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: boolean
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    const togglePasswordVisibility = () => {
      setShowPassword((prev) => !prev)
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? 'text' : 'password'}
            placeholder="*****"
            className={`
              w-full px-4 py-3 pr-12 rounded-lg border text-gray-900
              ${error ? 'border-red-500' : 'border-gray-300'}
              focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent
              transition-colors
              ${className}
            `}
            {...props}
          />
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none bg-transparent border-0 p-0 m-0 cursor-pointer shadow-none outline-none hover:border-0"
            style={{ background: 'transparent', boxShadow: 'none', border: 'none' }}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            onMouseEnter={(e) => {
              e.currentTarget.style.border = 'none'
              e.currentTarget.style.outline = 'none'
            }}
          >
            {showPassword ? (
              <VisibilityOffIcon className="w-5 h-5" style={{ background: 'transparent' }} />
            ) : (
              <VisibilityIcon className="w-5 h-5" style={{ background: 'transparent' }} />
            )}
          </button>
        </div>
      </div>
    )
  },
)

PasswordInput.displayName = 'PasswordInput'

export default PasswordInput
