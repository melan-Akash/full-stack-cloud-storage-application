import axios from 'axios'
import { dummyUser, dummyFolders, dummyFiles, dummyShareLinks } from '../assets/assets'

const API = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:5000',
  withCredentials: true,
})

// Request Interceptor: Attach JWT Bearer Token if available in localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('drivea_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle global 401 Unauthorized
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token expired or invalid, remove it
      const currentUrl = error.config?.url || ''
      if (!currentUrl.includes('/api/auth/me') && !currentUrl.includes('/api/auth/login')) {
        localStorage.removeItem('drivea_token')
      }
    }
    return Promise.reject(error)
  }
)

export { dummyUser, dummyFolders, dummyFiles, dummyShareLinks, API as api }
export default API
