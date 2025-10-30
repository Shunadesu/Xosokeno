import { useState, useEffect } from 'react'
import { X, Plus, Minus, CreditCard } from 'lucide-react'
import { useBetsStore, useWalletStore, usePromotionsStore, useAuthStore } from '../stores/index'
import toast from 'react-hot-toast'

export default function BetSlip({ game, onPlaceBet }) {
  const [amount, setAmount] = useState(10000)
  const [showPromotions, setShowPromotions] = useState(false)
  
  const { betSlip, placeBet, clearBetSlip, removeNumber } = useBetsStore()
  const { balance } = useWalletStore()
  const { user, refreshUser } = useAuthStore()
  const { getApplicablePromotions } = usePromotionsStore()
  
  // Use user balance from auth store as primary source, fallback to wallet store
  const currentBalance = user?.balance || balance

  // Refresh user data when component mounts to ensure balance is up to date
  useEffect(() => {
    if (user && !user.balance) {
      refreshUser()
    }
  }, [user, refreshUser])

  const handleAmountChange = (value) => {
    const numValue = parseInt(value.replace(/\D/g, ''))
    if (!isNaN(numValue) && numValue >= game.minBetAmount && numValue <= game.maxBetAmount) {
      setAmount(numValue)
    }
  }

  const handleQuickAmount = (value) => {
    setAmount(value)
  }

  const getPayoutRate = (key) => {
    if (!game.payoutRates) return 0;
    // Handle both Map and object formats
    if (game.payoutRates instanceof Map) {
      return game.payoutRates.get(key) || 0;
    } else if (typeof game.payoutRates === 'object') {
      return game.payoutRates[key] || 0;
    }
    return 0;
  }

  const calculatePayout = () => {
    // For Keno game, calculate based on number of selected numbers
    if (betSlip.betType === 'keno') {
      if (betSlip.numbers.length === 0) return 0
      const payoutRate = getPayoutRate(betSlip.numbers.length.toString())
      return amount * payoutRate
    }
    
    // For Big/Small/Even/Odd games, payout is 1.95x
    if (['big', 'small', 'even', 'odd'].includes(betSlip.betType)) {
      return amount * 1.95
    }
    
    return 0
  }

  const handlePlaceBet = async () => {
    // Validation for Keno game (needs numbers)
    if (betSlip.betType === 'keno' && betSlip.numbers.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 số')
      return
    }

    // Validation for Big/Small/Even/Odd games (no numbers needed)
    if (['big', 'small', 'even', 'odd'].includes(betSlip.betType) && betSlip.numbers.length === 0) {
      // For Big/Small/Even/Odd, we don't need numbers, just the bet type
      // This is handled by the game page
    }

    if (amount < game.minBetAmount || amount > game.maxBetAmount) {
      toast.error(`Số tiền cược phải từ ${game.minBetAmount.toLocaleString()} đến ${game.maxBetAmount.toLocaleString()} VNĐ`)
      return
    }

    if (amount > currentBalance) {
      toast.error('Số dư không đủ! Vui lòng nạp thêm tiền để tiếp tục đặt cược.', {
        duration: 4000,
      })
      return
    }

    const betData = {
      gameId: game._id,
      numbers: betSlip.betType === 'keno' ? betSlip.numbers : [], // Only send numbers for Keno game
      betType: betSlip.betType,
      amount: amount
    }

    const result = await placeBet(betData)
    if (result.success) {
      clearBetSlip()
      setAmount(10000)
      onPlaceBet?.(result.data)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const quickAmounts = [10000, 50000, 100000, 200000, 500000]

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Phiếu cược</h3>
          <button
            onClick={clearBetSlip}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Selected Numbers or Bet Type */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {betSlip.betType === 'keno' ? `Số đã chọn (${betSlip.numbers.length}/20)` : 'Loại cược'}
            </span>
            <span className="text-xs text-gray-500">
              {game.minBetAmount.toLocaleString()} - {game.maxBetAmount.toLocaleString()} VNĐ
            </span>
          </div>
          
          {betSlip.betType === 'keno' ? (
            betSlip.numbers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {betSlip.numbers.map((number) => (
                  <button
                    key={number}
                    onClick={() => removeNumber(number)}
                    className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium hover:bg-primary-700 transition-colors flex items-center space-x-1"
                  >
                    <span>{number}</span>
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p>Chưa chọn số nào</p>
              </div>
            )
          ) : (
            <div className="text-center py-4">
              <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                {betSlip.betType === 'big' ? 'Lớn' : 
                 betSlip.betType === 'small' ? 'Nhỏ' :
                 betSlip.betType === 'even' ? 'Chẵn' :
                 betSlip.betType === 'odd' ? 'Lẻ' : betSlip.betType}
              </span>
            </div>
          )}
        </div>

        {/* Bet Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Số tiền cược
          </label>
          <div className="relative">
            <input
              type="text"
              value={amount.toLocaleString()}
              onChange={(e) => handleAmountChange(e.target.value)}
              className="input w-full pr-20"
              placeholder="Nhập số tiền"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
              <button
                onClick={() => setAmount(Math.max(game.minBetAmount, amount - 10000))}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                onClick={() => setAmount(Math.min(game.maxBetAmount, amount + 10000))}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {/* Quick Amount Buttons */}
          <div className="flex flex-wrap gap-2 mt-2">
            {quickAmounts.map((quickAmount) => (
              <button
                key={quickAmount}
                onClick={() => handleQuickAmount(quickAmount)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  amount === quickAmount
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {quickAmount.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        {/* Payout Info */}
        {((betSlip.betType === 'keno' && betSlip.numbers.length > 0) || 
          ['big', 'small', 'even', 'odd'].includes(betSlip.betType)) && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Tỷ lệ trả thưởng:</span>
              <span className="font-medium text-gray-900">
                {betSlip.betType === 'keno' 
                  ? getPayoutRate(betSlip.numbers.length.toString())
                  : 1.95}x
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tiền thắng:</span>
              <span className="font-bold text-green-600">
                {formatCurrency(calculatePayout())}
              </span>
            </div>
          </div>
        )}

        {/* Balance */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Số dư:</span>
          <span className="font-medium text-gray-900">{formatCurrency(currentBalance)}</span>
        </div>

        {/* Place Bet Button */}
        <button
          onClick={handlePlaceBet}
          disabled={
            amount < game.minBetAmount || 
            amount > game.maxBetAmount
          }
          className="w-full btn btn-primary btn-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CreditCard className="h-5 w-5" />
          <span>Đặt cược {formatCurrency(amount)}</span>
        </button>
      </div>
    </div>
  )
}


