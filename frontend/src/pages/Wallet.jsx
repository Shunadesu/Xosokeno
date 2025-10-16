import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, CreditCard, QrCode, History, Trophy } from 'lucide-react'
import DepositModal from '../components/DepositModal'
import { useWalletStore, useQRCodeStore, useDepositsStore, useAuthStore } from '../stores/index'

export default function Wallet() {
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const navigate = useNavigate()
  
  const { balance, fetchBalance } = useWalletStore()
  const { qrCodes, fetchQRCodes } = useQRCodeStore()
  const { deposits, fetchDeposits } = useDepositsStore()
  const { refreshUser } = useAuthStore()

  useEffect(() => {
    fetchBalance()
    fetchQRCodes()
    fetchDeposits()
    refreshUser() // Refresh user data to get latest balance
  }, [fetchBalance, fetchQRCodes, fetchDeposits, refreshUser])

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
      'confirmed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Chờ xử lý',
      'confirmed': 'Đã xác nhận',
      'rejected': 'Đã từ chối'
    }
    return texts[status] || status
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <div className="px-4 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Balance Card */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-600/90 to-primary-700/90"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Số dư tài khoản</h2>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <CreditCard className="h-6 w-6" />
              </div>
            </div>
            <div className="text-3xl font-bold">
              {formatCurrency(balance)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowDepositModal(true)}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-all duration-200 hover:shadow-md transform hover:-translate-y-1"
          >
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Plus className="h-5 w-5 text-primary-600" />
            </div>
            <span className="font-medium text-gray-900 text-sm">Nạp tiền</span>
          </button>
          
          <button
            onClick={() => setShowHistory(true)}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-all duration-200 hover:shadow-md transform hover:-translate-y-1"
          >
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <History className="h-5 w-5 text-green-600" />
            </div>
            <span className="font-medium text-gray-900 text-sm">Lịch sử</span>
          </button>
          
          <button
            onClick={() => navigate('/bet-history')}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex flex-col items-center justify-center space-y-2 hover:bg-gray-50 transition-all duration-200 hover:shadow-md transform hover:-translate-y-1"
          >
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Trophy className="h-5 w-5 text-purple-600" />
            </div>
            <span className="font-medium text-gray-900 text-sm">Cược</span>
          </button>
        </div>

        {/* Quick Deposit Options */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Phương thức nạp tiền</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {qrCodes.map((qrCode) => (
              <div key={qrCode._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <QrCode className="h-5 w-5 text-primary-600" />
                  <div>
                    <div className="font-medium text-gray-900">{qrCode.name}</div>
                    <div className="text-sm text-gray-500">{qrCode.bankName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(qrCode.minAmount)} - {formatCurrency(qrCode.maxAmount)}
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    qrCode.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {qrCode.isActive ? 'Hoạt động' : 'Tạm dừng'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Giao dịch gần đây</h3>
          
          {deposits.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>Chưa có giao dịch nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deposits.slice(0, 5).map((deposit) => (
                <div key={deposit._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">
                      Nạp tiền - {deposit.qrCodeId?.name || deposit.method}
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(deposit.createdAt)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {formatCurrency(deposit.amount)}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(deposit.status)}`}>
                      {getStatusText(deposit.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <DepositModal
          isOpen={showDepositModal}
          onClose={() => setShowDepositModal(false)}
          qrCodes={qrCodes}
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Lịch sử giao dịch</h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-96">
              {deposits.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Chưa có giao dịch nào</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deposits.map((deposit) => (
                    <div key={deposit._id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-900">
                          Nạp tiền - {deposit.qrCodeId?.name || deposit.method}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadge(deposit.status)}`}>
                          {getStatusText(deposit.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mb-1">
                        {formatDate(deposit.createdAt)}
                      </div>
                      <div className="font-medium text-gray-900">
                        {formatCurrency(deposit.amount)}
                      </div>
                      {deposit.note && (
                        <div className="text-sm text-gray-500 mt-1">
                          Ghi chú: {deposit.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
