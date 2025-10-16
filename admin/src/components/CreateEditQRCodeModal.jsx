import React, { useState, useEffect } from 'react';
import { X, Upload, QrCode, DollarSign, User, CreditCard } from 'lucide-react';
import { useQRCodeStore } from '../stores/index';
import toast from 'react-hot-toast';

const CreateEditQRCodeModal = ({ isOpen, onClose, onQRCodeCreated, qrCode, isEdit = false }) => {
  const { createQRCode, updateQRCode } = useQRCodeStore();
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank_transfer',
    accountNumber: '',
    accountName: '',
    bankName: '',
    qrCodeImage: null,
    status: 'active',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (isEdit && qrCode) {
        setFormData({
          name: qrCode.name || '',
          type: qrCode.type || 'bank_transfer',
          accountNumber: qrCode.accountNumber || '',
          accountName: qrCode.accountName || '',
          bankName: qrCode.bankName || '',
          qrCodeImage: null,
          status: qrCode.status || 'active',
          description: qrCode.description || ''
        });
        setImagePreview(qrCode.qrImage?.url || null);
      } else {
        setFormData({
          name: '',
          type: 'bank_transfer',
          accountNumber: '',
          accountName: '',
          bankName: '',
          qrCodeImage: null,
          status: 'active',
          description: ''
        });
        setImagePreview(null);
      }
    }
  }, [isOpen, isEdit, qrCode]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Vui lòng chọn file hình ảnh');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        qrCodeImage: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên QR code');
      return;
    }

    if (!formData.accountNumber.trim()) {
      toast.error('Vui lòng nhập số tài khoản');
      return;
    }

    if (!formData.accountName.trim()) {
      toast.error('Vui lòng nhập tên chủ tài khoản');
      return;
    }

    if (!isEdit && !formData.qrCodeImage) {
      toast.error('Vui lòng chọn hình ảnh QR code');
      return;
    }

    setIsLoading(true);
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('type', formData.type);
      submitData.append('accountNumber', formData.accountNumber);
      submitData.append('accountHolder', formData.accountName);
      submitData.append('bankName', formData.bankName);
      submitData.append('status', formData.status);
      submitData.append('description', formData.description);
      submitData.append('minAmount', '1000');
      submitData.append('maxAmount', '10000000');
      
      if (formData.qrCodeImage) {
        submitData.append('qrImage', formData.qrCodeImage);
      }

      let result;
      if (isEdit && qrCode) {
        result = await updateQRCode(qrCode._id, submitData);
      } else {
        result = await createQRCode(submitData);
      }
      
      if (result.success) {
        onQRCodeCreated(result.data);
        onClose();
      }
      
    } catch (error) {
      console.error('Error saving QR code:', error);
      toast.error(error.response?.data?.message || 'Không thể lưu QR code');
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
            <QrCode className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {isEdit ? 'Chỉnh sửa QR Code' : 'Thêm QR Code Mới'}
            </h2>
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
          {/* QR Code Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên QR Code *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập tên QR code"
              required
            />
          </div>

          {/* Type and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 inline mr-1" />
                Loại thanh toán *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                <option value="momo">Ví MoMo</option>
                <option value="zalo_pay">Ví ZaloPay</option>
                <option value="viettel_pay">Ví ViettelPay</option>
              </select>
            </div>
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
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
                <option value="maintenance">Bảo trì</option>
              </select>
            </div>
          </div>

          {/* Account Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Số tài khoản *
              </label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập số tài khoản"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                Tên chủ tài khoản *
              </label>
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên chủ tài khoản"
                required
              />
            </div>
          </div>

          {/* Bank Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên ngân hàng
            </label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập tên ngân hàng"
            />
          </div>

          {/* QR Code Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh QR Code {!isEdit && '*'}
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="QR Code Preview"
                      className="mx-auto h-32 w-32 object-contain"
                    />
                    <div className="text-sm text-gray-600">
                      <label htmlFor="qrCodeImage" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500">
                          Thay đổi hình ảnh
                        </span>
                      </label>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <QrCode className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      <label htmlFor="qrCodeImage" className="cursor-pointer">
                        <span className="text-blue-600 hover:text-blue-500">
                          Chọn hình ảnh QR code
                        </span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF tối đa 5MB</p>
                  </div>
                )}
                <input
                  id="qrCodeImage"
                  name="qrCodeImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="sr-only"
                />
              </div>
            </div>
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
              placeholder="Nhập mô tả QR code"
            />
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
              {isLoading ? 'Đang lưu...' : (isEdit ? 'Cập nhật' : 'Tạo QR Code')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditQRCodeModal;
