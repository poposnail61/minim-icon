'use client'

import { useState, useMemo, useEffect } from 'react'
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

type FilterType = 'all' | 'outline' | 'solid'

const IconItem = ({
  icon,
  size,
  onDelete,
  showControls,
  onCopy,
  copied
}: {
  icon: Icon
  size: number
  onDelete?: (name: string) => void
  showControls: boolean
  onCopy: (text: string, name: string) => void
  copied: string | null
}) => {
  const [aspectRatio, setAspectRatio] = useState(1)

  useEffect(() => {
    const img = new Image()
    img.src = icon.url
    img.onload = () => {
      if (img.height > 0) {
        setAspectRatio(img.width / img.height)
      }
    }
  }, [icon.url])

  return (
    <div
      className="group relative flex items-center justify-center bg-white rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer border border-transparent hover:border-gray-200"
      style={{
        padding: '1rem',
      }}
      onClick={() => onCopy(`<i class="icon icon-${icon.name}"></i>`, icon.name)}
      title={icon.name}
    >
      <div
        className="transition-transform duration-200 group-hover:scale-110 text-gray-700 group-hover:text-gray-900"
      >
        <i
          className={`icon icon-${icon.name} block bg-current`}
          style={{
            width: `${size * aspectRatio}px`,
            height: `${size}px`,
            maskImage: `url(${icon.url})`,
            WebkitMaskImage: `url(${icon.url})`,
            maskSize: '100% 100%',
            WebkitMaskSize: '100% 100%',
            maskRepeat: 'no-repeat',
            WebkitMaskRepeat: 'no-repeat',
            maskPosition: 'center',
            WebkitMaskPosition: 'center',
            backgroundColor: 'currentColor'
          }}
        />
      </div>

      {/* Copied Feedback Overlay */}
      {copied === icon.name && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded-xl animate-in fade-in duration-200 z-10">
          <Check className="w-6 h-6 text-white" />
        </div>
      )}

      {/* Admin Delete Button */}
      {showControls && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete(icon.name)
          }}
          className="absolute top-1 right-1 p-1 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
          title="Delete Icon"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

export default function IconGrid({ icons, onDelete, showControls = false }: IconGridProps) {
  const [search, setSearch] = useState('')
  const [size, setSize] = useState(24)
  const [copied, setCopied] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredIcons = useMemo(() => {
    return icons.filter(icon => {
      const matchesSearch = icon.name.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = 
        filter === 'all' ? true :
        filter === 'outline' ? icon.name.includes('-outline') :
        filter === 'solid' ? icon.name.includes('-solid') : true
      
      return matchesSearch && matchesFilter
    })
  }, [icons, search, filter])

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text)
    setCopied(name)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                placeholder="Search icons..."
                className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 sm:text-base transition duration-200 ease-in-out shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            </div>

            {/* Filter Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-xl">
                {(['all', 'outline', 'solid'] as FilterType[]).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all ${
                            filter === f 
                                ? 'bg-white text-gray-900 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 font-medium">
                {filteredIcons.length} icons
            </div>
            <div className="flex items-center space-x-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Size</span>
            <input
                type="range"
                min="16"
                max="64"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-32 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <span className="text-sm text-gray-600 w-8 text-right">{size}px</span>
            </div>
        </div>
      </div>

      {/* Grid */}
      <div className="flex flex-wrap gap-4 pb-12">
        {filteredIcons.map((icon) => (
          <IconItem
            key={icon.name}
            icon={icon}
            size={size}
            onDelete={onDelete}
            showControls={showControls}
            onCopy={copyToClipboard}
            copied={copied}
          />
        ))}
      </div>

      {filteredIcons.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No icons found matching "{search}" {filter !== 'all' ? `in ${filter}` : ''}</p>
        </div>
      )}
    </div>
  )
}
