import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { useQRCodesStore } from '../stores/index'

export default function QRCodes() {
  const [currentPage, setCurrentPage] = useState(1)
  const { qrCodes, totalQRCodes, isLoading, fetchQRCodes, deleteQRCode } = useQRCodesStore()

  useEffect(() => {
    fetchQRCodes(currentPage)
  }, [currentPage])

  const handleDelete = async (qrCodeId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa QR code này?')) {
      await deleteQRCode(qrCodeId)
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý QR Code</h1>
          <p className="mt-1 text-sm text-gray-500">Tổng cộng {totalQRCodes} QR code</p>
        </div>
        <button className="btn btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          Thêm QR Code
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">QR Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngân hàng</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sử dụng</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {qrCodes.map((qrCode) => (
              <tr key={qrCode._id}>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{qrCode.name}</div>
                  <div className="text-sm text-gray-500">{qrCode.accountNumber}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{qrCode.bankName}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {formatCurrency(qrCode.minAmount)} - {formatCurrency(qrCode.maxAmount)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{qrCode.usageCount} lần</td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-md">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(qrCode._id)}
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





