import { Outlet } from 'react-router-dom'

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-lg min-h-[calc(100vh-3rem)]">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default MainLayout 