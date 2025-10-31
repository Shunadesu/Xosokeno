import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Eye, Search, Filter, X, Image } from 'lucide-react'
import { useDepositsStore } from '../stores/index'

export default function Deposits() {
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedDeposit, setSelectedDeposit] = useState(null)
  
  const { 
    deposits, 
    pendingDeposits,
    totalDeposits, 
    isLoading, 
    fetchDeposits, 
    fetchPendingDeposits,
    confirmDeposit, 
    rejectDeposit 
  } = useDepositsStore()

  useEffect(() => {
    const filters = {}
    if (statusFilter) filters.status = statusFilter
    if (searchTerm) filters.search = searchTerm
    
    fetchDeposits(currentPage, filters)
    fetchPendingDeposits()
  }, [currentPage, statusFilter, searchTerm])

  const handleConfirm = async (depositId) => {
    if (window.confirm('Bạn có chắc chắn muốn xác nhận nạp tiền này?')) {
      await confirmDeposit(depositId)
    }
  }

  const handleReject = async (depositId) => {
    const reason = window.prompt('Nhập lý do từ chối:')
    if (reason) {
      await rejectDeposit(depositId, reason)
    }
  }

  const handleViewReceipt = (deposit) => {
    console.log('Viewing receipt for deposit:', deposit)
    setSelectedDeposit(deposit)
    setShowReceiptModal(true)
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

  const getStatusBadge = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800',
      'completed': 'bg-blue-100 text-blue-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Chờ xử lý',
      'confirmed': 'Đã xác nhận',
      'rejected': 'Đã từ chối',
      'completed': 'Hoàn thành'
    }
    return texts[status] || status
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Quản lý nạp tiền</h1>
        <p className="mt-1 text-sm text-gray-500">
          Tổng cộng {totalDeposits} giao dịch nạp tiền
        </p>
      </div>

      {/* Pending Deposits */}
      {pendingDeposits.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-4">
            Nạp tiền chờ xử lý ({pendingDeposits.length})
          </h3>
          <div className="space-y-3">
            {pendingDeposits.slice(0, 5).map((deposit) => (
              <div key={deposit._id} className="bg-white p-4 rounded-lg border border-yellow-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {deposit.userId?.fullName || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {deposit.qrCodeId?.name || deposit.method} - {formatCurrency(deposit.amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(deposit.createdAt)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleConfirm(deposit._id)}
                      className="btn btn-sm btn-primary"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Xác nhận
                    </button>
                    <button
                      onClick={() => handleReject(deposit._id)}
                      className="btn btn-sm btn-destructive"
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Từ chối
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tên người dùng, email..."
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái
            </label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xử lý</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="rejected">Đã từ chối</option>
              <option value="completed">Hoàn thành</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full btn btn-primary">
              <Filter className="h-4 w-4 mr-2" />
              Lọc
            </button>
          </div>
        </div>
      </div>

      {/* Deposits Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số tiền
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phương thức
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deposits.map((deposit) => (
                <tr key={deposit._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {deposit.userId?.fullName || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {deposit.userId?.email || 'Unknown'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(deposit.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {deposit.qrCodeId?.name || deposit.method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(deposit.status)}`}>
                      {getStatusText(deposit.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(deposit.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => handleViewReceipt(deposit)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Xem biên lai"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {deposit.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleConfirm(deposit._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReject(deposit._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalDeposits > 0 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage * 20 >= totalDeposits}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị{' '}
                  <span className="font-medium">{(currentPage - 1) * 20 + 1}</span>
                  {' '}đến{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * 20, totalDeposits)}
                  </span>
                  {' '}trong tổng số{' '}
                  <span className="font-medium">{totalDeposits}</span> kết quả
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage * 20 >= totalDeposits}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceiptModal && selectedDeposit && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowReceiptModal(false)}
        >
          <div 
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Biên lai nạp tiền - {selectedDeposit.userId?.fullName || 'Unknown User'}
              </h2>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Thông tin giao dịch */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin giao dịch</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tiền:</span>
                      <span className="font-semibold">{formatCurrency(selectedDeposit.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phương thức:</span>
                      <span className="font-semibold">{selectedDeposit.method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        selectedDeposit.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        selectedDeposit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {selectedDeposit.status === 'confirmed' ? 'Đã xác nhận' :
                         selectedDeposit.status === 'pending' ? 'Chờ xử lý' : 'Đã từ chối'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ngày tạo:</span>
                      <span className="font-semibold">{formatDate(selectedDeposit.createdAt)}</span>
                    </div>
                    {selectedDeposit.confirmedAt && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ngày xác nhận:</span>
                        <span className="font-semibold">{formatDate(selectedDeposit.confirmedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Thông tin người dùng */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin người dùng</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Họ tên:</span>
                      <span className="font-semibold">{selectedDeposit.userId?.fullName || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-semibold">{selectedDeposit.userId?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số điện thoại:</span>
                      <span className="font-semibold">{selectedDeposit.userId?.phone || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ảnh biên lai */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ảnh biên lai</h3>
                {selectedDeposit.receiptImage ? (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <img
                      src={selectedDeposit.receiptImage}
                      alt="Biên lai nạp tiền"
                      className="w-full max-w-md mx-auto rounded border cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(selectedDeposit.receiptImage, '_blank')}
                    />
                    <p className="text-center text-sm text-gray-500 mt-2">
                      Click vào ảnh để xem ảnh gốc
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-8 rounded-lg text-center">
                    <Image className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Không có ảnh biên lai</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
