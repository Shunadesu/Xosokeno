import { useState, useEffect } from 'react'
import { ArrowUp, Phone } from 'lucide-react'

export default function FloatingActionButtons() {
  const [showScrollTop, setShowScrollTop] = useState(false)

  // Show scroll to top button when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    })
  }

  const handlePhoneCall = () => {
    // Hotline number from CustomerService
    window.location.href = 'tel:19001234'
  }

  return (
    <div className="fixed bottom-20 lg:bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-12 h-12 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
          aria-label="Lên đầu trang"
          title="Lên đầu trang"
        >
          <ArrowUp className="h-6 w-6" />
        </button>
      )}

      {/* Phone Call Button */}
      <button
        onClick={handlePhoneCall}
        className="w-12 h-12 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 flex items-center justify-center hover:scale-110 active:scale-95"
        aria-label="Gọi điện thoại"
        title="Gọi hotline: 1900 1234"
      >
        <Phone className="h-6 w-6" />
      </button>
    </div>
  )
}

