'use client'

import { Search } from 'lucide-react'

type FilterType = 'all' | 'outline' | 'solid'

interface SidebarFilterProps {
    search: string
    setSearch: (value: string) => void
    filter: FilterType
    setFilter: (value: FilterType) => void
    totalIcons: number
}

export default function SidebarFilter({
    search,
    setSearch,
    filter,
    setFilter,
    totalIcons
}: SidebarFilterProps) {
    return (
        <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-white h-[calc(100vh-64px)] overflow-y-auto sticky top-16 hidden lg:block">
            <div className="p-6 space-y-8">
                {/* Stats */}
                <div>
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                        Icons
                    </h2>
                    <div className="text-3xl font-bold text-gray-900">
                        {totalIcons}
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

                {/* Style Filter */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Style</h3>
                    <div className="space-y-2">
                        {(['all', 'outline', 'solid'] as FilterType[]).map((f) => (
                            <label key={f} className="flex items-center cursor-pointer group">
                                <input
                                    type="radio"
                                    name="style-filter"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                    checked={filter === f}
                                    onChange={() => setFilter(f)}
                                />
                                <span className={`ml-3 text-sm capitalize group-hover:text-indigo-600 transition-colors ${filter === f ? 'text-gray-900 font-medium' : 'text-gray-600'
                                    }`}>
                                    {f}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
