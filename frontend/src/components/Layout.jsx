import { Outlet, useLocation } from 'react-router-dom'
import { Home, Wallet, User, MessageCircle, History } from 'lucide-react'
import { useAuthStore } from '../stores/index'
import BottomNavigation from './BottomNavigation'
import FixedElements from './FixedElements'
import { useEffect } from 'react'

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Elements */}
      <FixedElements />

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-primary-600">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-white">XOSOKENOVN.COM</h1>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {filteredNavigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? 'bg-primary-700 text-white'
                        : 'text-primary-100 hover:bg-primary-700 hover:text-white'
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
                  >
                    <item.icon
                      className={`${
                        isActive ? 'text-white' : 'text-primary-300 group-hover:text-white'
                      } mr-3 h-6 w-6 flex-shrink-0`}
                    />
                    {item.name}
                  </a>
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
      <div className="lg:pl-64">
        {/* Page content */}
        <main className="flex-1">
          <div className="py-6 lg:py-6 pt-20 pb-24 lg:pt-6 lg:pb-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
