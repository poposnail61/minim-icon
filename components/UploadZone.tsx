'use client'

import { useState, useCallback } from 'react'

interface UploadZoneProps {
  onUploadComplete: () => void
}

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await uploadFiles(files)
    }
  }, [])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(Array.from(e.target.files))
    }
  }

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true)
    setMessage('')
    
    let successCount = 0
    let errorCount = 0

    for (const file of files) {
      if (file.type !== 'image/svg+xml') {
        errorCount++
        continue
      }

      const formData = new FormData()
      formData.append('file', file)

      try {
        const res = await fetch('/api/icons', {
          method: 'POST',
          body: formData,
        })
        if (res.ok) successCount++
        else errorCount++
      } catch (err) {
        errorCount++
      }
    }

    setIsUploading(false)
    setMessage(`Uploaded ${successCount} files. ${errorCount > 0 ? `${errorCount} failed.` : ''}`)
    if (successCount > 0) {
      onUploadComplete()
    }
  }

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="space-y-2">
        <div className="text-4xl text-gray-400">
          ☁️
        </div>
        <div className="text-gray-600">
          <span className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer relative">
            Upload a file
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileSelect}
              accept=".svg"
              multiple
            />
          </span>
          {' '}or drag and drop
        </div>
        <p className="text-xs text-gray-500">SVG files only</p>
      </div>
      {isUploading && (
        <div className="mt-4 text-sm text-indigo-600">Uploading...</div>
      )}
      {message && (
        <div className="mt-4 text-sm text-gray-600">{message}</div>
      )}
    </div>
  )
}
