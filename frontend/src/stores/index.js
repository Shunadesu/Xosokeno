import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
import toast from 'react-hot-toast'
import { config } from '../config'

// Configure axios defaults
axios.defaults.baseURL = config.apiUrl
axios.defaults.withCredentials = true
axios.defaults.headers.common['Content-Type'] = 'application/json'

// Add axios interceptor to include token in all requests
axios.interceptors.request.use(
  (config) => {
    // Get token from Zustand persist storage
    const authStorage = localStorage.getItem('auth-storage')
    
    if (authStorage) {
      try {
        const parsed = JSON.parse(authStorage)
        // Zustand persist structure: { state: { token, user, ... }, version: 0 }
        const token = parsed?.state?.token
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch (error) {
        console.error('Error parsing auth storage:', error)
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Auth Store
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const response = await axios.post('/auth/login', credentials)
          const { user, token } = response.data.data
          
          set({ 
            user, 
            token, 
            isAuthenticated: true,
            isLoading: false 
          })
          
          // Set token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          toast.success('Đăng nhập thành công!')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Đăng nhập thất bại'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      register: async (userData) => {
        set({ isLoading: true })
        try {
          const response = await axios.post('/auth/register', userData)
          const { user, token } = response.data.data
          
          set({ 
            user, 
            token, 
            isAuthenticated: true,
            isLoading: false 
          })
          
          // Set token in axios headers
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          toast.success('Đăng ký thành công!')
          return { success: true }
        } catch (error) {
          set({ isLoading: false })
          const message = error.response?.data?.message || 'Đăng ký thất bại'
          toast.error(message)
          return { success: false, error: message }
        }
      },

      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        })
        delete axios.defaults.headers.common['Authorization']
        toast.success('Đăng xuất thành công!')
      },

      refreshUser: async () => {
        try {
          const response = await axios.get('/auth/me')
          const user = response.data.data
          
          set((state) => ({
            user: { ...state.user, ...user }
          }))
          
          return { success: true, user }
        } catch (error) {
          console.error('Error refreshing user:', error)
          return { success: false, error: error.message }
        }
      },

      initialize: () => {
        const { token } = get()
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)

// Wallet Store
export const useWalletStore = create((set, get) => ({
  balance: 0,
  isLoading: false,

  fetchBalance: async () => {
    set({ isLoading: true })
    try {
      const response = await axios.get('/wallet/balance')
      set({ balance: response.data.data.balance, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Không thể tải số dư')
    }
  },

  updateBalance: (newBalance) => {
    set({ balance: newBalance })
  }
}))

// QR Codes Store
export const useQRCodeStore = create((set, get) => ({
  qrCodes: [],
  isLoading: false,

  fetchQRCodes: async () => {
    set({ isLoading: true })
    try {
      const response = await axios.get('/qr-codes')
      set({ qrCodes: response.data.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Không thể tải danh sách QR code')
    }
  }
}))

// Deposits Store
export const useDepositsStore = create((set, get) => ({
  deposits: [],
  isLoading: false,

  createDeposit: async (depositData) => {
    set({ isLoading: true })
    try {
      const response = await axios.post('/deposits', depositData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      set({ isLoading: false })
      toast.success('Yêu cầu nạp tiền đã được gửi!')
      return { success: true, data: response.data.data }
    } catch (error) {
      set({ isLoading: false })
      const message = error.response?.data?.message || 'Nạp tiền thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  fetchDeposits: async () => {
    set({ isLoading: true })
    try {
      const response = await axios.get('/deposits/my')
      set({ deposits: response.data.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Không thể tải lịch sử nạp tiền')
    }
  }
}))

// Games Store
export const useGamesStore = create((set, get) => ({
  games: [],
  activeGames: [],
  upcomingGames: [],
  completedGames: [],
  currentGame: null,
  isLoading: false,

  fetchActiveGames: async () => {
    set({ isLoading: true })
    try {
      const response = await axios.get('/games/active')
      set({ activeGames: response.data.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Không thể tải danh sách game')
    }
  },

  fetchUpcomingGames: async () => {
    try {
      const response = await axios.get('/games/upcoming')
      set({ upcomingGames: response.data.data })
    } catch (error) {
      toast.error('Không thể tải game sắp tới')
    }
  },

  fetchCompletedGames: async () => {
    try {
      const response = await axios.get('/games/completed')
      set({ completedGames: response.data.data })
    } catch (error) {
      toast.error('Không thể tải lịch sử game')
    }
  },

  fetchGameById: async (gameId) => {
    try {
      const response = await axios.get(`/games/${gameId}`)
      set({ currentGame: response.data.data })
      return response.data.data
    } catch (error) {
      toast.error('Không thể tải thông tin game')
      return null
    }
  },

  setCurrentGame: (game) => {
    set({ currentGame: game })
  }
}))

// Bets Store
export const useBetsStore = create((set, get) => ({
  bets: [],
  currentBet: null,
  betSlip: {
    numbers: [],
    betType: 'keno',
    amount: 0,
    gameId: null
  },
  isLoading: false,

  fetchUserBets: async () => {
    set({ isLoading: true })
    try {
      console.log('🔄 Fetching user bets...')
      const response = await axios.get('/bets/user')
      console.log('📊 User bets response:', response.data)
      set({ bets: response.data.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      console.error('❌ Error fetching user bets:', error)
      toast.error('Không thể tải lịch sử cược')
    }
  },

  placeBet: async (betData) => {
    set({ isLoading: true })
    try {
      const response = await axios.post('/bets', betData)
      const newBet = response.data.data.bet
      
      set((state) => ({
        bets: [newBet, ...state.bets],
        betSlip: {
          numbers: [],
          betType: 'keno',
          amount: 0,
          gameId: null
        },
        isLoading: false
      }))
      
      // Refresh user balance after placing bet
      const authStore = useAuthStore.getState()
      if (authStore.refreshUser) {
        await authStore.refreshUser()
      }
      
      toast.success('Đặt cược thành công!')
      return { success: true, data: newBet }
    } catch (error) {
      set({ isLoading: false })
      const message = error.response?.data?.message || 'Đặt cược thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  updateBetSlip: (updates) => {
    set((state) => ({
      betSlip: { ...state.betSlip, ...updates }
    }))
  },

  clearBetSlip: () => {
    set({
      betSlip: {
        numbers: [],
        betType: 'keno',
        amount: 0,
        gameId: null
      }
    })
  },

  addNumber: (number) => {
    set((state) => {
      const numbers = [...state.betSlip.numbers]
      if (!numbers.includes(number)) {
        numbers.push(number)
      }
      return {
        betSlip: { ...state.betSlip, numbers }
      }
    })
  },

  removeNumber: (number) => {
    set((state) => ({
      betSlip: {
        ...state.betSlip,
        numbers: state.betSlip.numbers.filter(n => n !== number)
      }
    }))
  }
}))

// Promotions Store
export const usePromotionsStore = create((set, get) => ({
  promotions: [],
  activePromotions: [],
  isLoading: false,

  fetchPromotions: async () => {
    set({ isLoading: true })
    try {
      const response = await axios.get('/promotions')
      set({ promotions: response.data.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Không thể tải danh sách khuyến mãi')
    }
  },

  fetchActivePromotions: async () => {
    try {
      const response = await axios.get('/promotions/active')
      set({ activePromotions: response.data.data })
    } catch (error) {
      toast.error('Không thể tải khuyến mãi đang hoạt động')
    }
  },

  getApplicablePromotions: async (amount) => {
    try {
      const response = await axios.get(`/promotions/applicable?amount=${amount}`)
      return response.data.data
    } catch (error) {
      return []
    }
  }
}))
