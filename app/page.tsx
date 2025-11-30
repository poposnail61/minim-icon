'use client'

import { useState, useEffect } from 'react'
import IconGrid from '../components/IconGrid'
import Link from 'next/link'

interface Icon {
  name: string
  url: string
}

export default function Home() {
  const [icons, setIcons] = useState<Icon[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="min-h-screen bg-white">
      {/* Minimal Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="max-w-[1400px] mx-auto h-16 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
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

      <main className="max-w-[1400px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Icon Gallery */}
        <div className="min-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                </div>
            </div>
          ) : (
            <IconGrid icons={icons} showControls={false} />
          )}
        </div>

        {/* Developer Guide (Simplified) */}
        <div className="mt-20 border-t border-gray-100 pt-12 pb-20">
            <div className="max-w-2xl mx-auto text-center mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How to use</h2>
                <p className="text-gray-500">Simple integration for your web projects.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">1. Basic Usage</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Add the icon class to your element.
                </p>
                <div className="bg-white border border-gray-200 rounded-xl p-4 font-mono text-sm text-gray-600">
                    &lt;i class="icon icon-globe"&gt;&lt;/i&gt;
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">2. Customization</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Style with standard CSS properties.
                </p>
                <div className="bg-white border border-gray-200 rounded-xl p-4 font-mono text-sm text-gray-600">
                    .icon-globe &#123;<br/>
                    &nbsp;&nbsp;font-size: 24px;<br/>
                    &nbsp;&nbsp;color: blue;<br/>
                    &#125;
                </div>
              </div>
            </div>
        </div>
      </main>
    </div>
  )
}
