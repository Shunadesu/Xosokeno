import { Play } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useGamesStore, useAuthStore } from '../stores/index'
import axios from 'axios'

export default function GameBanner({ banner }) {
  const navigate = useNavigate()
  const { activeGames, fetchActiveGames } = useGamesStore()
  const { isAuthenticated } = useAuthStore()

  const handleJoin = async () => {
    // Check if user is authenticated for betting
    if (!isAuthenticated) {
      if (window.confirm('Bạn cần đăng nhập để tham gia chơi game. Đăng nhập ngay?')) {
        navigate('/login', { state: { from: { pathname: '/' } } })
      }
      return
    }

    // Fetch active games first
    await fetchActiveGames()
    
    // Use gameId from banner if available (from database)
    if (banner.gameId) {
      // Navigate directly to the specific game
      if (banner.gameType === 'big-small' || banner.gameType === 'even-odd') {
        navigate(`/game/big-small/${banner.gameId}`)
      } else {
        navigate(`/game/keno/${banner.gameId}`)
      }
    } else {
      // Fallback to old logic for backward compatibility
      let gameType = 'keno'
      if (banner.id === 'keno-big-small' || banner.id === 'keno-new-play') {
        gameType = 'keno'
      } else if (banner.id === 'zodiac-hour') {
        gameType = 'special'
      }
      
      // Find active game of this type
      let targetGame = activeGames.find(game => game.type === gameType)
      
      if (targetGame) {
        // Found active game, navigate to it
        if (banner.id === 'keno-big-small') {
          navigate(`/game/big-small/${targetGame._id}`)
        } else {
          navigate(`/game/keno/${targetGame._id}`)
        }
      } else {
        // No active game, try to find the most recent completed game
        try {
          const response = await axios.get(`/games?type=${gameType}&status=completed&limit=1`)
          const recentGame = response.data.data?.[0]
          
          if (recentGame) {
            // Found recent completed game, navigate to view results
            if (banner.id === 'keno-big-small') {
              navigate(`/game/big-small/${recentGame._id}`)
            } else {
              navigate(`/game/keno/${recentGame._id}`)
            }
          } else {
            // No games at all, show message
            alert('Hiện tại chưa có game nào. Vui lòng quay lại sau!')
          }
        } catch (error) {
          console.error('Error fetching recent games:', error)
          alert('Không thể tải thông tin game. Vui lòng thử lại!')
        }
      }
    }
  }

  return (
    <div className={`${banner.background} rounded-xl p-6 shadow-lg relative overflow-hidden mb-4 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>

      {/* Content */}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">

            <h2 className={`text-3xl font-bold ${banner.textColor} mb-1`}>
              {banner.title}
            </h2>
            
            <p className={`text-sm ${banner.textColor} opacity-90`}>
              {banner.subtitle}
            </p>
          </div>
          
          <div className="text-right">
            <div className={`text-sm font-bold ${banner.textColor} mb-2`}>
              {banner.logo}
            </div>
            <button
              onClick={handleJoin}
              className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-primary-700 transition-colors flex items-center space-x-1 shadow-lg hover:shadow-xl"
            >
              <Play className="h-4 w-4" />
              <span>Tham gia</span>
            </button>
          </div>
        </div>
        
        {/* Features */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {(banner.features || []).map((feature, index) => (
              <div key={index} className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg">
                {feature}
              </div>
            ))}
          </div>
          
          <div className={`text-xs ${banner.textColor} opacity-80 bg-white/20 px-2 py-1 rounded-full`}>
            {banner.description}
          </div>
        </div>
        
        {/* Special graphics for specific banners */}
        {banner.id === 'keno-big-small' && (
          <div className="absolute top-2 left-2 flex items-center space-x-2 z-20">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🎯</span>
            </div>
            <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
              HẤP DẪN HƠN
            </div>
          </div>
        )}
        
        {banner.id === 'zodiac-hour' && (
          <div className="absolute top-2 left-2 flex items-center space-x-2 z-20">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">🐱</span>
            </div>
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-xs">🕐</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
