import { useEffect } from 'react'
import { 
  Users, 
  Gamepad2, 
  Target, 
  CreditCard, 
  TrendingUp, 
  DollarSign,
  Activity,
  Calendar
} from 'lucide-react'
import { useDashboardStore } from '../stores/index'

const stats = [
  {
    name: 'Tổng người dùng',
    value: '0',
    icon: Users,
    change: '+12%',
    changeType: 'positive'
  },
  {
    name: 'Game hoạt động',
    value: '0',
    icon: Gamepad2,
    change: '+5%',
    changeType: 'positive'
  },
  {
    name: 'Tổng cược',
    value: '0',
    icon: Target,
    change: '+8%',
    changeType: 'positive'
  },
  {
    name: 'Nạp tiền chờ xử lý',
    value: '0',
    icon: CreditCard,
    change: '+2%',
    changeType: 'positive'
  }
]

export default function Dashboard() {
  const { stats: dashboardStats, isLoading, fetchStats } = useDashboardStore()

  useEffect(() => {
    fetchStats()
  }, [])

  const formatNumber = (num) => {
    if (!num) return '0'
    return new Intl.NumberFormat('vi-VN').format(num)
  }

  const formatCurrency = (num) => {
    if (!num) return '0 VNĐ'
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(num)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Tổng quan hệ thống Zuna Xosokeno
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.name === 'Tổng người dùng' && dashboardStats?.users?.total
                            ? formatNumber(dashboardStats.users.total)
                            : stat.name === 'Game hoạt động' && dashboardStats?.games?.active
                            ? formatNumber(dashboardStats.games.active)
                            : stat.name === 'Tổng cược' && dashboardStats?.bets?.totalAmount
                            ? formatCurrency(dashboardStats.bets.totalAmount)
                            : stat.name === 'Nạp tiền chờ xử lý' && dashboardStats?.deposits?.pending
                            ? formatNumber(dashboardStats.deposits.pending)
                            : stat.value}
                        </div>
                        <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                          stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detailed Stats */}
      {dashboardStats && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Users Stats */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Thống kê người dùng
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(dashboardStats.users?.total || 0)}
                  </div>
                  <div className="text-sm text-gray-500">Tổng người dùng</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(dashboardStats.users?.active || 0)}
                  </div>
                  <div className="text-sm text-gray-500">Người dùng hoạt động</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatNumber(dashboardStats.users?.newToday || 0)}
                  </div>
                  <div className="text-sm text-gray-500">Mới hôm nay</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {formatNumber(dashboardStats.users?.newThisMonth || 0)}
                  </div>
                  <div className="text-sm text-gray-500">Mới tháng này</div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Stats */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Thống kê tài chính
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Tổng số tiền cược:</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(dashboardStats.bets?.totalAmount || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Tổng tiền thắng:</span>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(dashboardStats.bets?.totalWinnings || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Lợi nhuận:</span>
                  <span className={`font-semibold ${
                    (dashboardStats.bets?.totalAmount || 0) - (dashboardStats.bets?.totalWinnings || 0) >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    {formatCurrency(
                      (dashboardStats.bets?.totalAmount || 0) - (dashboardStats.bets?.totalWinnings || 0)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Tổng nạp tiền:</span>
                  <span className="font-semibold text-blue-600">
                    {formatCurrency(dashboardStats.deposits?.totalAmount || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activities */}
      {dashboardStats?.recentActivities && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Recent Users */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Người dùng mới
              </h3>
              <div className="space-y-3">
                {dashboardStats.recentActivities.users?.slice(0, 5).map((user) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Bets */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Cược gần đây
              </h3>
              <div className="space-y-3">
                {dashboardStats.recentActivities.bets?.slice(0, 5).map((bet) => (
                  <div key={bet._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {bet.userId?.fullName || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {bet.gameId?.title || 'Unknown Game'}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-gray-900">
                      {formatCurrency(bet.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Deposits */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Nạp tiền gần đây
              </h3>
              <div className="space-y-3">
                {dashboardStats.recentActivities.deposits?.slice(0, 5).map((deposit) => (
                  <div key={deposit._id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {deposit.userId?.fullName || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {deposit.qrCodeId?.name || deposit.method}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-gray-900">
                      {formatCurrency(deposit.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  )
}





