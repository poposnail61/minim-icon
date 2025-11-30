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
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Minim Icon
            </h1>
            <p className="mt-4 max-w-xl mx-auto text-xl text-gray-500">
              A minimal SVG icon manager for developers.
            </p>
            <div className="mt-8 flex justify-center">
              <Link href="/admin" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                Admin Login &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Icon Gallery */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Icons</h2>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <IconGrid icons={icons} showControls={false} />
          )}
        </div>

        {/* Developer Guide */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Developer Guide</h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">1. Basic Usage</h3>
                <p className="text-gray-600 mb-4">
                  Use the <code>&lt;i&gt;</code> tag with the <code>icon</code> class and the specific icon name.
                </p>
                <div className="bg-gray-800 rounded-md p-4">
                  <code className="text-green-400">
                    &lt;i class="icon icon-globe"&gt;&lt;/i&gt;
                  </code>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">2. Customizing Size & Color</h3>
                <p className="text-gray-600 mb-4">
                  The icons inherit <code>font-size</code> and <code>color</code> from their parent or inline styles.
                </p>
                <div className="bg-gray-800 rounded-md p-4 space-y-2">
                  <div className="text-gray-400 text-sm mb-2">// Large Blue Icon</div>
                  <code className="text-green-400 block">
                    &lt;i class="icon icon-globe" style="font-size: 48px; color: blue;"&gt;&lt;/i&gt;
                  </code>
                  
                  <div className="text-gray-400 text-sm mb-2 mt-4">// Tailwind Example</div>
                  <code className="text-green-400 block">
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
