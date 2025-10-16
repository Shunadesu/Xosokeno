import { useState } from 'react'
import { User, LogOut, Edit, Save, X } from 'lucide-react'
import { useAuthStore } from '../stores/index'

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    fullName: '',
    email: '',
    phone: ''
  })
  
  const { user, logout } = useAuthStore()

  const handleEdit = () => {
    setEditData({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone
    })
    setIsEditing(true)
  }

  const handleSave = () => {
    // TODO: Implement update profile
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="px-4 py-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{user?.fullName}</h2>
              <p className="text-gray-600">{user?.email}</p>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
              >
                <Edit className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={editData.fullName}
                  onChange={(e) => setEditData({...editData, fullName: e.target.value})}
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  value={editData.phone}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  className="input w-full"
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Lưu</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="btn btn-secondary flex-1 flex items-center justify-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Hủy</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Họ và tên
                </label>
                <div className="text-gray-900">{user?.fullName}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="text-gray-900">{user?.email}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Số điện thoại
                </label>
                <div className="text-gray-900">{user?.phone}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ngày tham gia
                </label>
                <div className="text-gray-900">
                  {new Date(user?.createdAt).toLocaleDateString('vi-VN')}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tài khoản</h3>
          
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


