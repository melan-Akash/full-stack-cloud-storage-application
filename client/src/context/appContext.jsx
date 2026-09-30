import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import API from '../config/api'

const appContext = createContext()

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('name_asc')
  const [viewMode, setViewModeState] = useState(() => {
    return localStorage.getItem('drivea_view_mode') || 'grid'
  })

  const setViewMode = (mode) => {
    setViewModeState(mode)
    localStorage.setItem('drivea_view_mode', mode)
  }

  const [starredIds, setStarredIds] = useState(() => {
    try {
      const saved = localStorage.getItem('drivea_starred')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  const toggleStar = (id) => {
    setStarredIds((prev) => {
      const isAlready = prev.includes(id)
      const next = isAlready ? prev.filter((item) => item !== id) : [...prev, id]
      localStorage.setItem('drivea_starred', JSON.stringify(next))
      if (isAlready) {
        toast.success('Removed from Starred')
      } else {
        toast.success('Added to Starred')
      }
      return next
    })
  }

  const isStarred = (id) => starredIds.includes(id)

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const { data } = await API.get('/api/auth/me')
        if (data?.user) {
          setUser(data.user)
        }
      } catch (error) {
        // Not logged in or session expired
        setUser(null)
      } finally {
        setIsAuthLoading(false)
      }
    }
    fetchMe()
  }, [])

  const getErrorMessage = (error, fallback) => {
    return error?.response?.data?.error || fallback
  }

  const authActionHelper = async (requestFn, successMessage, errorFallback) => {
    try {
      const response = await requestFn()
      const data = response?.data || response
      if (data?.token) {
        localStorage.setItem('drivea_token', data.token)
      }
      setUser(data.user)
      if (successMessage) {
        toast.success(successMessage)
      }
      return true
    } catch (error) {
      toast.error(getErrorMessage(error, errorFallback))
      return false
    }
  }

  const login = async (email, password) => {
    return authActionHelper(
      () => API.post('/api/auth/login', { email, password }),
      'Welcome back',
      'Login failed'
    )
  }

  const register = async (name, email, password) => {
    return authActionHelper(
      () => API.post('/api/auth/register', { name, email, password }),
      'Account created successfully',
      'Registration failed'
    )
  }

  const logout = async () => {
    try {
      await API.post('/api/auth/logout')
    } catch (error) {
      // ignore
    } finally {
      localStorage.removeItem('drivea_token')
      setUser(null)
      toast.success('Logged out')
    }
  }

  const refreshUser = async () => {
    try {
      const { data } = await API.get('/api/auth/me')
      if (data?.user) {
        setUser(data.user)
      }
    } catch (error) {
      // ignore
    }
  }

  const value = {
    user,
    setUser,
    isAuthLoading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    login,
    register,
    logout,
    refreshUser,
    viewMode,
    setViewMode,
    starredIds,
    toggleStar,
    isStarred,
  }

  return (
    <appContext.Provider value={value}>
      {children}
    </appContext.Provider>
  )
}

export const useApp = () => {
  return useContext(appContext)
}

export default appContext
