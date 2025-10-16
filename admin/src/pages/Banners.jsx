import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { useBannersStore } from '../stores/index'

export default function Banners() {
  const [currentPage, setCurrentPage] = useState(1)
  const { banners, totalBanners, isLoading, fetchBanners, deleteBanner } = useBannersStore()

  useEffect(() => {
    fetchBanners(currentPage)
  }, [currentPage])

  const handleDelete = async (bannerId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
      await deleteBanner(bannerId)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN')
  }

  const getTypeText = (type) => {
    const texts = {
      'game': 'Game',
      'promotion': 'Khuyến mãi',
      'announcement': 'Thông báo',
      'event': 'Sự kiện'
    }
    return texts[type] || type
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Banner</h1>
          <p className="mt-1 text-sm text-gray-500">Tổng cộng {totalBanners} banner</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Thêm Banner
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Banner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vị trí</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thống kê</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {banners.map((banner) => (
              <tr key={banner._id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    {banner.image?.url && (
                      <img
                        src={banner.image.url}
                        alt={banner.title}
                        className="h-12 w-20 object-cover rounded"
                      />
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{banner.title}</div>
                      <div className="text-sm text-gray-500">{banner.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{getTypeText(banner.type)}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{banner.position}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div>{formatDate(banner.startDate)}</div>
                  <div>{formatDate(banner.endDate)}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div>Views: {banner.viewCount}</div>
                  <div>Clicks: {banner.clickCount}</div>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md"
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
    </div>
  )
}





