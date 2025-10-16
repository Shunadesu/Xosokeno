import { MessageCircle, Phone, Mail, Clock } from 'lucide-react'

export default function CustomerService() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="px-4 py-6">
        <div className="text-center mb-8">
          <MessageCircle className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Chăm sóc khách hàng</h1>
          <p className="text-gray-600">Chúng tôi luôn sẵn sàng hỗ trợ bạn</p>
        </div>

        <div className="space-y-6">
          {/* Contact Methods */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Liên hệ với chúng tôi</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="h-5 w-5 text-primary-600" />
                <div>
                  <div className="font-medium text-gray-900">Hotline</div>
                  <div className="text-sm text-gray-600">1900 1234 (24/7)</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-primary-600" />
                <div>
                  <div className="font-medium text-gray-900">Email</div>
                  <div className="text-sm text-gray-600">support@xosokenovn.com</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-primary-600" />
                <div>
                  <div className="font-medium text-gray-900">Thời gian hỗ trợ</div>
                  <div className="text-sm text-gray-600">24/7 - Tất cả các ngày trong tuần</div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Câu hỏi thường gặp</h2>
            
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-medium text-gray-900 mb-2">Làm thế nào để nạp tiền?</h3>
                <p className="text-sm text-gray-600">
                  Bạn có thể nạp tiền qua QR code. Chọn phương thức nạp tiền, 
                  chuyển khoản theo thông tin hiển thị và upload ảnh chụp màn hình giao dịch.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-medium text-gray-900 mb-2">Thời gian xử lý nạp tiền?</h3>
                <p className="text-sm text-gray-600">
                  Thông thường từ 5-15 phút trong giờ hành chính. 
                  Ngoài giờ có thể mất 1-2 giờ.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-medium text-gray-900 mb-2">Làm thế nào để rút tiền?</h3>
                <p className="text-sm text-gray-600">
                  Hiện tại chúng tôi chỉ hỗ trợ nạp tiền. 
                  Tính năng rút tiền sẽ được cập nhật trong thời gian tới.
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Có phí giao dịch không?</h3>
                <p className="text-sm text-gray-600">
                  Chúng tôi không thu phí nạp tiền. Tất cả giao dịch đều miễn phí.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


