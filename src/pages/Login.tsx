import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email inválido')
    .required('Email é obrigatório')
    .trim(),
  password: Yup.string()
    .required('Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

const Login = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const justRegistered = searchParams.get('registered') === 'true'

  useEffect(() => {
    if (justRegistered) {
      Swal.fire({
        title: 'Cadastro realizado!',
        text: 'Por favor, verifique seu email para confirmar sua conta antes de fazer login.',
        icon: 'success',
        confirmButtonColor: '#3B82F6',
        timer: 3000,
        timerProgressBar: true
      })
    }
  }, [justRegistered])

  const handleSubmit = async (
    values: { email: string; password: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      await signIn(values.email, values.password)
      
      await Swal.fire({
        title: 'Bem-vindo!',
        text: 'Login realizado com sucesso',
        icon: 'success',
        timer: 1500,
        timerProgressBar: true,
        showConfirmButton: false
      })

      navigate('/chat', { replace: true })
    } catch (error) {
      console.error('Erro no login:', error)
      if (error instanceof Error) {
        let errorTitle = 'Erro no login'
        let errorMessage = 'Ocorreu um erro ao fazer login. Tente novamente.'

        if (error.message.includes('Email not confirmed')) {
          errorTitle = 'Email não confirmado'
          errorMessage = 'Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.'
        } else if (error.message.includes('Invalid login credentials')) {
          errorTitle = 'Credenciais inválidas'
          errorMessage = 'Email ou senha incorretos'
        }

        await Swal.fire({
          title: errorTitle,
          text: errorMessage,
          icon: 'error',
          confirmButtonColor: '#3B82F6'
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={loginSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Field
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Digite seu email"
              />
              {errors.email && touched.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Senha
              </label>
              <Field
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                className="mt-1 appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Digite sua senha"
              />
              {errors.password && touched.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/forgot-password"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Esqueci minha senha
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          <div className="text-sm text-center">
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Ainda não tem uma conta? Cadastre-se
            </Link>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default Login 