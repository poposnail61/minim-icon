'use client'

import { Search, Tag } from 'lucide-react'
import { useMemo } from 'react'

interface SidebarFilterProps {
    search: string
    setSearch: (value: string) => void
    selectedTags: string[]
    toggleTag: (tag: string) => void
    icons: { tags?: string[] }[]
}

export default function SidebarFilter({
    search,
    setSearch,
    selectedTags,
    toggleTag,
    icons
}: SidebarFilterProps) {

    // Extract unique tags and sort them
    const availableTags = useMemo(() => {
        const tags = new Set<string>()
        icons.forEach(icon => {
            if (icon.tags) {
                icon.tags.forEach(tag => tags.add(tag))
            }
        })
        return Array.from(tags).sort()
    }, [icons])

    return (
        <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-white h-[calc(100vh-64px)] overflow-y-auto sticky top-16 hidden lg:block">
            <div className="p-6 space-y-8">
                {/* Stats */}
                <div>
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Total Icons
                    </h2>
                    <div className="text-3xl font-bold text-gray-900">
                        {icons.length}
                    </div>
                </div>

                {/* Search */}
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Tag Cloud Filter */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-gray-900">Filter by Tags</h3>
                        {selectedTags.length > 0 && (
                            <span className="text-xs text-indigo-600 font-medium">
                                {selectedTags.length} active
                            </span>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {availableTags.length > 0 ? (
                            availableTags.map((tag) => {
                                const isActive = selectedTags.includes(tag)
                                return (
                                    <button
                                        key={tag}
                                        onClick={() => toggleTag(tag)}
                                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${isActive
                                                ? 'bg-indigo-100 text-indigo-800 border-indigo-200 ring-1 ring-indigo-500 ring-offset-1'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Tag className={`w-3 h-3 mr-1.5 ${isActive ? 'text-indigo-500' : 'text-gray-400'}`} />
                                        {tag}
                                    </button>
                                )
                            })
                        ) : (
                            <p className="text-sm text-gray-400 italic">No tags found.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
