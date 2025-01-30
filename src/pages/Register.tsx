import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState } from 'react'

const registerSchema = Yup.object().shape({
  username: Yup.string()
    .required('Nome de usuário é obrigatório')
    .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/, 'Nome de usuário deve conter apenas letras, números e _')
    .trim(),
  full_name: Yup.string()
    .required('Nome completo é obrigatório')
    .min(3, 'Nome completo deve ter pelo menos 3 caracteres')
    .trim(),
  email: Yup.string()
    .email('Email inválido')
    .required('Email é obrigatório')
    .trim(),
  password: Yup.string()
    .required('Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
    ),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Senhas não conferem')
    .required('Confirmação de senha é obrigatória'),
})

const Register = () => {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (
    values: {
      username: string
      full_name: string
      email: string
      password: string
      confirmPassword: string
    },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    try {
      setErrorMessage('')
      console.log('Enviando formulário:', values)

      const result = await signUp(values.email, values.password, {
        username: values.username,
        full_name: values.full_name
      })

      console.log('Resultado do registro:', result)
      navigate('/login?registered=true')
    } catch (error) {
      console.error('Erro no registro:', error)
      if (error instanceof Error) {
        if (error.message.includes('email already registered')) {
          setErrorMessage('Este email já está cadastrado')
        } else {
          setErrorMessage(`Erro ao cadastrar: ${error.message}`)
        }
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
          <p>{errorMessage}</p>
        </div>
      )}

      <Formik
        initialValues={{
          username: '',
          full_name: '',
          email: '',
          password: '',
          confirmPassword: ''
        }}
        validationSchema={registerSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form className="mt-8 space-y-6">
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Nome de usuário
                </label>
                <Field
                  id="username"
                  name="username"
                  type="text"
                  className="mt-1 py-2 px-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Digite seu nome de usuário"
                />
                {errors.username && touched.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              <div>
                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700">
                  Nome Completo
                </label>
                <Field
                  id="full_name"
                  name="full_name"
                  type="text"
                  className="mt-1 py-2 px-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Digite seu nome completo"
                />
                {errors.full_name && touched.full_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.full_name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Field
                  id="email"
                  name="email"
                  type="email"
                  className="mt-1 py-2 px-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                  className="mt-1 py-2 px-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Digite sua senha"
                />
                {errors.password && touched.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar Senha
                </label>
                <Field
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  className="mt-1 py-2 px-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Confirme sua senha"
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
              </button>
            </div>

            <div className="text-sm text-center">
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Já tem uma conta? Faça login
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    </>
  )
}

export default Register 