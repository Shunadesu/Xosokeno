import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  QrCode,
  DollarSign,
  Calendar,
  User
} from 'lucide-react'
import { useQRCodeStore } from '../stores/index'
import CreateEditQRCodeModal from '../components/CreateEditQRCodeModal'
import toast from 'react-hot-toast'

export default function QRCode() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedQRCode, setSelectedQRCode] = useState(null)
  
  const { 
    qrCodes, 
    totalQRCodes, 
    isLoading, 
    fetchQRCodes, 
    createQRCode, 
    updateQRCode, 
    deleteQRCode
  } = useQRCodeStore()

  useEffect(() => {
    fetchQRCodes(currentPage, {
      search: searchTerm,
      status: statusFilter
    })
  }, [currentPage, searchTerm, statusFilter])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value)
    setCurrentPage(1)
  }

  const handleCreateQRCode = () => {
    setSelectedQRCode(null)
    setIsCreateModalOpen(true)
  }

  const handleEditQRCode = (qrCode) => {
    setSelectedQRCode(qrCode)
    setIsEditModalOpen(true)
  }

  const handleDeleteQRCode = async (qrCodeId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa QR code này?')) {
      await deleteQRCode(qrCodeId)
    }
  }

  const handleQRCodeCreated = (newQRCode) => {
    // Refresh QR codes list
    fetchQRCodes(currentPage, {
      search: searchTerm,
      status: statusFilter
    })
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN')
  }

  const getStatusBadge = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-red-100 text-red-800',
      'maintenance': 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status) => {
    const texts = {
      'active': 'Hoạt động',
      'inactive': 'Không hoạt động',
      'maintenance': 'Bảo trì'
    }
    return texts[status] || status
  }

  const getTypeText = (type) => {
    const texts = {
      'bank_transfer': 'Chuyển khoản ngân hàng',
      'momo': 'Ví MoMo',
      'zalo_pay': 'Ví ZaloPay',
      'viettel_pay': 'Ví ViettelPay'
    }
    return texts[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý QR Code</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tổng cộng {totalQRCodes} QR code
          </p>
        </div>
        <button 
          onClick={handleCreateQRCode}
          className="btn btn-primary btn-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Thêm QR Code
        </button>
      </div>

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
                placeholder="Tên, số tài khoản..."
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearch}
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
              onChange={handleStatusFilter}
            >
              <option value="">Tất cả</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          </div>

          <div className="flex items-end">
            <button className="w-full btn btn-primary btn-md">
              <Filter className="h-4 w-4 mr-2" />
              Lọc
            </button>
          </div>
        </div>
      </div>

      {/* QR Codes Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QR Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thông tin
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
              {qrCodes.map((qrCode) => (
                <tr key={qrCode._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {qrCode.qrImage?.url ? (
                          <img 
                            className="h-12 w-12 rounded-lg object-cover" 
                            src={qrCode.qrImage.url} 
                            alt="QR Code"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <QrCode className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {qrCode.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {getTypeText(qrCode.type)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-400" />
                        {qrCode.accountNumber}
                      </div>
                      <div className="flex items-center mt-1">
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        {qrCode.accountName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(qrCode.status || 'active')}`}>
                      {getStatusText(qrCode.status || 'active')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(qrCode.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditQRCode(qrCode)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQRCode(qrCode._id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalQRCodes > 0 && (
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
                disabled={currentPage * 20 >= totalQRCodes}
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
                    {Math.min(currentPage * 20, totalQRCodes)}
                  </span>
                  {' '}trong tổng số{' '}
                  <span className="font-medium">{totalQRCodes}</span> kết quả
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
                    disabled={currentPage * 20 >= totalQRCodes}
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

      {/* Create/Edit QR Code Modal */}
      {(isCreateModalOpen || isEditModalOpen) && (
        <CreateEditQRCodeModal
          isOpen={isCreateModalOpen || isEditModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false)
            setIsEditModalOpen(false)
            setSelectedQRCode(null)
          }}
          onQRCodeCreated={handleQRCodeCreated}
          qrCode={selectedQRCode}
          isEdit={isEditModalOpen}
        />
      )}
    </div>
  )
}
