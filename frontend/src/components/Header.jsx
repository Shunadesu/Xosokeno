import { useEffect } from 'react'
import { RefreshCw } from 'lucide-react'
import { useAuthStore } from '../stores/index'

export default function Header() {
  const { user, isAuthenticated, refreshUser } = useAuthStore()

  // Refresh user data when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      refreshUser()
    }
  }, [isAuthenticated, refreshUser])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary-600 text-white px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">XOSOKENOVN.COM</h1>
        {isAuthenticated && user && (
          <div className="flex items-center space-x-2">
            <div className="text-sm">
              <div className="font-medium">{user.fullName}</div>
              <div className="text-primary-200 text-xs">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(user.balance || 0)}
              </div>
            </div>
            <button
              onClick={refreshUser}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
              title="Làm mới số dư"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
