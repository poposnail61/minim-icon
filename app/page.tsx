'use client'

import { useState, useEffect } from 'react'
import IconGrid from '../components/IconGrid'
import SidebarFilter from '../components/SidebarFilter'
import IconDetailsPanel from '../components/IconDetailsPanel'
import Link from 'next/link'

interface Icon {
  name: string
  url: string
  tags?: string[]
}

export default function Home() {
  const [icons, setIcons] = useState<Icon[]>([])
  const [loading, setLoading] = useState(true)

  // Filter States
  const [search, setSearch] = useState('')
  const [tagFilters, setTagFilters] = useState<Record<string, 'include' | 'exclude'>>({})

  // Selection State
  const [selectedIcon, setSelectedIcon] = useState<Icon | null>(null)

  // Visualization States
  const [previewColor, setPreviewColor] = useState<string | null>(null)
  const [previewSize, setPreviewSize] = useState(24)

  useEffect(() => {
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
    fetchIcons()
  }, [])

  // Filter Logic
  const filteredIcons = icons.filter(icon => {
    const matchesSearch = icon.name.toLowerCase().includes(search.toLowerCase())

    const includedTags = Object.entries(tagFilters)
      .filter(([_, status]) => status === 'include')
      .map(([tag]) => tag)

    const excludedTags = Object.entries(tagFilters)
      .filter(([_, status]) => status === 'exclude')
      .map(([tag]) => tag)

    const iconTags = icon.tags || []

    // 1. Must include ALL 'includedTags' (AND logic)
    const hasAllIncludes = includedTags.length === 0 || includedTags.every(t => iconTags.includes(t))

    // 2. Must NOT include ANY 'excludedTags' (NOT logic)
    const hasNoExcludes = excludedTags.length === 0 || !excludedTags.some(t => iconTags.includes(t))

    return matchesSearch && hasAllIncludes && hasNoExcludes
  })

  // Handle Tag Toggle (Tri-state: Include -> Exclude -> Off)
  const toggleTag = (tag: string) => {
    setTagFilters(prev => {
      const current = prev[tag]
      const next = { ...prev }

      if (!current) {
        next[tag] = 'include'
      } else if (current === 'include') {
        next[tag] = 'exclude'
      } else {
        delete next[tag]
      }

      return next
    })
  }

  // Handle Icon Click
  const handleIconClick = (icon: Icon) => {
    setSelectedIcon(icon)
  }

  return (
    <div className="h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="h-16 px-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Minim Icon
            </h1>
          </div>
          <div>
            <Link href="/admin" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Sidebar */}
        <SidebarFilter
          search={search}
          setSearch={setSearch}
          tagFilters={tagFilters}
          toggleTag={toggleTag}
          icons={icons}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50/50 p-6 sm:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : (
            <div className="max-w-[1600px] mx-auto">
              <IconGrid
                icons={filteredIcons}
                showControls={false}
                onIconClick={handleIconClick}
                layoutMode="minimal"
              />
            </div>
          )}
        </main>

        {/* Right Details Panel */}
        {selectedIcon && (
          <IconDetailsPanel
            icon={selectedIcon}
            onClose={() => setSelectedIcon(null)}
            color={previewColor}
            setColor={setPreviewColor}
            size={previewSize}
            setSize={setPreviewSize}
          />
        )}
      </div>
    </div>
  )
}
