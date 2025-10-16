import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  UserCheck,
  UserX,
  DollarSign,
  Image,
  X
} from 'lucide-react'
import { useUsersStore } from '../stores/index'
import axios from 'axios'

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDeposits, setUserDeposits] = useState([])
  
  const { 
    users, 
    totalUsers, 
    isLoading, 
    fetchUsers, 
    updateUser, 
    deleteUser 
  } = useUsersStore()

  useEffect(() => {
    const filters = {}
    if (searchTerm) filters.search = searchTerm
    if (roleFilter) filters.role = roleFilter
    if (statusFilter) filters.isActive = statusFilter === 'true'
    
    console.log('Fetching users with filters:', filters)
    fetchUsers(currentPage, filters)
  }, [currentPage, searchTerm, roleFilter, statusFilter])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value)
    setCurrentPage(1)
  }

  const handleToggleStatus = async (user) => {
    await updateUser(user._id, { isActive: !user.isActive })
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      await deleteUser(userId)
    }
  }

  const handleViewReceipts = async (user) => {
    try {
      console.log('Opening receipts modal for user:', user)
      setSelectedUser(user)
      setShowReceiptModal(true)
      
      // Fetch user deposits using axios
      const response = await axios.get(`/api/deposits?userId=${user._id}`)
      console.log('Deposits response:', response.data)
      
      if (response.data.success) {
        setUserDeposits(response.data.data)
      } else {
        console.error('Failed to fetch deposits:', response.data.message)
        setUserDeposits([])
      }
    } catch (error) {
      console.error('Error fetching deposits:', error)
      setUserDeposits([])
    }
  }

  // Test function to open modal
  const testModal = () => {
    console.log('Testing modal...')
    setSelectedUser({ _id: 'test', fullName: 'Test User' })
    setShowReceiptModal(true)
    setUserDeposits([])
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN')
  }

  const getRoleBadge = (role) => {
    const colors = {
      'super_admin': 'bg-red-100 text-red-800',
      'admin': 'bg-blue-100 text-blue-800',
      'user': 'bg-green-100 text-green-800'
    }
    return colors[role] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  // Debug state
  console.log('showReceiptModal:', showReceiptModal)
  console.log('selectedUser:', selectedUser)
  console.log('userDeposits:', userDeposits)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý người dùng</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tổng cộng {totalUsers} người dùng
          </p>
        </div>
        <button 
          onClick={testModal}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Test Modal
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tên, email, số điện thoại..."
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vai trò
            </label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={roleFilter}
              onChange={handleRoleFilter}
            >
              <option value="">Tất cả</option>
              <option value="user">Người dùng</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
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
              <option value="true">Hoạt động</option>
              <option value="false">Không hoạt động</option>
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

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người dùng
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vai trò
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Số dư
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
              {users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {user.fullName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.phone}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                      {user.role === 'super_admin' ? 'Super Admin' : 
                       user.role === 'admin' ? 'Admin' : 'Người dùng'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(user.balance || 0)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.isActive)}`}>
                      {user.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={`p-2 rounded-md ${
                          user.isActive 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={user.isActive ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                      >
                        {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => {
                          console.log('Button clicked for user:', user)
                          handleViewReceipts(user)
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        title="Xem biên lai nạp tiền"
                      >
                        <Image className="h-4 w-4" />
                      </button>
                      <button
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      {user.role !== 'super_admin' && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          title="Xóa"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalUsers > 0 && (
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
                disabled={currentPage * 20 >= totalUsers}
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
                    {Math.min(currentPage * 20, totalUsers)}
                  </span>
                  {' '}trong tổng số{' '}
                  <span className="font-medium">{totalUsers}</span> kết quả
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
                    disabled={currentPage * 20 >= totalUsers}
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
      {showReceiptModal && (
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
                Biên lai nạp tiền - {selectedUser?.fullName || 'Unknown User'}
              </h2>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {userDeposits.length === 0 ? (
                <div className="text-center py-8">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Người dùng chưa có giao dịch nạp tiền nào</p>
                  <p className="text-sm text-gray-400 mt-2">
                    User ID: {selectedUser?._id}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userDeposits.map((deposit) => (
                    <div key={deposit._id} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">Thông tin giao dịch</h3>
                          <p className="text-sm text-gray-600">Số tiền: {formatCurrency(deposit.amount)}</p>
                          <p className="text-sm text-gray-600">Phương thức: {deposit.method}</p>
                          <p className="text-sm text-gray-600">
                            Trạng thái: 
                            <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                              deposit.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                              deposit.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {deposit.status === 'confirmed' ? 'Đã xác nhận' :
                               deposit.status === 'pending' ? 'Chờ xử lý' : 'Đã từ chối'}
                            </span>
                          </p>
                          <p className="text-sm text-gray-600">
                            Ngày tạo: {new Date(deposit.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900">Ghi chú</h3>
                          <p className="text-sm text-gray-600">{deposit.note || 'Không có ghi chú'}</p>
                        </div>
                        
                        <div>
                          <h3 className="font-semibold text-gray-900">Ảnh biên lai</h3>
                          {deposit.receiptImage ? (
                            <div className="mt-2">
                              <img
                                src={deposit.receiptImage}
                                alt="Biên lai"
                                className="w-full h-32 object-cover rounded border cursor-pointer hover:opacity-80"
                                onClick={() => window.open(deposit.receiptImage, '_blank')}
                              />
                              <p className="text-xs text-gray-500 mt-1">Click để xem ảnh gốc</p>
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500">Không có ảnh biên lai</p>
                          )}
                        </div>
                      </div>
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



