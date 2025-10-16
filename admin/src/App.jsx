import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/index'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Games from './pages/Games'
import Bets from './pages/Bets'
import Deposits from './pages/Deposits'
import QRCode from './pages/QRCode'
import Promotions from './pages/Promotions'
import Banners from './pages/Banners'
import SettingsPage from './pages/Settings'

function App() {
  const { isAuthenticated, user, initialize } = useAuthStore()

  // Initialize auth when app starts
  useEffect(() => {
    initialize()
  }, [initialize])

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/games" element={<Games />} />
        <Route path="/bets" element={<Bets />} />
        <Route path="/deposits" element={<Deposits />} />
        <Route path="/qr-codes" element={<QRCode />} />
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/banners" element={<Banners />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  )
}

export default App
