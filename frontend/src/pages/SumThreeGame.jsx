import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RefreshCw, TrendingUp, TrendingDown, Circle, Square } from 'lucide-react'
import NumberPad from '../components/NumberPad'
import GameTimer from '../components/GameTimer'
import { useGamesStore, useBetsStore, useAuthStore } from '../stores/index'
import toast from 'react-hot-toast'

export default function SumThreeGame() {
  const { gameId } = useParams()
  const navigate = useNavigate()
  const [selectedBetType, setSelectedBetType] = useState(null)
  const [betAmount, setBetAmount] = useState('')
  const [showNumberPad, setShowNumberPad] = useState(false)
  
  const { currentGame, fetchGameById } = useGamesStore()
  const { bets, fetchUserBets, placeBet } = useBetsStore()
  const { user, refreshUser } = useAuthStore()

  useEffect(() => {
    if (gameId) {
      fetchGameById(gameId)
      fetchUserBets()
    }
  }, [gameId, fetchGameById, fetchUserBets])

  // Auto refresh game data every 30 seconds
  useEffect(() => {
    if (!currentGame) return

    const interval = setInterval(() => {
      fetchGameById(currentGame._id)
      fetchUserBets()
    }, 30000)

    return () => clearInterval(interval)
  }, [currentGame, fetchGameById, fetchUserBets])

  const handleBetTypeClick = (betType) => {
    if (currentGame.status !== 'active') return
    setSelectedBetType(betType)
    setShowNumberPad(true)
    if (!betAmount) {
      setBetAmount('10000')
    }
  }

  const handleAmountChange = (value) => {
    setBetAmount(value)
  }

  const handlePlaceBet = async () => {
    if (!selectedBetType || !betAmount) {
      toast.error('Vui lòng chọn loại cược và nhập số tiền')
      return
    }

    const amount = parseInt(betAmount.replace(/\D/g, '')) || 0
    
    if (amount < (currentGame.minBetAmount || 10000)) {
      toast.error(`Số tiền tối thiểu: ${new Intl.NumberFormat('vi-VN').format(currentGame.minBetAmount || 10000)} ₫`)
      return
    }

    if (amount > (currentGame.maxBetAmount || 1000000)) {
      toast.error(`Số tiền tối đa: ${new Intl.NumberFormat('vi-VN').format(currentGame.maxBetAmount || 1000000)} ₫`)
      return
    }

    if (user?.balance < amount) {
      toast.error('Số dư không đủ! Vui lòng nạp thêm tiền.')
      return
    }

    try {
      await placeBet({
        gameId: currentGame._id,
        numbers: [],
        betType: selectedBetType,
        amount
      })

      toast.success('Đặt cược thành công!')
      setSelectedBetType(null)
      setBetAmount('')
      setShowNumberPad(false)
      
      await Promise.all([
        fetchGameById(currentGame._id),
        fetchUserBets(),
        refreshUser()
      ])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Đặt cược thất bại')
    }
  }

  const handleCloseNumberPad = () => {
    setShowNumberPad(false)
    if (!betAmount) {
      setSelectedBetType(null)
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

  // Calculate sum-three result
  const calculateSumThreeResult = (result) => {
    if (!result || result.length !== 3) return null
    
    const sum = result[0] + result[1] + result[2]
    const isTai = sum >= 14
    const isXiu = sum <= 13
    const isChan = sum % 2 === 0
    const isLe = sum % 2 === 1
    
    return {
      sum,
      numbers: result,
      isTai,
      isXiu,
      isChan,
      isLe,
      isTaiChan: isTai && isChan,
      isTaiLe: isTai && isLe,
      isXiuChan: isXiu && isChan,
      isXiuLe: isXiu && isLe
    }
  }

  const getBetTypeLabel = (betType) => {
    const labels = {
      'tai': 'Tài',
      'xiu': 'Xỉu',
      'chan': 'Chẵn',
      'le': 'Lẻ',
      'taiChan': 'Tài chẵn',
      'taiLe': 'Tài lẻ',
      'xiuChan': 'Xỉu chẵn',
      'xiuLe': 'Xỉu lẻ'
    }
    return labels[betType] || betType
  }

  const getPayoutRate = (betType) => {
    const rates = {
      'tai': 2.0,
      'xiu': 2.0,
      'chan': 2.0,
      'le': 2.0,
      'taiChan': 4.0,
      'taiLe': 4.0,
      'xiuChan': 4.0,
      'xiuLe': 4.0
    }
    return rates[betType] || 0
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

  const resultInfo = currentGame.result?.length === 3 
    ? calculateSumThreeResult(currentGame.result) 
    : null

  const betOptions = [
    { type: 'tai', label: 'Tài', icon: TrendingUp, bgClass: 'bg-red-50', borderClass: 'border-red-500', textClass: 'text-red-700', iconClass: 'text-red-600' },
    { type: 'xiu', label: 'Xỉu', icon: TrendingDown, bgClass: 'bg-blue-50', borderClass: 'border-blue-500', textClass: 'text-blue-700', iconClass: 'text-blue-600' },
    { type: 'chan', label: 'Chẵn', icon: Circle, bgClass: 'bg-green-50', borderClass: 'border-green-500', textClass: 'text-green-700', iconClass: 'text-green-600' },
    { type: 'le', label: 'Lẻ', icon: Square, bgClass: 'bg-orange-50', borderClass: 'border-orange-500', textClass: 'text-orange-700', iconClass: 'text-orange-600' },
    { type: 'taiChan', label: 'Tài chẵn', icon: TrendingUp, bgClass: 'bg-purple-50', borderClass: 'border-purple-500', textClass: 'text-purple-700', iconClass: 'text-purple-600' },
    { type: 'taiLe', label: 'Tài lẻ', icon: TrendingUp, bgClass: 'bg-pink-50', borderClass: 'border-pink-500', textClass: 'text-pink-700', iconClass: 'text-pink-600' },
    { type: 'xiuChan', label: 'Xỉu chẵn', icon: TrendingDown, bgClass: 'bg-cyan-50', borderClass: 'border-cyan-500', textClass: 'text-cyan-700', iconClass: 'text-cyan-600' },
    { type: 'xiuLe', label: 'Xỉu lẻ', icon: TrendingDown, bgClass: 'bg-yellow-50', borderClass: 'border-yellow-500', textClass: 'text-yellow-700', iconClass: 'text-yellow-600' }
  ]

  const userBets = bets.filter(bet => 
    bet.gameId === currentGame._id && 
    ['tai', 'xiu', 'chan', 'le', 'taiChan', 'taiLe', 'xiuChan', 'xiuLe'].includes(bet.betType)
  )

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
        {resultInfo && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Kết quả game</h3>
            
            {/* Result Numbers */}
            <div className="flex justify-center gap-2 mb-4">
              {currentGame.result.map((number, index) => (
                <div
                  key={index}
                  className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold"
                >
                  {number}
                </div>
              ))}
            </div>

            {/* Sum Display */}
            <div className="bg-primary-50 rounded-lg p-4 mb-4 text-center">
              <div className="text-sm text-gray-600 mb-1">Tổng 3 số</div>
              <div className="text-4xl font-bold text-primary-700">
                {resultInfo.sum.toString().padStart(2, '0')}
              </div>
            </div>

            {/* Analysis */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-md font-semibold text-gray-800 mb-3 text-center">Phân tích kết quả</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-600 mb-1">Tài/Xỉu</div>
                  <div className={`font-bold ${resultInfo.isTai ? 'text-red-600' : 'text-blue-600'}`}>
                    {resultInfo.isTai ? 'Tài' : 'Xỉu'}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-600 mb-1">Chẵn/Lẻ</div>
                  <div className={`font-bold ${resultInfo.isChan ? 'text-green-600' : 'text-orange-600'}`}>
                    {resultInfo.isChan ? 'Chẵn' : 'Lẻ'}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-600 mb-1">Tài chẵn/Tài lẻ</div>
                  <div className={`font-bold ${resultInfo.isTaiChan ? 'text-purple-600' : resultInfo.isTaiLe ? 'text-pink-600' : 'text-gray-400'}`}>
                    {resultInfo.isTaiChan ? 'Tài chẵn' : resultInfo.isTaiLe ? 'Tài lẻ' : '-'}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-600 mb-1">Xỉu chẵn/Xỉu lẻ</div>
                  <div className={`font-bold ${resultInfo.isXiuChan ? 'text-cyan-600' : resultInfo.isXiuLe ? 'text-yellow-600' : 'text-gray-400'}`}>
                    {resultInfo.isXiuChan ? 'Xỉu chẵn' : resultInfo.isXiuLe ? 'Xỉu lẻ' : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Bet Results */}
        {userBets.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Kết quả cược của bạn</h3>
            <div className="space-y-3">
              {userBets.map((bet) => (
                <div key={bet._id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">
                        {getBetTypeLabel(bet.betType)}
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
          </div>
        )}

        {/* Betting Options */}
        {currentGame.status === 'active' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 8 Bet Options */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                  Chọn loại cược
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {betOptions.map((option) => {
                    const Icon = option.icon
                    const isSelected = selectedBetType === option.type
                    const payoutRate = getPayoutRate(option.type)
                    
                    return (
                      <button
                        key={option.type}
                        onClick={() => handleBetTypeClick(option.type)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? `${option.borderClass} ${option.bgClass}`
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <Icon className={`h-6 w-6 mx-auto mb-2 ${option.iconClass}`} />
                        <div className={`font-semibold ${isSelected ? option.textClass : 'text-gray-700'}`}>
                          {option.label}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {payoutRate}x
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Game Rules */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Luật chơi:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Kết quả là tổng 3 số (00-27)</li>
                    <li>• <strong>Tài:</strong> 14-27 | <strong>Xỉu:</strong> 00-13</li>
                    <li>• <strong>Chẵn:</strong> Tổng là số chẵn | <strong>Lẻ:</strong> Tổng là số lẻ</li>
                    <li>• Tỷ lệ Tài/Xỉu/Chẵn/Lẻ: 1x2 (ví dụ: 100k → 200k)</li>
                    <li>• Tỷ lệ Tài chẵn/Tài lẻ/Xỉu chẵn/Xỉu lẻ: 1x4 (ví dụ: 25k → 100k)</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Number Pad & Bet Slip */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
                {selectedBetType ? (
                  <>
                    <div className="text-center">
                      <div className="text-sm text-gray-500 mb-1">Loại cược</div>
                      <div className="text-lg font-bold text-primary-600">
                        {getBetTypeLabel(selectedBetType)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Tỷ lệ: {getPayoutRate(selectedBetType)}x
                      </div>
                    </div>

                    {showNumberPad && (
                      <NumberPad
                        value={betAmount}
                        onChange={handleAmountChange}
                        min={currentGame.minBetAmount || 10000}
                        max={currentGame.maxBetAmount || 1000000}
                      />
                    )}

                    <div className="space-y-2">
                      <button
                        onClick={handlePlaceBet}
                        disabled={
                          !betAmount || 
                          parseInt(betAmount.replace(/\D/g, '')) < (currentGame.minBetAmount || 10000) ||
                          parseInt(betAmount.replace(/\D/g, '')) > (currentGame.maxBetAmount || 1000000) ||
                          (user?.balance || 0) < parseInt(betAmount.replace(/\D/g, '') || 0)
                        }
                        className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Đặt cược
                      </button>
                      <button
                        onClick={handleCloseNumberPad}
                        className="w-full btn btn-secondary"
                      >
                        Hủy
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Chọn loại cược để bắt đầu
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

