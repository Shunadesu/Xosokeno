import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Wallet, FileText, User } from 'lucide-react'
import { useAuthStore } from '../stores/index'

export default function BottomNavigation() {
  const location = useLocation()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  const navItems = [
    { path: '/', icon: Home, label: 'Trang chủ', requiresAuth: false },
    { path: '/wallet', icon: Wallet, label: 'Ví tiền', requiresAuth: true },
    { path: '/customer-service', icon: FileText, label: 'CSKH', requiresAuth: false },
    { path: '/profile', icon: User, label: 'Của tôi', requiresAuth: true }
  ]

  const handleNavClick = (item) => {
    if (item.requiresAuth && !isAuthenticated) {
      navigate('/login', { state: { from: { pathname: item.path } } })
    } else {
      navigate(item.path)
    }
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[99] bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg px-4 py-2 pb-safe">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          const isDisabled = item.requiresAuth && !isAuthenticated
          
          return (
            <button
              key={item.path}
              onClick={() => handleNavClick(item)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-primary-600 bg-primary-50' 
                  : isDisabled
                  ? 'text-gray-400 cursor-pointer'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`h-5 w-5 ${
                isActive ? 'text-primary-600' : 
                isDisabled ? 'text-gray-400' : 
                'text-gray-500'
              }`} />
              <span className={`text-xs mt-1 ${
                isActive ? 'text-primary-600 font-medium' : 
                isDisabled ? 'text-gray-400' : 
                'text-gray-500'
              }`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
