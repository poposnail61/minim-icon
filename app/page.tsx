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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Minim Icon
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              A minimal SVG icon manager for developers.
            </p>
          </div>
          <div>
            <Link href="/admin" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              Admin Login &rarr;
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Icon Gallery */}
        <div>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading icons...</div>
          ) : (
            <IconGrid icons={icons} showControls={false} />
          )}
        </div>

        {/* Developer Guide */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Developer Guide</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">1. Basic Usage</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Use the <code>&lt;i&gt;</code> tag with the <code>icon</code> class.
                </p>
                <div className="bg-gray-900 rounded-lg p-4">
                  <code className="text-green-400 text-sm font-mono">
                    &lt;i class="icon icon-globe"&gt;&lt;/i&gt;
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-base font-medium text-gray-900 mb-2">2. Customizing Size & Color</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Control via CSS <code>font-size</code> and <code>color</code>.
                </p>
                <div className="bg-gray-900 rounded-lg p-4 space-y-2">
                  <code className="text-green-400 text-sm font-mono block">
                    &lt;i class="icon icon-globe text-4xl text-red-500"&gt;&lt;/i&gt;
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
