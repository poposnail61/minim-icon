import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const GITHUB_OWNER = process.env.GITHUB_OWNER
const GITHUB_REPO = process.env.GITHUB_REPO
const BRANCH = 'main'

// Helper to interact with GitHub API
async function githubRequest(path: string, options: RequestInit = {}) {
  if (!GITHUB_TOKEN) throw new Error('GITHUB_TOKEN is not set')

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`
  const headers = {
    'Authorization': `Bearer ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const res = await fetch(url, { ...options, headers })
  if (!res.ok) {
    const error = await res.json()
    throw new Error(error.message || 'GitHub API Error')
  }
  return res.json()
}

export async function GET() {
  try {
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })
    }

    // 1. Fetch Icons
    let iconsData
    try {
      iconsData = await githubRequest('public/icons')
    } catch (error: any) {
      if (error.message === 'Not Found') {
        iconsData = []
      } else {
        throw error
      }
    }

    // 2. Fetch Tags
    let tagsMap: Record<string, string[]> = {}
    try {
      const tagsRes = await githubRequest('data/tags.json')
      const content = Buffer.from(tagsRes.content, 'base64').toString('utf-8')
      tagsMap = JSON.parse(content)
    } catch (error: any) {
      // If tags.json doesn't exist, just use empty map
      if (error.message !== 'Not Found') {
        console.warn('Failed to fetch tags.json:', error)
      }
    }

    // 3. Merge and Return
    const icons = Array.isArray(iconsData)
      ? iconsData
        .filter((file: any) => file.name.endsWith('.svg'))
        .map((file: any) => {
          const name = file.name.replace('.svg', '')
          return {
            name: name,
            url: `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${BRANCH}/public/icons/${file.name}`,
            tags: tagsMap[name] || []
          }
        })
      : []

    return NextResponse.json({ icons })
  } catch (error) {
    console.error('GitHub List Error:', error)
    return NextResponse.json({ error: 'Failed to list icons from GitHub' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file || !file.name.endsWith('.svg')) {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const content = buffer.toString('base64')

    const filename = file.name.replace(/\s+/g, '-').toLowerCase()
    const path = `public/icons/${filename}`

    let sha: string | undefined
    try {
      const existing = await githubRequest(path)
      sha = existing.sha
    } catch (e) {
      // File doesn't exist, proceed with create
    }

    await githubRequest(path, {
      method: 'PUT',
      body: JSON.stringify({
        message: `Upload ${filename} via Minim Icon`,
        content: content,
        sha: sha,
        branch: BRANCH
      })
    })

    return NextResponse.json({ success: true, filename })
  } catch (error) {
    console.error('GitHub Upload Error:', error)
    return NextResponse.json({ error: 'Upload failed', details: (error as Error).message }, { status: 500 })
  }
}

// Update Tags
export async function PUT(request: Request) {
  try {
    if (!GITHUB_TOKEN) {
      return NextResponse.json({ error: 'GITHUB_TOKEN not configured' }, { status: 500 })
    }

    const { tags } = await request.json() // Expecting { "icon-name": ["tag1"], ... }

    const path = 'data/tags.json'
    let sha: string | undefined
    let currentTags = {}

    try {
      const existing = await githubRequest(path)
      sha = existing.sha
      const content = Buffer.from(existing.content, 'base64').toString('utf-8')
      currentTags = JSON.parse(content)
    } catch (e) {
      // File doesn't exist, start empty
    }

    const newTags = { ...currentTags, ...tags }
    // Clean up empty tags if needed? keeping it simple for now

    const content = Buffer.from(JSON.stringify(newTags, null, 2)).toString('base64')

    await githubRequest(path, {
      method: 'PUT',
      body: JSON.stringify({
        message: `Update tags via Minim Icon`,
        content: content,
        sha: sha,
        branch: BRANCH
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('GitHub Tag Update Error:', error)
    return NextResponse.json({ error: 'Failed to update tags' }, { status: 500 })
  }
}
