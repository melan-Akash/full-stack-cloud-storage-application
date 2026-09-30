import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Download, FileText, Lock } from 'lucide-react'
import { toast } from 'react-hot-toast'
import API from '../config/api'
import Spinner from '../components/ui/Spinner'
import Button from '../components/ui/Button'

const SharedWithMe = () => {
  const { token } = useParams()
  const [sharedData, setSharedData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSharedItem = async () => {
      setIsLoading(true)
      try {
        const res = await API.get(`/api/share/public/${token}`)
        setSharedData(res.data)
      } catch (err) {
        setError('This link is invalid, expired, or has been revoked.')
      } finally {
        setIsLoading(false)
      }
    }

    if (token) {
      fetchSharedItem()
    }
  }, [token])

  const handleDownload = async () => {
    try {
      const response = await API.get(`/api/share/download/${token}`, {
        responseType: 'blob',
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', sharedData?.item?.name || 'downloaded-file')
      document.body.appendChild(link)
      link.click()
      link.remove()
      toast.success('Download started')
    } catch (err) {
      toast.error('Failed to download file')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Spinner size="lg" />
        <p className="mt-4 text-slate-500 text-sm">Verifying share link...</p>
      </div>
    )
  }

  if (error || !sharedData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Access Denied</h2>
        <p className="text-slate-500 text-sm max-w-md mt-2 mb-6">{error}</p>
        <a
          href="/login"
          className="text-orange-600 font-semibold text-sm hover:underline"
        >
          Return to Drivea Login
        </a>
      </div>
    )
  }

  const { item } = sharedData

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Drivea Logo" className="h-8" />
          <span className="font-bold text-slate-900 text-xl tracking-tight">Drivea</span>
        </div>
        <a
          href="/login"
          className="text-sm font-medium text-orange-600 hover:text-orange-700"
        >
          Sign In
        </a>
      </header>

      {/* Main Shared Content Box */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full shadow-2xs text-center space-y-6">
          <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-2xl mx-auto flex items-center justify-center">
            <FileText className="w-10 h-10" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 break-words">{item?.name || 'Shared Item'}</h3>
            <p className="text-slate-500 text-sm mt-1">
              Shared with you via public link
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 text-xs text-slate-600 space-y-1.5 text-left border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-400">File Type:</span>
              <span className="font-medium text-slate-800">{item?.mime_type || item?.mimeType || 'Document'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Shared Date:</span>
              <span className="font-medium text-slate-800">
                {new Date(sharedData.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <Button
            onClick={handleDownload}
            variant="primary"
            className="w-full py-3 gap-2"
          >
            <Download className="w-5 h-5" />
            <span>Download File</span>
          </Button>
        </div>
      </main>
    </div>
  )
}

export default SharedWithMe