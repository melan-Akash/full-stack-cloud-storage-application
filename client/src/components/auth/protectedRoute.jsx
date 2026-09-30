import React from 'react'
import { Navigate } from 'react-router-dom'
import { useApp } from '../../context/appContext'

const ProtectedRoute = ({ children }) => {
  const { user, isAuthLoading } = useApp()

  if (isAuthLoading) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute
