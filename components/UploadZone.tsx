'use client'

import { useState, useCallback } from 'react'
import { Upload, X, FileText, Loader2 } from 'lucide-react'

interface UploadZoneProps {
  onUpload: (files: File[]) => Promise<void>
  isUploading: boolean
}

export default function UploadZone({ onUpload, isUploading }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => file.type === 'image/svg+xml')
      setSelectedFiles(prev => [...prev, ...newFiles])
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).filter(file => file.type === 'image/svg+xml')
      setSelectedFiles(prev => [...prev, ...newFiles])
    }
  }, [])

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUploadClick = async () => {
    if (selectedFiles.length === 0) return
    await onUpload(selectedFiles)
    setSelectedFiles([])
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ease-in-out text-center ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50 scale-[1.02]'
            : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleFileSelect}
          accept=".svg"
          multiple
          disabled={isUploading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
          <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'}`}>
            <Upload className="w-8 h-8" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragging ? 'Drop files here' : 'Click or drag files to upload'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Supports multiple SVG files
            </p>
          </div>
        </div>
      </div>

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">{selectedFiles.length} files selected</span>
            <button 
              onClick={() => setSelectedFiles([])}
              className="text-xs text-red-500 hover:text-red-600 font-medium"
            >
              Clear all
            </button>
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-gray-100">
            {selectedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-600 truncate">{file.name}</span>
                  <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                  disabled={isUploading}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload {selectedFiles.length} Files</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
