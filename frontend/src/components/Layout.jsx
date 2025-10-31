import { Outlet, useLocation } from 'react-router-dom'
import { Home, Wallet, User, MessageCircle, History } from 'lucide-react'
import { useAuthStore } from '../stores/index'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import FloatingActionButtons from './FloatingActionButtons'

export default function Layout() {
  const { isAuthenticated, user, refreshUser } = useAuthStore()
  const location = useLocation()

  // Refresh user data when navigating to wallet or profile pages
  useEffect(() => {
    if (isAuthenticated && (location.pathname === '/wallet' || location.pathname === '/profile')) {
      refreshUser()
    }
  }, [location.pathname, isAuthenticated, refreshUser])

  const navigation = [
    { name: 'Trang chủ', href: '/', icon: Home, public: true },
    { name: 'Ví tiền', href: '/wallet', icon: Wallet, public: false },
    { name: 'Hồ sơ', href: '/profile', icon: User, public: false },
    { name: 'Lịch sử cược', href: '/bet-history', icon: History, public: false },
    { name: 'CSKH', href: '/customer-service', icon: MessageCircle, public: true },
  ]

  const filteredNavigation = navigation.filter(item => 
    item.public || isAuthenticated
  )
  // const { isAuthenticated, user } = useAuthStore()

  return (
    <div className="relative bg-gray-50">
      
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed z-50 lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-primary-600">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-white">XOSOKENOVN.COM</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      isActive
                        ? 'bg-primary-700 text-white shadow-md scale-[1.02]'
                        : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-300 cursor-pointer relative z-10 pointer-events-auto`}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-white scale-110' : 'text-primary-300 group-hover:text-white'
                      } mr-3 h-6 w-6 flex-shrink-0 transition-all duration-300`}
                    />
                    <span className={`transition-all duration-300 ${
                      isActive ? 'font-semibold' : ''
                    }`}>
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </nav>
          </div>
          {isAuthenticated && user && (
            <div className="flex flex-shrink-0 border-t border-primary-700 p-4">
              <div className="group block w-full flex-shrink-0">
                <div className="flex items-center">
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user.fullName}</p>
                    <p className="text-xs font-medium text-primary-200">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(user.balance || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 relative">
        {/* Page content */}
        <main className="relative">
          {/* Mobile Header - Fixed */}
          <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-primary-600/95 backdrop-blur-md shadow-lg border-b border-primary-500/20">
              <div className="flex h-full justify-between items-center px-4">
                <Link to="/" className="text-lg font-bold text-white drop-shadow-sm">XOSOKENOVN.COM</Link>
                {isAuthenticated && user && (
                  <div className="text-sm text-white drop-shadow-sm">
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-primary-200 text-xs">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND'
                      }).format(user.balance || 0)}
                    </div>
                  </div>
                )}
            </div>
          </div>
          <div className="py-6 lg:py-6 pt-16 pb-16 lg:pt-6 lg:pb-6">
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
          {/* Mobile Footer - Fixed */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[99] bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
            <div className="flex justify-around items-center px-4 py-2 pb-safe">
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-300 ${
                      isActive
                        ? 'text-primary-600 bg-primary-50 scale-105'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 transition-all duration-300 ${
                        isActive ? 'text-primary-600 scale-110' : 'text-gray-500'
                      }`}
                    />
                    <span className={`text-xs mt-1 transition-all duration-300 ${
                      isActive ? 'text-primary-600 font-medium' : 'text-gray-500'
                    }`}>
                      {item.name}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Floating Action Buttons */}
          <FloatingActionButtons />
        </main>

      </div>

      
    </div>
  )
}
