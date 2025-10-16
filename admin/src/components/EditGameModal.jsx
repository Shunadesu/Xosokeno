import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, DollarSign, Target } from 'lucide-react';
import { useGamesStore } from '../stores/index';
import toast from 'react-hot-toast';

const EditGameModal = ({ isOpen, onClose, game, onGameUpdated }) => {
  const { updateGame } = useGamesStore();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    minBetAmount: '',
    maxBetAmount: '',
    status: 'active'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && game) {
      setFormData({
        title: game.title || '',
        description: game.description || '',
        startTime: game.startTime ? new Date(game.startTime).toISOString().slice(0, 16) : '',
        endTime: game.endTime ? new Date(game.endTime).toISOString().slice(0, 16) : '',
        minBetAmount: game.minBetAmount?.toString() || '',
        maxBetAmount: game.maxBetAmount?.toString() || '',
        status: game.status || 'active'
      });
    }
  }, [isOpen, game]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Vui lòng nhập tên game');
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
      const updateData = {
        title: formData.title,
        description: formData.description,
        startTime: new Date(formData.startTime),
        endTime: new Date(formData.endTime),
        minBetAmount: parseInt(formData.minBetAmount),
        maxBetAmount: parseInt(formData.maxBetAmount),
        status: formData.status
      };

      const result = await updateGame(game._id, updateData);
      
      if (result.success) {
        toast.success('Cập nhật game thành công!');
        onGameUpdated(result.data);
        onClose();
      }
    } catch (error) {
      console.error('Error updating game:', error);
      toast.error('Không thể cập nhật game');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !game) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Chỉnh sửa Game</h2>
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
                placeholder="1000"
                min="1"
                required
              />
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
                min="1"
                required
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái *
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="pending">Chờ bắt đầu</option>
              <option value="active">Đang hoạt động</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
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
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGameModal;



