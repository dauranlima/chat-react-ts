import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { Link } from 'react-router-dom'

const registerSchema = Yup.object().shape({
  name: Yup.string().required('Obrigatório'),
  email: Yup.string().email('Email inválido').required('Obrigatório'),
  password: Yup.string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
      .required('Obrigatório'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Senhas não conferem')
    .required('Obrigatório'),
})

const Register = () => {
  const handleSubmit = (values: {
    name: string
    email: string
    password: string
    confirmPassword: string
  }) => {
    console.log(values)
    // Handle registration logic here
  }

  return (
    <Formik
      initialValues={{ name: '', email: '', password: '', confirmPassword: '' }}
      validationSchema={registerSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched }) => (
        <Form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Nome Completo
              </label>
              <Field
                id="name"
                name="name"
                type="text"
                className="mt-1 py-2 px-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Digite seu nome completo"
              />
              {errors.name && touched.name && (
                <p className="mt-1 py-2 px-4 text-sm text-red-600">{errors.name}</p>
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
                <p className="mt-1 py-2 px-4 text-sm text-red-600">{errors.email}</p>
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
                <p className="mt-1 py-2 px-4 text-sm text-red-600">{errors.password}</p>
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
                <p className="mt-1 py-2 px-4 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cadastrar
            </button>
          </div>

          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Já tem uma conta? Entrar
            </Link>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default Register 