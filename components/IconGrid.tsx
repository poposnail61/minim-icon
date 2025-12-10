'use client'

import { useState, useMemo, useEffect } from 'react'
import { Search, Copy, Check, Trash2, RefreshCcw } from 'lucide-react'

interface Icon {
  name: string
  url: string
}

interface IconGridProps {
  icons: Icon[]
  onDelete?: (name: string) => void
  showControls?: boolean
  onIconClick?: (icon: Icon) => void
  layoutMode?: 'full' | 'minimal'
}

type FilterType = 'all' | 'outline' | 'solid'

const COLORS = [
  { name: 'Original', value: null },
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#FFFFFF' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#10B981' },
]

const IconItem = ({
  icon,
  size,
  onDelete,
  showControls,
  onCopy,
  copied,
  selectedColor,
  onClick
}: {
  icon: Icon
  size: number
  onDelete?: (name: string) => void
  showControls: boolean
  onCopy: (text: string, name: string) => void
  copied: string | null
  selectedColor: string | null
  onClick?: () => void
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
      onClick={() => {
        if (onClick) {
          onClick()
        } else {
          onCopy(`<i class="icon icon-${icon.name}"></i>`, icon.name)
        }
      }}
      title={icon.name}
    >
      <div
        className="transition-transform duration-200 group-hover:scale-110 text-gray-700 group-hover:text-gray-900"
      >
        {selectedColor ? (
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
              backgroundColor: selectedColor
            }}
          />
        ) : (
          <img
            src={icon.url}
            alt={icon.name}
            style={{
              width: `${size * aspectRatio}px`,
              height: `${size}px`,
              objectFit: 'contain'
            }}
          />
        )}
      </div>

      {/* Copied Feedback Overlay (Only show if not in selection mode) */}
      {!onClick && copied === icon.name && (
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

export default function IconGrid({
  icons,
  onDelete,
  showControls = false,
  onIconClick,
  layoutMode = 'full'
}: IconGridProps) {
  const [search, setSearch] = useState('')
  const [size, setSize] = useState(24)
  const [copied, setCopied] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [customHex, setCustomHex] = useState('')

  // Internal filtering only for 'full' mode.
  // In 'minimal' mode, we assume parent filters icons.
  const displayIcons = useMemo(() => {
    if (layoutMode === 'minimal') return icons

    return icons.filter(icon => {
      const matchesSearch = icon.name.toLowerCase().includes(search.toLowerCase())
      const matchesFilter =
        filter === 'all' ? true :
          filter === 'outline' ? icon.name.includes('-outline') :
            filter === 'solid' ? icon.name.includes('-solid') : true

      return matchesSearch && matchesFilter
    })
  }, [icons, search, filter, layoutMode])

  const copyToClipboard = (text: string, name: string) => {
    navigator.clipboard.writeText(text)
    setCopied(name)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setCustomHex(val)
    if (/^#[0-9A-F]{6}$/i.test(val)) {
      setSelectedColor(val)
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar - Only show in Full Mode */}
      {layoutMode === 'full' && (
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
                  className={`px-4 py-2 text-sm font-medium rounded-lg capitalize transition-all ${filter === f
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Color Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
              {COLORS.map((color) => (
                <button
                  key={color.name}
                  onClick={() => {
                    setSelectedColor(color.value)
                    if (color.value === null) setCustomHex('')
                  }}
                  className={`w-8 h-8 rounded-md border flex items-center justify-center transition-all ${selectedColor === color.value
                    ? 'ring-2 ring-indigo-500 ring-offset-2'
                    : 'hover:scale-110'
                    }`}
                  style={{
                    backgroundColor: color.value || '#transparent',
                    borderColor: color.name === 'White' || color.name === 'Original' ? '#e5e7eb' : 'transparent',
                    background: color.name === 'Original'
                      ? 'linear-gradient(45deg, #f3f4f6 25%, transparent 25%, transparent 75%, #f3f4f6 75%, #f3f4f6), linear-gradient(45deg, #f3f4f6 25%, transparent 25%, transparent 75%, #f3f4f6 75%, #f3f4f6)'
                      : undefined,
                    backgroundSize: '8px 8px',
                    backgroundPosition: '0 0, 4px 4px'
                  }}
                  title={color.name}
                >
                  {color.name === 'Original' && <RefreshCcw className="w-4 h-4 text-gray-400" />}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 font-medium">Hex</span>
              <input
                type="text"
                placeholder="#000000"
                value={customHex}
                onChange={handleHexChange}
                className="w-24 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
                maxLength={7}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500 font-medium">
              {displayIcons.length} icons
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
      )}

      {/* Grid */}
      <div className="flex flex-wrap gap-4 pb-12">
        {displayIcons.map((icon) => (
          <IconItem
            key={icon.name}
            icon={icon}
            size={size}
            onDelete={onDelete}
            showControls={showControls}
            onCopy={copyToClipboard}
            copied={copied}
            selectedColor={selectedColor}
            onClick={onIconClick ? () => onIconClick(icon) : undefined}
          />
        ))}
      </div>

      {displayIcons.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No icons found.</p>
        </div>
      )}
    </div>
  )
}
