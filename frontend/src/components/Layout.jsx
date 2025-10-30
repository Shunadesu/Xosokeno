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
      <div className="lg:pl-64 relative">
        {/* Page content */}
        <main className="relative">
          {/* Mobile Header - Fixed */}
          <div className="lg:hidden fixed top-0 left-0 right-0 z-[100] h-16 bg-primary-600/95 backdrop-blur-md shadow-lg border-b border-primary-500/20">
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
          <div className="py-6 lg:py-6 pt-20 pb-24 lg:pt-6 lg:pb-6">
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
          {/* Mobile Footer - Fixed */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[99] bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
            <div className="flex justify-around items-center px-4 py-2 pb-safe">
              <Link to="/" className="flex flex-col items-center py-2 px-3 rounded-lg text-primary-600 bg-primary-50">
                <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-xs mt-1 text-primary-600 font-medium">Trang chủ</span>
              </Link>
              <Link to="/wallet" className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-500 hover:text-gray-700">
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-xs mt-1 text-gray-500">Ví tiền</span>
              </Link>
              <Link to="/customer-service" className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-500 hover:text-gray-700">
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-xs mt-1 text-gray-500">CSKH</span>
              </Link>
              <Link to="/profile" className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-500 hover:text-gray-700">
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs mt-1 text-gray-500">Của tôi</span>
              </Link>
            </div>
          </div>

          {/* Floating Action Buttons */}
          <FloatingActionButtons />
        </main>

      </div>

      
    </div>
  )
}
