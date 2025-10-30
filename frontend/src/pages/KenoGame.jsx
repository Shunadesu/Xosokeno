import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, Trophy, Users } from 'lucide-react'
import NumberPicker from '../components/NumberPicker'
import BetSlip from '../components/BetSlip'
import GameTimer from '../components/GameTimer'
import { useGamesStore, useBetsStore } from '../stores/index'

export default function KenoGame() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const [selectedNumbers, setSelectedNumbers] = useState([])
  
  const { currentGame, fetchGameById, setCurrentGame } = useGamesStore()
  const { betSlip, updateBetSlip, clearBetSlip, bets, fetchUserBets } = useBetsStore()

  useEffect(() => {
    if (gameId) {
      console.log('🔄 Fetching game data for gameId:', gameId)
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
      console.log('🎮 Current game data:', {
        id: currentGame._id,
        title: currentGame.title,
        status: currentGame.status,
        result: currentGame.result,
        hasResult: currentGame.result && currentGame.result.length > 0
      })
      updateBetSlip({ gameId: currentGame._id, betType: 'keno' })
    }
  }, [currentGame, updateBetSlip])

  const handleNumberSelect = (number) => {
    setSelectedNumbers(betSlip.numbers)
  }

  const handlePlaceBet = (bet) => {
    // Refresh game data after placing bet
    if (currentGame) {
      fetchGameById(currentGame._id)
    }
  }

  const handleTimeUp = () => {
    // Refresh game data when time is up
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

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN')
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
          
          {/* Game Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-50 rounded-lg p-3">
              <Users className="h-5 w-5 text-gray-500 mx-auto mb-1" />
              <div className="text-sm text-gray-600">Người chơi</div>
              <div className="font-semibold text-gray-900">{currentGame.totalBets || 0}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <Trophy className="h-5 w-5 text-yellow-500 mx-auto mb-1" />
              <div className="text-sm text-gray-600">Tổng cược</div>
              <div className="font-semibold text-gray-900">{formatCurrency(currentGame.totalAmount || 0)}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="h-5 w-5 bg-green-500 rounded-full mx-auto mb-1"></div>
              <div className="text-sm text-gray-600">Tổng thưởng</div>
              <div className="font-semibold text-gray-900">{formatCurrency(currentGame.totalWinnings || 0)}</div>
            </div>
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
            
            {/* Game Analysis for Keno */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h4 className="text-md font-semibold text-gray-800 mb-3 text-center">Phân tích kết quả Keno</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <div className="bg-white rounded-lg p-3">
                  <div className="text-sm text-gray-600">Số lượng kết quả</div>
                  <div className="text-xl font-bold text-gray-900">{currentGame.result.length} số</div>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <div className="text-sm text-gray-600">Tổng 20 số</div>
                  <div className="text-xl font-bold text-gray-900">
                    {currentGame.result.reduce((sum, num) => sum + num, 0)}
                  </div>
                </div>
              </div>
            </div>
            
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
              
              // Debug: Show all bet game IDs
              bets.forEach((bet, index) => {
                console.log(`🎲 Bet ${index + 1}:`, {
                  betId: bet._id,
                  gameId: bet.gameId,
                  betType: bet.betType,
                  amount: bet.amount,
                  status: bet.status,
                  gameIdMatch: bet.gameId === currentGame._id
                });
              });
              
              const userBets = bets.filter(bet => bet.gameId === currentGame._id);
              console.log('🎲 User bets for this game:', userBets);
              
              if (userBets.length === 0) {
                return (
                  <div className="text-center py-4 text-gray-500">
                    <p>Bạn chưa đặt cược cho game này</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Total bets: {bets.length} | Game ID: {currentGame._id}
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
                            Cược {bet.betType === 'keno' ? 'Keno' : bet.betType}
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
                      
                      {bet.betType === 'keno' && bet.numbers && bet.numbers.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs text-gray-500 mb-1">Số đã chọn:</div>
                          <div className="flex flex-wrap gap-1">
                            {bet.numbers.map((number, index) => {
                              const isMatched = currentGame.result.includes(number);
                              return (
                                <span
                                  key={index}
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                    isMatched 
                                      ? 'bg-green-500 text-white' 
                                      : 'bg-gray-200 text-gray-700'
                                  }`}
                                >
                                  {number}
                                </span>
                              );
                            })}
                          </div>
                          {bet.matchedCount > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              Trúng {bet.matchedCount} số
                            </div>
                          )}
                        </div>
                      )}
                      
                      {['big', 'small', 'even', 'odd'].includes(bet.betType) && (
                        <div className="text-xs text-gray-500">
                          Loại cược: {bet.betType === 'big' ? 'Lớn' : 
                                     bet.betType === 'small' ? 'Nhỏ' :
                                     bet.betType === 'even' ? 'Chẵn' : 'Lẻ'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {/* Only show betting options if game is active */}
        {currentGame.status === 'active' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Number Picker */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Chọn số (1-80)</h3>
                    <p className="text-sm text-gray-600">
                      Chọn từ 1 đến 20 số. Tỷ lệ trả thưởng tăng theo số lượng số trúng.
                    </p>
                  </div>
                  
                  <NumberPicker
                    maxNumbers={20}
                    selectedNumbers={betSlip.numbers}
                    onNumberSelect={handleNumberSelect}
                    disabled={currentGame.status !== 'active'}
                  />
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

            {/* Payout Table */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bảng tỷ lệ trả thưởng</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((count) => {
                  // Handle both Map and object formats
                  let rate = 0;
                  if (currentGame.payoutRates) {
                    if (currentGame.payoutRates instanceof Map) {
                      rate = currentGame.payoutRates.get(count.toString()) || 0;
                    } else if (typeof currentGame.payoutRates === 'object') {
                      rate = currentGame.payoutRates[count.toString()] || 0;
                    }
                  }
                  return (
                    <div key={count} className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">{count} số</div>
                      <div className="font-bold text-primary-600">{rate}x</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}


