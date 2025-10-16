import { useState, useEffect } from 'react'
import { X, QrCode, Upload, CheckCircle } from 'lucide-react'
import { useDepositsStore } from '../stores/index'

export default function DepositModal({ isOpen, onClose, qrCodes }) {
  const [step, setStep] = useState(1) // 1: Select QR, 2: Show QR, 3: Upload receipt, 4: Confirmed
  const [selectedQRCode, setSelectedQRCode] = useState(null)
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [receiptFile, setReceiptFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  
  const { createDeposit, isLoading } = useDepositsStore()

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setStep(1)
      setSelectedQRCode(null)
      setAmount('')
      setNote('')
      setReceiptFile(null)
      setPreviewUrl('')
    }
  }, [isOpen])

  const handleQRCodeSelect = (qrCode) => {
    setSelectedQRCode(qrCode)
    setStep(2)
  }

  const handleAmountChange = (value) => {
    const numValue = parseInt(value.replace(/\D/g, ''))
    if (!isNaN(numValue)) {
      setAmount(numValue.toString())
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setReceiptFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleSubmitDeposit = async () => {
    if (!selectedQRCode || !amount || !receiptFile) return

    const formData = new FormData()
    formData.append('amount', amount)
    formData.append('method', 'qr_code')
    formData.append('qrCodeId', selectedQRCode._id)
    if (note) formData.append('note', note)
    formData.append('transactionImage', receiptFile)

    const result = await createDeposit(formData)
    
    if (result.success) {
      setStep(4)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Nạp tiền</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          {/* Step 1: Select QR Code */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Chọn phương thức nạp tiền</h4>
              <div className="space-y-3">
                {qrCodes.filter(qr => qr.isActive).map((qrCode) => (
                  <button
                    key={qrCode._id}
                    onClick={() => handleQRCodeSelect(qrCode)}
                    className="w-full p-4 border border-gray-200 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors text-left"
                  >
                    <div className="flex items-center space-x-3">
                      <QrCode className="h-5 w-5 text-primary-600" />
                      <div>
                        <div className="font-medium text-gray-900">{qrCode.name}</div>
                        <div className="text-sm text-gray-500">{qrCode.bankName}</div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(qrCode.minAmount)} - {formatCurrency(qrCode.maxAmount)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Show QR Code */}
          {step === 2 && selectedQRCode && (
            <div className="space-y-4">
              <div className="text-center">
                <h4 className="font-medium text-gray-900 mb-2">Thông tin chuyển khoản</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="text-sm text-gray-600">Ngân hàng: {selectedQRCode.bankName}</div>
                  <div className="text-sm text-gray-600">Số tài khoản: {selectedQRCode.accountNumber}</div>
                  <div className="text-sm text-gray-600">Chủ tài khoản: {selectedQRCode.accountHolder}</div>
                </div>
              </div>

              {selectedQRCode.qrImage?.url && (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
                    <img
                      src={selectedQRCode.qrImage.url}
                      alt="QR Code"
                      className="w-48 h-48 mx-auto"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số tiền nạp
                  </label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    placeholder="Nhập số tiền"
                    className="input w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Tối thiểu: {formatCurrency(selectedQRCode.minAmount)} - 
                    Tối đa: {formatCurrency(selectedQRCode.maxAmount)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ghi chú (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nhập ghi chú"
                    className="input w-full"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="btn btn-secondary flex-1"
                >
                  Quay lại
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!amount || parseInt(amount) < selectedQRCode.minAmount || parseInt(amount) > selectedQRCode.maxAmount}
                  className="btn btn-primary flex-1"
                >
                  Tiếp tục
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Upload Receipt */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <h4 className="font-medium text-gray-900 mb-2">Xác nhận đã chuyển khoản</h4>
                <p className="text-sm text-gray-600">
                  Vui lòng upload ảnh chụp màn hình giao dịch để xác nhận
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ảnh chụp màn hình giao dịch
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <label
                      htmlFor="receipt-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {receiptFile ? 'Thay đổi ảnh' : 'Chọn ảnh'}
                      </span>
                    </label>
                  </div>
                  
                  {previewUrl && (
                    <div className="mt-3">
                      <img
                        src={previewUrl}
                        alt="Receipt preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(2)}
                  className="btn btn-secondary flex-1"
                >
                  Quay lại
                </button>
                <button
                  onClick={handleSubmitDeposit}
                  disabled={!receiptFile || isLoading}
                  className="btn btn-primary flex-1"
                >
                  {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmed */}
          {step === 4 && (
            <div className="text-center space-y-4">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h4 className="text-lg font-semibold text-gray-900">Yêu cầu nạp tiền đã được gửi!</h4>
              <p className="text-sm text-gray-600">
                Chúng tôi sẽ xử lý yêu cầu của bạn trong thời gian sớm nhất. 
                Bạn có thể theo dõi trạng thái trong lịch sử giao dịch.
              </p>
              <button
                onClick={onClose}
                className="btn btn-primary w-full"
              >
                Đóng
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


