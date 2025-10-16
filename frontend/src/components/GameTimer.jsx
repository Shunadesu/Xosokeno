import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'

export default function GameTimer({ startTime, endTime, gameStatus, onTimeUp }) {
  const [timeLeft, setTimeLeft] = useState(0)
  const [status, setStatus] = useState('waiting') // waiting, active, ended

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const start = new Date(startTime)
      const end = new Date(endTime)

      // Use gameStatus from database if available, otherwise calculate based on time
      if (gameStatus) {
        if (gameStatus === 'completed') {
          setTimeLeft(0)
          setStatus('ended')
        } else if (gameStatus === 'active') {
          setTimeLeft(Math.max(0, end - now))
          setStatus('active')
        } else {
          setTimeLeft(Math.max(0, start - now))
          setStatus('waiting')
        }
      } else {
        // Fallback to time-based calculation
        if (now < start) {
          setTimeLeft(Math.max(0, start - now))
          setStatus('waiting')
        } else if (now >= start && now < end) {
          setTimeLeft(Math.max(0, end - now))
          setStatus('active')
        } else {
          setTimeLeft(0)
          setStatus('ended')
          onTimeUp?.()
        }
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [startTime, endTime, gameStatus, onTimeUp])

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const getStatusColor = () => {
    switch (status) {
      case 'waiting':
        return 'text-blue-600 bg-blue-100'
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'ended':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = () => {
    switch (status) {
      case 'waiting':
        return 'Chờ bắt đầu'
      case 'active':
        return 'Đang diễn ra'
      case 'ended':
        return 'Đã kết thúc'
      default:
        return 'Không xác định'
    }
  }

  return (
    <div className="flex items-center space-x-3">
      <Clock className="h-5 w-5 text-gray-500" />
      <div className="flex items-center space-x-2">
        <span className="text-lg font-mono font-bold text-gray-900">
          {formatTime(timeLeft)}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
    </div>
  )
}


