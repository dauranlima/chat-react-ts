import { Outlet } from 'react-router-dom'

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <img
            className="mx-auto h-12 w-auto"
            src="https://cdn-icons-png.flaticon.com/512/134/134914.png"
            alt="Chat Logo"
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">D-Chat</h2>
        </div>
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout 