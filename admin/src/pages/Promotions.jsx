import { useState, useEffect } from 'react'
import { ToggleLeft, ToggleRight, Eye } from 'lucide-react'
import { usePromotionsStore } from '../stores/index'

export default function Promotions() {
  const [currentPage, setCurrentPage] = useState(1)
  const { promotions, totalPromotions, isLoading, fetchPromotions, updatePromotion } = usePromotionsStore()

  useEffect(() => {
    fetchPromotions(currentPage)
  }, [currentPage])

  const handleToggleStatus = async (promotion) => {
    const newStatus = !promotion.isActive
    const action = newStatus ? 'kích hoạt' : 'tắt'
    
    if (window.confirm(`Bạn có chắc chắn muốn ${action} khuyến mãi này?`)) {
      await updatePromotion(promotion._id, { isActive: newStatus })
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN')
  }

  const getTypeText = (type) => {
    const texts = {
      'first_deposit': 'Nạp tiền lần đầu',
      'daily': 'Hàng ngày',
      'weekly': 'Hàng tuần',
      'monthly': 'Hàng tháng',
      'special': 'Đặc biệt',
      'event': 'Sự kiện',
      'referral': 'Giới thiệu'
    }
    return texts[type] || type
  }

  const getStatusBadge = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800'
      : 'bg-red-100 text-red-800'
  }

  const getStatusText = (isActive) => {
    return isActive ? 'Đang hoạt động' : 'Đã tắt'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Khuyến mãi</h1>
          <p className="mt-1 text-sm text-gray-500">Tổng cộng {totalPromotions} khuyến mãi</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khuyến mãi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phần thưởng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điều kiện</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sử dụng</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {promotions.length === 0 && !isLoading ? (
              <tr>
                <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                  Không có khuyến mãi nào
                </td>
              </tr>
            ) : (
              promotions.map((promotion) => (
                <tr key={promotion._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{promotion.name}</div>
                    <div className="text-sm text-gray-500">{promotion.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{getTypeText(promotion.type)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="font-medium">
                      {promotion.reward.type === 'percentage' 
                        ? `${promotion.reward.value}%`
                        : formatCurrency(promotion.reward.value)
                      }
                    </div>
                    {promotion.reward.maxReward && (
                      <div className="text-xs text-gray-400">
                        Tối đa: {formatCurrency(promotion.reward.maxReward)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>Nạp: {formatCurrency(promotion.condition.minAmount)} - {formatCurrency(promotion.condition.maxAmount)}</div>
                    <div className="text-xs text-gray-400">
                      Mỗi user: {promotion.maxUsagePerUser} lần
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(promotion.isActive)}`}>
                      {getStatusText(promotion.isActive)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {promotion.currentUsage}/{promotion.maxUsage === -1 ? '∞' : promotion.maxUsage}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(promotion)}
                        className={`p-2 rounded-md ${
                          promotion.isActive 
                            ? 'text-red-600 hover:bg-red-50' 
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={promotion.isActive ? 'Tắt khuyến mãi' : 'Bật khuyến mãi'}
                      >
                        {promotion.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  )
}



