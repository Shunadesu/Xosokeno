import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Target
} from 'lucide-react'
import { useGamesStore } from '../stores/index'
import CreateGameModal from '../components/CreateGameModal'
import GameDetailModal from '../components/GameDetailModal'
import EditGameModal from '../components/EditGameModal'
import InputResultModal from '../components/InputResultModal'
import toast from 'react-hot-toast'

export default function Games() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isInputResultModalOpen, setIsInputResultModalOpen] = useState(false)
  const [selectedGame, setSelectedGame] = useState(null)
  
  const { 
    games, 
    totalGames, 
    isLoading, 
    fetchGames, 
    createGame, 
    updateGame, 
    deleteGame,
    generateResult,
    processGameManually
  } = useGamesStore()

  // Fetch games on component mount
  useEffect(() => {
    fetchGames(1, {})
  }, [fetchGames])

  // Fetch games when filters change
  useEffect(() => {
    fetchGames(currentPage, {
      search: searchTerm,
      type: typeFilter,
      status: statusFilter
    })
  }, [currentPage, searchTerm, typeFilter, statusFilter, fetchGames])

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleTypeFilter = (e) => {
    setTypeFilter(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value)
    setCurrentPage(1)
  }

  const handleGenerateResult = async (gameId) => {
    if (window.confirm('Bạn có chắc chắn muốn tạo kết quả ngẫu nhiên cho game này?')) {
      await generateResult(gameId)
    }
  }

  const handleInputResult = (game) => {
    setSelectedGame(game)
    setIsInputResultModalOpen(true)
  }

  const handleDeleteGame = async (gameId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa game này?')) {
      await deleteGame(gameId)
    }
  }

  const handleGameCreated = (newGame) => {
    // Game is already added to state by createGame in store
    // No need to refresh
  }

  const handleGameUpdated = (updatedGame) => {
    // Refresh games list
    fetchGames(currentPage, {
      search: searchTerm,
      type: typeFilter,
      status: statusFilter
    })
  }

  const handleViewGame = (game) => {
    setSelectedGame(game)
    setIsDetailModalOpen(true)
  }

  const handleEditGame = (game) => {
    setSelectedGame(game)
    setIsEditModalOpen(true)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN')
  }

  const getStatusBadge = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'active': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Chờ bắt đầu',
      'active': 'Đang hoạt động',
      'completed': 'Đã hoàn thành',
      'cancelled': 'Đã hủy'
    }
    return texts[status] || status
  }

  const getTypeText = (type) => {
    const texts = {
      'keno': 'Keno tự chọn',
      'big-small': 'Big/Small',
      'even-odd': 'Even/Odd',
      'special': 'Giờ hoàng đạo',
      'anniversary': 'Kỷ niệm'
    }
    return texts[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Game</h1>
          <p className="mt-1 text-sm text-gray-500">
            Tổng cộng {totalGames || 0} game
          </p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary btn-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tạo Game
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
                placeholder="Tên game..."
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Loại game
            </label>
            <select
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              value={typeFilter}
              onChange={handleTypeFilter}
            >
              <option value="">Tất cả</option>
              <option value="keno">Keno tự chọn</option>
              <option value="big-small">Big/Small</option>
              <option value="even-odd">Even/Odd</option>
              <option value="special">Giờ hoàng đạo</option>
              <option value="anniversary">Kỷ niệm</option>
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
              <option value="pending">Chờ bắt đầu</option>
              <option value="active">Đang hoạt động</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
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

      {/* Games Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Game
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thống kê
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(games || []).map((game) => (
                <tr key={game._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {game.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {game.description}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getTypeText(game.type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Bắt đầu: {formatDate(game.startTime)}</div>
                    <div>Kết thúc: {formatDate(game.endTime)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(game.status)}`}>
                      {getStatusText(game.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>Cược: {game.totalBets || 0}</div>
                    <div>Số tiền: {new Intl.NumberFormat('vi-VN').format(game.totalAmount || 0)} VNĐ</div>
                    <div>Thắng: {new Intl.NumberFormat('vi-VN').format(game.totalWinnings || 0)} VNĐ</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                             <button
                               onClick={() => handleViewGame(game)}
                               className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                               title="Xem chi tiết"
                             >
                               <Eye className="h-4 w-4" />
                             </button>
                             <button
                               onClick={() => handleEditGame(game)}
                               className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md"
                               title="Chỉnh sửa"
                             >
                               <Edit className="h-4 w-4" />
                             </button>
                      {game.status === 'active' && (
                        <>
                          <button
                            onClick={() => handleInputResult(game)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-md"
                            title="Nhập kết quả"
                          >
                            <Target className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleGenerateResult(game._id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                            title="Tạo kết quả ngẫu nhiên"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        </>
                      )}
                      {game.status === 'completed' && game.result && game.result.length > 0 && (
                        <button
                          onClick={() => processGameManually(game._id)}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-md"
                          title="Xử lý game"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteGame(game._id)}
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
        {(totalGames || 0) > 0 && (
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
                disabled={currentPage * 20 >= (totalGames || 0)}
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
                    {Math.min(currentPage * 20, totalGames || 0)}
                  </span>
                  {' '}trong tổng số{' '}
                  <span className="font-medium">{totalGames || 0}</span> kết quả
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
                    disabled={currentPage * 20 >= (totalGames || 0)}
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

             {/* Create Game Modal */}
             <CreateGameModal
               isOpen={isCreateModalOpen}
               onClose={() => setIsCreateModalOpen(false)}
               onGameCreated={handleGameCreated}
             />

             {/* Game Detail Modal */}
             <GameDetailModal
               isOpen={isDetailModalOpen}
               onClose={() => {
                 setIsDetailModalOpen(false)
                 setSelectedGame(null)
               }}
               game={selectedGame}
             />

             {/* Edit Game Modal */}
             <EditGameModal
               isOpen={isEditModalOpen}
               onClose={() => {
                 setIsEditModalOpen(false)
                 setSelectedGame(null)
               }}
               game={selectedGame}
               onGameUpdated={handleGameUpdated}
             />

             {/* Input Result Modal */}
             <InputResultModal
               isOpen={isInputResultModalOpen}
               onClose={() => {
                 setIsInputResultModalOpen(false)
                 setSelectedGame(null)
               }}
               game={selectedGame}
             />
    </div>
  )
}
