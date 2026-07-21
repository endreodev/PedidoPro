import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useForm } from 'react-hook-form'
import { showToast } from '../../components/common/Toast'

interface SignupForm {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export default function SignupPage() {
  const navigate = useNavigate()
  const handleSignup = useAuthStore((state) => state.handleSignup)
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<SignupForm>()
  const password = watch('password')

  const onSubmit = async (data: SignupForm) => {
    try {
      await handleSignup(
        data.name,
        data.email,
        data.password,
        data.password_confirmation
      )
      navigate('/')
      showToast('Conta criada com sucesso!', 'success')
    } catch (error) {
      showToast('Erro ao criar conta. Verifique os dados fornecidos.', 'error')
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
        <p className="text-sm text-text-secondary mt-1">Criar nova conta</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-600 text-text-primary mb-2">
            Nome
          </label>
          <input
            {...register('name', {
              required: 'Nome é obrigatório',
              minLength: {
                value: 3,
                message: 'Nome deve ter pelo menos 3 caracteres',
              },
            })}
            type="text"
            placeholder="Seu nome"
            className="w-full px-4 py-2 h-10 bg-background rounded-sm border border-border text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
          {errors.name && (
            <p className="text-xs text-error mt-1">{errors.name.message}</p>
          )}
        </div>

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

        {/* Password Confirmation */}
        <div>
          <label className="block text-sm font-600 text-text-primary mb-2">
            Confirmar Senha
          </label>
          <input
            {...register('password_confirmation', {
              required: 'Confirmação de senha é obrigatória',
              validate: (value) =>
                value === password || 'As senhas não correspondem',
            })}
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2 h-10 bg-background rounded-sm border border-border text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
          {errors.password_confirmation && (
            <p className="text-xs text-error mt-1">
              {errors.password_confirmation.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 bg-gradient-to-r from-primary to-secondary text-white font-600 rounded-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed mt-6"
        >
          {isSubmitting ? 'Criando conta...' : 'Criar conta'}
        </button>
      </form>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-surface text-text-secondary">Ou</span>
        </div>
      </div>

      {/* Login Link */}
      <div className="text-center">
        <p className="text-sm text-text-secondary">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="text-primary font-600 hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-text-secondary">
        <p>Ao criar uma conta, você concorda com nossos Termos de Serviço</p>
      </div>
    </div>
  )
}
