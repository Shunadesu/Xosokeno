import React, { useState, useEffect } from 'react';
import { X, Target, CheckCircle } from 'lucide-react';
import { useGamesStore } from '../stores/index';
import toast from 'react-hot-toast';

const InputResultModal = ({ isOpen, onClose, game }) => {
  const { updateGame } = useGamesStore();
  const [result, setResult] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen && game) {
      // Initialize with existing result or empty array
      setResult(game.result || []);
    }
  }, [isOpen, game]);

  const handleNumberChange = (index, value) => {
    const num = parseInt(value);
    if (isNaN(num) || num < 1 || num > 80) return;
    
    const newResult = [...result];
    newResult[index] = num;
    setResult(newResult);
  };

  const addNumber = () => {
    if (result.length < 20) {
      setResult([...result, '']);
    }
  };

  const removeNumber = (index) => {
    const newResult = result.filter((_, i) => i !== index);
    setResult(newResult);
  };

  const generateRandomResult = () => {
    const numbers = Array.from({ length: 80 }, (_, i) => i + 1);
    const randomResult = [];
    
    for (let i = 0; i < 20; i++) {
      const randomIndex = Math.floor(Math.random() * numbers.length);
      randomResult.push(numbers.splice(randomIndex, 1)[0]);
    }
    
    setResult(randomResult.sort((a, b) => a - b));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (result.length !== 20) {
      toast.error('Vui lòng nhập đủ 20 số');
      return;
    }

    const uniqueNumbers = [...new Set(result)];
    if (uniqueNumbers.length !== 20) {
      toast.error('Các số phải khác nhau');
      return;
    }

    const validNumbers = result.every(num => num >= 1 && num <= 80);
    if (!validNumbers) {
      toast.error('Các số phải từ 1 đến 80');
      return;
    }

    setIsLoading(true);
    
    try {
      // Update game with result
      const response = await updateGame(game._id, {
        result: result.sort((a, b) => a - b),
        status: 'completed'
      });

      if (response.success) {
        toast.success('Cập nhật kết quả game thành công!');
        onClose();
      }
    } catch (error) {
      toast.error('Cập nhật kết quả thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !game) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Nhập kết quả game</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">{game.title}</h3>
            <p className="text-sm text-gray-500">{game.description}</p>
          </div>

          {/* Game Type Info */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Thông tin game:</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">Loại:</span>
                <span className="ml-2 text-blue-900">
                  {game.type === 'keno' ? 'Keno tự chọn' : 
                   game.type === 'big-small' ? 'Big/Small' : 
                   game.type === 'even-odd' ? 'Even/Odd' : game.type}
                </span>
              </div>
              <div>
                <span className="text-blue-700">Số lượng:</span>
                <span className="ml-2 text-blue-900">20 số</span>
              </div>
            </div>
          </div>

          {/* Result Input */}
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Nhập kết quả (20 số từ 1-80):</h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={generateRandomResult}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Tạo ngẫu nhiên
                  </button>
                  <button
                    type="button"
                    onClick={addNumber}
                    disabled={result.length >= 20}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                  >
                    Thêm số
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-10 gap-2">
                {result.map((number, index) => (
                  <div key={index} className="relative">
                    <input
                      type="number"
                      min="1"
                      max="80"
                      value={number}
                      onChange={(e) => handleNumberChange(index, e.target.value)}
                      className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="?"
                    />
                    <button
                      type="button"
                      onClick={() => removeNumber(index)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {Array.from({ length: 20 - result.length }).map((_, index) => (
                  <div key={index} className="relative">
                    <input
                      type="number"
                      min="1"
                      max="80"
                      value=""
                      onChange={(e) => handleNumberChange(result.length + index, e.target.value)}
                      className="w-full px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="?"
                    />
                  </div>
                ))}
              </div>

              <div className="mt-2 text-sm text-gray-500">
                Đã nhập: {result.filter(n => n !== '').length}/20 số
              </div>
            </div>

            {/* Preview */}
            {result.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-2">Kết quả hiện tại:</h4>
                <div className="flex flex-wrap gap-2">
                  {result.filter(n => n !== '').sort((a, b) => a - b).map((number, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white text-sm font-medium rounded-full"
                    >
                      {number}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading || result.length !== 20}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Xác nhận kết quả
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InputResultModal;
