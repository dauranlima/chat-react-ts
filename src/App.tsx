import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AuthLayout from './layouts/AuthLayout.tsx'
import MainLayout from './layouts/MainLayout.tsx'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import Chat from './pages/Chat.tsx'

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Chat />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
