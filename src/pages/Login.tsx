import { Formik, Form, Field } from 'formik'
import * as Yup from 'yup'
import { Link } from 'react-router-dom'

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Email inválido').required('Obrigatório'),
  password: Yup.string().required('Obrigatório'),
})

const Login = () => {
  const handleSubmit = (values: { email: string; password: string }) => {
    console.log(values)
    // Handle login logic here
  }

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={loginSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched }) => (
        <Form className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <Field
                id="email"
                name="email"
                type="email"
                className="mt-1 py-2 px-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Entre com seu email"
              />
              {errors.email && touched.email && (
                <p className="mt-1 py-2 px-4 text-sm text-blue-500">{errors.email}</p>
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
                placeholder="Entre com sua senha"
              />
              {errors.password && touched.password && (
                <p className="mt-1 py-2 px-4 text-sm text-blue-500">{errors.password}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Entrar
            </button>
          </div>

          <div className="text-sm text-center">
            <Link to="/register" className="font-medium text-blue-500 hover:text-blue-400">
              Ainda não tem uma conta? Cadastre-se
            </Link>
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default Login 