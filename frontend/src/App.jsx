import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/index'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Wallet from './pages/Wallet'
import CustomerService from './pages/CustomerService'
import Profile from './pages/Profile'
import KenoGame from './pages/KenoGame'
import BigSmallGame from './pages/BigSmallGame'
import BetHistory from './pages/BetHistory'

function App() {
  const { isAuthenticated, initialize } = useAuthStore()

  // Initialize auth when app starts
  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Router>
      <ScrollToTop />
      <Routes>
          {/* Public routes - no authentication required */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="customer-service" element={<CustomerService />} />
            <Route path="game/keno/:gameId" element={<KenoGame />} />
            <Route path="game/big-small/:gameId" element={<BigSmallGame />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          

          {/* Protected routes - require authentication */}
          {isAuthenticated ? (
            <Route path="/*" element={<Layout />}>
              <Route path="wallet" element={<Wallet />} />
              <Route path="profile" element={<Profile />} />
              <Route path="bet-history" element={<BetHistory />} />
            </Route>
          ) : (
            <>
              <Route path="/wallet" element={<Login />} />
              <Route path="/profile" element={<Login />} />
              <Route path="/bet-history" element={<Login />} />
            </>
          )}
        </Routes>
        
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
    </Router>
  )
}

export default App
