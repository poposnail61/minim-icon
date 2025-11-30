'use client'

import { useState, useEffect } from 'react'
import UploadZone from '../../components/UploadZone'
import IconGrid from '../../components/IconGrid'

interface Icon {
  name: string
  url: string
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [icons, setIcons] = useState<Icon[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        setIsAuthenticated(true)
        fetchIcons()
      } else {
        alert('Invalid password')
      }
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  const fetchIcons = async () => {
    setLoading(true)
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

  const handleUpload = async (files: File[]) => {
    setIsUploading(true)
    try {
      let successCount = 0
      let failCount = 0

      for (const file of files) {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/icons', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          successCount++
        } else {
          failCount++
          console.error(`Failed to upload ${file.name}`)
        }
      }

      if (successCount > 0) {
        await fetchIcons()
        alert(`Uploaded ${successCount} files successfully.${failCount > 0 ? ` Failed: ${failCount}` : ''}`)
      } else if (failCount > 0) {
        alert('Failed to upload files.')
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('An error occurred during upload.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return

    try {
      const res = await fetch(`/api/icons?name=${name}.svg`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setIcons(icons.filter(icon => icon.name !== name))
      } else {
        alert('Failed to delete icon')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('An error occurred while deleting')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Admin Login
            </h2>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Icon Manager
          </h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Upload Icons</h2>
            <UploadZone onUpload={handleUpload} isUploading={isUploading} />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Manage Icons</h2>
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <IconGrid icons={icons} onDelete={handleDelete} showControls={true} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
