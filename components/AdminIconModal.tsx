'use client'

import { useState, useEffect } from 'react'
import { X, Trash2, Plus, Tag } from 'lucide-react'

interface Icon {
    name: string
    url: string
    tags?: string[]
}

interface AdminIconModalProps {
    icon: Icon | null
    isOpen: boolean
    onClose: () => void
    onDelete: (name: string) => void
    onUpdateTags: (name: string, tags: string[]) => void
}

export default function AdminIconModal({ icon, isOpen, onClose, onDelete, onUpdateTags }: AdminIconModalProps) {
    const [tagInput, setTagInput] = useState('')
    const [currentTags, setCurrentTags] = useState<string[]>([])

    useEffect(() => {
        if (icon) {
            setCurrentTags(icon.tags || [])
        }
    }, [icon])

    if (!isOpen || !icon) return null

    const handleAddTag = () => {
        if (!tagInput.trim()) return
        const newTag = tagInput.trim()
        if (!currentTags.includes(newTag)) {
            const updatedTags = [...currentTags, newTag]
            setCurrentTags(updatedTags)
            onUpdateTags(icon.name, updatedTags)
        }
        setTagInput('')
    }

    const handleRemoveTag = (tagToRemove: string) => {
        const updatedTags = currentTags.filter(tag => tag !== tagToRemove)
        setCurrentTags(updatedTags)
        onUpdateTags(icon.name, updatedTags)
    }

    const handleDelete = () => {
        if (confirm(`Are you sure you want to delete ${icon.name}? This cannot be undone.`)) {
            onDelete(icon.name)
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900 truncate pr-4">
                        {icon.name}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    {/* Icon Preview */}
                    <div className="flex justify-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                        <img
                            src={icon.url}
                            alt={icon.name}
                            className="w-32 h-32 object-contain"
                        />
                    </div>

                    {/* Tag Management */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-indigo-500" />
                            Tags
                        </label>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                                placeholder="Add a tag..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                            <button
                                onClick={handleAddTag}
                                disabled={!tagInput.trim()}
                                className="px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Tag List */}
                        <div className="flex flex-wrap gap-2 min-h-[2rem]">
                            {currentTags.length > 0 ? (
                                currentTags.map(tag => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 group border border-indigo-100"
                                    >
                                        {tag}
                                        <button
                                            onClick={() => handleRemoveTag(tag)}
                                            className="ml-1.5 text-indigo-400 hover:text-indigo-600"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400 italic">No tags added yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Icon</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
