import { useBetsStore } from '../stores/index'

export default function NumberPicker({ maxNumbers = 20, selectedNumbers = [], onNumberSelect }) {
  const { addNumber, removeNumber } = useBetsStore()

  const handleNumberClick = (number) => {
    if (selectedNumbers.includes(number)) {
      removeNumber(number)
    } else if (selectedNumbers.length < maxNumbers) {
      addNumber(number)
    }
    onNumberSelect?.(number)
  }

  const numbers = Array.from({ length: 80 }, (_, i) => i + 1)

  return (
    <div className="grid grid-cols-8 gap-2 p-4">
      {numbers.map((number) => {
        const isSelected = selectedNumbers.includes(number)
        const isDisabled = !isSelected && selectedNumbers.length >= maxNumbers
        
        return (
          <button
            key={number}
            onClick={() => handleNumberClick(number)}
            disabled={isDisabled}
            className={`
              w-10 h-10 rounded-full text-sm font-medium transition-all duration-200
              ${isSelected 
                ? 'bg-primary-600 text-white shadow-lg transform scale-110' 
                : isDisabled
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-primary-500 hover:bg-primary-50'
              }
            `}
          >
            {number}
          </button>
        )
      })}
    </div>
  )
}


