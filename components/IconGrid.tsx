'use client'

import { useState } from 'react'

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
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text)
    setCopied(name)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {icons.map((icon) => (
        <div key={icon.name} className="border rounded-lg p-4 flex flex-col items-center space-y-3 bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 flex items-center justify-center bg-gray-50 rounded-md">
            <i 
              className={`icon icon-${icon.name}`} 
              style={{ 
                maskImage: `url(${icon.url})`,
                WebkitMaskImage: `url(${icon.url})`,
                fontSize: '24px' 
              }} 
            />
          </div>
          <div className="text-sm font-medium text-gray-700 truncate w-full text-center">
            {icon.name}
          </div>
          
          <div className="flex space-x-2 w-full">
            <button
              onClick={() => copyToClipboard(`<i class="icon icon-${icon.name}"></i>`, icon.name)}
              className="flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-600 py-1 px-2 rounded transition-colors"
            >
              {copied === icon.name ? 'Copied!' : 'Copy HTML'}
            </button>
            {showControls && onDelete && (
              <button
                onClick={() => onDelete(icon.name)}
                className="text-xs bg-red-50 hover:bg-red-100 text-red-600 py-1 px-2 rounded transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
