import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GameBanner from '../components/GameBanner'
import { useGamesStore, useAuthStore } from '../stores/index'
import { TrendingUp, Users, Award, Clock, Star, Shield, Zap } from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const { activeGames, completedGames, fetchActiveGames, fetchCompletedGames } = useGamesStore()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    fetchActiveGames()
    fetchCompletedGames()
  }, [fetchActiveGames, fetchCompletedGames])

  // Create banners from active and completed games
  const createBannersFromGames = () => {
    const banners = []
    
    // Combine active and completed games, prioritize active games
    const allGames = [...activeGames, ...completedGames]
    
    // Group games by type
    const gamesByType = allGames.reduce((acc, game) => {
      if (!acc[game.type]) {
        acc[game.type] = []
      }
      acc[game.type].push(game)
      return acc
    }, {})
    
    // Create banner for each game type
    Object.entries(gamesByType).forEach(([type, games]) => {
      // Sort games: active first, then by creation date
      const sortedGames = games.sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1
        if (a.status !== 'active' && b.status === 'active') return 1
        return new Date(b.createdAt) - new Date(a.createdAt)
      })
      
      const latestGame = sortedGames[0] // Get the most relevant game
      
      if (type === 'keno') {
        banners.push({
          id: `keno-${latestGame._id}`,
          type: 'keno',
          title: 'KENO XỔ SỐ TỰ CHỌN',
          subtitle: 'CÁCH CHƠI MỚI VẬN MAY MỚI',
          description: latestGame.status === 'active' 
            ? `Game ${latestGame.title} - Đang hoạt động`
            : `Game ${latestGame.title} - Đã kết thúc${latestGame.result && latestGame.result.length > 0 ? ' (Có kết quả)' : ''}`,
          background: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
          textColor: 'text-yellow-900',
          accentColor: 'text-blue-600',
          logo: 'Keno',
          features: ['28', '9', '27'],
          graphics: ['smartphone', 'keno-balls'],
          gameId: latestGame._id,
          gameType: 'keno'
        })
      } else if (type === 'big-small') {
        banners.push({
          id: `big-small-${latestGame._id}`,
          type: 'big-small',
          title: 'Lớn, Nhỏ, Chẳn, Lẻ',
          subtitle: 'Thêm cách chơi mới',
          description: latestGame.status === 'active' 
            ? `Game ${latestGame.title} - Đang hoạt động`
            : `Game ${latestGame.title} - Đã kết thúc${latestGame.result && latestGame.result.length > 0 ? ' (Có kết quả)' : ''}`,
          background: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
          textColor: 'text-yellow-900',
          accentColor: 'text-blue-600',
          logo: 'Keno',
          features: ['big-small', 'even-odd'],
          graphics: ['mascots', 'keno-ball'],
          gameId: latestGame._id,
          gameType: 'big-small'
        })
      } else if (type === 'even-odd') {
        banners.push({
          id: `even-odd-${latestGame._id}`,
          type: 'even-odd',
          title: 'Chẵn, Lẻ',
          subtitle: 'Cách chơi đơn giản',
          description: latestGame.status === 'active' 
            ? `Game ${latestGame.title} - Đang hoạt động`
            : `Game ${latestGame.title} - Đã kết thúc${latestGame.result && latestGame.result.length > 0 ? ' (Có kết quả)' : ''}`,
          background: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
          textColor: 'text-yellow-900',
          accentColor: 'text-blue-600',
          logo: 'Keno',
          features: ['even', 'odd'],
          graphics: ['mascots', 'keno-ball'],
          gameId: latestGame._id,
          gameType: 'even-odd'
        })
      } else if (type === 'special') {
        banners.push({
          id: `special-${latestGame._id}`,
          type: 'special',
          title: 'GAME ĐẶC BIỆT',
          subtitle: latestGame.title,
          description: latestGame.status === 'active' 
            ? `Game ${latestGame.title} - Đang hoạt động`
            : `Game ${latestGame.title} - Đã kết thúc${latestGame.result && latestGame.result.length > 0 ? ' (Có kết quả)' : ''}`,
          background: 'bg-gradient-to-r from-yellow-400 to-yellow-500',
          textColor: 'text-yellow-900',
          accentColor: 'text-red-600',
          logo: 'Vietlott',
          features: ['special', 'bonus'],
          graphics: ['zodiac', 'clock'],
          gameId: latestGame._id,
          gameType: 'special'
        })
      }
    })
    
    return banners
  }
  
  const banners = createBannersFromGames()

  // Stats data
  const stats = [
    { icon: Users, label: 'Người chơi', value: '12,345', color: 'text-blue-600', bgColor: 'bg-blue-50' },
    { icon: Award, label: 'Giải thưởng', value: '2.5M VNĐ', color: 'text-green-600', bgColor: 'bg-green-50' },
    { icon: TrendingUp, label: 'Tăng trưởng', value: '+15%', color: 'text-purple-600', bgColor: 'bg-purple-50' },
    { icon: Clock, label: 'Thời gian', value: '24/7', color: 'text-orange-600', bgColor: 'bg-orange-50' }
  ]

  // Features data
  const features = [
    { icon: Shield, title: 'An toàn tuyệt đối', desc: 'Bảo mật thông tin và giao dịch' },
    { icon: Zap, title: 'Thanh toán nhanh', desc: 'Rút tiền trong 5 phút' },
    { icon: Star, title: 'Tỷ lệ cao', desc: 'Tỷ lệ trúng thưởng tốt nhất' },
    { icon: Users, title: 'Hỗ trợ 24/7', desc: 'Đội ngũ CSKH chuyên nghiệp' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="px-4 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary-600 to-primary-700 rounded-full mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Chào mừng đến với XOSOKENOVN.COM
          </h1>
          <p className="text-gray-600 max-w-md mx-auto">
            Trải nghiệm game xổ số Keno hấp dẫn nhất Việt Nam với tỷ lệ trúng thưởng cao
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                    <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Game Banners */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              🎮 Game Hấp Dẫn
            </h2>
            <p className="text-gray-600 text-sm">
              Chọn game yêu thích và bắt đầu trải nghiệm
            </p>
          </div>
          {banners.length > 0 ? (
            banners.map((banner) => (
              <GameBanner key={banner.id} banner={banner} />
            ))
          ) : (
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Chưa có game nào
              </h3>
              <p className="text-gray-600 text-sm">
                Hiện tại chưa có game nào (đang hoạt động hoặc đã hoàn thành). Vui lòng quay lại sau!
              </p>
            </div>
          )}
        </div>

        {/* Features Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
            ✨ Tại sao chọn chúng tôi?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">{feature.title}</div>
                    <div className="text-sm text-gray-600">{feature.desc}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Call to Action */}
        {!isAuthenticated && (
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-primary-700/90"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
                <span className="text-2xl">🎁</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Bắt đầu ngay hôm nay!</h3>
              <p className="text-primary-100 mb-4 max-w-sm mx-auto">
                Đăng ký tài khoản để nhận ngay khuyến mãi nạp tiền lần đầu 50%
              </p>
              <button 
                onClick={() => navigate('/register')}
                className="bg-white text-primary-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors shadow-lg"
              >
                Đăng ký ngay
              </button>
            </div>
          </div>
        )}

        {/* Footer Info */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-500">
            © 2024 XOSOKENOVN.COM - Trò chơi có thưởng dành cho người từ 18 tuổi trở lên
          </p>
        </div>
      </div>
    </div>
  )
}
