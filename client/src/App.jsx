import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'

import Login from './pages/login'
import Drive from './pages/drive'
import SharedFiles from './pages/shared'
import SharedWithMe from './pages/sharedWithMe'
import Trash from './pages/trash'
import Starred from './pages/starred'
import Recent from './pages/recent'

import ProtectedRoute from './components/auth/protectedRoute'
import DashboardLayout from './components/layout/dashboardLayout'

const App = () => {
  return (
    <>
      <Toaster />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login mode="login" />} />
        <Route path="/register" element={<Login mode="register" />} />
        <Route path="/s/:token" element={<SharedWithMe />} />

        {/* Protected Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Drive />} />
          <Route path="/drive/:folderId" element={<Drive />} />
          <Route path="/recent" element={<Recent />} />
          <Route path="/starred" element={<Starred />} />
          <Route path="/shared" element={<SharedFiles />} />
          <Route path="/trash" element={<Trash />} />
        </Route>

        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App