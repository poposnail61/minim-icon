'use client'

import { useState, useEffect, useMemo } from 'react'
import { Check, Search, RefreshCcw } from 'lucide-react'

// Define Icon interface locally if not available globally, or rely on parent.
interface Icon {
  name: string
  url: string
  tags?: string[]
}

interface IconGridProps {
  icons: Icon[]
  onDelete?: (name: string) => void
  showControls?: boolean
  onIconClick?: (icon: Icon) => void
  layoutMode?: 'full' | 'minimal'
  selectedIds?: string[]
  onToggleSelection?: (icon: Icon) => void
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
  showControls,
  onCopy,
  copied,
  selectedColor,
  onClick,
  isSelected,
  onToggleSelection
}: {
  icon: Icon
  size: number
  onDelete?: (name: string) => void
  showControls: boolean
  onCopy: (text: string, name: string) => void
  copied: string | null
  selectedColor: string | null
  onClick?: () => void
  isSelected?: boolean
  onToggleSelection?: () => void
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
      className={`group relative flex flex-col bg-white rounded-xl overflow-hidden transition-all duration-200 cursor-pointer border shadow-sm hover:shadow-md ${isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500 ring-offset-2'
          : 'border-gray-200 hover:border-gray-300'
        }`}
      onClick={() => {
        if (onClick) {
          onClick()
        } else {
          onCopy(`<i class="icon icon-${icon.name}"></i>`, icon.name)
        }
      }}
      title={icon.name}
    >
      {/* 
        NEW LAYOUT: Header Row for Checkbox
        This separates the control from the icon content physically in the DOM flow.
      */}
      {showControls && onToggleSelection ? (
        <div className="h-8 bg-gray-50 border-b border-gray-100 flex items-center px-2">
          <div
            className="p-1 hover:bg-gray-200 rounded cursor-pointer z-10"
            onClick={(e) => {
              e.stopPropagation()
              onToggleSelection()
            }}
          >
            <div className={`w-[20px] h-[20px] rounded border flex items-center justify-center transition-colors ${isSelected
                ? 'bg-indigo-500 border-indigo-500'
                : 'bg-white border-gray-300'
              }`}>
              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
            </div>
          </div>
          {/* Tags Indicator in Header */}
          {icon.tags && icon.tags.length > 0 && (
            <div className="ml-auto flex gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-400" title={`${icon.tags.length} tags`}></span>
            </div>
          )}
        </div>
      ) : (
        // Spacer for consistency if controls are off but we want similar alignment
        // Or just omitted if Minimal mode
        null
      )}

      {/* Main Icon Content Area */}
      <div
        className="flex-1 flex items-center justify-center p-4 min-h-[100px]"
        style={{ minWidth: '100px' }}
      >
        <div className="transition-transform duration-200 group-hover:scale-110 text-gray-700 group-hover:text-gray-900">
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
      </div>

      {/* Copied Feedback Overlay */}
      {!onClick && copied === icon.name && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/90 rounded-xl animate-in fade-in duration-200 z-20">
          <Check className="w-6 h-6 text-white" />
        </div>
      )}
    </div>
  )
}

export default function IconGrid({
  icons,
  onDelete,
  showControls = false,
  onIconClick,
  layoutMode = 'full',
  selectedIds = [],
  onToggleSelection
}: IconGridProps) {
  const [search, setSearch] = useState('')
  const [size, setSize] = useState(24)
  const [copied, setCopied] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>('all')
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [customHex, setCustomHex] = useState('')

  // Internal filtering only for 'full' mode.
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
      {/* 
        Refactored Toolbar: Uses flex-wrap and explicitly sized containers to prevent collisions 
      */}
      {layoutMode === 'full' && (
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100 py-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 space-y-4">

          {/* Row 1: Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Search Input - Grows to fill available space */}
            <div className="relative flex-grow w-full md:w-auto min-w-[200px]">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search icons..."
                className="block w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-200 ease-in-out shadow-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Filter Tabs - Fixed width container on mobile, auto on desktop */}
            <div className="flex p-1 bg-gray-100 rounded-xl shrink-0">
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

          {/* Row 2: Color & Size */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-4">

            {/* Colors Wrapper */}
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
                        : 'hover:scale-105'
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

            {/* Size Slider */}
            <div className="flex items-center space-x-4 ml-auto">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Size</span>
              <input
                type="range"
                min="16"
                max="64"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-32 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-sm text-gray-600 w-8 text-right font-mono">{size}px</span>
            </div>
          </div>

          <div className="text-xs text-gray-400 font-medium pt-1">
            Showing {displayIcons.length} icons
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4 pb-12">
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
            isSelected={selectedIds.includes(icon.name)}
            onToggleSelection={onToggleSelection ? () => onToggleSelection(icon) : undefined}
          />
        ))}
      </div>

      {displayIcons.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-500">No icons found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
