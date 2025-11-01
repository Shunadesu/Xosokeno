import { useState } from 'react'
import { X } from 'lucide-react'

export default function NumberPad({ value = '', onChange, onConfirm, min = 10000, max = 1000000 }) {
  const [inputValue, setInputValue] = useState(value.toString() || '')

  const handleNumberClick = (num) => {
    const newValue = inputValue + num.toString()
    const numValue = parseInt(newValue.replace(/\D/g, '')) || 0
    
    if (numValue <= max) {
      setInputValue(newValue)
      onChange(newValue)
    }
  }

  const handleClear = () => {
    setInputValue('')
    onChange('')
  }

  const handleK = () => {
    // K = nghìn đồng (add 000)
    const numValue = parseInt(inputValue.replace(/\D/g, '')) || 0
    const newValue = numValue * 1000
    
    if (newValue <= max) {
      const newValueStr = newValue.toString()
      setInputValue(newValueStr)
      onChange(newValueStr)
    }
  }

  const handleM = () => {
    // M = triệu đồng (add 000000)
    const numValue = parseInt(inputValue.replace(/\D/g, '')) || 0
    const newValue = numValue * 1000000
    
    if (newValue <= max) {
      const newValueStr = newValue.toString()
      setInputValue(newValueStr)
      onChange(newValueStr)
    }
  }

  const handleQuickAmount = (amount) => {
    if (amount <= max) {
      const newValueStr = amount.toString()
      setInputValue(newValueStr)
      onChange(newValueStr)
    }
  }

  const numValue = parseInt(inputValue.replace(/\D/g, '')) || 0
  const isValid = numValue >= min && numValue <= max

  return (
    <div className="space-y-3">
      {/* Display */}
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <div className="text-sm text-gray-500 mb-1">Số tiền đặt cược</div>
        <div className="text-2xl font-bold text-gray-900">
          {inputValue ? new Intl.NumberFormat('vi-VN').format(numValue) : '0'} ₫
        </div>
        {inputValue && !isValid && (
          <div className="text-xs text-red-500 mt-1">
            {numValue < min ? `Tối thiểu: ${new Intl.NumberFormat('vi-VN').format(min)} ₫` : 
             `Tối đa: ${new Intl.NumberFormat('vi-VN').format(max)} ₫`}
          </div>
        )}
      </div>

      {/* Number Pad */}
      <div className="grid grid-cols-3 gap-2">
        {/* Row 1 */}
        <button
          onClick={() => handleNumberClick(1)}
          className="bg-white border-2 border-gray-300 rounded-lg p-4 text-xl font-bold hover:bg-gray-50 active:scale-95 transition-all"
        >
          1
        </button>
        <button
          onClick={() => handleNumberClick(2)}
          className="bg-white border-2 border-gray-300 rounded-lg p-4 text-xl font-bold hover:bg-gray-50 active:scale-95 transition-all"
        >
          2
        </button>
        <button
          onClick={() => handleNumberClick(3)}
          className="bg-white border-2 border-gray-300 rounded-lg p-4 text-xl font-bold hover:bg-gray-50 active:scale-95 transition-all"
        >
          3
        </button>

        {/* Row 2 */}
        <button
          onClick={() => handleNumberClick(4)}
          className="bg-white border-2 border-gray-300 rounded-lg p-4 text-xl font-bold hover:bg-gray-50 active:scale-95 transition-all"
        >
          4
        </button>
        <button
          onClick={() => handleNumberClick(5)}
          className="bg-white border-2 border-gray-300 rounded-lg p-4 text-xl font-bold hover:bg-gray-50 active:scale-95 transition-all"
        >
          5
        </button>
        <button
          onClick={() => handleNumberClick(6)}
          className="bg-white border-2 border-gray-300 rounded-lg p-4 text-xl font-bold hover:bg-gray-50 active:scale-95 transition-all"
        >
          6
        </button>

        {/* Row 3 */}
        <button
          onClick={() => handleNumberClick(7)}
          className="bg-white border-2 border-gray-300 rounded-lg p-4 text-xl font-bold hover:bg-gray-50 active:scale-95 transition-all"
        >
          7
        </button>
        <button
          onClick={() => handleNumberClick(8)}
          className="bg-white border-2 border-gray-300 rounded-lg p-4 text-xl font-bold hover:bg-gray-50 active:scale-95 transition-all"
        >
          8
        </button>
        <button
          onClick={() => handleNumberClick(9)}
          className="bg-white border-2 border-gray-300 rounded-lg p-4 text-xl font-bold hover:bg-gray-50 active:scale-95 transition-all"
        >
          9
        </button>

        {/* Row 4 */}
        <button
          onClick={() => handleNumberClick(0)}
          className="bg-white border-2 border-gray-300 rounded-lg p-4 text-xl font-bold hover:bg-gray-50 active:scale-95 transition-all"
        >
          0
        </button>
        <button
          onClick={handleK}
          className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 text-lg font-bold text-blue-700 hover:bg-blue-200 active:scale-95 transition-all"
        >
          K
        </button>
        <button
          onClick={handleM}
          className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4 text-lg font-bold text-purple-700 hover:bg-purple-200 active:scale-95 transition-all"
        >
          M
        </button>

        {/* Row 5 - Quick Amounts */}
        <button
          onClick={() => handleQuickAmount(1000000)}
          className="bg-green-50 border-2 border-green-300 rounded-lg p-3 text-sm font-bold text-green-700 hover:bg-green-100 active:scale-95 transition-all"
        >
          1M
        </button>
        <button
          onClick={() => handleQuickAmount(10000000)}
          className="bg-green-50 border-2 border-green-300 rounded-lg p-3 text-sm font-bold text-green-700 hover:bg-green-100 active:scale-95 transition-all"
        >
          10M
        </button>
        <button
          onClick={() => handleQuickAmount(100000000)}
          className="bg-green-50 border-2 border-green-300 rounded-lg p-3 text-sm font-bold text-green-700 hover:bg-green-100 active:scale-95 transition-all"
        >
          100M
        </button>
      </div>

      {/* Clear Button */}
      <button
        onClick={handleClear}
        className="w-full bg-red-50 border-2 border-red-300 rounded-lg p-3 text-red-700 font-bold hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center space-x-2"
      >
        <X className="h-5 w-5" />
        <span>Xóa</span>
      </button>
    </div>
  )
}

