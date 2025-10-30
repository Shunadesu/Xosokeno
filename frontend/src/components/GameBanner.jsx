import { Play } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGamesStore, useAuthStore } from '../stores/index'
import axios from 'axios'

export default function GameBanner({ banner }) {
  const navigate = useNavigate()
  const { activeGames, fetchActiveGames } = useGamesStore()
  const { isAuthenticated } = useAuthStore()
  const [showLoginModal, setShowLoginModal] = useState(false)

  const handleJoin = async () => {
    // Check if user is authenticated for betting
    if (!isAuthenticated) {
      setShowLoginModal(true)
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-4 hover:shadow-xl transition-all duration-300">
      {/* Top image */}
      <div
        className="w-full"
        style={{
          background: banner.background,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: 200
        }}
      />

      {/* Bottom content */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 pr-3">
            <h2 className={`text-lg font-bold ${banner.textColor || 'text-gray-900'} mb-1`}>
              {banner.title}
            </h2>
            <p className="text-sm text-gray-600">{banner.subtitle}</p>
          </div>

          <div className="text-right">
            <div className={`text-xs font-semibold ${banner.textColor || 'text-gray-700'} mb-2`}>
              {banner.logo}
            </div>
            <button
              onClick={handleJoin}
              className="bg-primary-600 text-white px-3 py-2 rounded-full text-sm font-medium hover:bg-primary-700 transition-colors inline-flex items-center space-x-1"
            >
              <Play className="h-4 w-4" />
              <span>Tham gia</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-start gap-2 lg:gap-0 lg:items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {(banner.features || []).map((feature, index) => {
              // Check if feature is a long text like "big-small", "even-odd"
              const isLongText = feature.includes('-') || feature.length > 5;
              
              return (
                <div
                  key={index}
                  className={`bg-blue-100 flex items-center justify-center text-gray-700 text-xs font-bold ${
                    isLongText
                      ? 'px-3 py-1 rounded-md'
                      : 'w-8 h-8 rounded-full'
                  }`}
                >
                  {feature}
                </div>
              );
            })}
          </div>

          <div className="text-xs text-gray-600 bg-white/90 rounded-lg p-2">
            {banner.description}
          </div>
        </div>
      </div>

      {/* Login Required Modal (inside root) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setShowLoginModal(false)}
          />
          <div className="relative z-10 w-[90%] max-w-sm bg-white rounded-xl shadow-2xl p-5 transform transition-all duration-200 ease-out">
            <div className="text-center">
              <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-600">🔒</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Cần đăng nhập</h3>
              <p className="text-sm text-gray-600 mb-4">Bạn cần đăng nhập để tham gia chơi game.</p>
            </div>
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowLoginModal(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
              >
                Để sau
              </button>
              <button
                onClick={() => navigate('/login', { state: { from: { pathname: '/' } } })}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700"
              >
                Đăng nhập
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
