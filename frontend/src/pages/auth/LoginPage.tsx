import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useForm } from 'react-hook-form'
import { showToast } from '../../components/common/Toast'

interface LoginForm {
  email: string
  password: string
}

const DEMOS = [
  { label: 'Administrador', email: 'admin@pedidospro.com' },
  { label: 'Vendedor', email: 'vendedor@pedidospro.com' },
  { label: 'Caixa', email: 'caixa@pedidospro.com' },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const handleLogin = useAuthStore((state) => state.handleLogin)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    try {
      await handleLogin(data.email, data.password)
      navigate('/')
      showToast('Login realizado com sucesso!', 'success')
    } catch (error) {
      showToast('Erro ao fazer login. Verifique suas credenciais.', 'error')
    }
  }

  const quickLogin = async (email: string) => {
    try {
      await handleLogin(email, 'demo')
      navigate('/')
      showToast('Bem-vindo!', 'success')
    } catch {
      showToast('Falha no acesso de demonstração.', 'error')
    }
  }

  return (
    <div className="bg-surface rounded-xl shadow-modal p-8 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary mb-4">
          <span className="text-white font-bold text-xl">P</span>
        </div>
        <h1 className="text-2xl font-800 text-text-primary">PedidosPro</h1>
        <p className="text-sm text-text-secondary mt-1">Gestão de vendas SaaS</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm font-600 text-text-primary mb-2">
            Email
          </label>
          <input
            {...register('email', {
              required: 'Email é obrigatório',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Email inválido',
              },
            })}
            type="email"
            placeholder="seu@email.com"
            className="w-full px-4 py-2 h-10 bg-background rounded-sm border border-border text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
          {errors.email && (
            <p className="text-xs text-error mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-600 text-text-primary mb-2">
            Senha
          </label>
          <input
            {...register('password', {
              required: 'Senha é obrigatória',
              minLength: {
                value: 6,
                message: 'Senha deve ter pelo menos 6 caracteres',
              },
            })}
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2 h-10 bg-background rounded-sm border border-border text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
          {errors.password && (
            <p className="text-xs text-error mt-1">{errors.password.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 bg-gradient-to-r from-primary to-secondary text-white font-600 rounded-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-surface text-text-secondary">Acesso de demonstração</span>
        </div>
      </div>

      {/* Acesso rápido (demo, sem backend) */}
      <div className="grid grid-cols-3 gap-2">
        {DEMOS.map((d) => (
          <button
            key={d.email}
            type="button"
            onClick={() => quickLogin(d.email)}
            className="text-xs font-600 py-2 px-1 rounded-md border border-border text-text-primary hover:border-primary hover:text-primary transition-colors"
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Signup Link */}
      <div className="text-center">
        <p className="text-sm text-text-secondary">
          Não tem uma conta?{' '}
          <Link
            to="/signup"
            className="text-primary font-600 hover:underline"
          >
            Criar conta
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-text-secondary">
        <p>Ao entrar, você concorda com nossos Termos de Serviço</p>
      </div>
    </div>
  )
}
