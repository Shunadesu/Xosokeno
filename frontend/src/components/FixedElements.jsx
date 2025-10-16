import { useAuthStore } from '../stores/index'

export default function FixedElements() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <>
      {/* Mobile Header - Fixed */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-[100] h-16 bg-primary-600/95 backdrop-blur-md shadow-lg border-b border-primary-500/20">
        <div className="flex h-full justify-between items-center px-4">
          <h1 className="text-lg font-bold text-white drop-shadow-sm">XOSOKENOVN.COM</h1>
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

      {/* Mobile Footer - Fixed */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[99] bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg">
        <div className="flex justify-around items-center px-4 py-2 pb-safe">
          <div className="flex flex-col items-center py-2 px-3 rounded-lg text-primary-600 bg-primary-50">
            <svg className="h-5 w-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1 text-primary-600 font-medium">Trang chủ</span>
          </div>
          <div className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-500 hover:text-gray-700">
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-xs mt-1 text-gray-500">Ví tiền</span>
          </div>
          <div className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-500 hover:text-gray-700">
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs mt-1 text-gray-500">CSKH</span>
          </div>
          <div className="flex flex-col items-center py-2 px-3 rounded-lg text-gray-500 hover:text-gray-700">
            <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1 text-gray-500">Của tôi</span>
          </div>
        </div>
      </div>
    </>
  )
}

