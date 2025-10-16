// Environment configuration for Admin Panel
export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || '/api',
  socketUrl: import.meta.env.VITE_SOCKET_URL || window.location.origin,
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'Zuna Xosokeno Admin',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  nodeEnv: import.meta.env.VITE_NODE_ENV || 'development',
  
  // Feature Flags
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  enableDebug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  enableRealtime: import.meta.env.VITE_ENABLE_REALTIME !== 'false',
  
  // File Upload
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  allowedFileTypes: import.meta.env.VITE_ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp'
  ],
  
  // Pagination
  defaultPageSize: parseInt(import.meta.env.VITE_DEFAULT_PAGE_SIZE) || 20,
  maxPageSize: parseInt(import.meta.env.VITE_MAX_PAGE_SIZE) || 100,
  
  // Real-time Updates
  socketReconnectAttempts: parseInt(import.meta.env.VITE_SOCKET_RECONNECT_ATTEMPTS) || 5,
  socketReconnectDelay: parseInt(import.meta.env.VITE_SOCKET_RECONNECT_DELAY) || 1000,
  
  // UI Configuration
  defaultTheme: import.meta.env.VITE_DEFAULT_THEME || 'light',
  enableDarkMode: import.meta.env.VITE_ENABLE_DARK_MODE !== 'false',
  
  // Security
  enableCsrfProtection: import.meta.env.VITE_ENABLE_CSRF_PROTECTION !== 'false',
  tokenRefreshInterval: parseInt(import.meta.env.VITE_TOKEN_REFRESH_INTERVAL) || 300000, // 5 minutes
}

// Helper functions
export const isDevelopment = () => config.nodeEnv === 'development'
export const isProduction = () => config.nodeEnv === 'production'

// Debug logging
export const debugLog = (...args) => {
  if (config.enableDebug) {
    console.log('[DEBUG]', ...args)
  }
}

// Error logging
export const errorLog = (...args) => {
  console.error('[ERROR]', ...args)
}

export default config
