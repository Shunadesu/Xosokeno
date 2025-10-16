import React from 'react';
import { X, Calendar, Clock, DollarSign, Users, Target, Trophy, BarChart3 } from 'lucide-react';

const GameDetailModal = ({ isOpen, onClose, game }) => {
  if (!isOpen || !game) return null;

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'active': 'bg-green-100 text-green-800',
      'completed': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Chờ bắt đầu',
      'active': 'Đang hoạt động',
      'completed': 'Đã hoàn thành',
      'cancelled': 'Đã hủy'
    };
    return texts[status] || status;
  };

  const getTypeText = (type) => {
    const texts = {
      'keno': 'Keno tự chọn',
      'big-small': 'Big/Small',
      'even-odd': 'Even/Odd',
      'special': 'Giờ hoàng đạo',
      'anniversary': 'Kỷ niệm'
    };
    return texts[type] || type;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Chi tiết Game</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Game Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Thông tin cơ bản</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Tên game</label>
                    <p className="text-sm text-gray-900">{game.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Loại game</label>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {getTypeText(game.type)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Trạng thái</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(game.status)}`}>
                      {getStatusText(game.status)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Mô tả</label>
                    <p className="text-sm text-gray-900">{game.description || 'Không có mô tả'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Thời gian</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Bắt đầu</label>
                      <p className="text-sm text-gray-900">{formatDate(game.startTime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Kết thúc</label>
                      <p className="text-sm text-gray-900">{formatDate(game.endTime)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Betting Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Thông tin cược</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Số tiền cược tối thiểu</label>
                    <p className="text-sm text-gray-900">{new Intl.NumberFormat('vi-VN').format(game.minBetAmount)} VNĐ</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Số tiền cược tối đa</label>
                    <p className="text-sm text-gray-900">{new Intl.NumberFormat('vi-VN').format(game.maxBetAmount)} VNĐ</p>
                  </div>
                </div>
                {game.maxNumbers && (
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-2 text-gray-400" />
                    <div>
                      <label className="block text-sm font-medium text-gray-500">Số lượng số tối đa</label>
                      <p className="text-sm text-gray-900">{game.maxNumbers}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Thống kê</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Tổng số cược</label>
                    <p className="text-sm text-gray-900">{game.totalBets || 0}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <BarChart3 className="w-4 h-4 mr-2 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Tổng số tiền cược</label>
                    <p className="text-sm text-gray-900">{new Intl.NumberFormat('vi-VN').format(game.totalAmount || 0)} VNĐ</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Trophy className="w-4 h-4 mr-2 text-gray-400" />
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Tổng số tiền thắng</label>
                    <p className="text-sm text-gray-900">{new Intl.NumberFormat('vi-VN').format(game.totalWinnings || 0)} VNĐ</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Game Results */}
          {game.result && game.result.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Kết quả game</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex flex-wrap gap-2">
                  {game.result.map((number, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white text-sm font-medium rounded-full"
                    >
                      {number}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Payout Rates */}
          {game.payoutRates && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Tỷ lệ trả thưởng</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {Object.entries(game.payoutRates).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-sm font-medium text-gray-900">{key}</div>
                      <div className="text-lg font-bold text-blue-600">{value}x</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Created Info */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <label className="block font-medium">Người tạo</label>
                <p>{game.createdBy?.fullName || 'Không xác định'}</p>
              </div>
              <div>
                <label className="block font-medium">Ngày tạo</label>
                <p>{formatDate(game.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameDetailModal;



