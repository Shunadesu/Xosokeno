import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'
import toast from 'react-hot-toast'
import { config } from '../config'

// Configure axios defaults
axios.defaults.baseURL = config.apiUrl
axios.defaults.withCredentials = true

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

      logout: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        })
        delete axios.defaults.headers.common['Authorization']
        toast.success('Đăng xuất thành công!')
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

// Dashboard Store
export const useDashboardStore = create((set, get) => ({
  stats: null,
  isLoading: false,

  fetchStats: async () => {
    set({ isLoading: true })
    try {
      const response = await axios.get('/admin/dashboard')
      set({ stats: response.data.data, isLoading: false })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Không thể tải thống kê')
    }
  }
}))

// Users Store
export const useUsersStore = create((set, get) => ({
  users: [],
  totalUsers: 0,
  currentPage: 1,
  isLoading: false,

  fetchUsers: async (page = 1, filters = {}) => {
    set({ isLoading: true })
    try {
      const params = { page, ...filters }
      console.log('Fetching users with params:', params)
      const response = await axios.get('/admin/users', { params })
      console.log('Users response:', response.data)
      
      set({ 
        users: response.data.data,
        totalUsers: response.data.total,
        currentPage: page,
        isLoading: false 
      })
    } catch (error) {
      set({ isLoading: false })
      console.error('Error fetching users:', error)
      toast.error('Không thể tải danh sách người dùng')
    }
  },

  updateUser: async (userId, data) => {
    try {
      const response = await axios.put(`/admin/users/${userId}`, data)
      const updatedUser = response.data.data
      
      set((state) => ({
        users: state.users.map(user => 
          user._id === userId ? updatedUser : user
        )
      }))
      
      toast.success('Cập nhật người dùng thành công!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Cập nhật thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  deleteUser: async (userId) => {
    try {
      await axios.delete(`/admin/users/${userId}`)
      
      set((state) => ({
        users: state.users.filter(user => user._id !== userId)
      }))
      
      toast.success('Xóa người dùng thành công!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Xóa thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  }
}))

// Games Store
export const useGamesStore = create((set, get) => ({
  games: [],
  totalGames: 0,
  currentPage: 1,
  isLoading: false,

  fetchGames: async (page = 1, filters = {}) => {
    set({ isLoading: true })
    try {
      const params = { page, ...filters }
      const response = await axios.get('/games', { params })
      set({ 
        games: response.data.data,
        totalGames: response.data.total,
        currentPage: page,
        isLoading: false 
      })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Không thể tải danh sách game')
    }
  },

  createGame: async (gameData) => {
    try {
      const response = await axios.post('/games', gameData)
      const newGame = response.data.data
      
      // Add new game to the beginning of the list
      set((state) => ({
        games: [newGame, ...state.games],
        totalGames: state.totalGames + 1
      }))
      
      toast.success('Tạo game thành công!')
      return { success: true, data: newGame }
    } catch (error) {
      const message = error.response?.data?.message || 'Tạo game thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  },

         updateGame: async (gameId, data) => {
           try {
             const response = await axios.put(`/games/${gameId}`, data)
             const updatedGame = response.data.data
             
             set((state) => ({
               games: state.games.map(game => 
                 game._id === gameId ? updatedGame : game
               )
             }))
             
             toast.success('Cập nhật game thành công!')
             return { success: true, data: updatedGame }
           } catch (error) {
             const message = error.response?.data?.message || 'Cập nhật thất bại'
             toast.error(message)
             return { success: false, error: message }
           }
         },

  deleteGame: async (gameId) => {
    try {
      await axios.delete(`/games/${gameId}`)
      
      set((state) => ({
        games: state.games.filter(game => game._id !== gameId)
      }))
      
      toast.success('Xóa game thành công!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Xóa thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  generateResult: async (gameId) => {
    try {
      const response = await axios.post(`/games/${gameId}/generate-result`)
      const updatedGame = response.data.data.game
      
      set((state) => ({
        games: state.games.map(game => 
          game._id === gameId ? updatedGame : game
        )
      }))
      
      toast.success('Tạo kết quả game thành công!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Tạo kết quả thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  processGameManually: async (gameId) => {
    try {
      const response = await axios.post(`/games/${gameId}/process-manually`)
      
      toast.success('Xử lý game thành công!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Xử lý game thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  }
}))

// Deposits Store
export const useDepositsStore = create((set, get) => ({
  deposits: [],
  pendingDeposits: [],
  totalDeposits: 0,
  currentPage: 1,
  isLoading: false,

  fetchDeposits: async (page = 1, filters = {}) => {
    set({ isLoading: true })
    try {
      const params = { page, ...filters }
      const response = await axios.get('/deposits', { params })
      set({ 
        deposits: response.data.data,
        totalDeposits: response.data.total,
        currentPage: page,
        isLoading: false 
      })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Không thể tải danh sách nạp tiền')
    }
  },

  fetchPendingDeposits: async () => {
    try {
      const response = await axios.get('/deposits/admin/pending')
      set({ pendingDeposits: response.data.data })
    } catch (error) {
      toast.error('Không thể tải danh sách nạp tiền chờ xử lý')
    }
  },

  confirmDeposit: async (depositId) => {
    try {
      const response = await axios.post(`/deposits/${depositId}/confirm`)
      const updatedDeposit = response.data.data
      
      set((state) => ({
        deposits: state.deposits.map(deposit => 
          deposit._id === depositId ? updatedDeposit : deposit
        ),
        pendingDeposits: state.pendingDeposits.filter(deposit => 
          deposit._id !== depositId
        )
      }))
      
      toast.success('Xác nhận nạp tiền thành công!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Xác nhận thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  rejectDeposit: async (depositId, reason) => {
    try {
      const response = await axios.post(`/deposits/${depositId}/reject`, { reason })
      const updatedDeposit = response.data.data
      
      set((state) => ({
        deposits: state.deposits.map(deposit => 
          deposit._id === depositId ? updatedDeposit : deposit
        ),
        pendingDeposits: state.pendingDeposits.filter(deposit => 
          deposit._id !== depositId
        )
      }))
      
      toast.success('Từ chối nạp tiền thành công!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Từ chối thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  }
}))

// QR Codes Store
export const useQRCodesStore = create((set, get) => ({
  qrCodes: [],
  totalQRCodes: 0,
  currentPage: 1,
  isLoading: false,

  fetchQRCodes: async (page = 1, filters = {}) => {
    set({ isLoading: true })
    try {
      const params = { page, ...filters }
      const response = await axios.get('/qr-codes/admin', { params })
      set({ 
        qrCodes: response.data.data,
        totalQRCodes: response.data.total,
        currentPage: page,
        isLoading: false 
      })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Không thể tải danh sách QR code')
    }
  },

  createQRCode: async (qrCodeData) => {
    try {
      const response = await axios.post('/qr-codes', qrCodeData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      const newQRCode = response.data.data
      
      set((state) => ({
        qrCodes: [newQRCode, ...state.qrCodes]
      }))
      
      toast.success('Tạo QR code thành công!')
      return { success: true, data: newQRCode }
    } catch (error) {
      const message = error.response?.data?.message || 'Tạo QR code thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  updateQRCode: async (qrCodeId, data) => {
    try {
      const response = await axios.put(`/qr-codes/${qrCodeId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      const updatedQRCode = response.data.data
      
      set((state) => ({
        qrCodes: state.qrCodes.map(qrCode => 
          qrCode._id === qrCodeId ? updatedQRCode : qrCode
        )
      }))
      
      toast.success('Cập nhật QR code thành công!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Cập nhật thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  deleteQRCode: async (qrCodeId) => {
    try {
      await axios.delete(`/qr-codes/${qrCodeId}`)
      
      set((state) => ({
        qrCodes: state.qrCodes.filter(qrCode => qrCode._id !== qrCodeId)
      }))
      
      toast.success('Xóa QR code thành công!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Xóa thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  }
}))

// Bets Store
export const useBetsStore = create((set, get) => ({
  bets: [],
  totalBets: 0,
  isLoading: false,
  error: null,

  fetchBets: async (page = 1, filters = {}) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.get('/bets', {
        params: { page, ...filters }
      })
      
      set({
        bets: response.data.data,
        totalBets: response.data.total,
        isLoading: false
      })
    } catch (error) {
      set({ 
        error: error.response?.data?.message || error.message, 
        isLoading: false 
      })
      toast.error('Không thể tải danh sách cược')
    }
  },

  getBetById: async (betId) => {
    try {
      const response = await axios.get(`/bets/${betId}`)
      return response.data.data
    } catch (error) {
      toast.error('Không thể tải thông tin cược')
      return null
    }
  },

  updateBetStatus: async (betId, status) => {
    try {
      const response = await axios.put(`/bets/${betId}`, { status })
      
      set((state) => ({
        bets: state.bets.map(bet => 
          bet._id === betId ? { ...bet, status } : bet
        )
      }))
      
      toast.success('Cập nhật trạng thái cược thành công!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Cập nhật thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  deleteBet: async (betId) => {
    try {
      await axios.delete(`/bets/${betId}`)
      
      set((state) => ({
        bets: state.bets.filter(bet => bet._id !== betId)
      }))
      
      toast.success('Xóa cược thành công!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Xóa thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  }
}))

// Banners Store
export const useBannersStore = create((set, get) => ({
  banners: [],
  totalBanners: 0,
  currentPage: 1,
  isLoading: false,

  fetchBanners: async (page = 1, filters = {}) => {
    set({ isLoading: true })
    try {
      const params = { page, ...filters }
      const response = await axios.get('/ads', { params })
      set({ 
        banners: response.data.data,
        totalBanners: response.data.total,
        currentPage: page,
        isLoading: false 
      })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Không thể tải danh sách banner')
    }
  },

  createBanner: async (bannerData) => {
    try {
      const response = await axios.post('/ads', bannerData)
      const newBanner = response.data.data
      
      set((state) => ({
        banners: [newBanner, ...state.banners]
      }))
      
      toast.success('Tạo banner thành công!')
      return { success: true, data: newBanner }
    } catch (error) {
      const message = error.response?.data?.message || 'Tạo banner thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  updateBanner: async (bannerId, data) => {
    try {
      const response = await axios.put(`/ads/${bannerId}`, data)
      const updatedBanner = response.data.data
      
      set((state) => ({
        banners: state.banners.map(banner => 
          banner._id === bannerId ? updatedBanner : banner
        )
      }))
      
      toast.success('Cập nhật banner thành công!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Cập nhật thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  deleteBanner: async (bannerId) => {
    try {
      await axios.delete(`/ads/${bannerId}`)
      
      set((state) => ({
        banners: state.banners.filter(banner => banner._id !== bannerId)
      }))
      
      toast.success('Xóa banner thành công!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Xóa thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  }
}))

// Promotions Store
export const usePromotionsStore = create((set, get) => ({
  promotions: [],
  totalPromotions: 0,
  currentPage: 1,
  isLoading: false,

  fetchPromotions: async (page = 1, filters = {}) => {
    set({ isLoading: true })
    try {
      const params = { page, ...filters }
      const response = await axios.get('/promotions', { params })
      set({ 
        promotions: response.data.data,
        totalPromotions: response.data.total,
        currentPage: page,
        isLoading: false 
      })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Không thể tải danh sách khuyến mãi')
    }
  },

  createPromotion: async (promotionData) => {
    try {
      const response = await axios.post('/promotions', promotionData)
      const newPromotion = response.data.data
      
      set((state) => ({
        promotions: [newPromotion, ...state.promotions]
      }))
      
      toast.success('Tạo khuyến mãi thành công!')
      return { success: true, data: newPromotion }
    } catch (error) {
      const message = error.response?.data?.message || 'Tạo khuyến mãi thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  updatePromotion: async (promotionId, data) => {
    try {
      const response = await axios.put(`/promotions/${promotionId}`, data)
      const updatedPromotion = response.data.data
      
      set((state) => ({
        promotions: state.promotions.map(promotion => 
          promotion._id === promotionId ? updatedPromotion : promotion
        )
      }))
      
      toast.success('Cập nhật khuyến mãi thành công!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Cập nhật thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  deletePromotion: async (promotionId) => {
    try {
      await axios.delete(`/promotions/${promotionId}`)
      
      set((state) => ({
        promotions: state.promotions.filter(promotion => promotion._id !== promotionId)
      }))
      
      toast.success('Xóa khuyến mãi thành công!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Xóa thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  }
}))

// QR Code Store
export const useQRCodeStore = create((set, get) => ({
  qrCodes: [],
  totalQRCodes: 0,
  currentPage: 1,
  isLoading: false,

  fetchQRCodes: async (page = 1, filters = {}) => {
    set({ isLoading: true })
    try {
      const params = { page, ...filters }
      const response = await axios.get('/qr-codes/admin', { params })
      set({ 
        qrCodes: response.data.data,
        totalQRCodes: response.data.total,
        currentPage: page,
        isLoading: false 
      })
    } catch (error) {
      set({ isLoading: false })
      toast.error('Không thể tải danh sách QR code')
    }
  },

  createQRCode: async (qrCodeData) => {
    try {
      const response = await axios.post('/qr-codes', qrCodeData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      const newQRCode = response.data.data
      
      set((state) => ({
        qrCodes: [newQRCode, ...state.qrCodes]
      }))
      
      toast.success('Tạo QR code thành công!')
      return { success: true, data: newQRCode }
    } catch (error) {
      const message = error.response?.data?.message || 'Tạo QR code thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  updateQRCode: async (qrCodeId, data) => {
    try {
      const response = await axios.put(`/qr-codes/${qrCodeId}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      const updatedQRCode = response.data.data
      
      set((state) => ({
        qrCodes: state.qrCodes.map(qrCode => 
          qrCode._id === qrCodeId ? updatedQRCode : qrCode
        )
      }))
      
      toast.success('Cập nhật QR code thành công!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Cập nhật thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  },

  deleteQRCode: async (qrCodeId) => {
    try {
      await axios.delete(`/qr-codes/${qrCodeId}`)
      
      set((state) => ({
        qrCodes: state.qrCodes.filter(qrCode => qrCode._id !== qrCodeId)
      }))
      
      toast.success('Xóa QR code thành công!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Xóa thất bại'
      toast.error(message)
      return { success: false, error: message }
    }
  }
}))
