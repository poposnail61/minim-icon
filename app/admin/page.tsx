'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import IconGrid from '../../components/IconGrid'
import UploadZone from '../../components/UploadZone'

interface Icon {
  name: string
  url: string
}

export default function AdminDashboard() {
  const [icons, setIcons] = useState<Icon[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchIcons = async () => {
    try {
      const res = await fetch('/api/icons')
      if (res.ok) {
        const data = await res.json()
        setIcons(data.icons)
      }
    } catch (error) {
      console.error('Failed to fetch icons', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchIcons()
  }, [])

  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    try {
      const res = await fetch(`/api/icons/${name}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        fetchIcons()
      } else {
        alert('Failed to delete icon')
      }
    } catch (error) {
      alert('Error deleting icon')
    }
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Upload Icons</h2>
          <UploadZone onUploadComplete={fetchIcons} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Manage Icons</h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <IconGrid icons={icons} onDelete={handleDelete} showControls={true} />
          )}
        </div>
      </div>
    </div>
  )
}
