'use client'

import { useState, useEffect } from 'react'
import UploadZone from '../../components/UploadZone'
import IconGrid from '../../components/IconGrid'
import { Tag, Plus, X } from 'lucide-react'

interface Icon {
  name: string
  url: string
  tags?: string[]
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [icons, setIcons] = useState<Icon[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)

  // Tagging State
  const [selectedIcons, setSelectedIcons] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isAddingTags, setIsAddingTags] = useState(false)

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
        setSelectedIcons(selectedIcons.filter(id => id !== name))
      } else {
        alert('Failed to delete icon')
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('An error occurred while deleting')
    }
  }

  // Tagging Logic
  const toggleSelection = (icon: Icon) => {
    if (selectedIcons.includes(icon.name)) {
      setSelectedIcons(selectedIcons.filter(id => id !== icon.name))
    } else {
      setSelectedIcons([...selectedIcons, icon.name])
    }
  }

  const handleAddTags = async () => {
    if (!tagInput.trim()) return
    setIsAddingTags(true)

    const tagsToAdd = tagInput.split(',').map(t => t.trim()).filter(Boolean)
    const updates: Record<string, string[]> = {}

    selectedIcons.forEach(iconName => {
      const icon = icons.find(i => i.name === iconName)
      if (icon) {
        const currentTags = icon.tags || []
        // Add new tags avoiding duplicates
        const newTags = Array.from(new Set([...currentTags, ...tagsToAdd]))
        updates[iconName] = newTags
      }
    })

    try {
      const res = await fetch('/api/icons', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: updates })
      })

      if (res.ok) {
        setTagInput('')
        setSelectedIcons([])
        await fetchIcons() // Refresh to show new tags
        alert('Tags added successfully!')
      } else {
        alert('Failed to add tags')
      }
    } catch (error) {
      console.error('Tag update error:', error)
      alert('Error updating tags')
    } finally {
      setIsAddingTags(false)
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
    <div className="min-h-screen bg-gray-50 relative pb-20">
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
            <h2 className="text-lg font-medium text-gray-900 mb-4">Manage Icons & Tags</h2>
            {loading ? (
              <div className="text-center py-12">Loading...</div>
            ) : (
              <IconGrid
                icons={icons}
                onDelete={handleDelete}
                showControls={true}
                layoutMode="full"
                onIconClick={toggleSelection}
                selectedIds={selectedIcons}
              />
            )}
          </div>
        </div>
      </main>

      {/* Floating Tag Management Bar */}
      {selectedIcons.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-lg p-4 animate-in slide-in-from-bottom-5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                {selectedIcons.length} Selected
              </div>
              <button
                onClick={() => setSelectedIcons([])}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-3 w-full max-w-lg">
              <div className="relative flex-grow">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Enter tags (comma separated)..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTags()}
                />
              </div>
              <button
                onClick={handleAddTags}
                disabled={!tagInput.trim() || isAddingTags}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isAddingTags ? (
                  <span className="animate-spin mr-2">...</span>
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>Add Tags</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
