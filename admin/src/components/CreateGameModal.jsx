import React, { useState } from 'react';
import { X, Calendar, Clock, DollarSign, Gamepad2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateGameModal = ({ isOpen, onClose, onGameCreated }) => {
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    minBetAmount: '',
    maxBetAmount: '',
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);

  // No need to fetch templates since we have predefined game types

  // Template change handler removed since we use predefined game types

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedTemplate) {
      toast.error('Vui lòng chọn loại game');
      return;
    }

    if (!formData.startTime || !formData.endTime) {
      toast.error('Vui lòng nhập thời gian bắt đầu và kết thúc');
      return;
    }

    if (parseInt(formData.minBetAmount) >= parseInt(formData.maxBetAmount)) {
      toast.error('Số tiền cược tối thiểu phải nhỏ hơn số tiền cược tối đa');
      return;
    }

    setIsLoading(true);
    try {
      // Determine game type and set appropriate payout rates
      let payoutRates = new Map();
      let gameType = selectedTemplate;
      
      if (selectedTemplate === 'keno') {
        // Keno payout rates based on matched numbers
        payoutRates = new Map([
          ['1', 1.0], ['2', 2.0], ['3', 3.0], ['4', 4.0], ['5', 5.0],
          ['6', 6.0], ['7', 7.0], ['8', 8.0], ['9', 9.0], ['10', 10.0],
          ['11', 11.0], ['12', 12.0], ['13', 13.0], ['14', 14.0], ['15', 15.0],
          ['16', 16.0], ['17', 17.0], ['18', 18.0], ['19', 19.0], ['20', 20.0]
        ]);
      } else if (selectedTemplate === 'big-small') {
        // Big/Small payout rates (1.95x for both)
        payoutRates = new Map([
          ['big', 1.95],
          ['small', 1.95]
        ]);
      } else if (selectedTemplate === 'even-odd') {
        // Even/Odd payout rates (1.95x for both)
        payoutRates = new Map([
          ['even', 1.95],
          ['odd', 1.95]
        ]);
      }

      const gameData = {
        title: formData.title,
        description: formData.description,
        type: gameType,
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        minBetAmount: parseInt(formData.minBetAmount),
        maxBetAmount: parseInt(formData.maxBetAmount),
        payoutRates: payoutRates,
        status: 'pending'
      };

      const response = await axios.post('/api/games', gameData);
      
      toast.success(`Tạo game ${gameType.toUpperCase()} thành công!`);
      onGameCreated(response.data.data);
      onClose();
      
      // Reset form
      setSelectedTemplate('');
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        minBetAmount: '',
        maxBetAmount: '',
        isActive: true
      });
    } catch (error) {
      console.error('Error creating game:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo game');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Tạo Game Mới</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Guide */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">📋 Hướng dẫn nhanh</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <p>• <strong>KENO:</strong> User chọn 1-20 số, trả thưởng theo số trúng (1x-20x)</p>
              <p>• <strong>LỚN/NHỎ:</strong> Dự đoán tổng 20 số ≥810 (Lớn) hoặc ≤810 (Nhỏ), trả 1.95x</p>
              <p>• <strong>CHẴN/LẺ:</strong> Dự đoán tổng 20 số chẵn hoặc lẻ, trả 1.95x</p>
              <p>• <strong>Thời gian:</strong> Khuyến nghị 5-10 phút cho mỗi game</p>
            </div>
          </div>
          {/* Game Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại Game *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { type: 'keno', title: 'KENO XỔ SỐ TỰ CHỌN', desc: 'Chọn 1-20 số từ 1-80', icon: '🎯' },
                { type: 'big-small', title: 'LỚN/NHỎ', desc: 'Dự đoán tổng 20 số', icon: '📊' },
                { type: 'even-odd', title: 'CHẴN/LẺ', desc: 'Dự đoán tổng chẵn/lẻ', icon: '⚖️' }
              ].map((gameType) => (
                <button
                  key={gameType.type}
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(gameType.type);
                    setFormData(prev => ({
                      ...prev,
                      title: gameType.title,
                      description: gameType.desc,
                      minBetAmount: '10000',
                      maxBetAmount: '1000000'
                    }));
                  }}
                  className={`p-4 border-2 rounded-lg text-left transition-all ${
                    selectedTemplate === gameType.type
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-2">{gameType.icon}</div>
                  <div className="font-semibold text-sm">{gameType.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{gameType.desc}</div>
                </button>
              ))}
            </div>
          </div>


          {/* Game Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên Game *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập tên game"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập mô tả game"
            />
          </div>

          {/* Time Range */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Thời gian Game</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const startTime = now.toISOString().slice(0, 16);
                    const endTime = new Date(now.getTime() + 5 * 60 * 1000).toISOString().slice(0, 16); // +5 minutes
                    setFormData(prev => ({
                      ...prev,
                      startTime,
                      endTime
                    }));
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Bây giờ + 5 phút
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const startTime = now.toISOString().slice(0, 16);
                    const endTime = new Date(now.getTime() + 10 * 60 * 1000).toISOString().slice(0, 16); // +10 minutes
                    setFormData(prev => ({
                      ...prev,
                      startTime,
                      endTime
                    }));
                  }}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  Bây giờ + 10 phút
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    const startTime = new Date(now.getTime() + 1 * 60 * 1000).toISOString().slice(0, 16); // +1 minute
                    const endTime = new Date(now.getTime() + 6 * 60 * 1000).toISOString().slice(0, 16); // +6 minutes
                    setFormData(prev => ({
                      ...prev,
                      startTime,
                      endTime
                    }));
                  }}
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                >
                  +1 phút + 5 phút
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Thời gian bắt đầu *
                </label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Thời gian kết thúc *
                </label>
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.startTime) {
                        const startTime = new Date(formData.startTime);
                        const endTime = new Date(startTime.getTime() + 5 * 60 * 1000); // +5 minutes
                        setFormData(prev => ({
                          ...prev,
                          endTime: endTime.toISOString().slice(0, 16)
                        }));
                      }
                    }}
                    className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    title="Thêm 5 phút từ thời gian bắt đầu"
                  >
                    +5m
                  </button>
                </div>
              </div>
            </div>
            
            {/* Duration Info */}
            {formData.startTime && formData.endTime && (
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm text-blue-800">
                  <strong>Thời gian diễn ra:</strong> {(() => {
                    const start = new Date(formData.startTime);
                    const end = new Date(formData.endTime);
                    const duration = Math.round((end - start) / (1000 * 60)); // minutes
                    return `${duration} phút`;
                  })()}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Bắt đầu: {new Date(formData.startTime).toLocaleString('vi-VN')} | 
                  Kết thúc: {new Date(formData.endTime).toLocaleString('vi-VN')}
                </div>
              </div>
            )}
          </div>

          {/* Bet Amounts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Số tiền cược</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      minBetAmount: '10000',
                      maxBetAmount: '1000000'
                    }));
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                >
                  Cơ bản (10K-1M)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      minBetAmount: '50000',
                      maxBetAmount: '5000000'
                    }));
                  }}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                >
                  Cao cấp (50K-5M)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      minBetAmount: '100000',
                      maxBetAmount: '10000000'
                    }));
                  }}
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
                >
                  VIP (100K-10M)
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Số tiền cược tối thiểu (VNĐ) *
                </label>
                <input
                  type="number"
                  name="minBetAmount"
                  value={formData.minBetAmount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10000"
                  min="1000"
                  step="1000"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tối thiểu: 1,000 VNĐ
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Số tiền cược tối đa (VNĐ) *
                </label>
                <input
                  type="number"
                  name="maxBetAmount"
                  value={formData.maxBetAmount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1000000"
                  min="1000"
                  step="1000"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tối đa: 100,000,000 VNĐ
                </p>
              </div>
            </div>
            
            {/* Bet Range Info */}
            {formData.minBetAmount && formData.maxBetAmount && (
              <div className="bg-green-50 p-3 rounded-md">
                <div className="text-sm text-green-800">
                  <strong>Khoảng cược:</strong> {new Intl.NumberFormat('vi-VN').format(formData.minBetAmount)} - {new Intl.NumberFormat('vi-VN').format(formData.maxBetAmount)} VNĐ
                </div>
                <div className="text-xs text-green-600 mt-1">
                  Tỷ lệ: 1:{Math.round(formData.maxBetAmount / formData.minBetAmount)} (tối đa gấp {Math.round(formData.maxBetAmount / formData.minBetAmount)} lần tối thiểu)
                </div>
              </div>
            )}
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
              Kích hoạt game ngay sau khi tạo
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Đang tạo...' : 'Tạo Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGameModal;



