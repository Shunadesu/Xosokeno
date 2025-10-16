import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'
import BetSlip from '../components/BetSlip'
import GameTimer from '../components/GameTimer'
import { useGamesStore, useBetsStore, useAuthStore } from '../stores/index'

export default function BigSmallGame() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const [selectedType, setSelectedType] = useState('big')
  
  const { currentGame, fetchGameById } = useGamesStore()
  const { betSlip, updateBetSlip, bets, fetchUserBets } = useBetsStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (gameId) {
      fetchGameById(gameId)
      fetchUserBets() // Fetch user bets to show results
    }
  }, [gameId, fetchGameById, fetchUserBets])

  // Auto refresh game data every 30 seconds
  useEffect(() => {
    if (!currentGame) {
      return;
    }

    const interval = setInterval(() => {
      fetchGameById(currentGame._id);
      fetchUserBets();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [currentGame, fetchGameById, fetchUserBets])

  useEffect(() => {
    if (currentGame) {
      updateBetSlip({ gameId: currentGame._id, betType: selectedType })
    }
  }, [currentGame, selectedType, updateBetSlip])

  const handleTypeSelect = (type) => {
    setSelectedType(type)
  }

  const handlePlaceBet = (bet) => {
    if (currentGame) {
      fetchGameById(currentGame._id)
    }
  }

  const handleTimeUp = () => {
    if (currentGame) {
      fetchGameById(currentGame._id)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  if (!currentGame) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="px-4 py-6">
        {/* Game Header */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Quay lại</span>
            </button>
            <button
              onClick={() => fetchGameById(currentGame._id)}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>
          
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentGame.title}</h1>
            <p className="text-gray-600">{currentGame.description}</p>
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <GameTimer
              startTime={currentGame.startTime}
              endTime={currentGame.endTime}
              gameStatus={currentGame.status}
              onTimeUp={handleTimeUp}
            />
          </div>
        </div>

        {/* Game Results */}
        {currentGame.result && currentGame.result.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">Kết quả game</h3>
              <button
                onClick={() => fetchGameById(currentGame._id)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                title="Làm mới"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
            
            {/* Result Numbers */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {currentGame.result.map((number, index) => (
                <div
                  key={index}
                  className="w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-lg font-bold"
                >
                  {number}
                </div>
              ))}
            </div>
            
            {/* Game Analysis */}
            {(() => {
              const totalSum = currentGame.result.reduce((sum, num) => sum + num, 0);
              const isEven = totalSum % 2 === 0;
              const isBig = totalSum >= 810;
              
              return (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-md font-semibold text-gray-800 mb-3 text-center">Phân tích kết quả</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-sm text-gray-600">Tổng 20 số</div>
                      <div className="text-xl font-bold text-gray-900">{totalSum}</div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-sm text-gray-600">Lớn/Nhỏ</div>
                      <div className={`text-xl font-bold ${isBig ? 'text-red-600' : 'text-blue-600'}`}>
                        {isBig ? 'Lớn (≥810)' : 'Nhỏ (≤810)'}
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-3">
                      <div className="text-sm text-gray-600">Chẵn/Lẻ</div>
                      <div className={`text-xl font-bold ${isEven ? 'text-green-600' : 'text-orange-600'}`}>
                        {isEven ? 'Chẵn' : 'Lẻ'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
            
            {/* Game Status */}
            <div className="text-center">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                currentGame.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {currentGame.status === 'completed' ? 'Đã kết thúc' : 'Đang xử lý'}
              </span>
            </div>
          </div>
        )}

        {/* User Bet Results */}
        {currentGame.result && currentGame.result.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Kết quả cược của bạn</h3>
            {(() => {
              console.log('🎯 All bets:', bets);
              console.log('🎮 Current game ID:', currentGame._id);
              
              // Debug: Show user info
              console.log('👤 Current user:', user);
              console.log('👤 User ID:', user?._id);
              
              // Debug: Show all bet game IDs
              bets.forEach((bet, index) => {
                console.log(`🎲 Bet ${index + 1}:`, {
                  betId: bet._id,
                  gameId: bet.gameId,
                  userId: bet.userId,
                  betType: bet.betType,
                  amount: bet.amount,
                  status: bet.status,
                  gameIdMatch: bet.gameId === currentGame._id,
                  userIdMatch: bet.userId === user?._id
                });
              });
              
              const userBets = bets.filter(bet => bet.gameId === currentGame._id);
              console.log('🎲 User bets for this game:', userBets);
              
              if (userBets.length === 0) {
                return (
                  <div className="text-center py-4 text-gray-500">
                    <p>Bạn chưa đặt cược cho game này</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Total bets: {bets.length} | Game ID: {currentGame._id} | User ID: {user?._id}
                    </p>
                  </div>
                );
              }
              
              return (
                <div className="space-y-3">
                  {userBets.map((bet) => (
                    <div key={bet._id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-700">
                            Cược {bet.betType === 'big' ? 'Lớn' : 
                                   bet.betType === 'small' ? 'Nhỏ' :
                                   bet.betType === 'even' ? 'Chẵn' : 'Lẻ'}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            bet.status === 'won' 
                              ? 'bg-green-100 text-green-800' 
                              : bet.status === 'lost'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {bet.status === 'won' ? 'Thắng' : 
                             bet.status === 'lost' ? 'Thua' : 'Chờ xử lý'}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatCurrency(bet.amount)}
                          </div>
                          {bet.winAmount > 0 && (
                            <div className="text-sm font-bold text-green-600">
                              +{formatCurrency(bet.winAmount)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Only show betting options if game is active */}
        {currentGame.status === 'active' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Game Options */}
            <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Chọn loại cược</h3>
              <p className="text-sm text-gray-600 mb-4 text-center">
                {currentGame.status === 'completed' 
                  ? 'Game đã kết thúc. Bạn có thể xem kết quả ở trên.'
                  : 'Chọn loại cược bạn muốn đặt.'
                }
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Big/Small */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 text-center">Lớn/Nhỏ</h4>
                  
                  <button
                    onClick={() => handleTypeSelect('big')}
                    disabled={currentGame.status !== 'active'}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      selectedType === 'big'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-300 hover:border-green-400'
                    } ${currentGame.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <div className="font-semibold">Lớn</div>
                    <div className="text-sm text-gray-600">Tổng 20 số ≥ 810</div>
                    <div className="text-sm font-medium text-green-600">Tỷ lệ: 1.95x</div>
                  </button>
                  
                  <button
                    onClick={() => handleTypeSelect('small')}
                    disabled={currentGame.status !== 'active'}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      selectedType === 'small'
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-300 hover:border-red-400'
                    } ${currentGame.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <TrendingDown className="h-8 w-8 mx-auto mb-2 text-red-600" />
                    <div className="font-semibold">Nhỏ</div>
                    <div className="text-sm text-gray-600">Tổng 20 số ≤ 810</div>
                    <div className="text-sm font-medium text-red-600">Tỷ lệ: 1.95x</div>
                  </button>
                </div>

                {/* Even/Odd */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 text-center">Chẵn/Lẻ</h4>
                  
                  <button
                    onClick={() => handleTypeSelect('even')}
                    disabled={currentGame.status !== 'active'}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      selectedType === 'even'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 hover:border-blue-400'
                    } ${currentGame.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="h-8 w-8 mx-auto mb-2 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
                    <div className="font-semibold">Chẵn</div>
                    <div className="text-sm text-gray-600">Tổng 20 số là số chẵn</div>
                    <div className="text-sm font-medium text-blue-600">Tỷ lệ: 1.95x</div>
                  </button>
                  
                  <button
                    onClick={() => handleTypeSelect('odd')}
                    disabled={currentGame.status !== 'active'}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      selectedType === 'odd'
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 hover:border-purple-400'
                    } ${currentGame.status !== 'active' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="h-8 w-8 mx-auto mb-2 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
                    <div className="font-semibold">Lẻ</div>
                    <div className="text-sm text-gray-600">Tổng 20 số là số lẻ</div>
                    <div className="text-sm font-medium text-purple-600">Tỷ lệ: 1.95x</div>
                  </button>
                </div>
              </div>

              {/* Game Rules */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Luật chơi:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Hệ thống sẽ quay 20 số từ 1-80</li>
                  <li>• <strong>Lớn:</strong> Tổng 20 số ≥ 810</li>
                  <li>• <strong>Nhỏ:</strong> Tổng 20 số ≤ 810</li>
                  <li>• <strong>Chẵn:</strong> Tổng 20 số là số chẵn</li>
                  <li>• <strong>Lẻ:</strong> Tổng 20 số là số lẻ</li>
                  <li>• Tỷ lệ trả thưởng: 1.95x</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bet Slip */}
          <div className="lg:col-span-1">
            <BetSlip
              game={currentGame}
              onPlaceBet={handlePlaceBet}
            />
          </div>
        </div>
        )}
      </div>
    </div>
  )
}


