'use client'

import { useState, useMemo } from 'react'
import { Search, Copy, Check, Trash2 } from 'lucide-react'

interface Icon {
  name: string
  url: string
}

interface IconGridProps {
  icons: Icon[]
  onDelete?: (name: string) => void
  showControls?: boolean
}

export default function IconGrid({ icons, onDelete, showControls = false }: IconGridProps) {
  const [search, setSearch] = useState('')
  const [size, setSize] = useState(24)
  const [copied, setCopied] = useState<string | null>(null)

  const filteredIcons = useMemo(() => {
    return icons.filter(icon => icon.name.toLowerCase().includes(search.toLowerCase()))
  }, [icons, search])

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text)
    setCopied(name)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search icons..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <span className="text-sm text-gray-500 whitespace-nowrap">Size: {size}px</span>
          <input
            type="range"
            min="16"
            max="64"
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="w-full sm:w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredIcons.map((icon) => (
          <div 
            key={icon.name} 
            className="group relative flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => copyToClipboard(`<i class="icon icon-${icon.name}"></i>`, icon.name)}
          >
            <div 
              className="mb-4 transition-transform duration-200 group-hover:scale-110"
              style={{ width: `${size}px`, height: `${size}px` }}
            >
              <i 
                className={`icon icon-${icon.name} block w-full h-full bg-current`} 
                style={{ 
                  maskImage: `url(${icon.url})`,
                  WebkitMaskImage: `url(${icon.url})`,
                  maskSize: 'contain',
                  WebkitMaskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'center',
                  WebkitMaskPosition: 'center',
                  backgroundColor: 'currentColor'
                }} 
              />
            </div>
            
            <div className="text-xs text-gray-500 font-medium truncate w-full text-center group-hover:text-indigo-600">
              {icon.name}
            </div>

            {/* Hover Actions */}
            <div className={`absolute inset-0 flex items-center justify-center bg-white/90 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${copied === icon.name ? 'opacity-100' : ''}`}>
              {copied === icon.name ? (
                <div className="flex flex-col items-center text-green-600">
                  <Check className="w-8 h-8 mb-1" />
                  <span className="text-xs font-bold">Copied!</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-indigo-600">
                  <Copy className="w-8 h-8 mb-1" />
                  <span className="text-xs font-bold">Copy HTML</span>
                </div>
              )}
            </div>

            {/* Admin Delete Button (Top Right) */}
            {showControls && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(icon.name)
                }}
                className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                title="Delete Icon"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {filteredIcons.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No icons found matching "{search}"</p>
        </div>
      )}
    </div>
  )
}
