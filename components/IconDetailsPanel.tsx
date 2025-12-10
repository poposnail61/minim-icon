'use client'

import { X, Copy, Download, Code } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Icon {
    name: string
    url: string
    tags?: string[]
}

interface IconDetailsPanelProps {
    icon: Icon | null
    onClose: () => void
    color: string | null
    setColor: (color: string | null) => void
    size: number
    setSize: (size: number) => void
}

const COLORS = [
    { name: 'Original', value: null },
    { name: 'Black', value: '#000000' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
]

export default function IconDetailsPanel({
    icon,
    onClose,
    color,
    setColor,
    size,
    setSize
}: IconDetailsPanelProps) {
    const [svgContent, setSvgContent] = useState<string>('')
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null)

    useEffect(() => {
        if (icon) {
            fetch(icon.url)
                .then(res => res.text())
                .then(text => setSvgContent(text))
                .catch(err => console.error('Failed to load SVG content', err))
        }
    }, [icon])

    if (!icon) return null

    const handleCopySvg = () => {
        navigator.clipboard.writeText(svgContent)
        setCopyFeedback('SVG Copied!')
        setTimeout(() => setCopyFeedback(null), 2000)
    }

    const handleCopyJsx = () => {
        const jsx = `<i class="icon icon-${icon.name}"></i>`
        navigator.clipboard.writeText(jsx)
        setCopyFeedback('JSX Copied!')
        setTimeout(() => setCopyFeedback(null), 2000)
    }

    return (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out border-l border-gray-200 z-50 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 truncate pr-4">{icon.name}</h2>
                <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            <div className="p-8 space-y-8">
                {/* Preview */}
                <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 relative overflow-hidden group">
                    <div
                        className="transition-all duration-300"
                        style={{
                            transform: `scale(${size / 24})` // Visual scaling for preview
                        }}
                    >
                        {color ? (
                            <i
                                className={`icon icon-${icon.name} block bg-current`}
                                style={{
                                    width: '64px', // Base large size
                                    height: '64px',
                                    maskImage: `url(${icon.url})`,
                                    WebkitMaskImage: `url(${icon.url})`,
                                    maskSize: '100% 100%',
                                    WebkitMaskSize: '100% 100%',
                                    maskRepeat: 'no-repeat',
                                    WebkitMaskRepeat: 'no-repeat',
                                    maskPosition: 'center',
                                    WebkitMaskPosition: 'center',
                                    backgroundColor: color
                                }}
                            />
                        ) : (
                            <img
                                src={icon.url}
                                alt={icon.name}
                                className="w-16 h-16 object-contain"
                            />
                        )}
                    </div>

                    {/* Grid Background Pattern */}
                    <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                        style={{
                            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}
                    />
                </div>

                {/* Controls */}
                <div className="space-y-6">
                    {/* Color */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Color</label>
                        <div className="flex flex-wrap gap-3">
                            {COLORS.map((c) => (
                                <button
                                    key={c.name}
                                    onClick={() => setColor(c.value)}
                                    className={`w-8 h-8 rounded-full border-2 transition-all ${color === c.value ? 'border-indigo-600 scale-110' : 'border-transparent hover:scale-110'
                                        }`}
                                    style={{
                                        backgroundColor: c.value || 'transparent',
                                        background: c.name === 'Original'
                                            ? 'linear-gradient(45deg, #f3f4f6 25%, transparent 25%, transparent 75%, #f3f4f6 75%, #f3f4f6), linear-gradient(45deg, #f3f4f6 25%, transparent 25%, transparent 75%, #f3f4f6 75%, #f3f4f6)'
                                            : undefined,
                                        backgroundSize: '8px 8px',
                                        backgroundPosition: '0 0, 4px 4px'
                                    }}
                                    title={c.name}
                                >
                                    {c.name === 'Original' && !color && <div className="w-full h-full rounded-full border border-gray-200" />}
                                </button>
                            ))}
                            {/* Hex Input */}
                            <input
                                type="text"
                                placeholder="#"
                                className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                value={color || ''}
                                onChange={(e) => setColor(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Size */}
                    <div>
                        <div className="flex justify-between mb-3">
                            <label className="text-sm font-medium text-gray-700">Size</label>
                            <span className="text-sm text-gray-500">{size}px</span>
                        </div>
                        <input
                            type="range"
                            min="16"
                            max="96"
                            value={size}
                            onChange={(e) => setSize(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-6 border-t border-gray-100">
                    <button
                        onClick={handleCopySvg}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors"
                    >
                        <Copy className="w-4 h-4" />
                        <span>Copy SVG</span>
                    </button>
                    <button
                        onClick={handleCopyJsx}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                        <Code className="w-4 h-4" />
                        <span>Copy JSX</span>
                    </button>
                </div>

                {copyFeedback && (
                    <div className="text-center text-sm font-medium text-green-600 animate-in fade-in slide-in-from-bottom-2">
                        {copyFeedback}
                    </div>
                )}
            </div>
        </div>
    )
}
