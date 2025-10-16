import { useState } from 'react'
import { Save, Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Zuna Xosokeno',
    maintenanceMode: false,
    registrationEnabled: true,
    maxBetAmount: 1000000,
    minBetAmount: 1000,
    gameInterval: 5,
    specialHours: [8, 12, 18],
    specialMultiplier: 1.2
  })

  const handleSave = () => {
    // Save settings logic here
  }

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
        <p className="mt-1 text-sm text-gray-500">
          Quản lý cài đặt chung của hệ thống
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Cài đặt chung
          </h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tên trang web
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Chế độ bảo trì
              </label>
              <div className="mt-1">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    checked={settings.maintenanceMode}
                    onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-600">Kích hoạt chế độ bảo trì</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cho phép đăng ký
              </label>
              <div className="mt-1">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                    checked={settings.registrationEnabled}
                    onChange={(e) => handleChange('registrationEnabled', e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-600">Cho phép người dùng đăng ký</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Số tiền cược tối thiểu
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={settings.minBetAmount}
                onChange={(e) => handleChange('minBetAmount', parseInt(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Số tiền cược tối đa
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={settings.maxBetAmount}
                onChange={(e) => handleChange('maxBetAmount', parseInt(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Khoảng thời gian game (phút)
              </label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={settings.gameInterval}
                onChange={(e) => handleChange('gameInterval', parseInt(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Giờ hoàng đạo
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={settings.specialHours.join(', ')}
                onChange={(e) => handleChange('specialHours', e.target.value.split(',').map(h => parseInt(h.trim())))}
                placeholder="8, 12, 18"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hệ số nhân giờ hoàng đạo
              </label>
              <input
                type="number"
                step="0.1"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={settings.specialMultiplier}
                onChange={(e) => handleChange('specialMultiplier', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Save className="h-4 w-4 mr-2" />
              Lưu cài đặt
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}