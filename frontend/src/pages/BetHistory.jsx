import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, Clock, XCircle } from 'lucide-react'
import { useBetsStore } from '../stores/index'

export default function BetHistory() {
  const navigate = useNavigate()
  const { bets, fetchUserBets, isLoading } = useBetsStore()

  useEffect(() => {
    fetchUserBets()
  }, [fetchUserBets])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN')
  }

  const getStatusBadge = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'won': 'bg-green-100 text-green-800',
      'lost': 'bg-red-100 text-red-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Chờ kết quả',
      'won': 'Thắng',
      'lost': 'Thua',
      'cancelled': 'Đã hủy'
    }
    return texts[status] || status
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'won':
        return <Trophy className="h-4 w-4" />
      case 'lost':
        return <XCircle className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getBetTypeText = (betType) => {
    const texts = {
      'keno': 'Keno tự chọn',
      'big': 'Lớn',
      'small': 'Nhỏ',
      'even': 'Chẵn',
      'odd': 'Lẻ',
      'special': 'Đặc biệt'
    }
    return texts[betType] || betType
  }

  return (
    <div className="min-h-screen">
      
      <div className="px-2 sm:px-4 py-6 bg-white rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/wallet')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Quay lại</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Lịch sử cược</h1>
          <div></div>
        </div>

        {/* Bets List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : bets.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có cược nào</h3>
              <p className="text-gray-600">Bắt đầu đặt cược để xem lịch sử ở đây</p>
            </div>
          ) : (
            bets.map((bet) => (
              <div key={bet._id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getStatusBadge(bet.status)}`}>
                      {getStatusIcon(bet.status)}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {getBetTypeText(bet.betType)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {bet.gameId?.title || 'Game không xác định'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(bet.amount)}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(bet.status)}`}>
                      {getStatusText(bet.status)}
                    </span>
                  </div>
                </div>

                {/* Bet Details */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Số đã chọn:</div>
                    <div className="font-medium text-gray-900">
                      {bet.numbers && bet.numbers.length > 0 
                        ? bet.numbers.join(', ')
                        : 'N/A'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Tiền thắng:</div>
                    <div className={`font-medium ${
                      bet.winAmount > 0 ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {bet.winAmount > 0 ? formatCurrency(bet.winAmount) : '-'}
                    </div>
                  </div>
                </div>

                {/* Bet Slip */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                      Mã phiếu: <span className="font-mono text-gray-900">{bet.betSlip}</span>
                    </div>
                    <div className="text-gray-500">
                      {formatDate(bet.createdAt)}
                    </div>
                  </div>
                </div>

                {/* Game Result */}
                {bet.gameId?.result && bet.gameId.result.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-sm text-gray-600 mb-2">Kết quả game:</div>
                    <div className="flex flex-wrap gap-1">
                      {bet.gameId.result.map((number, index) => (
                        <div
                          key={index}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            bet.numbers && bet.numbers.includes(number)
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {number}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}


